<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * @implements ProcessorInterface<User, User>
 */
final class UserImageUploadProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly SluggerInterface $slugger,
        private readonly KernelInterface $kernel,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        if (!$data instanceof User) {
            throw new BadRequestHttpException('User not found.');
        }

        $request = $context['request'] ?? null;
        if (!$request instanceof Request) {
            throw new BadRequestHttpException('Missing request.');
        }

        $image = $request->files->get('image');
        if (!$image instanceof UploadedFile) {
            throw new BadRequestHttpException('Missing image file.');
        }

        if (!str_starts_with((string) $image->getClientMimeType(), 'image/')) {
            throw new BadRequestHttpException('Uploaded file must be an image.');
        }

        $uploadDir = $this->kernel->getProjectDir().'/public/uploads/users';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = $this->slugger->slug($originalName)->lower();
        $extension = $image->getClientOriginalExtension() ?: 'bin';
        $filename = sprintf('%s-%s.%s', $safeName, bin2hex(random_bytes(8)), $extension);

        $image->move($uploadDir, $filename);

        $data->setProfileImagePath('/uploads/users/'.$filename);
        $this->entityManager->flush();

        return $data;
    }
}
