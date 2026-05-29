# Commandes & Installation

### 1. Créer / lancer le projet

- **Créer un squelette Symfony 6.4**
  - `composer create-project symfony/skeleton:"6.4.*" sfapi`
- **Installer API Platform**
  - `composer require api`
  - Ajoute `api_platform.yaml` + routes API + répertoire `src/ApiResource`.
- **Installer MakerBundle (dev)**
  - `composer require symfony/maker-bundle --dev`

### 2. Commandes de base (à savoir par cœur)

- **Général**
  - `php bin/console` : liste des commandes
  - `php bin/console cache:clear` : vider le cache
  - `php bin/console debug:router` : voir les routes
  - `php bin/console debug:container` : voir les services

- **Maker (Génération de code)**
  - `php bin/console make:entity` : Créer entité
  - `php bin/console make:migration` : Créer migration
  - `php bin/console make:controller MyController` : Créer contrôleur
  - `php bin/console make:user` : Créer utilisateur (UserInterface)
  - `php bin/console make:auth` : Créer authenticator
  - `php bin/console make:fixtures` : Créer fixtures
  - `php bin/console make:voter` : Créer voter de sécurité

- **Doctrine / Base de données**
  - `php bin/console doctrine:migrations:diff` : Générer migration depuis entités
  - `php bin/console doctrine:migrations:migrate` : Appliquer migrations
  - `php bin/console doctrine:schema:validate` : Vérifier synchro DB <-> Entités
  - `php bin/console doctrine:fixtures:load` : Charger les fixtures

- **Tests**
  - `php bin/phpunit` : Lancer tous les tests
  - `php bin/phpunit tests/DragonTreasureTest.php` : Lancer un fichier spécifique

