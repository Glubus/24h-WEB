# Structure & Doctrine

### 1. Structure du projet

- `src/Entity` : entités Doctrine (`User`, `DragonTreasure`)
- `src/Repository` : repositories (requêtes SQL custom)
- `src/Controller` : contrôleurs classiques
- `src/Security` : authenticators, voters
- `src/ApiResource` : ressources API Platform sans entité (ou DTO)
- `src/DataFixtures` : chargement de données

### 2. Relations Doctrine (Mémo rapide)

**Règle d'or :** Ne pas inverser `mappedBy` et `inversedBy`.

#### ManyToOne (ex: Treasure -> User)
"Un trésor appartient à un user".
- C'est le côté **propriétaire** (owning side) qui porte la clé étrangère (`user_id`).
- Annotation : `#[ORM\ManyToOne(inversedBy: 'treasures')]` + `#[ORM\JoinColumn(nullable: false)]`

```php
// DragonTreasure.php
#[ORM\ManyToOne(inversedBy: 'treasures')]
#[ORM\JoinColumn(nullable: false)]
private ?User $owner = null;
```

#### OneToMany (ex: User -> Treasures)
"Un user a plusieurs trésors".
- Côté **inverse**.
- Annotation : `#[ORM\OneToMany(mappedBy: 'owner', targetEntity: DragonTreasure::class)]`
- **Important** : Ne stocke rien en base, c'est juste pour Doctrine (collection).

```php
// User.php
#[ORM\OneToMany(mappedBy: 'owner', targetEntity: DragonTreasure::class)]
private Collection $treasures;
```

#### ManyToMany (ex: User <-> Group)
- Crée une table de jointure.

### 3. Fixtures avec Foundry

Plus simple que les fixtures classiques.

```php
// src/DataFixtures/AppFixtures.php
class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Créer 10 users
        UserFactory::createMany(10);
        
        // Créer 30 trésors liés à des users aléatoires (géré par la Factory)
        DragonTreasureFactory::createMany(30, function() {
            return ['owner' => UserFactory::random()];
        });
    }
}
```

### 4. Repository (Requête custom)

```php
// src/Repository/DragonTreasureRepository.php
public function findByOwnerEmail(string $email): array
{
    return $this->createQueryBuilder('t')
        ->join('t.owner', 'u')
        ->andWhere('u.email = :email')
        ->setParameter('email', $email)
        ->getQuery()
        ->getResult();
}
```

