<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260529194500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add sold date to annonces.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE annonce ADD sold_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE annonce DROP sold_at');
    }
}
