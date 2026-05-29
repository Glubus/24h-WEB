<?php

namespace App\DataFixtures;

use App\Entity\ApiToken;
use App\Entity\User;
use App\Enum\AnnonceCategory;
use App\Factory\AnnonceFactory;
use App\Factory\ApiTokenFactory;
use App\Factory\UserFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private const PARIS_LATITUDE = '48.8566000';
    private const PARIS_LONGITUDE = '2.3522000';

    public function __construct(private UserPasswordHasherInterface $userPasswordHasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        $uploads = $this->prepareUploads();

        $admin = new User();
        $admin->setEmail('admin@example.com');
        $admin->setUsername('admin');
        $admin->setPhone('+33100000000');
        $admin->setRating(5);
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setProfileImagePath($uploads['users'][0]);
        $admin->setPassword($this->userPasswordHasher->hashPassword($admin, 'changeme'));
        $manager->persist($admin);

        $demoUser = new User();
        $demoUser->setEmail('demo@example.com');
        $demoUser->setUsername('mael');
        $demoUser->setPhone('+33600000000');
        $demoUser->setRating(4.7);
        $demoUser->setRoles(['ROLE_USER']);
        $demoUser->setProfileImagePath($uploads['users'][1]);
        $demoUser->setPassword($this->userPasswordHasher->hashPassword($demoUser, 'changeme'));
        $manager->persist($demoUser);

        $moderator = UserFactory::createOne([
            'email' => 'moderator@example.com',
            'password' => 'password',
            'phone' => '+33100000001',
            'profileImagePath' => $uploads['users'][2],
            'rating' => 4.8,
            'roles' => ['ROLE_MODERATOR'],
            'username' => 'moderator',
        ]);

        $users = [
            UserFactory::createOne([
                'email' => 'claire.martin@example.com',
                'password' => 'password',
                'phone' => '+33601020304',
                'profileImagePath' => $uploads['users'][0],
                'rating' => 4.6,
                'username' => 'claire',
            ]),
            UserFactory::createOne([
                'email' => 'hugo.bernard@example.com',
                'password' => 'password',
                'phone' => '+33605060708',
                'profileImagePath' => $uploads['users'][1],
                'rating' => 4.2,
                'username' => 'hugo',
            ]),
            UserFactory::createOne([
                'email' => 'sarah.dubois@example.com',
                'password' => 'password',
                'phone' => '+33611121314',
                'profileImagePath' => $uploads['users'][2],
                'rating' => 4.9,
                'username' => 'sarah',
            ]),
            UserFactory::createOne([
                'email' => 'nicolas.moreau@example.com',
                'password' => 'password',
                'phone' => '+33615161718',
                'profileImagePath' => $uploads['users'][0],
                'rating' => 3.9,
                'username' => 'nicolas',
            ]),
            UserFactory::createOne([
                'email' => 'ines.leroy@example.com',
                'password' => 'password',
                'phone' => '+33619202122',
                'profileImagePath' => $uploads['users'][1],
                'rating' => 4.4,
                'username' => 'ines',
            ]),
            UserFactory::createOne([
                'email' => 'thomas.petit@example.com',
                'password' => 'password',
                'phone' => '+33623242526',
                'profileImagePath' => $uploads['users'][2],
                'rating' => 4.1,
                'username' => 'thomas',
            ]),
        ];

        ApiTokenFactory::createOne([
            'ownedBy' => $admin,
            'scopes' => [ApiToken::SCOPE_USER_EDIT, ApiToken::SCOPE_ANNONCE_CREATE, ApiToken::SCOPE_ANNONCE_EDIT],
        ]);

        ApiTokenFactory::createOne([
            'ownedBy' => $demoUser,
            'scopes' => [ApiToken::SCOPE_USER_EDIT, ApiToken::SCOPE_ANNONCE_CREATE, ApiToken::SCOPE_ANNONCE_EDIT],
        ]);

        ApiTokenFactory::createOne([
            'ownedBy' => $moderator,
            'scopes' => [ApiToken::SCOPE_ANNONCE_EDIT],
        ]);

        foreach ($users as $user) {
            ApiTokenFactory::createOne([
                'ownedBy' => $user,
                'scopes' => [ApiToken::SCOPE_USER_EDIT, ApiToken::SCOPE_ANNONCE_CREATE, ApiToken::SCOPE_ANNONCE_EDIT],
            ]);
        }

        $this->createAnnonce([
            'author' => $demoUser,
            'categories' => [AnnonceCategory::Home->value],
            'title' => 'Canapé convertible',
            'description' => 'Canapé confortable, parfait pour un salon parisien. Disponible rapidement.',
            'price' => 280,
            'city' => 'Paris',
            'address' => '10 rue de Rivoli',
            'images' => [$uploads['annonces'][0], $uploads['annonces'][1]],
        ]);

        $this->createAnnonce([
            'author' => $admin,
            'categories' => [AnnonceCategory::Electronic->value],
            'title' => 'MacBook Pro 14 pouces',
            'description' => 'Ordinateur en très bon état, vendu avec son chargeur et sa housse.',
            'price' => 1250,
            'city' => 'Paris',
            'address' => '25 avenue Daumesnil',
            'images' => [$uploads['annonces'][2]],
        ]);

        $this->createAnnonce([
            'author' => $users[0],
            'categories' => [AnnonceCategory::Car->value],
            'title' => 'Renault Clio essence',
            'description' => 'Petite voiture fiable, entretien à jour, idéale pour la ville.',
            'price' => 6200,
            'city' => 'Lyon',
            'address' => 'Place Bellecour',
            'latitude' => '45.7640000',
            'longitude' => '4.8357000',
            'images' => [$uploads['annonces'][3]],
        ]);

        $this->createAnnonce([
            'author' => $users[1],
            'categories' => [AnnonceCategory::Sport->value],
            'title' => 'Vélo route carbone',
            'description' => 'Vélo léger, révisé récemment, prêt pour les sorties longues.',
            'price' => 900,
            'city' => 'Marseille',
            'address' => 'Vieux-Port',
            'latitude' => '43.2965000',
            'longitude' => '5.3698000',
            'images' => [$uploads['annonces'][4]],
        ]);

        foreach ($this->extraAnnonces($users, $uploads['annonces']) as $annonceData) {
            $this->createAnnonce($annonceData);
        }

        $manager->flush();
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createAnnonce(array $data): void
    {
        if (($data['city'] ?? null) === 'Paris') {
            $data['latitude'] = self::PARIS_LATITUDE;
            $data['longitude'] = self::PARIS_LONGITUDE;
        }

        AnnonceFactory::createOne([
            'masked' => false,
            'sold' => false,
            ...$data,
        ]);
    }

    /**
     * @param list<object> $users
     * @param list<string> $images
     * @return list<array<string, mixed>>
     */
    private function extraAnnonces(array $users, array $images): array
    {
        return [
            [
                'author' => $users[2],
                'categories' => [AnnonceCategory::Home->value],
                'title' => 'Fauteuil scandinave en tissu gris',
                'description' => 'Fauteuil propre et confortable, idéal pour un coin lecture. À récupérer sur place.',
                'price' => 120,
                'city' => 'Nantes',
                'address' => '12 rue Crébillon',
                'latitude' => '47.2184000',
                'longitude' => '-1.5536000',
                'images' => [$images[7], $images[1]],
            ],
            [
                'author' => $users[3],
                'categories' => [AnnonceCategory::Electronic->value],
                'title' => 'iPhone 13 128 Go bleu',
                'description' => 'Téléphone débloqué tout opérateur, batterie en bon état, vendu avec câble USB-C.',
                'price' => 430,
                'city' => 'Toulouse',
                'address' => 'Place du Capitole',
                'latitude' => '43.6047000',
                'longitude' => '1.4442000',
                'images' => [$images[8]],
            ],
            [
                'author' => $users[4],
                'categories' => [AnnonceCategory::Home->value],
                'title' => 'Machine à café automatique',
                'description' => 'Machine entretenue régulièrement, parfaite pour espresso et cappuccino.',
                'price' => 180,
                'city' => 'Bordeaux',
                'address' => 'Cours de l’Intendance',
                'latitude' => '44.8378000',
                'longitude' => '-0.5792000',
                'images' => [$images[6]],
            ],
            [
                'author' => $users[5],
                'categories' => [AnnonceCategory::Sport->value],
                'title' => 'VTT semi-rigide taille M',
                'description' => 'VTT révisé, freins récents, pneus en très bon état. Convient pour chemins et ville.',
                'price' => 520,
                'city' => 'Grenoble',
                'address' => 'Avenue Alsace-Lorraine',
                'latitude' => '45.1885000',
                'longitude' => '5.7245000',
                'images' => [$images[4]],
            ],
            [
                'author' => $users[0],
                'categories' => [AnnonceCategory::Electronic->value],
                'title' => 'Écran 27 pouces QHD',
                'description' => 'Écran idéal pour télétravail ou gaming léger, vendu avec câble HDMI.',
                'price' => 210,
                'city' => 'Lille',
                'address' => 'Grand Place',
                'latitude' => '50.6292000',
                'longitude' => '3.0573000',
                'images' => [$images[2]],
                'sold' => true,
            ],
            [
                'author' => $users[1],
                'categories' => [AnnonceCategory::Car->value],
                'title' => 'Peugeot 208 diesel',
                'description' => 'Voiture économique, contrôle technique valide, quelques marques d’usage.',
                'price' => 7400,
                'city' => 'Rennes',
                'address' => 'Rue d’Antrain',
                'latitude' => '48.1173000',
                'longitude' => '-1.6778000',
                'images' => [$images[3]],
            ],
            [
                'author' => $users[2],
                'categories' => [AnnonceCategory::Home->value],
                'title' => 'Table basse en chêne massif',
                'description' => 'Table basse robuste avec quelques traces normales d’utilisation.',
                'price' => 95,
                'city' => 'Strasbourg',
                'address' => 'Place Kléber',
                'latitude' => '48.5734000',
                'longitude' => '7.7521000',
                'images' => [$images[5], $images[7]],
            ],
            [
                'author' => $users[3],
                'categories' => [AnnonceCategory::Electronic->value],
                'title' => 'Casque audio Bluetooth',
                'description' => 'Casque léger avec réduction de bruit, autonomie correcte, étui inclus.',
                'price' => 75,
                'city' => 'Montpellier',
                'address' => 'Place de la Comédie',
                'latitude' => '43.6108000',
                'longitude' => '3.8767000',
                'images' => [$images[8]],
            ],
            [
                'author' => $users[4],
                'categories' => [AnnonceCategory::Sport->value],
                'title' => 'Tapis de course pliable',
                'description' => 'Tapis de course compact, fonctionne parfaitement, idéal appartement.',
                'price' => 260,
                'city' => 'Nice',
                'address' => 'Avenue Jean Médecin',
                'latitude' => '43.7102000',
                'longitude' => '7.2620000',
                'images' => [$images[5]],
                'sold' => true,
            ],
            [
                'author' => $users[5],
                'categories' => [AnnonceCategory::Home->value],
                'title' => 'Lot de chaises de cuisine',
                'description' => 'Quatre chaises solides, structure bois, assise confortable.',
                'price' => 140,
                'city' => 'Angers',
                'address' => 'Boulevard Foch',
                'latitude' => '47.4784000',
                'longitude' => '-0.5632000',
                'images' => [$images[7]],
            ],
            [
                'author' => $users[0],
                'categories' => [AnnonceCategory::Electronic->value],
                'title' => 'Tablette Android 10 pouces',
                'description' => 'Tablette fluide pour navigation, vidéos et prise de notes. Chargeur fourni.',
                'price' => 160,
                'city' => 'Tours',
                'address' => 'Rue Nationale',
                'latitude' => '47.3941000',
                'longitude' => '0.6848000',
                'images' => [$images[8], $images[2]],
            ],
            [
                'author' => $users[1],
                'categories' => [AnnonceCategory::Car->value],
                'title' => 'Porte-vélos pour hayon',
                'description' => 'Porte-vélos compatible avec la plupart des citadines, fixation simple.',
                'price' => 65,
                'city' => 'Dijon',
                'address' => 'Place Darcy',
                'latitude' => '47.3220000',
                'longitude' => '5.0415000',
                'images' => [$images[4], $images[3]],
            ],
        ];
    }

    /**
     * @return array{users: list<string>, annonces: list<string>}
     */
    private function prepareUploads(): array
    {
        $uploadRoot = dirname(__DIR__, 2).'/public/uploads';
        $usersDir = $uploadRoot.'/users';
        $annoncesDir = $uploadRoot.'/annonces';

        if (!is_dir($usersDir)) {
            mkdir($usersDir, 0775, true);
        }

        if (!is_dir($annoncesDir)) {
            mkdir($annoncesDir, 0775, true);
        }

        $assetDir = __DIR__.'/assets';
        $userImages = [
            'fixture-admin.jpg' => $assetDir.'/user-admin.jpg',
            'fixture-mael.jpg' => $assetDir.'/user-mael.jpg',
            'fixture-moderator.jpg' => $assetDir.'/user-moderator.jpg',
        ];

        $annonceImages = [
            'fixture-canape.jpg' => $assetDir.'/annonce-canape.jpg',
            'fixture-salon.jpg' => $assetDir.'/annonce-salon.jpg',
            'fixture-laptop.jpg' => $assetDir.'/annonce-laptop.jpg',
            'fixture-car.jpg' => $assetDir.'/annonce-car.jpg',
            'fixture-bike.jpg' => $assetDir.'/annonce-bike.jpg',
            'fixture-listing.jpg' => $assetDir.'/annonce-listing.jpg',
            'fixture-coffee.jpg' => $assetDir.'/annonce-coffee.jpg',
            'fixture-chair.jpg' => $assetDir.'/annonce-chair.jpg',
            'fixture-phone.jpg' => $assetDir.'/annonce-phone.jpg',
        ];

        foreach ($userImages as $filename => $source) {
            copy($source, $usersDir.'/'.$filename);
        }

        foreach ($annonceImages as $filename => $source) {
            copy($source, $annoncesDir.'/'.$filename);
        }

        return [
            'users' => array_map(static fn (string $filename): string => '/uploads/users/'.$filename, array_keys($userImages)),
            'annonces' => array_map(static fn (string $filename): string => '/uploads/annonces/'.$filename, array_keys($annonceImages)),
        ];
    }

}
