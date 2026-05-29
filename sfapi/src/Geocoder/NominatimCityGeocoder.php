<?php

namespace App\Geocoder;

final class NominatimCityGeocoder implements CityGeocoderInterface
{
    private const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
    private const FALLBACK_COORDINATES = [
        'angers' => ['47.4784000', '-0.5632000'],
        'bordeaux' => ['44.8378000', '-0.5792000'],
        'dijon' => ['47.3220000', '5.0415000'],
        'grenoble' => ['45.1885000', '5.7245000'],
        'lille' => ['50.6292000', '3.0573000'],
        'lyon' => ['45.7640000', '4.8357000'],
        'marseille' => ['43.2965000', '5.3698000'],
        'montpellier' => ['43.6108000', '3.8767000'],
        'nantes' => ['47.2184000', '-1.5536000'],
        'nice' => ['43.7102000', '7.2620000'],
        'paris' => ['48.8566000', '2.3522000'],
        'rennes' => ['48.1173000', '-1.6778000'],
        'strasbourg' => ['48.5734000', '7.7521000'],
        'toulouse' => ['43.6047000', '1.4442000'],
        'tours' => ['47.3941000', '0.6848000'],
    ];

    public function geocodeCity(string $city): ?Coordinates
    {
        $city = trim($city);
        if ('' === $city) {
            return null;
        }

        $fallback = $this->fallbackCoordinates($city);
        if (null !== $fallback) {
            return $fallback;
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

    private function fallbackCoordinates(string $city): ?Coordinates
    {
        $normalizedCity = mb_strtolower(trim($city));
        $coordinates = self::FALLBACK_COORDINATES[$normalizedCity] ?? null;

        return null === $coordinates ? null : new Coordinates($coordinates[0], $coordinates[1]);
    }
}
