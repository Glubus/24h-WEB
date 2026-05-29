<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Annonce;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProcessorInterface<mixed, Annonce>
 */
final class AnnonceMaskedSwitchProcessor implements ProcessorInterface
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Annonce
    {
        if (!$data instanceof Annonce) {
            throw new BadRequestHttpException('Annonce not found.');
        }

        $data->switchMasket();
        $this->entityManager->flush();

        return $data;
    }
}
