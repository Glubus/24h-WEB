<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Imagick;
use App\Repository\DragonTreasureRepository;
use Symfony\Component\HttpKernel\KernelInterface;
use App\ApiResource\Map;

class MapProvider implements ProviderInterface
{
    private $dragonTreasureRepository;
    private $kernel;

    public function __construct(DragonTreasureRepository $dragonTreasureRepository, KernelInterface $kernel)
    {
        $this->dragonTreasureRepository = $dragonTreasureRepository;
        $this->kernel = $kernel;
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): Map|array|null
    {
        $treasures = $this->dragonTreasureRepository->findAll();
        $background = new Imagick();
        $background->readImage($this->kernel->getProjectDir() . '/public/map.jpg');
    
        $marker=new Imagick();                      
        $marker->readImage($this->kernel->getProjectDir() . '/public/treasure.png');
        foreach ($treasures as $treasure) {
            $background->compositeImage($marker, Imagick::COMPOSITE_OVER, $treasure->getX(), $treasure->getY());
        }
        $background->writeImage($this->kernel->getProjectDir() . '/public/treasure_map.jpg');
        return new Map($this->request->server->get('REQUEST_SCHEME') . '://' . $this->request->server->get('HTTP_HOST') . '/treasure_map.jpg');
    }
}
