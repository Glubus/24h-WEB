<?php

namespace App\Factory;

use App\Entity\User;
use Zenstruck\Foundry\Persistence\PersistentProxyObjectFactory;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
/**
 * @extends PersistentProxyObjectFactory<User>
 */
final class UserFactory extends PersistentProxyObjectFactory
{

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#factories-as-services
     *
     * @todo inject services if required
     */
    public function __construct(private UserPasswordHasherInterface $userPasswordHasher)
    {
    }

    public static function class(): string
    {
        return User::class;
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#model-factories
     *
     * @todo add your default values here
     */
    protected function defaults(): array|callable
    {
        $firstName = self::faker()->randomElement(['Camille', 'Lucas', 'Lea', 'Antoine', 'Manon', 'Julien']);
        $lastName = self::faker()->randomElement(['Martin', 'Bernard', 'Dubois', 'Moreau', 'Leroy', 'Petit']);
        $username = strtolower($firstName.'.'.$lastName.self::faker()->unique()->numberBetween(1, 999));

        return [
            'email' => self::faker()->unique()->safeEmail(),
            'password' => 'password',
            'phone' => '+336'.self::faker()->unique()->numerify('########'),
            'rating' => self::faker()->randomFloat(1, 3, 5),
            'roles' => [],
            'username' => $username,
        ];
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#initialization
     */
    protected function initialize(): static
    {
        return $this
            ->afterInstantiate(function(User $user): void {
                $user->setPassword($this->userPasswordHasher->hashPassword($user, $user->getPassword()));
            })
        ;
    }
}
