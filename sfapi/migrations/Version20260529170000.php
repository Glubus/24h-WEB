<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260529170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add annonce ratings and favorites relations.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE annonce_rating (annonce_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_4D5E8F3B8805AB2F (annonce_id), INDEX IDX_4D5E8F3BA76ED395 (user_id), PRIMARY KEY(annonce_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE annonce_favorite (annonce_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_5C2F859B8805AB2F (annonce_id), INDEX IDX_5C2F859BA76ED395 (user_id), PRIMARY KEY(annonce_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE annonce_rating ADD CONSTRAINT FK_4D5E8F3B8805AB2F FOREIGN KEY (annonce_id) REFERENCES annonce (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE annonce_rating ADD CONSTRAINT FK_4D5E8F3BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE annonce_favorite ADD CONSTRAINT FK_5C2F859B8805AB2F FOREIGN KEY (annonce_id) REFERENCES annonce (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE annonce_favorite ADD CONSTRAINT FK_5C2F859BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE annonce_rating DROP FOREIGN KEY FK_4D5E8F3B8805AB2F');
        $this->addSql('ALTER TABLE annonce_rating DROP FOREIGN KEY FK_4D5E8F3BA76ED395');
        $this->addSql('ALTER TABLE annonce_favorite DROP FOREIGN KEY FK_5C2F859B8805AB2F');
        $this->addSql('ALTER TABLE annonce_favorite DROP FOREIGN KEY FK_5C2F859BA76ED395');
        $this->addSql('DROP TABLE annonce_rating');
        $this->addSql('DROP TABLE annonce_favorite');
    }
}
