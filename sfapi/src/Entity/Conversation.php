<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\State\CurrentUserConversationsProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/conversations',
            normalizationContext: ['groups' => ['conversation:read', 'user:read']],
            security: 'is_granted("ROLE_USER")',
            provider: CurrentUserConversationsProvider::class,
        ),
        new Get(
            uriTemplate: '/conversations/{id}',
            normalizationContext: ['groups' => ['conversation:read', 'user:read']],
            security: 'object.hasParticipant(user)',
        ),
    ],
)]
class Conversation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['conversation:read', 'message:read'])]
    private int $id = 0;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['conversation:read'])]
    private ?User $userOne = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['conversation:read', 'conversation:write'])]
    private ?User $userTwo = null;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'conversation', orphanRemoval: true)]
    private Collection $messages;

    #[ORM\Column]
    #[Groups(['conversation:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->messages = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return 0 === $this->id ? null : $this->id;
    }

    public function getUserOne(): ?User
    {
        return $this->userOne;
    }

    public function setUserOne(?User $userOne): static
    {
        $this->userOne = $userOne;

        return $this;
    }

    public function getUserTwo(): ?User
    {
        return $this->userTwo;
    }

    public function setUserTwo(?User $userTwo): static
    {
        $this->userTwo = $userTwo;

        return $this;
    }

    public function hasParticipant(?User $user): bool
    {
        if (null === $user) {
            return false;
        }

        return $this->userOne?->getId() === $user->getId() || $this->userTwo?->getId() === $user->getId();
    }

    /**
     * @return Collection<int, Message>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
