.PHONY: help dev up down build logs test test-backend test-frontend lint lint-backend lint-frontend format clean generate-client

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

dev: up ## Start development environment

up: ## Start all services in the background
	docker compose up -d

down: ## Stop all services
	docker compose down

build: ## Build all images
	docker compose build

logs: ## Follow logs
	docker compose logs -f

logs-backend: ## Follow backend logs
	docker compose logs -f backend

logs-frontend: ## Follow frontend logs
	docker compose logs -f frontend

test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	docker compose exec -T backend bash scripts/test.sh

test-frontend: ## Run frontend tests
	cd frontend && npm run test:run

lint: lint-backend lint-frontend ## Lint code

lint-backend: ## Lint backend code
	docker compose exec -T backend bash scripts/lint.sh

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint

format: ## Format code
	docker compose exec -T backend bash scripts/format.sh
	cd frontend && npm run generate-types

clean: ## Clean up temporary files
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +

generate-client: ## Generate frontend client from backend OpenAPI
	cd frontend && npm run generate-client
