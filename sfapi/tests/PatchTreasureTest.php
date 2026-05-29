<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use Zenstruck\Foundry\Test\ResetDatabase;
use Zenstruck\Foundry\Test\Factories;
use App\Factory\UserFactory;
use App\Factory\ApiTokenFactory;
use App\Factory\DragonTreasureFactory;
use App\Entity\ApiToken;

class PatchTreasureTest extends ApiTestCase
{
    protected static ?bool $alwaysBootKernel = false;
    
    use ResetDatabase, Factories;
    public function testNonOwnerCannotPatchTreasure(): void
    {
        $client = static::createClient();
        $user = UserFactory::createOne();
        $userNonOwner = UserFactory::createOne();

        $treasure = DragonTreasureFactory::createOne([
            'user' => $user,
        ]);

        $apiToken = ApiTokenFactory::createOne([
            'ownedBy' => $userNonOwner,
            'scopes' => [ApiToken::SCOPE_TREASURE_EDIT],
        ]);
        
        $treasureId = $treasure->getId();
        $client->request('PATCH', '/api/treasures/'.$treasureId, [
            'headers' => [
                'Content-Type' => 'application/merge-patch+json',
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
            'json' => [
                'name' => 'Updated Treasure',
                'description' => 'Updated Description',
                'value' => 777,
                'coolFactor' => 7,
            ],
        ]);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testOwnerCannotTransferTreasure(): void
    {
        $client = static::createClient();
        $owner = UserFactory::createOne();
        $newOwner = UserFactory::createOne();

        $treasure = DragonTreasureFactory::createOne([
            'user' => $owner,
        ]);
        $treasureId = $treasure->getId();
        $ownerId = $owner->getId();
        $newOwnerId = $newOwner->getId();

        $apiToken = ApiTokenFactory::createOne([
            'ownedBy' => $owner,
            'scopes' => [ApiToken::SCOPE_TREASURE_EDIT],
        ]);

        $client->request('PATCH', '/api/treasures/'.$treasureId, [
            'headers' => [
                'Content-Type' => 'application/merge-patch+json',
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
            'json' => [
                'user' => '/api/users/'.$newOwnerId,
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);

        // Ensure the owner did not change
        $client->request('GET', '/api/treasures/'.$treasureId, [
            'headers' => [
                'Accept' => 'application/ld+json',
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'user' => '/api/users/'.$ownerId,
        ]);
    }
}
