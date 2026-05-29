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
    public function __construct(private UserPasswordHasherInterface $userPasswordHasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        $admin = new User();
        $admin->setEmail('admin@example.com');
        $admin->setUsername('admin');
        $admin->setPhone('+33100000000');
        $admin->setRating(5);
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->userPasswordHasher->hashPassword($admin, 'changeme'));
        $manager->persist($admin);

        $moderator = UserFactory::createOne([
            'email' => 'moderator@example.com',
            'password' => 'password',
            'phone' => '+33100000001',
            'rating' => 4.8,
            'roles' => ['ROLE_MODERATOR'],
            'username' => 'moderator',
        ]);

        $users = UserFactory::createMany(6);

        ApiTokenFactory::createOne([
            'ownedBy' => $admin,
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

        foreach (AnnonceCategory::values() as $category) {
            AnnonceFactory::createOne([
                'author' => $users[array_rand($users)],
                'categories' => [$category],
                'masked' => false,
                'sold' => false,
            ]);
        }

        AnnonceFactory::createMany(16, static fn () => [
            'author' => $users[array_rand($users)],
            'categories' => [AnnonceCategory::values()[array_rand(AnnonceCategory::values())]],
            'masked' => random_int(0, 4) === 0,
            'sold' => random_int(0, 5) === 0,
        ]);

        $manager->flush();
    }
}
