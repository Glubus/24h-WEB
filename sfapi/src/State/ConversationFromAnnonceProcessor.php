<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Annonce;
use App\Entity\Conversation;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProcessorInterface<mixed, Conversation>
 */
final class ConversationFromAnnonceProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Conversation
    {
        if (!$data instanceof Annonce) {
            throw new BadRequestHttpException('Annonce not found.');
        }

        $currentUser = $this->security->getUser();
        $seller = $data->getAuthor();
        if (!$currentUser instanceof User || !$seller instanceof User) {
            throw new BadRequestHttpException('Conversation cannot be created.');
        }

        if ($currentUser->getId() === $seller->getId()) {
            throw new BadRequestHttpException('You cannot start a conversation with yourself.');
        }

        $conversation = $this->findConversation($currentUser, $seller);
        if ($conversation instanceof Conversation) {
            return $conversation;
        }

        $conversation = (new Conversation())
            ->setUserOne($currentUser)
            ->setUserTwo($seller);

        $this->entityManager->persist($conversation);
        $this->entityManager->flush();

        return $conversation;
    }

    private function findConversation(User $userOne, User $userTwo): ?Conversation
    {
        return $this->entityManager->createQueryBuilder()
            ->select('conversation')
            ->from(Conversation::class, 'conversation')
            ->andWhere(
                '(conversation.userOne = :userOne AND conversation.userTwo = :userTwo) OR '.
                '(conversation.userOne = :userTwo AND conversation.userTwo = :userOne)',
            )
            ->setParameter('userOne', $userOne)
            ->setParameter('userTwo', $userTwo)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
