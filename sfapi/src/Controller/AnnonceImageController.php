<?php

namespace App\Controller;

use App\Entity\Annonce;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

class AnnonceImageController extends AbstractController
{
    #[Route('/api/annonces/{id}/image', name: 'api_annonce_upload_image', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function __invoke(
        Annonce $annonce,
        Request $request,
        SluggerInterface $slugger,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        if ($annonce->getAuthor() !== $this->getUser() && !$this->isGranted('ROLE_ANNONCE_EDIT')) {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $image = $request->files->get('image');

        if (!$image instanceof UploadedFile) {
            return $this->json(['error' => 'Missing image file'], Response::HTTP_BAD_REQUEST);
        }

        if (!str_starts_with((string) $image->getMimeType(), 'image/')) {
            return $this->json(['error' => 'Uploaded file must be an image'], Response::HTTP_BAD_REQUEST);
        }

        $uploadDir = $this->getParameter('kernel.project_dir').'/public/uploads/annonces';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = $slugger->slug($originalName)->lower();
        $filename = sprintf('%s-%s.%s', $safeName, bin2hex(random_bytes(8)), $image->guessExtension() ?: 'bin');

        $image->move($uploadDir, $filename);

        $annonce->setImagePath('/uploads/annonces/'.$filename);
        $entityManager->flush();

        return $this->json([
            'id' => $annonce->getId(),
            'imagePath' => $annonce->getImagePath(),
        ]);
    }
}
