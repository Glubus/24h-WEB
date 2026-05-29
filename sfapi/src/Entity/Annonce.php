<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\Filter\NumericFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Enum\AnnonceCategory;
use App\Repository\AnnonceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/annonces'),
        new Post(uriTemplate: '/annonces', security: 'is_granted("ROLE_ANNONCE_CREATE")'),
        new Get(uriTemplate: '/annonces/{id}'),
        new Put(uriTemplate: '/annonces/{id}', security: 'is_granted("ROLE_ANNONCE_EDIT") and object.getAuthor() == user'),
        new Patch(uriTemplate: '/annonces/{id}', security: 'is_granted("ROLE_ANNONCE_EDIT") and object.getAuthor() == user'),
        new Delete(uriTemplate: '/annonces/{id}', security: 'is_granted("ROLE_ANNONCE_EDIT") and object.getAuthor() == user'),
    ],
    normalizationContext: ['groups' => ['annonce:read']],
    denormalizationContext: ['groups' => ['annonce:write']],
    security: 'is_granted("ROLE_USER")',
)]
#[ORM\Entity(repositoryClass: AnnonceRepository::class)]
class Annonce
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['annonce:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['annonce:read', 'annonce:write'])]
    #[ApiFilter(SearchFilter::class, strategy: 'ipartial')]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['annonce:read', 'annonce:write'])]
    #[ApiFilter(SearchFilter::class, strategy: 'ipartial')]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'annonces')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['annonce:read', 'annonce:write'])]
    private ?User $author = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['annonce:read'])]
    private ?string $imagePath = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['annonce:read', 'annonce:write'])]
    #[ApiFilter(NumericFilter::class)]
    #[Assert\PositiveOrZero]
    private ?string $price = null;

    /**
     * @var list<string>
     */
    #[ORM\Column(type: Types::JSON)]
    #[Groups(['annonce:read', 'annonce:write'])]
    #[Assert\Choice(callback: [AnnonceCategory::class, 'values'], multiple: true)]
    private array $categories = [];

    #[ORM\Column]
    #[Groups(['annonce:read', 'annonce:write'])]
    #[ApiFilter(BooleanFilter::class)]
    private bool $masked = false;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7)]
    #[Groups(['annonce:read', 'annonce:write'])]
    private ?string $latitude = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7)]
    #[Groups(['annonce:read', 'annonce:write'])]
    private ?string $longitude = null;

    #[ORM\Column]
    #[Groups(['annonce:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
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

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    public function getImagePath(): ?string
    {
        return $this->imagePath;
    }

    public function setImagePath(?string $imagePath): static
    {
        $this->imagePath = $imagePath;

        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(string|float|int $price): static
    {
        $this->price = number_format((float) $price, 2, '.', '');

        return $this;
    }

    /**
     * @return list<string>
     */
    public function getCategories(): array
    {
        return $this->categories;
    }

    /**
     * @param list<string|AnnonceCategory> $categories
     */
    public function setCategories(array $categories): static
    {
        $this->categories = array_values(array_map(
            static fn (string|AnnonceCategory $category): string => $category instanceof AnnonceCategory ? $category->value : $category,
            $categories,
        ));

        return $this;
    }

    /**
     * @return list<AnnonceCategory>
     */
    public function getCategoryEnums(): array
    {
        return array_map(static fn (string $category): AnnonceCategory => AnnonceCategory::from($category), $this->categories);
    }

    public function isMasked(): bool
    {
        return $this->masked;
    }

    public function setMasked(bool $masked): static
    {
        $this->masked = $masked;

        return $this;
    }

    public function getLatitude(): ?string
    {
        return $this->latitude;
    }

    public function setLatitude(string|float $latitude): static
    {
        $this->latitude = (string) $latitude;

        return $this;
    }

    public function getLongitude(): ?string
    {
        return $this->longitude;
    }

    public function setLongitude(string|float $longitude): static
    {
        $this->longitude = (string) $longitude;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
