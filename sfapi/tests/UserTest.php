<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Entity\Annonce;
use App\Entity\User;
use App\Factory\AnnonceFactory;
use App\Factory\UserFactory;
use App\Factory\ApiTokenFactory;
use App\Entity\ApiToken;
use Doctrine\ORM\EntityManagerInterface;
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
            "scopes" => [ApiToken::SCOPE_USER_EDIT, ApiToken::SCOPE_ANNONCE_CREATE],
        ]);
        $response = $client->request('GET', '/api/annonces', [
            'headers' => [
                'Authorization' => 'Bearer '.$apiToken->getToken(),
            ],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertResponseStatusCodeSame(200);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $roles = $user->getRoles();
        $this->assertContains('ROLE_USER_EDIT', $roles);
        $this->assertContains('ROLE_ANNONCE_CREATE', $roles);
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testLoginReturnsTokenForAdminWithChangemePassword(): void
    {
        $admin = UserFactory::createOne([
            'email' => 'admin@example.com',
            'password' => 'changeme',
            'roles' => ['ROLE_ADMIN'],
            'username' => 'admin',
        ]);
        $token = ApiTokenFactory::createOne([
            'ownedBy' => $admin,
            'scopes' => [],
        ]);

        static::createClient()->request('POST', '/api/login', [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'email' => 'admin@example.com',
                'password' => 'changeme',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'token' => $token->getToken(),
            'username' => 'admin',
        ]);
    }

    public function testUserReadRequiresToken(): void
    {
        $user = UserFactory::createOne();

        static::createClient()->request('GET', '/api/users/'.$user->getId());

        $this->assertResponseStatusCodeSame(401);
    }

    public function testWhoamiRequiresToken(): void
    {
        static::createClient()->request('GET', '/api/me');

        $this->assertResponseStatusCodeSame(401);
    }

    public function testWhoamiReturnsAuthenticatedUser(): void
    {
        $user = UserFactory::createOne([
            'email' => 'me@example.com',
            'phone' => '+33123456789',
            'rating' => 4.5,
            'username' => 'me-user',
        ]);
        $token = ApiTokenFactory::createOne([
            'ownedBy' => $user,
            'scopes' => [ApiToken::SCOPE_USER_EDIT],
        ]);

        static::createClient()->request('GET', '/api/me', [
            'headers' => $this->authorizationHeaders($token),
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'id' => $user->getId(),
            'email' => 'me@example.com',
            'phone' => '+33123456789',
            'rating' => 4.5,
            'username' => 'me-user',
        ]);
    }

    public function testUserReadWithTokenDoesNotExposeSensitiveFields(): void
    {
        $user = UserFactory::createOne([
            'email' => 'profile@example.com',
            'phone' => '+33123456789',
            'rating' => 4.5,
            'username' => 'profile-user',
        ]);
        $token = ApiTokenFactory::createOne([
            'ownedBy' => $user,
            'scopes' => [ApiToken::SCOPE_USER_EDIT],
        ]);

        $response = static::createClient()->request('GET', '/api/users/'.$user->getId(), [
            'headers' => $this->authorizationHeaders($token),
        ]);
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame('profile@example.com', $data['email']);
        $this->assertSame('profile-user', $data['username']);
        $this->assertSame('+33123456789', $data['phone']);
        $this->assertSame(4.5, $data['rating']);
        $this->assertArrayNotHasKey('password', $data);
        $this->assertArrayNotHasKey('apiTokens', $data);
        $this->assertArrayNotHasKey('accessTokenScopes', $data);
    }

    public function testUserReadShowsRatedAndFavoriteAnnonces(): void
    {
        $user = UserFactory::createOne();
        $ratedAnnonce = AnnonceFactory::createOne(['title' => 'Rated annonce']);
        $favoriteAnnonce = AnnonceFactory::createOne(['title' => 'Favorite annonce']);
        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $managedUser = $entityManager->find(User::class, $user->getId());
        $managedRatedAnnonce = $entityManager->find(Annonce::class, $ratedAnnonce->getId());
        $managedFavoriteAnnonce = $entityManager->find(Annonce::class, $favoriteAnnonce->getId());
        $managedRatedAnnonce->addRating($managedUser);
        $managedFavoriteAnnonce->addFavorite($managedUser);
        $entityManager->flush();

        $token = ApiTokenFactory::createOne([
            'ownedBy' => $user,
            'scopes' => [ApiToken::SCOPE_USER_EDIT],
        ]);

        $response = static::createClient()->request('GET', '/api/users/'.$user->getId(), [
            'headers' => $this->authorizationHeaders($token),
        ]);
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame(['/api/annonces/'.$ratedAnnonce->getId()], $data['ratedAnnonces']);
        $this->assertSame(['/api/annonces/'.$favoriteAnnonce->getId()], $data['favoriteAnnonces']);
    }

    public function testUserPictureCanBeReadThroughApiRoute(): void
    {
        $user = UserFactory::createOne(['username' => 'picture-user']);
        $projectDir = static::getContainer()->getParameter('kernel.project_dir');
        $uploadDir = $projectDir.'/public/uploads/users';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $filename = 'test-user-picture-'.bin2hex(random_bytes(4)).'.txt';
        $path = $uploadDir.'/'.$filename;
        file_put_contents($path, 'picture-content');

        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $managedUser = $entityManager->find(User::class, $user->getId());
        $managedUser->setProfileImagePath('/uploads/users/'.$filename);
        $entityManager->flush();

        try {
            $response = static::createClient()->request('GET', '/api/users/'.$user->getId().'/pictures');

            $this->assertResponseIsSuccessful();
            $this->assertSame('picture-content', $response->getContent());
        } finally {
            if (is_file($path)) {
                unlink($path);
            }
        }
    }

    public function testUserProfilePatchRequiresToken(): void
    {
        $user = UserFactory::createOne();

        static::createClient()->request('PATCH', '/api/users/'.$user->getId(), [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => ['username' => 'blocked-update'],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    public function testUserProfileCanBePatchedWithToken(): void
    {
        $user = UserFactory::createOne([
            'email' => 'before@example.com',
            'phone' => '+33000000000',
            'rating' => 2.5,
            'username' => 'before-user',
        ]);
        $token = ApiTokenFactory::createOne([
            'ownedBy' => $user,
            'scopes' => [ApiToken::SCOPE_USER_EDIT],
        ]);

        static::createClient()->request('PATCH', '/api/users/'.$user->getId(), [
            'headers' => [
                ...$this->authorizationHeaders($token),
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => [
                'email' => 'after@example.com',
                'phone' => '+33999999999',
                'rating' => 4,
                'username' => 'after-user',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'email' => 'after@example.com',
            'phone' => '+33999999999',
            'rating' => 4,
            'username' => 'after-user',
        ]);
    }

    public function testUserProfileCannotBePatchedByAnotherUser(): void
    {
        $target = UserFactory::createOne(['username' => 'target-user']);
        $other = UserFactory::createOne();
        $token = ApiTokenFactory::createOne([
            'ownedBy' => $other,
            'scopes' => [ApiToken::SCOPE_USER_EDIT],
        ]);

        static::createClient()->request('PATCH', '/api/users/'.$target->getId(), [
            'headers' => [
                ...$this->authorizationHeaders($token),
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['username' => 'forbidden-update'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testAdminCanPatchAnotherUserProfile(): void
    {
        $target = UserFactory::createOne(['username' => 'target-user']);
        $admin = UserFactory::createOne(['roles' => ['ROLE_ADMIN']]);
        $token = ApiTokenFactory::createOne([
            'ownedBy' => $admin,
            'scopes' => [],
        ]);

        static::createClient()->request('PATCH', '/api/users/'.$target->getId(), [
            'headers' => [
                ...$this->authorizationHeaders($token),
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['username' => 'admin-updated'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['username' => 'admin-updated']);
    }

    /**
     * @return array<string, string>
     */
    private function authorizationHeaders(ApiToken $token): array
    {
        return ['Authorization' => 'Bearer '.$token->getToken()];
    }
}
