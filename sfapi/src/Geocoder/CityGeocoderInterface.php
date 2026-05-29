<?php

namespace App\Geocoder;

interface CityGeocoderInterface
{
    public function geocodeCity(string $city): ?Coordinates;
}
