<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Annonce;
use App\Geocoder\CityGeocoderInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @implements ProcessorInterface<mixed, mixed>
 */
final class AnnoncePersistProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly CityGeocoderInterface $cityGeocoder,
        /** @var ProcessorInterface<mixed, mixed> */
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Annonce) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        if ($this->shouldRefreshCoordinates($data, $context)) {
            $coordinates = $this->cityGeocoder->geocodeCity((string) $data->getCity());
            if (null === $coordinates) {
                throw new BadRequestHttpException('City could not be geocoded.');
            }

            $data->setLatitude($coordinates->latitude);
            $data->setLongitude($coordinates->longitude);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    /**
     * @param array<string, mixed> $context
     */
    private function shouldRefreshCoordinates(Annonce $annonce, array $context): bool
    {
        $city = trim((string) $annonce->getCity());
        if ('' === $city) {
            return false;
        }

        $previous = $context['previous_data'] ?? null;
        if (!$previous instanceof Annonce) {
            return true;
        }

        return $previous->getCity() !== $annonce->getCity();
    }
}
