set dotenv-load := true

dev:
    docker compose up

dev-detached:
    docker compose up -d

stop:
    docker compose down

logs:
    docker compose logs -f web

shell:
    docker compose run --rm web sh

build:
    docker compose run --rm web sh -c "npm install && npm run build"

lint:
    docker compose run --rm web sh -c "npm install && npm run lint"
