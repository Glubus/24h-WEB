<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260529183624 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE annonce (id INT AUTO_INCREMENT NOT NULL, author_id INT NOT NULL, buyer_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, images JSON NOT NULL COMMENT \'(DC2Type:json)\', address VARCHAR(255) DEFAULT NULL, city VARCHAR(120) DEFAULT NULL, price NUMERIC(10, 2) NOT NULL, categories JSON NOT NULL COMMENT \'(DC2Type:json)\', masked TINYINT(1) NOT NULL, sold TINYINT(1) NOT NULL, sold_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', latitude NUMERIC(10, 7) DEFAULT NULL, longitude NUMERIC(10, 7) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_F65593E5F675F31B (author_id), INDEX IDX_F65593E56C755722 (buyer_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE annonce_rating (annonce_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_B82E253C8805AB2F (annonce_id), INDEX IDX_B82E253CA76ED395 (user_id), PRIMARY KEY(annonce_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE annonce_favorite (annonce_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_258D801B8805AB2F (annonce_id), INDEX IDX_258D801BA76ED395 (user_id), PRIMARY KEY(annonce_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE api_token (id INT AUTO_INCREMENT NOT NULL, owned_by_id INT NOT NULL, token VARCHAR(68) NOT NULL, expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', scopes JSON NOT NULL COMMENT \'(DC2Type:json)\', INDEX IDX_7BA2F5EB5E70BCD7 (owned_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE conversation (id INT AUTO_INCREMENT NOT NULL, user_one_id INT NOT NULL, user_two_id INT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_8A8E26E99EC8D52E (user_one_id), INDEX IDX_8A8E26E9F59432E1 (user_two_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE message (id INT AUTO_INCREMENT NOT NULL, conversation_id INT NOT NULL, author_id INT NOT NULL, annonce_id INT DEFAULT NULL, content LONGTEXT DEFAULT NULL, deleted TINYINT(1) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_B6BD307F9AC0396 (conversation_id), INDEX IDX_B6BD307FF675F31B (author_id), INDEX IDX_B6BD307F8805AB2F (annonce_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL COMMENT \'(DC2Type:json)\', password VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL, phone VARCHAR(30) DEFAULT NULL, rating DOUBLE PRECISION DEFAULT NULL, profile_image_path VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE annonce ADD CONSTRAINT FK_F65593E5F675F31B FOREIGN KEY (author_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE annonce ADD CONSTRAINT FK_F65593E56C755722 FOREIGN KEY (buyer_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE annonce_rating ADD CONSTRAINT FK_B82E253C8805AB2F FOREIGN KEY (annonce_id) REFERENCES annonce (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE annonce_rating ADD CONSTRAINT FK_B82E253CA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE annonce_favorite ADD CONSTRAINT FK_258D801B8805AB2F FOREIGN KEY (annonce_id) REFERENCES annonce (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE annonce_favorite ADD CONSTRAINT FK_258D801BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE api_token ADD CONSTRAINT FK_7BA2F5EB5E70BCD7 FOREIGN KEY (owned_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E99EC8D52E FOREIGN KEY (user_one_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E9F59432E1 FOREIGN KEY (user_two_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F9AC0396 FOREIGN KEY (conversation_id) REFERENCES conversation (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FF675F31B FOREIGN KEY (author_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F8805AB2F FOREIGN KEY (annonce_id) REFERENCES annonce (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE annonce DROP FOREIGN KEY FK_F65593E5F675F31B');
        $this->addSql('ALTER TABLE annonce DROP FOREIGN KEY FK_F65593E56C755722');
        $this->addSql('ALTER TABLE annonce_rating DROP FOREIGN KEY FK_B82E253C8805AB2F');
        $this->addSql('ALTER TABLE annonce_rating DROP FOREIGN KEY FK_B82E253CA76ED395');
        $this->addSql('ALTER TABLE annonce_favorite DROP FOREIGN KEY FK_258D801B8805AB2F');
        $this->addSql('ALTER TABLE annonce_favorite DROP FOREIGN KEY FK_258D801BA76ED395');
        $this->addSql('ALTER TABLE api_token DROP FOREIGN KEY FK_7BA2F5EB5E70BCD7');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E99EC8D52E');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E9F59432E1');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F9AC0396');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307FF675F31B');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F8805AB2F');
        $this->addSql('DROP TABLE annonce');
        $this->addSql('DROP TABLE annonce_rating');
        $this->addSql('DROP TABLE annonce_favorite');
        $this->addSql('DROP TABLE api_token');
        $this->addSql('DROP TABLE conversation');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE user');
    }
}
