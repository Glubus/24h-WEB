<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\State\MapProvider;
#[ApiResource(operations: [
    new Get(
        provider: MapProvider::class,
        )
    ],
)]
class Map{

    public function __construct(
        public string $imageUrl,
    ) {

    }
}                                                       