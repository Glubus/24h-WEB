<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\Filter\RangeFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Enum\AnnonceCategory;
use App\State\AnnoncePersistProcessor;
use App\State\AnnonceMaskedSwitchProcessor;
use App\State\AnnonceImageUploadProcessor;
use App\Repository\AnnonceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/annonces',
            normalizationContext: ['groups' => ['annonce:list']],
        ),
        new Post(
            uriTemplate: '/annonces',
            security: 'is_granted("ROLE_USER")',
            processor: AnnoncePersistProcessor::class,
        ),
        new Get(
            uriTemplate: '/annonces/{id}',
            normalizationContext: ['groups' => ['annonce:read']],
        ),
        new Get(
            uriTemplate: '/annonces/{id}/edit',
            normalizationContext: ['groups' => ['annonce:read', 'annonce:edit']],
            security: 'object.getAuthor() == user or is_granted("ROLE_ADMIN")',
        ),
        new Patch(
            uriTemplate: '/annonces/{id}',
            security: 'object.getAuthor() == user or is_granted("ROLE_ADMIN")',
            securityPostDenormalize: 'previous_object.getAuthor() == object.getAuthor()',
            processor: AnnoncePersistProcessor::class,
        ),
        new Delete(
            uriTemplate: '/annonces/{id}',
            security: 'object.getAuthor() == user or is_granted("ROLE_MODERATOR") or is_granted("ROLE_ADMIN")',
        ),
        new Post(
            uriTemplate: '/annonces/{id}/image',
            inputFormats: ['multipart' => ['multipart/form-data']],
            deserialize: false,
            security: 'object.getAuthor() == user or is_granted("ROLE_MODERATOR") or is_granted("ROLE_ADMIN")',
            processor: AnnonceImageUploadProcessor::class,
        ),
        new Post(
            uriTemplate: '/annonces/{id}/masked',
            deserialize: false,
            security: 'object.getAuthor() == user or is_granted("ROLE_MODERATOR") or is_granted("ROLE_ADMIN")',
            processor: AnnonceMaskedSwitchProcessor::class,
        ),
    ],
    normalizationContext: ['groups' => ['annonce:read']],
    denormalizationContext: ['groups' => ['annonce:write']],
)]
#[ApiFilter(SearchFilter::class, properties: ['title' => 'ipartial', 'description' => 'ipartial', 'categories' => 'ipartial'])]
#[ORM\Entity(repositoryClass: AnnonceRepository::class)]
class Annonce
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['annonce:list', 'annonce:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['annonce:list', 'annonce:read', 'annonce:write'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['annonce:read', 'annonce:write'])]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'annonces')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['annonce:list', 'annonce:read', 'annonce:write'])]
    private ?User $author = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['annonce:list', 'annonce:read'])]
    private ?string $imagePath = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['annonce:edit', 'annonce:write'])]
    private ?string $address = null;

    #[ORM\Column(length: 120, nullable: true)]
    #[Groups(['annonce:list', 'annonce:read', 'annonce:edit', 'annonce:write'])]
    private ?string $city = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['annonce:list', 'annonce:read', 'annonce:write'])]
    #[ApiFilter(RangeFilter::class)]
    #[Assert\PositiveOrZero]
    private ?string $price = null;

    /**
     * @var list<string>
     */
    #[ORM\Column(type: Types::JSON)]
    #[Groups(['annonce:list', 'annonce:read', 'annonce:write'])]
    #[Assert\Choice(callback: [AnnonceCategory::class, 'values'], multiple: true)]
    private array $categories = [];

    #[ORM\Column]
    #[Groups(['annonce:list', 'annonce:read', 'annonce:write'])]
    #[ApiFilter(BooleanFilter::class)]
    private bool $masked = false;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7, nullable: true)]
    #[Groups(['annonce:list', 'annonce:read', 'annonce:write'])]
    private ?string $latitude = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7, nullable: true)]
    #[Groups(['annonce:list', 'annonce:read', 'annonce:write'])]
    private ?string $longitude = null;

    #[ORM\Column]
    #[Groups(['annonce:list', 'annonce:read'])]
    private \DateTimeImmutable $createdAt;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'ratedAnnonces')]
    #[ORM\JoinTable(name: 'annonce_rating')]
    #[Groups(['annonce:read', 'annonce:edit'])]
    private Collection $ratings;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'favoriteAnnonces')]
    #[ORM\JoinTable(name: 'annonce_favorite')]
    #[Groups(['annonce:read', 'annonce:edit'])]
    private Collection $favorites;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->ratings = new ArrayCollection();
        $this->favorites = new ArrayCollection();
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

    #[Groups(['annonce:list'])]
    #[SerializedName('description')]
    public function getShortDescription(): ?string
    {
        if (null === $this->description) {
            return null;
        }

        return mb_substr(strip_tags($this->description), 0, 30);
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

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): static
    {
        $this->city = $city;

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

    public function switchMasket(): static
    {
        $this->masked = !$this->masked;

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

    /**
     * @return Collection<int, User>
     */
    public function getRatings(): Collection
    {
        return $this->ratings;
    }

    public function addRating(User $user): static
    {
        if (!$this->ratings->contains($user)) {
            $this->ratings->add($user);
            $user->addRatedAnnonce($this);
        }

        return $this;
    }

    public function removeRating(User $user): static
    {
        if ($this->ratings->removeElement($user)) {
            $user->removeRatedAnnonce($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getFavorites(): Collection
    {
        return $this->favorites;
    }

    public function addFavorite(User $user): static
    {
        if (!$this->favorites->contains($user)) {
            $this->favorites->add($user);
            $user->addFavoriteAnnonce($this);
        }

        return $this;
    }

    public function removeFavorite(User $user): static
    {
        if ($this->favorites->removeElement($user)) {
            $user->removeFavoriteAnnonce($this);
        }

        return $this;
    }
}
