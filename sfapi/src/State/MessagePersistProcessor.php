<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Annonce;
use App\Entity\Message;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProcessorInterface<mixed, mixed>
 */
final class MessagePersistProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly Security $security,
        /** @var ProcessorInterface<mixed, mixed> */
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Message) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            throw new AccessDeniedHttpException('Authentication required.');
        }

        $conversation = $data->getConversation();
        if (null === $conversation || !$conversation->hasParticipant($currentUser)) {
            throw new AccessDeniedHttpException('Conversation not available.');
        }

        if ('' === trim((string) $data->getContent()) && null === $data->getAnnonce()) {
            throw new BadRequestHttpException('Message content or annonce embed is required.');
        }

        $annonce = $data->getAnnonce();
        if ($annonce instanceof Annonce && !$this->canEmbedAnnonce($annonce, $conversation->getUserOne(), $conversation->getUserTwo())) {
            throw new AccessDeniedHttpException('Annonce cannot be embedded in this conversation.');
        }

        $data->setAuthor($currentUser);

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    private function canEmbedAnnonce(Annonce $annonce, ?User $userOne, ?User $userTwo): bool
    {
        $authorId = $annonce->getAuthor()?->getId();

        return null !== $authorId && ($authorId === $userOne?->getId() || $authorId === $userTwo?->getId());
    }
}
