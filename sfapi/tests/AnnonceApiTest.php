<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Entity\Annonce;
use App\Entity\ApiToken;
use App\Entity\User;
use App\Enum\AnnonceCategory;
use App\Factory\AnnonceFactory;
use App\Factory\ApiTokenFactory;
use App\Factory\UserFactory;
use Doctrine\ORM\EntityManagerInterface;
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
            'address' => 'Secret street',
            'categories' => [AnnonceCategory::Car->value],
            'city' => 'Paris',
            'price' => 1200,
            'title' => 'Compact car',
        ]);

        $response = static::createClient()->request('GET', '/api/annonces');
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame(1, $data['totalItems']);
        $this->assertSame('Compact car', $data['member'][0]['title']);
        $this->assertSame('Paris', $data['member'][0]['city']);
        $this->assertFalse($data['member'][0]['sold']);
        $this->assertArrayNotHasKey('address', $data['member'][0]);
    }

    public function testAnnonceItemIsPublicAndKeepsFullDescription(): void
    {
        $description = 'This description is intentionally longer than thirty characters.';
        $annonce = AnnonceFactory::createOne([
            'address' => '12 private road',
            'city' => 'Paris',
            'description' => $description,
            'title' => 'Detailed annonce',
        ]);

        $response = static::createClient()->request('GET', '/api/annonces/'.$annonce->getId());
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame('Detailed annonce', $data['title']);
        $this->assertSame($description, $data['description']);
        $this->assertSame('Paris', $data['city']);
        $this->assertArrayNotHasKey('address', $data);
    }

    public function testAnnonceItemShowsRatingsAndFavoritesRelations(): void
    {
        $rater = UserFactory::createOne();
        $favoriteUser = UserFactory::createOne();
        $annonce = AnnonceFactory::createOne(['title' => 'Rated annonce']);
        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $managedAnnonce = $entityManager->find(Annonce::class, $annonce->getId());
        $managedRater = $entityManager->find(User::class, $rater->getId());
        $managedFavoriteUser = $entityManager->find(User::class, $favoriteUser->getId());
        $managedAnnonce->addRating($managedRater);
        $managedAnnonce->addFavorite($managedFavoriteUser);
        $entityManager->flush();

        $response = static::createClient()->request('GET', '/api/annonces/'.$annonce->getId());
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame('Rated annonce', $data['title']);
        $this->assertSame(['/api/users/'.$rater->getId()], $data['ratings']);
        $this->assertSame(['/api/users/'.$favoriteUser->getId()], $data['favorites']);
    }

    public function testOwnerCanGetAnnonceEditPayloadWithAddress(): void
    {
        [$headers, , $user] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne([
            'address' => '12 private road',
            'author' => $user,
            'city' => 'Paris',
            'title' => 'Editable annonce',
        ]);

        $response = static::createClient()->request('GET', '/api/annonces/'.$annonce->getId().'/edit', [
            'headers' => $headers,
        ]);
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame('Editable annonce', $data['title']);
        $this->assertSame('Paris', $data['city']);
        $this->assertSame('12 private road', $data['address']);
    }

    public function testAdminCanGetAnnonceEditPayloadWithAddress(): void
    {
        $admin = UserFactory::createOne(['roles' => ['ROLE_ADMIN']]);
        $token = ApiTokenFactory::createOne(['ownedBy' => $admin, 'scopes' => []]);
        $annonce = AnnonceFactory::createOne([
            'address' => '12 private road',
            'author' => UserFactory::createOne(),
            'city' => 'Paris',
        ]);

        $response = static::createClient()->request('GET', '/api/annonces/'.$annonce->getId().'/edit', [
            'headers' => $this->authorizationHeaders($token),
        ]);
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame('12 private road', $data['address']);
    }

    public function testNonOwnerCannotGetAnnonceEditPayload(): void
    {
        [$headers] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne([
            'address' => '12 private road',
            'author' => UserFactory::createOne(),
        ]);

        static::createClient()->request('GET', '/api/annonces/'.$annonce->getId().'/edit', [
            'headers' => $headers,
        ]);

        $this->assertResponseStatusCodeSame(403);
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
            'latitude' => '48.8566000',
            'longitude' => '2.3522000',
            'sold' => false,
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
                'sold' => true,
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['title' => 'After patch', 'sold' => true]);
        $this->assertNotNull(static::getContainer()->get(EntityManagerInterface::class)->find(Annonce::class, $annonce->getId())->getSoldAt());
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

    /**
     * @param list<string> $roles
     */
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
        $annonce = AnnonceFactory::createOne([
            'author' => $user,
            'images' => ['/uploads/annonces/existing.png'],
        ]);
        $image = $this->uploadedPng();

        $response = static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/image', [
            'headers' => $headers,
            'extra' => ['files' => ['image' => $image]],
        ]);
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertCount(2, $data['images']);
        $this->assertSame('/uploads/annonces/existing.png', $data['images'][0]);
        $this->assertStringStartsWith('/uploads/annonces/', $data['images'][1]);
    }

    public function testOwnerCanReplaceAnnonceImagesWithPatch(): void
    {
        [$headers, $userIri, $user] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne([
            'author' => $user,
            'images' => ['/uploads/annonces/old.png'],
        ]);

        static::createClient()->request('PATCH', '/api/annonces/'.$annonce->getId(), [
            'headers' => [
                ...$headers,
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => [
                'author' => $userIri,
                'images' => ['/uploads/annonces/new-a.png', '/uploads/annonces/new-b.png'],
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'images' => ['/uploads/annonces/new-a.png', '/uploads/annonces/new-b.png'],
        ]);
    }

    public function testOwnerCanDeleteSpecificAnnonceImage(): void
    {
        [$headers, , $user] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne([
            'author' => $user,
            'images' => [
                '/uploads/annonces/first.png',
                '/uploads/annonces/second.png',
                '/uploads/annonces/third.png',
            ],
        ]);

        static::createClient()->request('DELETE', '/api/annonces/'.$annonce->getId().'/images/1', [
            'headers' => $headers,
        ]);

        $this->assertResponseStatusCodeSame(204);

        $response = static::createClient()->request('GET', '/api/annonces/'.$annonce->getId());
        $data = $response->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame([
            '/uploads/annonces/first.png',
            '/uploads/annonces/third.png',
        ], $data['images']);
    }

    public function testAnnonceImageCanBeReadThroughApiRoute(): void
    {
        $annonce = AnnonceFactory::createOne();
        $projectDir = static::getContainer()->getParameter('kernel.project_dir');
        $uploadDir = $projectDir.'/public/uploads/annonces';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $filename = 'test-annonce-image-'.bin2hex(random_bytes(4)).'.txt';
        $path = $uploadDir.'/'.$filename;
        file_put_contents($path, 'annonce-image-content');

        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $managedAnnonce = $entityManager->find(Annonce::class, $annonce->getId());
        $managedAnnonce->setImages(['/uploads/annonces/'.$filename]);
        $entityManager->flush();

        try {
            $response = static::createClient()->request('GET', '/api/annonces/'.$annonce->getId().'/images/0');

            $this->assertResponseIsSuccessful();
            $this->assertSame('annonce-image-content', $response->getContent());
        } finally {
            if (is_file($path)) {
                unlink($path);
            }
        }
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

    /**
     * @param list<string> $roles
     */
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
        $this->assertCount(1, $data['images']);
        $this->assertStringStartsWith('/uploads/annonces/', $data['images'][0]);
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

    public function testUserCanToggleAnnonceFavorite(): void
    {
        [$headers, , $user] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne(['author' => UserFactory::createOne()]);

        static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/favorite', [
            'headers' => $headers,
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'favoriteCount' => 1,
            'favorites' => [['@id' => '/api/users/'.$user->getId()]],
        ]);

        static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/favorite', [
            'headers' => $headers,
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'favoriteCount' => 0,
            'favorites' => [],
        ]);
    }

    public function testUserCanRateAnnonceSeller(): void
    {
        [$headers, , $rater] = $this->authenticatedHeadersAndUserIri([]);
        $seller = UserFactory::createOne(['rating' => 3]);
        $annonce = AnnonceFactory::createOne(['author' => $seller]);

        static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/rate-seller', [
            'headers' => $headers,
            'json' => ['rating' => 4.5],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'ratings' => [['@id' => '/api/users/'.$rater->getId()]],
            'author' => ['rating' => 4.5],
        ]);
    }

    public function testOwnerCannotRateOwnAnnonceSeller(): void
    {
        [$headers, , $owner] = $this->authenticatedHeadersAndUserIri([]);
        $annonce = AnnonceFactory::createOne(['author' => $owner]);

        static::createClient()->request('POST', '/api/annonces/'.$annonce->getId().'/rate-seller', [
            'headers' => $headers,
            'json' => ['rating' => 5],
        ]);

        $this->assertResponseStatusCodeSame(400);
    }

    /**
     * @param list<string> $expectedTitles
     */
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
        yield 'sold status' => ['sold=true', ['Expensive car']];
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
     * @return array{array<string, string>, string, User}
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
            'sold' => false,
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
            'sold' => true,
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
