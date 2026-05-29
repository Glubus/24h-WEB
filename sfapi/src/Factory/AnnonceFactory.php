<?php

namespace App\Factory;

use App\Entity\Annonce;
use App\Enum\AnnonceCategory;
use Zenstruck\Foundry\Persistence\PersistentProxyObjectFactory;

/**
 * @extends PersistentProxyObjectFactory<Annonce>
 */
final class AnnonceFactory extends PersistentProxyObjectFactory
{
    public static function class(): string
    {
        return Annonce::class;
    }

    protected function defaults(): array|callable
    {
        return [
            'author' => UserFactory::new(),
            'categories' => [self::faker()->randomElement(AnnonceCategory::values())],
            'description' => self::faker()->paragraphs(2, true),
            'latitude' => (string) self::faker()->latitude(),
            'longitude' => (string) self::faker()->longitude(),
            'masked' => false,
            'price' => self::faker()->randomFloat(2, 0, 10000),
            'title' => self::faker()->sentence(4),
        ];
    }
}
