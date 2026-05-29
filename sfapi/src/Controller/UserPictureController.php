<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Attribute\Route;

final class UserPictureController extends AbstractController
{
    #[Route('/api/users/{id}/pictures', name: 'app_user_picture_get', methods: ['GET'])]
    public function __invoke(int $id, UserRepository $userRepository, KernelInterface $kernel): Response
    {
        $user = $userRepository->find($id);
        if (!$user instanceof User || null === $user->getProfileImagePath()) {
            throw new NotFoundHttpException('Picture not found.');
        }

        $path = $kernel->getProjectDir().'/public'.$user->getProfileImagePath();
        if (!is_file($path)) {
            throw new NotFoundHttpException('Picture file not found.');
        }

        return new Response(
            file_get_contents($path) ?: '',
            Response::HTTP_OK,
            ['Content-Type' => mime_content_type($path) ?: 'application/octet-stream'],
        );
    }
}
