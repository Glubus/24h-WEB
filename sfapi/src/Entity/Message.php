<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\State\CurrentUserMessagesProvider;
use App\State\MessageDeleteProcessor;
use App\State\MessagePersistProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/messages',
            normalizationContext: ['groups' => ['message:read', 'conversation:read', 'user:read', 'annonce:list']],
            security: 'is_granted("ROLE_USER")',
            provider: CurrentUserMessagesProvider::class,
        ),
        new Post(
            uriTemplate: '/messages',
            normalizationContext: ['groups' => ['message:read', 'conversation:read', 'user:read', 'annonce:list']],
            denormalizationContext: ['groups' => ['message:write']],
            security: 'is_granted("ROLE_USER")',
            processor: MessagePersistProcessor::class,
        ),
        new Delete(
            uriTemplate: '/messages/{id}',
            security: 'object.getConversation().hasParticipant(user)',
            processor: MessageDeleteProcessor::class,
        ),
    ],
)]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['message:read'])]
    private int $id = 0;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:read', 'message:write'])]
    private ?Conversation $conversation = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:read'])]
    private ?User $author = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['message:read', 'message:write'])]
    private ?string $content = null;

    #[ORM\ManyToOne]
    #[Groups(['message:read', 'message:write'])]
    private ?Annonce $annonce = null;

    #[ORM\Column]
    #[Groups(['message:read'])]
    private bool $deleted = false;

    #[ORM\Column]
    #[Groups(['message:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return 0 === $this->id ? null : $this->id;
    }

    public function getConversation(): ?Conversation
    {
        return $this->conversation;
    }

    public function setConversation(?Conversation $conversation): static
    {
        $this->conversation = $conversation;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->deleted ? 'Message supprimé' : $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getAnnonce(): ?Annonce
    {
        return $this->annonce;
    }

    public function setAnnonce(?Annonce $annonce): static
    {
        $this->annonce = $annonce;

        return $this;
    }

    public function isDeleted(): bool
    {
        return $this->deleted;
    }

    public function setDeleted(bool $deleted): static
    {
        $this->deleted = $deleted;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
