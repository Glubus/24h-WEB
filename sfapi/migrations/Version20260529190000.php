<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260529190000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add profile image path to users.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user ADD profile_image_path VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user DROP profile_image_path');
    }
}
