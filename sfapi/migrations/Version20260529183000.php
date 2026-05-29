<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260529183000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add sold status to annonces.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE annonce ADD sold TINYINT(1) DEFAULT 0 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE annonce DROP sold');
    }
}
