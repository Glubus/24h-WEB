<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260529160001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add display location fields to annonces.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE annonce ADD address VARCHAR(255) DEFAULT NULL, ADD city VARCHAR(120) DEFAULT NULL, CHANGE latitude latitude NUMERIC(10, 7) DEFAULT NULL, CHANGE longitude longitude NUMERIC(10, 7) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE annonce DROP address, DROP city, CHANGE latitude latitude NUMERIC(10, 7) NOT NULL, CHANGE longitude longitude NUMERIC(10, 7) NOT NULL');
    }
}
