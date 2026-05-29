<?php

namespace App\Enum;

enum AnnonceCategory: string
{
    case Car = 'car';
    case Electronic = 'electronic';
    case Sport = 'sport';
    case Home = 'home';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $category): string => $category->value, self::cases());
    }
}
