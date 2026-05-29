# Tests & Dépannage

### 1. Tests Fonctionnels (ApiTestCase)

```php
// tests/DragonTreasureTest.php
use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

class DragonTreasureTest extends ApiTestCase
{
    public function testGetCollection(): void
    {
        $response = static::createClient()->request('GET', '/api/treasures');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
        
        $this->assertJsonContains([
            '@context' => '/api/contexts/DragonTreasure',
            '@id' => '/api/treasures',
            '@type' => 'hydra:Collection',
        ]);
    }
    
    public function testCreateTreasureAuthenticated(): void
    {
        $token = '...'; // Récupérer token ou utiliser factory si possible
        
        static::createClient()->request('POST', '/api/treasures', [
            'headers' => ['Authorization' => 'Bearer '.$token],
            'json' => [
                'name' => 'My Treasure',
                'value' => 100
            ]
        ]);
        
        $this->assertResponseStatusCodeSame(201);
    }
}
```

### 2. Dépannage Rapide

- **Erreur CORS** :
  - Vérifier `nelmio_cors.yaml`.
  - Si appel depuis localhost différent, le navigateur bloque.

- **Erreur 500 "Circular Reference"** :
  - Le sérialiseur boucle (User -> Treasure -> User -> ...).
  - **Solution** : Ajouter `normalizationContext: ['groups' => '...']` dans `#[ApiResource]`.

- **Base de données introuvable / Connection refused** :
  - Vérifier `.env` (DATABASE_URL).
  - Vérifier que les conteneurs tournent : `docker compose ps`.

- **Changements de code ignorés** :
  - Vider le cache : `php bin/console cache:clear`.

- **Erreur "Access Denied" (401/403)** :
  - Vérifier `security.yaml` (firewalls, access_control).
  - Vérifier les rôles de l'utilisateur (`php bin/console debug:user my@email.com`).

