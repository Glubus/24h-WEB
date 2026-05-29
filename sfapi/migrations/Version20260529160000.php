<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260529160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add user profile fields and annonces.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user ADD phone VARCHAR(30) DEFAULT NULL, ADD rating DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('CREATE TABLE annonce (id INT AUTO_INCREMENT NOT NULL, author_id INT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, image_path VARCHAR(255) DEFAULT NULL, price NUMERIC(10, 2) NOT NULL, categories JSON NOT NULL COMMENT \'(DC2Type:json)\', masked TINYINT(1) NOT NULL, latitude NUMERIC(10, 7) NOT NULL, longitude NUMERIC(10, 7) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_F65593E1F675F31B (author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE annonce ADD CONSTRAINT FK_F65593E1F675F31B FOREIGN KEY (author_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE annonce DROP FOREIGN KEY FK_F65593E1F675F31B');
        $this->addSql('DROP TABLE annonce');
        $this->addSql('ALTER TABLE user DROP phone, DROP rating');
    }
}
