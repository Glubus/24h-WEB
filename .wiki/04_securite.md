# Sécurité

### 1. Fichier `security.yaml` (Base)

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
      stateless: true  # API Stateless
      provider: app_user_provider
      json_login:
        check_path: api_login # Route login
        username_path: email
        password_path: password
      # custom_authenticators: ...
```

### 2. Access Control (Global)

```yaml
security:
  access_control:
    - { path: ^/api/admin, roles: ROLE_ADMIN }
    - { path: ^/api/docs, roles: PUBLIC_ACCESS }
```

### 3. Sécurité Fine (API Platform)

Dans l'attribut `#[ApiResource]` ou `operations`.

```php
#[ApiResource(
    security: "is_granted('ROLE_USER')",
    operations: [
        new GetCollection(security: "is_granted('PUBLIC_ACCESS')"), // Public
        new Post(security: "is_granted('ROLE_ADMIN')"),             // Admin
        new Patch(security: "is_granted('ROLE_USER') and object.getOwner() == user") // Owner only
    ]
)]
```

### 4. Créer un Voter Personnalisé

Pour des règles métier complexes (ex: "modifier seulement si créé < 1h").

1. `php bin/console make:voter`
2. Implémenter la logique :

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

        // Propriétaire seulement
        if ($treasure->getOwner() !== $user) return false;
        
        // < 1 heure
        if ($treasure->getCreatedAt() < new \DateTime('-1 hour')) return false;

        return true;
    }
}
```
3. Utiliser : `security="is_granted('TREASURE_EDIT', object)"`

