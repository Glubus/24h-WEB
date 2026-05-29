<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Entity\ApiToken;
use App\Entity\Conversation;
use App\Factory\AnnonceFactory;
use App\Factory\ApiTokenFactory;
use App\Factory\UserFactory;
use Doctrine\ORM\EntityManagerInterface;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

class ChatApiTest extends ApiTestCase
{
    use Factories;
    use ResetDatabase;

    protected static ?bool $alwaysBootKernel = false;

    public function testUserCanCreateConversationAndSendMessageWithAnnonceEmbed(): void
    {
        $client = static::createClient();
        $userOne = UserFactory::createOne(['username' => 'first-user']);
        $userTwo = UserFactory::createOne(['username' => 'second-user']);
        $annonce = AnnonceFactory::createOne(['author' => $userTwo, 'title' => 'Shared annonce']);
        $token = ApiTokenFactory::createOne([
            'ownedBy' => $userOne,
            'scopes' => [ApiToken::SCOPE_USER_EDIT],
        ]);

        $conversation = $this->createConversation($userOne->_real(), $userTwo->_real());

        $conversationResponse = $client->request('GET', '/api/conversations/'.$conversation->getId(), [
            'headers' => $this->authorizationHeaders($token),
        ])->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame($userOne->getId(), $conversationResponse['userOne']['id']);
        $this->assertSame($userTwo->getId(), $conversationResponse['userTwo']['id']);

        $messageResponse = $client->request('POST', '/api/messages', [
            'headers' => $this->jsonHeaders($token),
            'json' => [
                'conversation' => '/api/conversations/'.$conversation->getId(),
                'content' => 'Regarde cette annonce',
                'annonce' => '/api/annonces/'.$annonce->getId(),
            ],
        ]);
        $message = $messageResponse->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertSame('Regarde cette annonce', $message['content']);
        $this->assertSame($userOne->getId(), $message['author']['id']);
        $this->assertSame($annonce->getId(), $message['annonce']['id']);
    }

    public function testMessagesCanBeListedAndSoftDeleted(): void
    {
        $client = static::createClient();
        $userOne = UserFactory::createOne();
        $userTwo = UserFactory::createOne();
        $token = ApiTokenFactory::createOne(['ownedBy' => $userOne]);
        $conversation = $this->createConversation($userOne->_real(), $userTwo->_real());

        $message = $client->request('POST', '/api/messages', [
            'headers' => $this->jsonHeaders($token),
            'json' => [
                'conversation' => '/api/conversations/'.$conversation->getId(),
                'content' => 'A supprimer',
            ],
        ])->toArray();

        $client->request('DELETE', '/api/messages/'.$message['id'], [
            'headers' => $this->authorizationHeaders($token),
        ]);

        $this->assertResponseStatusCodeSame(204);

        $messages = $client->request('GET', '/api/messages?conversation=/api/conversations/'.$conversation->getId(), [
            'headers' => $this->authorizationHeaders($token),
        ])->toArray();

        $this->assertResponseIsSuccessful();
        $this->assertCount(1, $messages['member']);
        $this->assertTrue($messages['member'][0]['deleted']);
        $this->assertSame('Message supprimé', $messages['member'][0]['content']);
    }

    public function testMessageCannotEmbedAnnonceFromOutsideParticipants(): void
    {
        $client = static::createClient();
        $userOne = UserFactory::createOne();
        $userTwo = UserFactory::createOne();
        $outsideUser = UserFactory::createOne();
        $outsideAnnonce = AnnonceFactory::createOne(['author' => $outsideUser]);
        $token = ApiTokenFactory::createOne(['ownedBy' => $userOne]);
        $conversation = $this->createConversation($userOne->_real(), $userTwo->_real());

        $client->request('POST', '/api/messages', [
            'headers' => $this->jsonHeaders($token),
            'json' => [
                'conversation' => '/api/conversations/'.$conversation->getId(),
                'annonce' => '/api/annonces/'.$outsideAnnonce->getId(),
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    /**
     * @return array<string, string>
     */
    private function authorizationHeaders(ApiToken $token): array
    {
        return ['Authorization' => 'Bearer '.$token->getToken()];
    }

    /**
     * @return array<string, string>
     */
    private function jsonHeaders(ApiToken $token): array
    {
        return [
            ...$this->authorizationHeaders($token),
            'Content-Type' => 'application/ld+json',
        ];
    }

    private function createConversation(\App\Entity\User $userOne, \App\Entity\User $userTwo): Conversation
    {
        $conversation = (new Conversation())
            ->setUserOne($userOne)
            ->setUserTwo($userTwo);

        $entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $entityManager->persist($conversation);
        $entityManager->flush();

        return $conversation;
    }
}
