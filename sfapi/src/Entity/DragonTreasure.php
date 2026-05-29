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
use ApiPlatform\Metadata\Delete;
use Symfony\Component\Serializer\Attribute\Groups;
use Carbon\Carbon;
use Symfony\Component\Serializer\Attribute\SerializedName;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\RangeFilter;
use ApiPlatform\Doctrine\Orm\Filter\NumericFilter;

#[ApiResource(
    description: 'A Dragon Treasure',
    shortName: 'Treasure',
    uriTemplate: '/my-treasures',
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: ['groups' => ['treasure:read']],
    denormalizationContext: ['groups' => ['treasure:write']],
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
    private ?int $value = null;

    #[ORM\Column(length: 255)]
    #[Groups(['treasure:read','treasure:write'])]
    #[ApiFilter(SearchFilter::class, strategy: 'istart')]
    private ?string $name = null;

    #[ORM\Column]
    #[Groups(['treasure:read','treasure:write'])]
    #[ApiFilter(RangeFilter::class)]
    private ?int $coolFactor = null;

    #[ORM\Column]
    #[ApiFilter(DateFilter::class)]
    private ?\DateTimeImmutable $createdAt;

    #[ORM\Column]
    #[Groups(['treasure:read','treasure:write'])]
    #[ApiFilter(BooleanFilter::class)]
    private ?bool $isPublished = null;

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
}
