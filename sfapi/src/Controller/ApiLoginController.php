<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Security\ApiTokenHandler;

final class ApiLoginController extends AbstractController
{
    #[Route('/api/login', name: 'app_api_login')]
    public function login(ApiTokenHandler $apiTokenHandler): JsonResponse
    {
       $user=$this->getUser();

       if(!$user) {
        return $this->json([
            'error' => 'Invalid credentials',
        ], 401);
       }

       $token=$this->apiTokenHandler->getUserToken($user);
       return $this->json([
        'token' => $token,
        'username' => $user->getUsername(),
       ]);
    }
}
