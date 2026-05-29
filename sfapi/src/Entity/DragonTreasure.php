<?php

namespace App\Entity;

use App\Repository\DragonTreasureRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Link;
use Symfony\Component\Serializer\Attribute\Groups;
use Carbon\Carbon;
use Symfony\Component\Serializer\Attribute\SerializedName;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\RangeFilter;
use ApiPlatform\Doctrine\Orm\Filter\NumericFilter;
use Symfony\Component\Validator\Constraints as Assert;


#[ApiResource(
    description: 'A Dragon Treasure',
    shortName: 'Treasure',
    operations: [
        new GetCollection(uriTemplate: '/treasures'),
        new Post(uriTemplate: '/treasures', security: 'is_granted("ROLE_TREASURE_CREATE")'),
        new Get(uriTemplate: '/treasures/{id}'),
        new Put(uriTemplate: '/treasures/{id}'),
        new Patch(uriTemplate: '/treasures/{id}', security: 'is_granted("ROLE_TREASURE_EDIT") and object.getUser() == user',
                                                            securityPostDenormalize: 'object.getUser() == user'),
        new Delete(uriTemplate: '/treasures/{id}'),
    ],
    normalizationContext: ['groups' => ['treasure:read']],
    denormalizationContext: ['groups' => ['treasure:write']],
    security: 'is_granted("ROLE_USER")',
)]
#[ApiResource(
   uriTemplate: '/user/{user_id}/treasures.{_format}',
   shortName: 'Treasure',
   operations: [
    new GetCollection(uriTemplate: '/user/{user_id}/treasures'),
   ],
   uriVariables: [
    'user_id' => new Link(fromProperty: 'treasures', fromClass: User::class, toProperty: 'id'),
   ],
   normalizationContext: ['groups' => ['treasure:read']],
)]
#[ORM\Entity(repositoryClass: DragonTreasureRepository::class)]
class DragonTreasure
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['treasure:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['treasure:read','treasure:write'])]
    #[ApiFilter(SearchFilter::class, strategy: 'ipartial')]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['treasure:read','treasure:write'])]
    #[ApiFilter(NumericFilter::class)]
    #[Assert\Positive]
    private ?int $value = null;

    #[ORM\Column(length: 255)]
    #[Groups(['treasure:read','treasure:write'])]
    #[ApiFilter(SearchFilter::class, strategy: 'istart')]
    private ?string $name = null;

    #[ORM\Column]
    #[Groups(['treasure:read','treasure:write'])]
    #[ApiFilter(RangeFilter::class)]
    #[Assert\Range(min: 0, max: 10)]
    private ?int $coolFactor = null;

    #[ORM\Column]
    #[ApiFilter(DateFilter::class)]
    private ?\DateTimeImmutable $createdAt;

    #[ORM\Column]
    #[Groups(['treasure:read','treasure:write'])]
    #[ApiFilter(BooleanFilter::class)]
    private ?bool $isPublished = null;

    #[ORM\ManyToOne(inversedBy: 'treasures')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['treasure:read','treasure:write'])]
    private ?User $user = null;

    #[ORM\Column]
    #[Groups(['treasure:read','treasure:write'])]
    private ?int $x = null;

    #[ORM\Column]
    #[Groups(['treasure:read','treasure:write'])]
    private ?int $y = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getValue(): ?int
    {
        return $this->value;
    }

    public function setValue(int $value): static
    {
        $this->value = $value;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getCoolFactor(): ?int
    {
        return $this->coolFactor;
    }

    public function setCoolFactor(int $coolFactor): static
    {
        $this->coolFactor = $coolFactor;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function isPublished(): ?bool
    {
        return $this->isPublished;
    }

    public function setIsPublished(bool $isPublished): static
    {
        $this->isPublished = $isPublished;

        return $this;
    }


    #[Groups(['treasure:read'])]
    public function getCreatedAgo():string{
        return Carbon::instance($this->createdAt)->diffForHumans();
    }

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->isPublished = false;
    }

    #[Groups(['treasure:write'])]
    #[SerializedName('description')]
    public function setTextDescription(string $description): static
    {
        $this->description = nl2br($description);

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getX(): ?int
    {
        return $this->x;
    }

    public function setX(int $x): static
    {
        $this->x = $x;

        return $this;
    }

    public function getY(): ?int
    {
        return $this->y;
    }

    public function setY(int $y): static
    {
        $this->y = $y;

        return $this;
    }
}
