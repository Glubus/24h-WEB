<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Annonce;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final class VisibleAnnonceExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    public function __construct(private readonly Security $security)
    {
    }

    /**
     * @param array<string, mixed> $context
     */
    public function applyToCollection(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        if ($operation?->getUriTemplate() !== '/annonces') {
            return;
        }

        $this->addVisibleFilter($queryBuilder, $resourceClass);
    }

    /**
     * @param array<string, mixed> $identifiers
     * @param array<string, mixed> $context
     */
    public function applyToItem(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        array $identifiers,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        if ($operation?->getUriTemplate() !== '/annonces/{id}') {
            return;
        }

        $this->addVisibleFilter($queryBuilder, $resourceClass);
    }

    private function addVisibleFilter(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        if (Annonce::class !== $resourceClass || $this->security->isGranted('ROLE_ADMIN')) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];

        $queryBuilder
            ->andWhere(sprintf('%s.masked = :visibleAnnonceMasked', $rootAlias))
            ->andWhere(sprintf('%s.sold = :visibleAnnonceSold', $rootAlias))
            ->setParameter('visibleAnnonceMasked', false)
            ->setParameter('visibleAnnonceSold', false);
    }
}
