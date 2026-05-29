<?php

namespace App\Tests\Double;

use App\Geocoder\CityGeocoderInterface;
use App\Geocoder\Coordinates;

final class FakeCityGeocoder implements CityGeocoderInterface
{
    public function geocodeCity(string $city): ?Coordinates
    {
        return match (mb_strtolower(trim($city))) {
            'paris' => new Coordinates('48.8566000', '2.3522000'),
            'lyon' => new Coordinates('45.7640000', '4.8357000'),
            default => null,
        };
    }
}
