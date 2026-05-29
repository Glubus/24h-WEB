<?php

namespace App\Security;

use App\Entity\User;
use App\Repository\ApiTokenRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class ApiTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(private ApiTokenRepository $apiTokenRepository)
    {
    }

    public function getUserBadgeFrom(#[\SensitiveParameter] string $accessToken): UserBadge
    {
        $token = $this->apiTokenRepository->findOneBy(['token' => $accessToken]);
        if (!$token || !$token->isValid()) {
            throw new BadCredentialsException('Invalid token');
        }

        $token->getOwnedBy()->setAccessTokenScopes($token->getScopes());

        return new UserBadge($token->getOwnedBy()->getUserIdentifier());
    }

    public function getUserToken(User $user): string
    {
        $token = $this->apiTokenRepository->findOneBy(['ownedBy' => $user]);
        if (!$token) {
            throw new BadCredentialsException('Invalid user');
        }

        return $token->getToken();
    }
}
