<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\AnnonceCategoryResource;
use App\Enum\AnnonceCategory;

final class AnnonceCategoryProvider implements ProviderInterface
{
    /**
     * @return list<AnnonceCategoryResource>
     */
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        return array_map(
            static fn (string $category): AnnonceCategoryResource => new AnnonceCategoryResource($category),
            AnnonceCategory::values(),
        );
    }
}
