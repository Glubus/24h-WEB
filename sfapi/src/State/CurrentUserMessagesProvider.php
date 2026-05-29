<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Conversation;
use App\Entity\Message;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * @implements ProviderInterface<Message>
 */
final class CurrentUserMessagesProvider implements ProviderInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly RequestStack $requestStack,
        private readonly Security $security,
    ) {
    }

    /**
     * @return list<Message>
     */
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return [];
        }

        $queryBuilder = $this->entityManager->createQueryBuilder()
            ->select('message')
            ->from(Message::class, 'message')
            ->join('message.conversation', 'conversation')
            ->andWhere('conversation.userOne = :user OR conversation.userTwo = :user')
            ->setParameter('user', $user)
            ->orderBy('message.createdAt', 'ASC');

        $conversationId = $this->conversationIdFromRequest($this->requestStack->getCurrentRequest());
        if (null !== $conversationId) {
            $conversation = $this->entityManager->find(Conversation::class, $conversationId);
            if (!$conversation instanceof Conversation || !$conversation->hasParticipant($user)) {
                return [];
            }

            $queryBuilder
                ->andWhere('message.conversation = :conversation')
                ->setParameter('conversation', $conversation);
        }

        return $queryBuilder->getQuery()->getResult();
    }

    private function conversationIdFromRequest(?Request $request): ?int
    {
        $conversation = $request?->query->get('conversation');
        if (!is_string($conversation) || '' === $conversation) {
            return null;
        }

        if (preg_match('#/api/conversations/(\d+)$#', $conversation, $matches)) {
            return (int) $matches[1];
        }

        return ctype_digit($conversation) ? (int) $conversation : null;
    }
}
