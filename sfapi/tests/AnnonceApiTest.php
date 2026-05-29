<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Entity\ApiToken;
use App\Enum\AnnonceCategory;
use App\Factory\AnnonceFactory;
use App\Factory\ApiTokenFactory;
use App\Factory\UserFactory;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

class AnnonceApiTest extends ApiTestCase
{
    use Factories;
    use ResetDatabase;

    private const EXPECTED_CATEGORIES = ['car', 'electronic', 'sport', 'home'];

    protected static ?bool $alwaysBootKernel = false;

    public function testCategoriesEndpointReturnsAllowedCategories(): void
    {
        $response = static::createClient()->request('GET', '/api/annonces/categories');
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame('/api/annonces/categories', $data['@id']);
        $this->assertSame(count(self::EXPECTED_CATEGORIES), $data['totalItems']);
        $this->assertEqualsCanonicalizing(self::EXPECTED_CATEGORIES, array_column($data['member'], 'value'));
    }

    public function testCategoriesEndpointIsReferencedInApiDocumentation(): void
    {
        $response = static::createClient()->request('GET', '/api/docs.jsonld');
        $data = $response->toArray();

        $classIds = array_column($data['supportedClass'], '@id');

        $this->assertResponseIsSuccessful();
        $this->assertContains('#AnnonceCategory', $classIds);
        $this->assertStringContainsString('annonceCategory', json_encode($data['supportedClass'], JSON_THROW_ON_ERROR));
    }

    public function testAnnonceCollectionIsPublic(): void
    {
        AnnonceFactory::createOne([
            'categories' => [AnnonceCategory::Car->value],
            'price' => 1200,
            'title' => 'Compact car',
        ]);

        $response = static::createClient()->request('GET', '/api/annonces');
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame(1, $data['totalItems']);
        $this->assertSame('Compact car', $data['member'][0]['title']);
    }

    public function testAnnonceItemIsPublicAndKeepsFullDescription(): void
    {
        $description = 'This description is intentionally longer than thirty characters.';
        $annonce = AnnonceFactory::createOne([
            'description' => $description,
            'title' => 'Detailed annonce',
        ]);

        $response = static::createClient()->request('GET', '/api/annonces/'.$annonce->getId());
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame('Detailed annonce', $data['title']);
        $this->assertSame($description, $data['description']);
    }

    public function testAnnonceCollectionUsesShortDescription(): void
    {
        AnnonceFactory::createOne([
            'description' => 'This description is intentionally longer than thirty characters.',
            'title' => 'Short description annonce',
        ]);

        $response = static::createClient()->request('GET', '/api/annonces');
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame(mb_substr('This description is intentionally longer than thirty characters.', 0, 30), $data['member'][0]['description']);
        $this->assertLessThanOrEqual(30, mb_strlen($data['member'][0]['description']));
    }

    public function testWriteAnnonceRequiresToken(): void
    {
        static::createClient()->request('POST', '/api/annonces', [
            'headers' => ['Content-Type' => 'application/ld+json'],
            'json' => $this->validAnnoncePayload(),
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    public function testCanCreateAnnonceWithToken(): void
    {
        [$headers, $userIri] = $this->authenticatedHeadersAndUserIri([]);

        static::createClient()->request('POST', '/api/annonces', [
            'headers' => $headers,
            'json' => $this->validAnnoncePayload([
                'author' => $userIri,
                'categories' => [AnnonceCategory::Sport->value],
                'price' => '350.00',
                'title' => 'Road bike',
                'city' => 'Paris',
                'address' => '10 rue de Rivoli',
            ]),
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'title' => 'Road bike',
            'categories' => [AnnonceCategory::Sport->value],
            'price' => '350.00',
            'city' => 'Paris',
            'address' => '10 rue de Rivoli',
            'latitude' => '48.8566000',
            'longitude' => '2.3522000',
        ]);
    }

    public function testOwnerCanPatchAnnonce(): void
    {
        [$headers, $userIri, $user] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne([
            'author' => $user,
            'title' => 'Before patch',
        ]);

        static::createClient()->request('PATCH', '/api/annonces/'.$annonce->getId(), [
            'headers' => [
                ...$headers,
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => [
                'title' => 'After patch',
                'author' => $userIri,
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['title' => 'After patch']);
    }

    public function testPatchAnnonceCityRefreshesCoordinates(): void
    {
        [$headers, $userIri, $user] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne([
            'author' => $user,
            'city' => 'Paris',
            'latitude' => '48.8566000',
            'longitude' => '2.3522000',
        ]);

        static::createClient()->request('PATCH', '/api/annonces/'.$annonce->getId(), [
            'headers' => [
                ...$headers,
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => [
                'author' => $userIri,
                'city' => 'Lyon',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'city' => 'Lyon',
            'latitude' => '45.7640000',
            'longitude' => '4.8357000',
        ]);
    }

    public function testNonOwnerCannotPatchAnnonce(): void
    {
        [$headers] = $this->authenticatedHeadersAndUserIri([]);
        $owner = UserFactory::createOne();
        $annonce = AnnonceFactory::createOne([
            'author' => $owner,
            'title' => 'Protected annonce',
        ]);

        static::createClient()->request('PATCH', '/api/annonces/'.$annonce->getId(), [
            'headers' => [
                ...$headers,
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['title' => 'Forbidden patch'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testAdminCanPatchAnnonce(): void
    {
        $admin = UserFactory::createOne(['roles' => ['ROLE_ADMIN']]);
        $token = ApiTokenFactory::createOne(['ownedBy' => $admin, 'scopes' => []]);
        $owner = UserFactory::createOne();
        $annonce = AnnonceFactory::createOne([
            'author' => $owner,
            'title' => 'Before admin patch',
        ]);

        static::createClient()->request('PATCH', '/api/annonces/'.$annonce->getId(), [
            'headers' => [
                ...$this->authorizationHeaders($token),
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['title' => 'After admin patch'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['title' => 'After admin patch']);
    }

    public function testModeratorCannotPatchAnnonce(): void
    {
        $moderator = UserFactory::createOne(['roles' => ['ROLE_MODERATOR']]);
        $token = ApiTokenFactory::createOne(['ownedBy' => $moderator, 'scopes' => []]);
        $owner = UserFactory::createOne();
        $annonce = AnnonceFactory::createOne([
            'author' => $owner,
            'title' => 'Before moderator patch',
        ]);

        static::createClient()->request('PATCH', '/api/annonces/'.$annonce->getId(), [
            'headers' => [
                ...$this->authorizationHeaders($token),
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['title' => 'Forbidden moderator patch'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testNonOwnerCannotDeleteAnnonce(): void
    {
        [$headers] = $this->authenticatedHeadersAndUserIri([]);
        $owner = UserFactory::createOne();
        $annonce = AnnonceFactory::createOne(['author' => $owner]);

        static::createClient()->request('DELETE', '/api/annonces/'.$annonce->getId(), [
            'headers' => $headers,
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    #[DataProvider('deleteAllowedProvider')]
    public function testOwnerModeratorOrAdminCanDeleteAnnonce(string $case, array $roles, bool $isOwner): void
    {
        $user = UserFactory::createOne(['roles' => $roles]);
        $token = ApiTokenFactory::createOne(['ownedBy' => $user, 'scopes' => []]);
        $owner = $isOwner ? $user : UserFactory::createOne();
        $annonce = AnnonceFactory::createOne(['author' => $owner]);

        static::createClient()->request('DELETE', '/api/annonces/'.$annonce->getId(), [
            'headers' => $this->authorizationHeaders($token),
        ]);

        $this->assertResponseStatusCodeSame(204, $case);
    }

    public function testOwnerCanUploadAnnonceImage(): void
    {
        [$headers, , $user] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne(['author' => $user]);
        $image = $this->uploadedPng();

        $response = static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/image', [
            'headers' => $headers,
            'extra' => ['files' => ['image' => $image]],
        ]);
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertStringStartsWith('/uploads/annonces/', $data['imagePath']);
    }

    public function testNonOwnerCannotUploadAnnonceImage(): void
    {
        [$headers] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne(['author' => UserFactory::createOne()]);

        static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/image', [
            'headers' => $headers,
            'extra' => ['files' => ['image' => $this->uploadedPng()]],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    #[DataProvider('imageUploadAllowedProvider')]
    public function testAdminOrModeratorCanUploadAnnonceImage(string $case, array $roles): void
    {
        $user = UserFactory::createOne(['roles' => $roles]);
        $token = ApiTokenFactory::createOne(['ownedBy' => $user, 'scopes' => []]);
        $annonce = AnnonceFactory::createOne(['author' => UserFactory::createOne()]);

        $response = static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/image', [
            'headers' => $this->authorizationHeaders($token),
            'extra' => ['files' => ['image' => $this->uploadedPng()]],
        ]);
        $data = $response->toArray();

        $this->assertResponseIsSuccessful($case);
        $this->assertStringStartsWith('/uploads/annonces/', $data['imagePath']);
    }

    public function testOwnerCanSwitchAnnonceMaskedState(): void
    {
        [$headers, , $user] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne([
            'author' => $user,
            'masked' => false,
        ]);

        static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/masked', [
            'headers' => $headers,
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['masked' => true]);
    }

    public function testAdminCanSwitchAnnonceMaskedState(): void
    {
        $admin = UserFactory::createOne(['roles' => ['ROLE_ADMIN']]);
        $token = ApiTokenFactory::createOne(['ownedBy' => $admin, 'scopes' => []]);
        $annonce = AnnonceFactory::createOne([
            'author' => UserFactory::createOne(),
            'masked' => false,
        ]);

        static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/masked', [
            'headers' => $this->authorizationHeaders($token),
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['masked' => true]);
    }

    public function testModeratorCanSwitchAnnonceMaskedState(): void
    {
        $moderator = UserFactory::createOne(['roles' => ['ROLE_MODERATOR']]);
        $token = ApiTokenFactory::createOne(['ownedBy' => $moderator, 'scopes' => []]);
        $annonce = AnnonceFactory::createOne([
            'author' => UserFactory::createOne(),
            'masked' => false,
        ]);

        static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/masked', [
            'headers' => $this->authorizationHeaders($token),
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['masked' => true]);
    }

    public function testNonOwnerCannotSwitchAnnonceMaskedState(): void
    {
        [$headers] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne([
            'author' => UserFactory::createOne(),
            'masked' => false,
        ]);

        static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/masked', [
            'headers' => $headers,
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    #[DataProvider('collectionFilterProvider')]
    public function testCollectionFilters(string $queryString, array $expectedTitles): void
    {
        $this->seedFilterFixtures();

        $response = static::createClient()->request('GET', '/api/annonces?'.$queryString);
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame(count($expectedTitles), $data['totalItems']);
        $this->assertEqualsCanonicalizing($expectedTitles, array_column($data['member'], 'title'));
    }

    public function testInvalidCategoryIsRejected(): void
    {
        [$headers, $userIri] = $this->authenticatedHeadersAndUserIri([]);

        static::createClient()->request('POST', '/api/annonces', [
            'headers' => $headers,
            'json' => $this->validAnnoncePayload([
                'author' => $userIri,
                'categories' => ['vis'],
                'title' => 'Invalid category',
            ]),
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    /**
     * @return iterable<string, array{string, list<string>}>
     */
    public static function collectionFilterProvider(): iterable
    {
        yield 'price range' => ['price[gte]=100&price[lte]=1000', ['Mid sport item', 'Gaming laptop']];
        yield 'category' => ['categories=electronic', ['Gaming laptop', 'Phone charger']];
        yield 'title search' => ['title=phone', ['Phone charger']];
        yield 'description search' => ['description=outdoor', ['Garden chair']];
    }

    /**
     * @return iterable<string, array{string, list<string>, bool}>
     */
    public static function deleteAllowedProvider(): iterable
    {
        yield 'owner' => ['owner', [], true];
        yield 'moderator' => ['moderator', ['ROLE_MODERATOR'], false];
        yield 'admin' => ['admin', ['ROLE_ADMIN'], false];
    }

    /**
     * @return iterable<string, array{string, list<string>}>
     */
    public static function imageUploadAllowedProvider(): iterable
    {
        yield 'moderator' => ['moderator', ['ROLE_MODERATOR']];
        yield 'admin' => ['admin', ['ROLE_ADMIN']];
    }

    /**
     * @param list<string> $scopes
     *
     * @return array{array<string, string>, string, object}
     */
    private function authenticatedHeadersAndUserIri(array $scopes): array
    {
        $user = UserFactory::createOne();
        $token = ApiTokenFactory::createOne([
            'ownedBy' => $user,
            'scopes' => $scopes,
        ]);

        return [
            [
                'Authorization' => 'Bearer '.$token->getToken(),
                'Content-Type' => 'application/ld+json',
            ],
            '/api/users/'.$user->getId(),
            $user,
        ];
    }

    /**
     * @return array<string, string>
     */
    private function authorizationHeaders(ApiToken $token): array
    {
        return ['Authorization' => 'Bearer '.$token->getToken()];
    }

    /**
     * @param array<string, mixed> $override
     *
     * @return array<string, mixed>
     */
    private function validAnnoncePayload(array $override = []): array
    {
        return array_replace([
            'title' => 'Valid annonce',
            'address' => '1 place de la mairie',
            'city' => 'Paris',
            'description' => 'A valid annonce payload',
            'categories' => [AnnonceCategory::Car->value],
            'price' => '10.00',
            'masked' => false,
        ], $override);
    }

    private function seedFilterFixtures(): void
    {
        AnnonceFactory::createOne([
            'categories' => [AnnonceCategory::Home->value],
            'description' => 'Small item for a kitchen shelf',
            'price' => 50,
            'title' => 'Cheap home item',
        ]);
        AnnonceFactory::createOne([
            'categories' => [AnnonceCategory::Sport->value],
            'description' => 'Training gear',
            'price' => 250,
            'title' => 'Mid sport item',
        ]);
        AnnonceFactory::createOne([
            'categories' => [AnnonceCategory::Car->value],
            'description' => 'Vehicle listing',
            'price' => 12000,
            'title' => 'Expensive car',
        ]);
        AnnonceFactory::createOne([
            'categories' => [AnnonceCategory::Electronic->value],
            'description' => 'Portable computer',
            'price' => 900,
            'title' => 'Gaming laptop',
        ]);
        AnnonceFactory::createOne([
            'categories' => [AnnonceCategory::Electronic->value],
            'description' => 'Fast USB-C power adapter',
            'price' => 20,
            'title' => 'Phone charger',
        ]);
        AnnonceFactory::createOne([
            'categories' => [AnnonceCategory::Home->value],
            'description' => 'Outdoor furniture',
            'price' => 35,
            'title' => 'Garden chair',
        ]);
    }

    private function uploadedPng(): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'annonce-upload-');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', true));

        return new UploadedFile($path, 'listing.png', 'image/png', null, true);
    }
}
