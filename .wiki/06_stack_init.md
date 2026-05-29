# Stack Init - Installation Rapide

Si tu dois remonter un projet de zéro le jour du DS, voici les commandes pour tout installer d'un coup.

### 1. Création du squelette

```bash
composer create-project symfony/skeleton:"6.4.*" sfapi
cd sfapi
```

### 2. Installation des dépendances (One-Liner)

Copie-colle cette commande pour installer : API Platform, Doctrine, Security, Maker, Fixtures, Foundry, BrowserKit, HttpClient, etc.

```bash
composer require \
    api \
    symfony/security-bundle \
    symfony/validator \
    symfony/serializer \
    doctrine/doctrine-migrations-bundle \
    doctrine/doctrine-fixtures-bundle \
    zenstruck/foundry \
    nesbot/carbon \
    symfony/maker-bundle --dev \
    symfony/test-pack --dev
```

*Note : `symfony/test-pack` installe PHPUnit, BrowserKit, HttpClient, etc.*

### 3. Setup Rapide de la Base de Données

1. Modifier `.env` pour configurer `DATABASE_URL`.
2. Créer la base :
   ```bash
   php bin/console doctrine:database:create
   ```

### 4. Config Initiale Recommandée

#### Activer les UUID (optionnel mais fréquent)
Modifier `config/packages/doctrine.yaml` si demandé.

#### Configurer le Firewall (Stateless API)
Remplacer le contenu de `main` dans `config/packages/security.yaml` par :

```yaml
    main:
        stateless: true
        provider: app_user_provider
        json_login:
            check_path: api_login # ou auth
            username_path: email
            password_path: password
```

### 5. Check-list de démarrage

- [ ] `php bin/console about` (Vérifier version Symfony)
- [ ] `php bin/console debug:router` (Vérifier routes API présentes)
- [ ] Créer `User` : `php bin/console make:user`
- [ ] Créer `Auth` : `php bin/console make:auth`

