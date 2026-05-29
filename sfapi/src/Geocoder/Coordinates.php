<?php

namespace App\Geocoder;

final readonly class Coordinates
{
    public function __construct(
        public string $latitude,
        public string $longitude,
    ) {
    }
}
