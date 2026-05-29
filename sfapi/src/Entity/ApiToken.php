<?php

namespace App\Entity;

use App\Repository\ApiTokenRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ApiTokenRepository::class)]
class ApiToken
{
    public const PERSONAL_ACCESS_TOKEN_PREFIX = 'tcp_';

    public const SCOPE_USER_EDIT = 'ROLE_USER_EDIT';
    public const SCOPE_ANNONCE_CREATE = 'ROLE_ANNONCE_CREATE';
    public const SCOPE_ANNONCE_EDIT = 'ROLE_ANNONCE_EDIT';
    public const SCOPES = [
        self::SCOPE_USER_EDIT => 'Edit User',
        self::SCOPE_ANNONCE_CREATE => 'Create Annonce',
        self::SCOPE_ANNONCE_EDIT => 'Edit Annonce',
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    // @phpstan-ignore-next-line
    private ?int $id = null;

    #[ORM\Column(length: 68)]
    private ?string $token = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $expiresAt = null;

    /**
     * @var list<string>
     */
    #[ORM\Column]
    private array $scopes = [];

    #[ORM\ManyToOne(inversedBy: 'apiTokens')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $ownedBy = null;

    public function __construct(string $token_type = self::PERSONAL_ACCESS_TOKEN_PREFIX)
    {
        $this->token = $token_type.bin2hex(random_bytes(32));
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function getExpiresAt(): ?\DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    /**
     * @return list<string>
     */
    public function getScopes(): array
    {
        return $this->scopes;
    }

    /**
     * @param list<string> $scopes
     */
    public function setScopes(array $scopes): static
    {
        $this->scopes = $scopes;

        return $this;
    }

    public function getOwnedBy(): ?User
    {
        return $this->ownedBy;
    }

    public function setOwnedBy(?User $ownedBy): static
    {
        $this->ownedBy = $ownedBy;

        return $this;
    }

    public function isValid(): bool
    {
        return $this->expiresAt > new \DateTimeImmutable() && null !== $this->ownedBy;
    }
}
