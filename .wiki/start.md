Mémo DS Symfony (projet API Platform)
=====================================

### 1. Créer / lancer le projet

- **Créer un squelette Symfony 6.4**
  - `composer create-project symfony/skeleton:"6.4.*" sfapi`
- **Installer API Platform**
  - `composer require api`
  - Ajoute `api_platform.yaml` + routes API + répertoire `src/ApiResource`.
- **Installer MakerBundle (dev)**
  - `composer require symfony/maker-bundle --dev`
- **Commandes de base**
  - `php bin/console` : liste des commandes
  - `php bin/console cache:clear` : vider le cache
  - `php bin/console debug:router` : voir les routes
  - `php bin/console debug:container` : voir les services

### 2. Structure du projet (utile à connaître)

- **Répertoires principaux**
  - `src/Entity` : entités Doctrine (`User`, `DragonTreasure`, `ApiToken`)
  - `src/Repository` : repositories Doctrine
  - `src/Controller` : contrôleurs (ex: `ApiLoginController`)
  - `src/Security` : authenticator, token handler, etc.
  - `src/ApiResource` : ressources API Platform (ex: `Map`)
  - `src/DataFixtures` + `src/Factory` + `src/Story` : fixtures (DoctrineFixtures + Foundry)
- **Fichier noyau**
  - `src/Kernel.php` : enregistre les bundles (via `config/bundles.php`).

### 3. Création d’éléments courants avec MakerBundle

- **Entité Doctrine**
  - `php bin/console make:entity`  
    - Donne le nom (`User`, `DragonTreasure`…), ajoute les champs.
  - **Migration**
    - `php bin/console make:migration`
    - `php bin/console doctrine:migrations:migrate`
- **Controller**
  - `php bin/console make:controller ApiLoginController`
- **Fixtures**
  - `php bin/console make:fixtures`  
    - Puis implémenter `load()` dans `AppFixtures` ou utiliser Foundry.
- **User / Security** (générique)
  - `php bin/console make:user` : crée entité `User` qui implémente `UserInterface` et éventuellement `PasswordAuthenticatedUserInterface`.
  - `php bin/console make:auth` : générer un authenticator (form login, API token, etc.).

### 4. Doctrine : commandes importantes

- **Schéma & migrations**
  - `php bin/console doctrine:migrations:diff` : génère une migration à partir des entités
  - `php bin/console doctrine:migrations:migrate` : applique les migrations
  - `php bin/console doctrine:schema:validate` : vérifie la cohérence entités ↔ base
- **Données**
  - `php bin/console doctrine:fixtures:load` : charge les fixtures (bundle `DoctrineFixturesBundle` + `ZenstruckFoundryBundle`).

### 5. Sécurité (très important pour DS)

Fichier principal : `config/packages/security.yaml`.

- **password_hashers**
  - Définit comment les mots de passe sont hashés :
    - `Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface: 'auto'`
- **providers**
  - Ici : `app_user_provider` qui charge l’utilisateur depuis l’entité `App\Entity\User` via la colonne `email`.
- **firewalls**
  - `dev` : désactive la sécurité pour le profiler, assets, etc.
  - `main` : **important** dans ce projet :
    - `stateless: true` : pas de session, typique API stateless.
    - `provider: app_user_provider` : utilise l’entity provider ci‑dessus.
    - `access_token:` avec `token_handler: App\Security\ApiTokenHandler` : support d’authentification par token.
    - `custom_authenticators:`
      - `App\Security\ApiTokenAuthenticator` : authenticator personnalisé.
    - `json_login:`
      - `check_path: api_login` : route qui gère le login JSON.
      - `username_path: email`, `password_path: password` : clés JSON.
      - `success_handler: App\Security\ApiTokenAuthenticator` : que faire après succès.
- **role_hierarchy**
  - Exemple :
    - `ROLE_FULL_USER: ['ROLE_USER_EDIT', 'ROLE_TREASURE_CREATE', 'ROLE_TREASURE_EDIT']`
  - Sert à donner automatiquement plusieurs rôles à un rôle parent.
- **access_control**
  - Permet de restreindre des URLs à certains rôles :
    - Ex type : `- { path: ^/admin, roles: ROLE_ADMIN }`
  - Dans ce projet c’est commenté mais à connaître pour le DS.
- **Tests (when@test)**
  - Dans `when@test: security:` : hashage moins coûteux pour accélérer les tests.

### 6. API Platform : notions à maîtriser

- **Installation**
  - `composer require api`
  - Ajoute les fichiers de config `api_platform.yaml` + routes.
- **Ressource API**
  - Soit via **entité annotée** (ex: `#[ApiResource]` sur une entité),
  - Soit via classe dans `src/ApiResource` (ex: `Map`).
- **Opérations courantes**
  - GET collection, GET item, POST, PATCH, DELETE
  - Configurable dans `#[ApiResource(operations: [...])]` ou dans `api_platform.yaml`.
- **State providers / processors**
  - Exemple dans ce projet : `State\MapProvider` pour fournir les données d’une ressource personnalisée.

### 7. Bundles utilisés dans ce projet (à citer en DS)

Voir `config/bundles.php` + `composer.json`.

- **FrameworkBundle** (`symfony/framework-bundle`)
  - Cœur du framework (container de services, configuration, événements…).
- **TwigBundle** (`symfony/twig-bundle`)
  - Gabarits Twig (ici peu utilisé car projet API, mais utile à connaître).
- **SecurityBundle** (`symfony/security-bundle`)
  - Gère firewall, providers, encoders/hashers, `access_control`, rôles, voters, authenticator.
- **DoctrineBundle** (`doctrine/doctrine-bundle`)
  - Intégration de Doctrine ORM dans Symfony.
- **DoctrineMigrationsBundle** (`doctrine/doctrine-migrations-bundle`)
  - Gère les migrations de schéma.
- **DoctrineFixturesBundle** (`doctrine/doctrine-fixtures-bundle`)
  - Permet de charger des jeux de données pour dev/test.
- **NelmioCorsBundle** (`nelmio/cors-bundle`)
  - Gère les CORS (Cross-Origin Resource Sharing) pour l’API.
- **ApiPlatformBundle** (`api-platform/symfony` + `api-platform/doctrine-orm`)
  - Génération auto de l’API REST/JSON‑LD, pagination, filtres, etc.
- **MakerBundle** (`symfony/maker-bundle`) [dev]
  - Génère code boilerplate (entités, contrôleurs, formulaires, authenticator, user…).
- **WebProfilerBundle** (`symfony/web-profiler-bundle`) [dev+test]
  - Barre de debug et profiler web.
- **MonologBundle** (`symfony/monolog-bundle`)
  - Logging applicatif.
- **DebugBundle** (`symfony/debug-bundle`) [dev]
  - Améliore les messages d’erreur, dump, etc.
- **ZenstruckFoundryBundle** (`zenstruck/foundry`)
  - Génère facilement des fixtures et des objets de test via des `Factory` et `Story`.

### 8. Ce que tu peux être amené à coder en DS

- **Créer une entité + migration + relation**
  - Exemple : entité `DragonTreasure` reliée à `User`.
- **Configurer un firewall / provider / access_control**
  - Savoir ajouter une règle pour protéger un endpoint API par rôle.
- **Mettre en place un authenticator ou un handler de token**
  - Connaître la structure d’un `Authenticator` (méthodes clés : `supports()`, `authenticate()`, `onAuthenticationSuccess()`, `onAuthenticationFailure()`).
- **Créer une ressource API Platform personnalisée**
  - Classe dans `ApiResource` + `StateProvider`.
- **Écrire ou adapter des fixtures**
  - Utiliser DoctrineFixtures + Foundry pour créer des utilisateurs, trésors, tokens.
- **Écrire des tests fonctionnels**
  - Appeler des endpoints avec `HttpClient` ou `BrowserKit`, vérifier les statuts et le JSON.

### 9. Rappels rapides à savoir par cœur

- **Commandes**
  - `make:entity`, `make:migration`, `doctrine:migrations:migrate`, `doctrine:fixtures:load`
  - `make:user`, `make:auth`, `make:controller`
- **Fichiers clés**
  - `config/packages/security.yaml` : sécurité
  - `config/packages/api_platform.yaml` : API Platform
  - `config/routes/*.yaml` : routes
  - `config/bundles.php` : bundles actifs
- **Concepts sécurité**
  - `provider`, `firewall`, `access_control`, `role_hierarchy`, `stateless`, `json_login`, `custom_authenticator`, `access_token`.

### 10. Bloc de commandes typiques (copier-coller rapide)

- **Doctrine / base de données**
  - Créer une migration à partir des entités :  
    - `php bin/console doctrine:migrations:diff`
  - Appliquer les migrations :  
    - `php bin/console doctrine:migrations:migrate`
  - (Optionnel, si demandé) recréer le schéma :  
    - `php bin/console doctrine:schema:create`
  - Valider le schéma :  
    - `php bin/console doctrine:schema:validate`
  - Charger les fixtures :  
    - `php bin/console doctrine:fixtures:load`

- **Maker (génération de code)**
  - Créer entité : `php bin/console make:entity`
  - Créer contrôleur : `php bin/console make:controller MyController`
  - Créer utilisateur : `php bin/console make:user`
  - Créer authenticator : `php bin/console make:auth`
  - Créer formulaire (si besoin) : `php bin/console make:form`

- **API / routes**
  - Voir les routes : `php bin/console debug:router`
  - Vérifier la config API Platform : ouvrir `config/packages/api_platform.yaml`

- **Cache / logs**
  - Vider le cache : `php bin/console cache:clear`
  - Voir les logs (local) : `tail -f var/log/dev.log`

- **Tests**
  - Lancer tous les tests : `php bin/phpunit`
  - Lancer un test précis : `php bin/phpunit tests/DragonTreasureTest.php`

### 11. Snippets prêts à l’emploi

#### 11.1 Entité simple + relation ManyToOne

```php
// src/Entity/DragonTreasure.php
#[ORM\Entity(repositoryClass: DragonTreasureRepository::class)]
class DragonTreasure
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: 'integer')]
    private ?int $value = null;

    #[ORM\ManyToOne(inversedBy: 'treasures')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $owner = null;
}
```

#### 11.2 Exemple `security.yaml` minimal pour API stateless + login JSON

```yaml
security:
  password_hashers:
    Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface: 'auto'

  providers:
    app_user_provider:
      entity:
        class: App\Entity\User
        property: email

  firewalls:
    dev:
      pattern: ^/(_(profiler|wdt)|css|images|js)/
      security: false

    main:
      stateless: true
      provider: app_user_provider
      json_login:
        check_path: api_login
        username_path: email
        password_path: password

  access_control:
    - { path: ^/admin, roles: ROLE_ADMIN }
```

#### 11.3 Exemple `access_control` pour protéger une API

```yaml
security:
  access_control:
    - { path: ^/api/admin, roles: ROLE_ADMIN }
    - { path: ^/api/user, roles: ROLE_USER }
```

#### 11.4 Exemple `ApiResource` simple

```php
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;

#[ApiResource(
    operations: [
        new Get(),              // GET /items/{id}
        new GetCollection(),    // GET /items
    ]
)]
class DragonTreasure
{
    // ...
}
```

#### 11.5 Exemple fixture avec Foundry

```php
// src/DataFixtures/AppFixtures.php
class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        UserFactory::createMany(10);
        DragonTreasureFactory::createMany(30);
    }
}
```

```php
// src/Factory/UserFactory.php
final class UserFactory extends ModelFactory
{
    protected function getDefaults(): array
    {
        return [
            'email' => self::faker()->unique()->email(),
            'password' => 'password',
        ];
    }
}
```

#### 11.6 Squelette de test fonctionnel

```php
// tests/DragonTreasureTest.php
class DragonTreasureTest extends WebTestCase
{
    public function testGetTreasures(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/dragon_treasures');

        $this->assertResponseIsSuccessful();
        $this->assertResponseStatusCodeSame(200);
    }
}
```

#### 11.7 Méthode typique dans un repository

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

### 12. Validation & Sérialisation (Crucial API Platform)

Ces aspects tombent souvent en DS pour filtrer les données (ex: mot de passe) ou valider les entrées.

#### 12.1 Groupes de sérialisation

Utilisez `normalizationContext` (lecture) et `denormalizationContext` (écriture).

```php
#[ApiResource(
    normalizationContext: ['groups' => ['treasure:read']],
    denormalizationContext: ['groups' => ['treasure:write']],
)]
class DragonTreasure
{
    #[ORM\Column]
    #[Groups(['treasure:read'])] // Visible en lecture
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['treasure:read', 'treasure:write'])] // Visible lecture + écriture
    #[Assert\NotBlank]
    private ?string $name = null;
    
    // Le champ user est souvent délicat :
    #[ORM\ManyToOne]
    #[Groups(['treasure:read', 'treasure:write'])] 
    private ?User $owner = null;
}
```

#### 12.2 Validation (Assertions)

Ajoutez des contraintes sur les propriétés de l'entité.

```php
use Symfony\Component\Validator\Constraints as Assert;

class DragonTreasure {
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 50)]
    private string $name;

    #[Assert\GreaterThan(0)]
    private int $value;
    
    #[Assert\Email]
    private string $contactEmail;
}
```

### 13. Filtres API Platform (Search, Date, Boolean)

Pour permettre `?name=machin` ou `?isPublished=true`.

```php
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\Filter\RangeFilter;

class DragonTreasure 
{
    #[ORM\Column]
    #[ApiFilter(SearchFilter::class, strategy: 'ipartial')] // ?name=...
    private ?string $name = null;

    #[ORM\Column]
    #[ApiFilter(BooleanFilter::class)] // ?isPublished=true
    private ?bool $isPublished = null;

    #[ORM\Column]
    #[ApiFilter(RangeFilter::class)] // ?value[gt]=10
    private ?int $value = null;
}
```

### 14. Sous-ressources & Relations

Pour gérer des URLs type `/users/{id}/treasures` ou lier automatiquement un utilisateur.

#### 14.1 Lier automatiquement l'utilisateur connecté (Voter ou Extension)

Souvent demandé : "L'utilisateur qui crée le trésor doit être le propriétaire".

**Option simple (si autorisé) :**
Dans une extension Doctrine ou via un `securityPostDenormalize` :

```php
#[ApiResource(
    operations: [
        new Post(
            securityPostDenormalize: "object.getUser() == user", 
        )
    ]
)]
```

#### 14.2 Sous-ressource (Subresource)

```php
#[ApiResource(
    uriTemplate: '/users/{user_id}/treasures.{_format}',
    operations: [new GetCollection()],
    uriVariables: [
        'user_id' => new Link(fromProperty: 'treasures', fromClass: User::class, toProperty: 'id')
    ]
)]
class DragonTreasure { ... }
```

### 15. Sécurité fine (Voters & Expressions)

Interdire/Autoriser selon des règles métier.

#### 15.1 Expressions de sécurité directes

```php
#[ApiResource(
    operations: [
        // Seul l'admin peut tout voir
        new GetCollection(security: "is_granted('ROLE_ADMIN')"),
        
        // On ne peut modifier que si on est propriétaire (custom logic)
        new Patch(security: "is_granted('ROLE_USER') and object.getOwner() == user"),
        
        // Création autorisée si on a le rôle adéquat
        new Post(security: "is_granted('ROLE_TREASURE_CREATE')")
    ]
)]
```

#### 15.2 Créer un Voter personnalisé (Bonus DS)

Commande : `php bin/console make:voter`

Exemple : Autoriser l'édition seulement si le trésor est créé depuis moins de 1h.

```php
// src/Security/Voter/TreasureVoter.php
class TreasureVoter extends Voter
{
    const EDIT = 'TREASURE_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::EDIT && $subject instanceof DragonTreasure;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) return false;

        /** @var DragonTreasure $treasure */
        $treasure = $subject;

        // Logique métier complexe
        if ($treasure->getOwner() !== $user) return false;
        
        // Si créé il y a plus d'une heure, interdit
        if ($treasure->getCreatedAt() < new \DateTime('-1 hour')) {
            return false;
        }

        return true;
    }
}
```
Utilisation dans l'entité : `security="is_granted('TREASURE_EDIT', object)"`

### 16. Relations Doctrine (Mémo rapide)

Ne pas se tromper de sens !

- **ManyToOne** (ex: Treasure -> User) :
  - "Un trésor appartient à un user".
  - C'est le côté **propriétaire** (owning side) qui porte la clé étrangère (`user_id`).
  - `#[ORM\ManyToOne(inversedBy: 'treasures')]`
  - `#[ORM\JoinColumn(nullable: false)]`

- **OneToMany** (ex: User -> Treasures) :
  - "Un user a plusieurs trésors".
  - Côté **inverse**.
  - `#[ORM\OneToMany(mappedBy: 'owner', targetEntity: DragonTreasure::class)]`
  - **Important** : Ne stocke rien en base, c'est juste pour Doctrine.

- **ManyToMany** (ex: User <-> Group) :
  - Crée une table de jointure.
  - Choisir un côté maître (`inversedBy`) et un côté esclave (`mappedBy`).

### 17. DTO & Processors (Avancé)

Si on vous demande une action qui n'est pas une entité (ex: "Reset Password").

1. Créer une classe PHP simple (DTO) avec les champs nécessaires (email, newPassword).
2. La déclarer comme `#[ApiResource]`.
3. Créer un `StateProcessor` qui fait le travail.

```php
// src/State/ResetPasswordProcessor.php
class ResetPasswordProcessor implements ProcessorInterface
{
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        // $data est votre DTO
        // Envoyer le mail, changer le mdp en base, etc.
    }
}
```

```php
#[ApiResource(
    operations: [
        new Post(processor: ResetPasswordProcessor::class)
    ]
)]
class ResetPasswordDto { ... }
```

### 18. Dépannage rapide

- **Erreur CORS** : Vérifier `nelmio_cors.yaml` ou si vous appelez l'API depuis un autre port/domaine sans l'autoriser.
- **Erreur 500 "Circular Reference"** : Vous avez oublié les `#[Groups]` et le sérialiseur boucle infiniment entre User <-> Treasure. Ajoutez `normalizationContext`.
- **Base de données introuvable** : Vérifier `.env` (DATABASE_URL) et que le conteneur db tourne (`docker compose ps`).
- **Changements non pris en compte** : `php bin/console cache:clear`.
