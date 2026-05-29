<?php

namespace App\Factory;

use App\Entity\DragonTreasure;
use Zenstruck\Foundry\Persistence\PersistentProxyObjectFactory;

/**
 * @extends PersistentProxyObjectFactory<DragonTreasure>
 */
final class DragonTreasureFactory extends PersistentProxyObjectFactory
{

    const TREASURE_NAME = [
        'Diamond',
        'Gold',
        'Silver',
        'Bronze',
        'Iron',
    ];
    /**
     * 
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#factories-as-services
     *
     * @todo inject services if required
     */
    public function __construct()
    {
    }

    public static function class(): string
    {
        return DragonTreasure::class;
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#model-factories
     *
     * @todo add your default values here
     */
    protected function defaults(): array|callable
    {
        return [
            'coolFactor' => self::faker()->randomNumber(),
            'createdAt' => \DateTimeImmutable::createFromMutable(self::faker()->dateTimeBetween('-25 year', 'now')),
            'description' => self::faker()->paragraphs(2, true),
            'isPublished' => self::faker()->boolean(),
            'value' => self::faker()->numberBetween(500, mt_getrandmax()),
            'name' => self::faker()->randomElement(self::TREASURE_NAME),
            'user' => UserFactory::new(),
            'x' => self::faker()->numberBetween(10, 1000),
            'y' => self::faker()->numberBetween(10, 1000),
        ];
    }

    /**
     * @see https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html#initialization
     */
    protected function initialize(): static
    {
        return $this
            // ->afterInstantiate(function(DragonTreasure $dragonTreasure): void {})
        ;
    }
}
