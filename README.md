# Rocket GenAI

Clean, production-ready full-stack template with modular architecture and Azure deployment configuration.

## Technology Stack and Features

- ⚡ [**FastAPI**](https://fastapi.tiangolo.com) for the Python backend API.
    - 🧰 [SQLModel](https://sqlmodel.tiangolo.com) for the Python SQL database interactions (ORM).
    - 🔍 [Pydantic](https://docs.pydantic.dev), used by FastAPI, for the data validation and settings management.
    - 💾 [PostgreSQL](https://www.postgresql.org) as the SQL database.
- 🚀 [React](https://react.dev) for the frontend.
    - 💃 Using TypeScript, hooks, Vite, and other parts of a modern frontend stack.
    - 🎨 [Chakra UI](https://chakra-ui.com) for the frontend components.
    - 🤖 An automatically generated frontend client.
    - 🧪 [Playwright](https://playwright.dev) for End-to-End testing.
    - 🦇 Dark mode support.
- 🐋 [Docker Compose](https://www.docker.com) for development and production.
- 🔒 Secure password hashing by default.
- 🔑 JWT (JSON Web Token) authentication.
- 📫 Email based password recovery.
- ✅ Tests with [Pytest](https://pytest.org).
- 📞 [Traefik](https://traefik.io) as a reverse proxy / load balancer.
- 🚢 Deployment instructions using Docker Compose, including how to set up a frontend Traefik proxy to handle automatic HTTPS certificates.
- 🏭 CI (continuous integration) and CD (continuous deployment) based on GitHub Actions.

## Key Features

- 🏗️ **Modular Frontend Architecture**: Organized API client with domain-based modules
- 🐋 **Azure VM Deployment**: Ready-to-deploy configuration with Traefik
- 🔄 **Automatic Database Migrations**: Alembic integration with Docker
- 📱 **Responsive UI**: Clean Chakra UI components with dark mode
- 🔒 **Production Security**: JWT authentication with secure defaults

## How To Use It

You can **just fork or clone** this repository and use it as is.

✨ It just works. ✨

### How to Use a Private Repository

If you want to have a private repository, GitHub won't allow you to simply fork it as it doesn't allow changing the visibility of forks.

But you can do the following:

- Create a new GitHub repo, for example `my-project`.
- Clone this repository manually:

```bash
git clone https://github.com/vaibes-dev/flow-seguros-la-camara.git my-project
```

- Enter into the new directory:

```bash
cd my-project
```

- Set the new origin to your new repository:

```bash
git remote set-url origin git@github.com:yourusername/my-project.git
```

- Push the code to your new repository:

```bash
git push -u origin main
```

### Update From the Original Template

After cloning the repository, and after doing changes, you might want to get the latest changes from this original template.

- Make sure you added the original repository as a remote, you can check it with:

```bash
git remote -v

origin    git@github.com:yourusername/my-project.git (fetch)
origin    git@github.com:yourusername/my-project.git (push)
upstream    https://github.com/vaibes-dev/flow-seguros-la-camara.git (fetch)
upstream    https://github.com/vaibes-dev/flow-seguros-la-camara.git (push)
```

- Pull the latest changes without merging:

```bash
git pull --no-commit upstream main
```

This will download the latest changes from this template without committing them, that way you can check everything is right before committing.

- If there are conflicts, solve them in your editor.

- Once you are done, commit the changes:

```bash
git merge --continue
```

### Configure

You can then update configs in the `.env` files to customize your configurations.

Before deploying it, make sure you change at least the values for:

- `SECRET_KEY`
- `FIRST_SUPERUSER_PASSWORD`
- `POSTGRES_PASSWORD`

You can (and should) pass these as environment variables from secrets.

For production deployment details, see [CLAUDE.md](./CLAUDE.md).

### Generate Secret Keys

Some environment variables in the `.env` file have a default value of `changethis`.

You have to change them with a secret key, to generate secret keys you can run the following command:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the content and use that as password / secret key. And run that again to generate another secure key.

## Quick Start

### Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/vaibes-dev/flow-seguros-la-camara.git
cd flow-seguros-la-camara
```

2. **Set up environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start with Docker Compose**:
```bash
docker compose watch
```

### Azure VM Deployment

1. **Prepare Azure environment**:
```bash
cp .env.azure.example .env.azure
# Configure your domain and credentials
```

2. **Deploy to Azure**:
```bash
./scripts/deploy-azure.sh
```

The deployment includes:
- Automatic SSL certificates via Traefik
- Database backups before updates
- Health checks and rollback capabilities

## Backend Development

Backend docs: [backend/README.md](./backend/README.md).

## Frontend Development

Frontend docs: [frontend/README.md](./frontend/README.md).

## Deployment

Deployment docs: [deployment.md](./deployment.md).

## Development

General development docs: [development.md](./development.md).

This includes using Docker Compose, custom local domains, `.env` configurations, etc.

## Release Notes

Check the file [release-notes.md](./release-notes.md).

## License

The Full Stack FastAPI Template is licensed under the terms of the MIT license.
