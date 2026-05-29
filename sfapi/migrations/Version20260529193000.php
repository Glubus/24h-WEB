<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260529193000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add conversations and messages.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE conversation (id INT AUTO_INCREMENT NOT NULL, user_one_id INT NOT NULL, user_two_id INT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_8A8E26E995B3E5A3 (user_one_id), INDEX IDX_8A8E26E92044131 (user_two_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE message (id INT AUTO_INCREMENT NOT NULL, conversation_id INT NOT NULL, author_id INT NOT NULL, annonce_id INT DEFAULT NULL, content LONGTEXT DEFAULT NULL, deleted TINYINT(1) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_B6BD307F9AC0396 (conversation_id), INDEX IDX_B6BD307F675F31B (author_id), INDEX IDX_B6BD307F8805AB2F (annonce_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E995B3E5A3 FOREIGN KEY (user_one_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E92044131 FOREIGN KEY (user_two_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F9AC0396 FOREIGN KEY (conversation_id) REFERENCES conversation (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F675F31B FOREIGN KEY (author_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F8805AB2F FOREIGN KEY (annonce_id) REFERENCES annonce (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F9AC0396');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F675F31B');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F8805AB2F');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E995B3E5A3');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E92044131');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE conversation');
    }
}
