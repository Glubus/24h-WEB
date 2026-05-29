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
        $locations = [
            ['Paris', '18 rue Montorgueil', '48.8566000', '2.3522000'],
            ['Lyon', '6 rue de la Republique', '45.7640000', '4.8357000'],
            ['Marseille', '22 quai de Rive Neuve', '43.2965000', '5.3698000'],
            ['Nantes', '14 rue Crebillon', '47.2184000', '-1.5536000'],
            ['Bordeaux', '8 cours de l Intendance', '44.8378000', '-0.5792000'],
        ];
        [$city, $address, $latitude, $longitude] = self::faker()->randomElement($locations);
        $annonces = [
            ['Canape trois places', 'Canape propre et confortable, a recuperer sur place.', AnnonceCategory::Home->value, 260],
            ['Velo urbain revise', 'Velo en bon etat, pneus recents et freins verifies.', AnnonceCategory::Sport->value, 180],
            ['Ordinateur portable 15 pouces', 'Ordinateur fiable pour bureautique, vendu avec chargeur.', AnnonceCategory::Electronic->value, 420],
            ['Peugeot 208 entretenue', 'Citadine propre, entretien suivi et controle technique valide.', AnnonceCategory::Car->value, 7300],
        ];
        [$title, $description, $category, $price] = self::faker()->randomElement($annonces);

        return [
            'address' => $address,
            'author' => UserFactory::new(),
            'categories' => [$category],
            'city' => $city,
            'description' => $description,
            'images' => [],
            'latitude' => $latitude,
            'longitude' => $longitude,
            'masked' => false,
            'price' => $price,
            'sold' => false,
            'title' => $title,
        ];
    }
}
