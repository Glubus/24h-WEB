<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Conversation;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<Conversation>
 */
final class CurrentUserConversationsProvider implements ProviderInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return [];
        }

        return $this->entityManager->createQueryBuilder()
            ->select('conversation')
            ->from(Conversation::class, 'conversation')
            ->andWhere('conversation.userOne = :user OR conversation.userTwo = :user')
            ->setParameter('user', $user)
            ->orderBy('conversation.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
