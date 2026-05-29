<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Annonce;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProcessorInterface<Annonce, Annonce>
 */
final class AnnoncePurchaseProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Annonce
    {
        if (!$data instanceof Annonce) {
            throw new BadRequestHttpException('Annonce not found.');
        }

        $buyer = $this->security->getUser();
        $seller = $data->getAuthor();
        if (!$buyer instanceof User || !$seller instanceof User) {
            throw new BadRequestHttpException('Purchase cannot be saved.');
        }

        if ($seller->getId() === $buyer->getId()) {
            throw new BadRequestHttpException('You cannot buy your own annonce.');
        }

        if ($data->isSold()) {
            throw new BadRequestHttpException('Annonce is already sold.');
        }

        $data->setBuyer($buyer);
        $data->setSold(true);
        $this->entityManager->flush();

        return $data;
    }
}
