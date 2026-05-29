<?php

namespace App\Controller;

use App\Entity\Annonce;
use App\Repository\AnnonceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Attribute\Route;

final class AnnonceImageController extends AbstractController
{
    #[Route('/api/annonces/{id}/images/{imageIndex}', name: 'app_annonce_image_get', methods: ['GET'])]
    public function __invoke(int $id, int $imageIndex, AnnonceRepository $annonceRepository, KernelInterface $kernel): Response
    {
        $annonce = $annonceRepository->find($id);
        if (!$annonce instanceof Annonce) {
            throw new NotFoundHttpException('Annonce not found.');
        }

        $images = $annonce->getImages();
        if (!array_key_exists($imageIndex, $images)) {
            throw new NotFoundHttpException('Image not found.');
        }

        $path = $kernel->getProjectDir().'/public'.$images[$imageIndex];
        if (!is_file($path)) {
            throw new NotFoundHttpException('Image file not found.');
        }

        return new Response(
            file_get_contents($path) ?: '',
            Response::HTTP_OK,
            ['Content-Type' => mime_content_type($path) ?: 'application/octet-stream'],
        );
    }
}
