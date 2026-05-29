# API Platform

### 1. Définition d'une ressource

Soit sur une entité, soit sur une classe DTO.

```php
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Patch(),
        new Delete()
    ]
)]
class DragonTreasure { ... }
```

### 2. Validation & Sérialisation

**Indispensable** pour filtrer les mots de passe et valider les entrées.

```php
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    normalizationContext: ['groups' => ['treasure:read']],     // Lecture (Output)
    denormalizationContext: ['groups' => ['treasure:write']], // Écriture (Input)
)]
class DragonTreasure
{
    #[ORM\Column]
    #[Groups(['treasure:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['treasure:read', 'treasure:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 50)]
    private ?string $name = null;
}
```

### 3. Filtres (Search, Boolean, Range)

Permet : `/api/treasures?name=gold&isPublished=true`

```php
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;

#[ApiFilter(SearchFilter::class, strategy: 'ipartial')]
#[ApiFilter(BooleanFilter::class)]
class DragonTreasure { ... }
```

### 4. Sous-ressources & Relations

#### Lier automatiquement l'utilisateur connecté
Dans une opération `Post` ou `Patch` :

```php
new Post(
    securityPostDenormalize: "object.getUser() == user"
)
```

#### Sous-ressource URL
`/users/{id}/treasures`

```php
#[ApiResource(
    uriTemplate: '/users/{user_id}/treasures.{_format}',
    operations: [new GetCollection()],
    uriVariables: [
        'user_id' => new Link(fromProperty: 'treasures', fromClass: User::class, toProperty: 'id')
    ]
)]
```

### 5. DTO & Processors (Actions complexes)

Si l'action n'est pas un CRUD simple (ex: Reset Password).

1. **DTO** : Classe PHP simple avec `#[ApiResource]`.
2. **Processor** : Logique métier.

```php
// Processor
class ResetPasswordProcessor implements ProcessorInterface {
    public function process($data, ...) {
        // Logique ici ($data est le DTO)
    }
}

// DTO
#[ApiResource(
    operations: [new Post(processor: ResetPasswordProcessor::class)]
)]
class ResetPasswordDto {
    public string $email;
}
```

