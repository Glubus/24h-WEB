<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Annonce;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @implements ProcessorInterface<Annonce, Annonce>
 */
final class AnnonceImageDeleteProcessor implements ProcessorInterface
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Annonce
    {
        if (!$data instanceof Annonce) {
            throw new BadRequestHttpException('Annonce not found.');
        }

        $rawImageIndex = $uriVariables['imageIndex'] ?? null;
        if (!is_numeric($rawImageIndex)) {
            throw new BadRequestHttpException('Invalid image index.');
        }

        try {
            $data->removeImageAt((int) $rawImageIndex);
        } catch (\OutOfBoundsException) {
            throw new NotFoundHttpException('Image not found.');
        }

        $this->entityManager->flush();

        return $data;
    }
}
