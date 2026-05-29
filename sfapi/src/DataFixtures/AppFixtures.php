<?php

namespace App\DataFixtures;

use App\Factory\DragonTreasureFactory;
use App\Factory\UserFactory;
use App\Factory\ApiTokenFactory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // $product = new Product();
        // $manager->persist($product);
        $user = UserFactory::createOne([
            "email" => "admin@example.com",
            "password" => "123456",
        ]);

        ApiTokenFactory::createMany(3,
        function() use ($user) {
            return [
                "ownedBy" => $user,
            ];
        });

        DragonTreasureFactory::createMany(10, function() use ($user) {
            return [
                "user" => $user,
            ];
        });
        $manager->flush();
    }
}
