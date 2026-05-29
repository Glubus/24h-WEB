<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Factory\DragonTreasureFactory;
use App\Entity\DragonTreasure;
use Zenstruck\Foundry\Test\ResetDatabase;
use Zenstruck\Foundry\Test\Factories;
use App\Factory\ApiTokenFactory;
use App\Factory\UserFactory;
use App\Entity\ApiToken;

class DragonTreasureTest extends ApiTestCase
{
    protected static ?bool $alwaysBootKernel = false;
    
    use ResetDatabase, Factories;

    public function testFailedAuthentication(): void
    {
        $response = static::createClient()->request('GET', '/api/treasures');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testGetCollectionOfTreasures(): void
    {

        DragonTreasureFactory::createOne();
        $apiToken = ApiTokenFactory::createOne();
        $response = static::createClient()->request('GET', '/api/treasures', [
            'headers' => [
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertResponseStatusCodeSame(200);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains(['totalItems' => 1]);
    }
    
    public function testPostOfTreasure(): void
    {
        $user = UserFactory::createOne();
        $apiToken = ApiTokenFactory::createOne([
            "ownedBy" => $user,
            "scopes" => [ApiToken::SCOPE_TREASURE_CREATE],
        ]);
        $response = static::createClient()->request('POST', '/api/treasures',[
            'headers' => [

                'Content-Type' => 'application/ld+json',
                'Accept' => 'application/ld+json',
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
            'json' => [
            'name' => 'New Treasure',
            'description' => 'Marvelous Treasure',
            'value' => 666,
            'coolFactor' => 6,
            'user' => '/api/users/'.$user->getId(),
            'x' => 300,
            'y' => 300,
        ]]);

     
        $this->assertResponseIsSuccessful();
        $this->assertResponseStatusCodeSame(201);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            'name' => 'New Treasure',
            'description' => 'Marvelous Treasure',
            'value' => 666,
            'coolFactor' => 6,
        ]);

    }

    public function testPostOfTreasureUnauthentifcated(): void
    {
        $apiToken = ApiTokenFactory::createOne();
        $response = static::createClient()->request('POST', '/api/treasures' , [
            'headers' => [
                'Content-Type' => 'application/ld+json',
                'Accept' => 'application/ld+json',
            ],
        ]);
        $this->assertResponseStatusCodeSame(401);
    }


    public function testPutOfTreasure(): void
    {
        $treasure = DragonTreasureFactory::createOne([
            'name' => 'Old Treasure',
            'description' => 'Old Description',
            'value' => 100,
            'coolFactor' => 1,
        ]);

        $client = static::createClient();
        $apiToken = ApiTokenFactory::createOne();
        $client->request('PUT', '/api/treasures/'.$treasure->getId(), [
            'headers' => [
                'Content-Type' => 'application/ld+json',
                'Accept' => 'application/ld+json',
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
            'json' => [
                'name' => 'Updated Treasure',
                'description' => 'Updated Description',
                'value' => 777,
                'coolFactor' => 7,
                'user' => '/api/users/'.$treasure->getUser()->getId(),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseStatusCodeSame(200);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            'id' => $treasure->getId(),
            'name' => 'Updated Treasure',
            'description' => 'Updated Description',
            'value' => 777,
            'coolFactor' => 7,
        ]);
    }

    public function testPostOfTreasureUnauthorized(): void
    {
        $user = UserFactory::createOne();
        $treasure = DragonTreasureFactory::createOne([
            'name' => 'Old Treasure',
            'description' => 'Old Description',
            'value' => 100,
            'coolFactor' => 1,
        ]);

        $client = static::createClient();
        $apiToken = ApiTokenFactory::createOne([
            "ownedBy" => $user,
            "scopes" => [ApiToken::SCOPE_USER_EDIT],
        ]);
        $client->request('POST', '/api/treasures', [
            'headers' => [
                'Content-Type' => 'application/ld+json',
                'Accept' => 'application/ld+json',
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


    public function testDeleteOfTreasure(): void
    {
        $treasure = DragonTreasureFactory::createOne();

        $client = static::createClient();
        $apiToken = ApiTokenFactory::createOne();
        $client->request('DELETE', '/api/treasures/'.$treasure->getId(), [
            'headers' => [
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);

        $this->assertResponseStatusCodeSame(204);

        $client->request('GET', '/api/treasures/'.$treasure->getId(), [
            'headers' => [
                'Accept' => 'application/ld+json',
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);
        $this->assertResponseStatusCodeSame(301);
    }

    public function testGetItemUnauthorized(): void
    {
        $treasure = DragonTreasureFactory::createOne();

        $client = static::createClient();
        $client->request('GET', '/api/treasures/'.$treasure->getId(), [
            'headers' => [
                'Accept' => 'application/ld+json',
            ],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    public function testPutUnauthorized(): void
    {
        $treasure = DragonTreasureFactory::createOne();

        $client = static::createClient();
        $client->request('PUT', '/api/treasures/'.$treasure->getId(), [
            'headers' => [
                'Content-Type' => 'application/ld+json',
                'Accept' => 'application/ld+json',
            ],
            'json' => [
                'name' => 'Some Name',
                'description' => 'Some Description',
                'value' => 111,
                'coolFactor' => 1,
            ],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    public function testDeleteUnauthorized(): void
    {
        $treasure = DragonTreasureFactory::createOne();

        $client = static::createClient();
        $client->request('DELETE', '/api/treasures/'.$treasure->getId());

        $this->assertResponseStatusCodeSame(401);
    }

    public function testFilterByNameIstarth(): void
    {
        DragonTreasureFactory::createOne([
            'name' => 'Diamond Crown',
            'description' => 'Shiny diamond crown',
            'value' => 100,
            'coolFactor' => 5,
            'isPublished' => true,
            'createdAt' => new \DateTimeImmutable('2025-01-01'),
        ]);
        DragonTreasureFactory::createOne([
            'name' => 'Gold Coin',
            'description' => 'Ancient gold coin',
            'value' => 200,
            'coolFactor' => 8,
            'isPublished' => false,
            'createdAt' => new \DateTimeImmutable('2024-01-01'),
        ]);
        DragonTreasureFactory::createOne([
            'name' => 'Silver Sword',
            'description' => 'Sharp silver sword',
            'value' => 300,
            'coolFactor' => 2,
            'isPublished' => true,
            'createdAt' => new \DateTimeImmutable('2023-01-01'),
        ]);

        $client = static::createClient();
        $apiToken = ApiTokenFactory::createOne();
        $client->request('GET', '/api/treasures?name=Di', [
            'headers' => [
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['totalItems' => 1]);
    }

    public function testFilterByIsPublished(): void
    {
        DragonTreasureFactory::createOne(['isPublished' => true]);
        DragonTreasureFactory::createOne(['isPublished' => false]);
        DragonTreasureFactory::createOne(['isPublished' => true]);

        $client = static::createClient();
        $apiToken = ApiTokenFactory::createOne();
        $client->request('GET', '/api/treasures?isPublished=true', [
            'headers' => [
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['totalItems' => 2]);
    }


    public function testFilterByCoolFactorRange(): void
    {
        DragonTreasureFactory::createOne(['coolFactor' => 2]);
        DragonTreasureFactory::createOne(['coolFactor' => 5]);
        DragonTreasureFactory::createOne(['coolFactor' => 8]);

        $client = static::createClient();
        $apiToken = ApiTokenFactory::createOne();
        $client->request('GET', '/api/treasures?coolFactor[gte]=3&coolFactor[lte]=7', [
            'headers' => [
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['totalItems' => 1]);
    }

    public function testFilterByCreatedAtBefore(): void
    {
        DragonTreasureFactory::createOne(['createdAt' => new \DateTimeImmutable('2025-01-01')]);
        DragonTreasureFactory::createOne(['createdAt' => new \DateTimeImmutable('2024-01-01')]);
        DragonTreasureFactory::createOne(['createdAt' => new \DateTimeImmutable('2023-01-01')]);

        $client = static::createClient();
        $apiToken = ApiTokenFactory::createOne();
        $client->request('GET', '/api/treasures?createdAt[before]=2024-06-01', [
            'headers' => [
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['totalItems' => 2]);
    }
}
