<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Annonce;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProcessorInterface<Annonce, Annonce>
 */
final class SellerRatingProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly RequestStack $requestStack,
        private readonly Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Annonce
    {
        if (!$data instanceof Annonce) {
            throw new BadRequestHttpException('Annonce not found.');
        }

        $currentUser = $this->security->getUser();
        $seller = $data->getAuthor();
        if (!$currentUser instanceof User || !$seller instanceof User) {
            throw new BadRequestHttpException('Rating cannot be saved.');
        }

        if ($seller->getId() === $currentUser->getId()) {
            throw new BadRequestHttpException('You cannot rate yourself.');
        }

        $payload = json_decode($this->requestStack->getCurrentRequest()?->getContent() ?? '', true);
        $rating = is_array($payload) ? ($payload['rating'] ?? null) : null;
        if (!is_numeric($rating) || (float) $rating < 1 || (float) $rating > 5) {
            throw new BadRequestHttpException('Rating must be between 1 and 5.');
        }

        $seller->setRating(round((float) $rating, 1));
        $data->addRating($currentUser);
        $this->entityManager->flush();

        return $data;
    }
}
