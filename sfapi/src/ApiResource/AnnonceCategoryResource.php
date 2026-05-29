<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\State\AnnonceCategoryProvider;

#[ApiResource(
    shortName: 'AnnonceCategory',
    operations: [
        new GetCollection(
            uriTemplate: '/annonces/categories',
            provider: AnnonceCategoryProvider::class,
        ),
    ],
)]
final class AnnonceCategoryResource
{
    public function __construct(
        public string $value,
    ) {
    }
}
