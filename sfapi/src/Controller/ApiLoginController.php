<?php

namespace App\Controller;

use App\Entity\User;
use App\Security\ApiTokenHandler;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class ApiLoginController extends AbstractController
{
    #[Route('/api/login', name: 'app_api_login')]
    public function login(ApiTokenHandler $apiTokenHandler): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'error' => 'Invalid credentials',
            ], 401);
        }

        $token = $apiTokenHandler->getUserToken($user);

        return $this->json([
            'token' => $token,
            'username' => $user->getUsername(),
        ]);
    }
}
