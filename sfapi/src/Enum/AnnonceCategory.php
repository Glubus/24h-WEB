<?php

namespace App\Enum;

enum AnnonceCategory: string
{
    case Electronics = 'electronics';
    case Furniture = 'furniture';
    case Clothing = 'clothing';
    case Vehicles = 'vehicles';
    case RealEstate = 'real_estate';
    case Services = 'services';
    case Leisure = 'leisure';
    case Other = 'other';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $category): string => $category->value, self::cases());
    }
}
