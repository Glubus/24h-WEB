<?php

namespace App\Geocoder;

final class NominatimCityGeocoder implements CityGeocoderInterface
{
    private const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

    public function geocodeCity(string $city): ?Coordinates
    {
        $city = trim($city);
        if ('' === $city) {
            return null;
        }

        $url = self::ENDPOINT.'?'.http_build_query([
            'city' => $city,
            'format' => 'jsonv2',
            'limit' => 1,
        ]);

        $context = stream_context_create([
            'http' => [
                'header' => [
                    'User-Agent: 24h-Web/1.0 contact@example.com',
                    'Accept: application/json',
                    'Accept-Language: fr',
                ],
                'ignore_errors' => true,
                'timeout' => 5,
            ],
        ]);

        $response = @file_get_contents($url, false, $context);
        if (false === $response) {
            return null;
        }

        $data = json_decode($response, true);
        if (!is_array($data) || !isset($data[0]['lat'], $data[0]['lon'])) {
            return null;
        }

        return new Coordinates((string) $data[0]['lat'], (string) $data[0]['lon']);
    }
}
