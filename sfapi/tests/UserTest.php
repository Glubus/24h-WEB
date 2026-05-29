<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Factory\UserFactory;
use App\Factory\ApiTokenFactory;
use App\Entity\ApiToken;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

class UserTest extends ApiTestCase
{
    use Factories;
    use ResetDatabase;

    protected static ?bool $alwaysBootKernel = false;
    
    public function testUserAuthentication(): void
    {
        $client = static::createClient();

        $user = UserFactory::createOne([
            "email" => "test@example.com",
            "password" => "123456",
            "username" => "testuser",
        ]);

        $apiToken = ApiTokenFactory::createOne([
            "ownedBy" => $user,
            "scopes" => [ApiToken::SCOPE_USER_EDIT, ApiToken::SCOPE_TREASURE_CREATE],
        ]);
        $response = $client->request('GET', '/api/treasures', [
            'headers' => [
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertResponseStatusCodeSame(200);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $roles = $user->getRoles();
        $this->assertContains('ROLE_USER_EDIT', $roles);
        $this->assertContains('ROLE_TREASURE_CREATE', $roles);
        $this->assertContains('ROLE_USER', $roles);
    }
}
