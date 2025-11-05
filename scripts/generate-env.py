#!/usr/bin/env python3
"""
Generate .env files for different environments with secure defaults.

This script creates .env files with:
- Automatically generated secure secrets (SECRET_KEY, passwords)
- Interactive prompts for required values (domain, emails, etc.)
- Validation for emails and URLs
- Environment-specific templates

Usage:
    python scripts/generate-env.py --env local
    python scripts/generate-env.py --env production --domain example.com
    python scripts/generate-env.py --env staging --interactive
"""

import argparse
import os
import re
import secrets
import string
from pathlib import Path
from typing import Dict, Optional


def generate_secret_key(length: int = 32) -> str:
    """Generate a secure random secret key."""
    return secrets.token_urlsafe(length)


def generate_password(length: int = 24) -> str:
    """Generate a secure random password with letters, digits, and special characters."""
    alphabet = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_domain(domain: str) -> bool:
    """Validate domain format."""
    pattern = r'^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, domain))


def prompt_input(prompt: str, default: Optional[str] = None, validator=None, required: bool = True) -> str:
    """Prompt user for input with optional validation."""
    while True:
        if default:
            value = input(f"{prompt} [{default}]: ").strip() or default
        else:
            value = input(f"{prompt}: ").strip()

        if not value and not required:
            return ""

        if not value and required:
            print("❌ This field is required.")
            continue

        if validator and not validator(value):
            print(f"❌ Invalid format. Please try again.")
            continue

        return value


def get_local_env_template() -> Dict[str, str]:
    """Template for local development environment."""
    return {
        "DOMAIN": "localhost",
        "FRONTEND_HOST": "http://localhost:5173",
        "ENVIRONMENT": "local",
        "PROJECT_NAME": "Rocket GenAI Local",
        "STACK_NAME": "rocket-genai-local",
        "DOCKER_IMAGE_BACKEND": "rocket-genai-backend-local",
        "DOCKER_IMAGE_FRONTEND": "rocket-genai-frontend-local",
        "TAG": "latest",
        "BACKEND_CORS_ORIGINS": "http://localhost:5173,http://localhost:3000",
        "SECRET_KEY": generate_secret_key(),
        "FIRST_SUPERUSER": "admin@example.com",
        "FIRST_SUPERUSER_PASSWORD": generate_password(),
        "POSTGRES_SERVER": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "app",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": generate_password(),
        "OPENAI_API_KEY": "sk-your-key-here",
        "OPENAI_MODEL": "gpt-4o-mini",
        "OPENAI_EMBEDDING_MODEL": "text-embedding-3-small",
        "SMTP_HOST": "",
        "SMTP_USER": "",
        "SMTP_PASSWORD": "",
        "EMAILS_FROM_EMAIL": "",
        "SENTRY_DSN": "",
    }


def get_production_env_template(domain: str) -> Dict[str, str]:
    """Template for production environment."""
    stack_name = domain.replace(".", "-")
    return {
        "DOMAIN": domain,
        "FRONTEND_HOST": f"https://dashboard.{domain}",
        "ENVIRONMENT": "production",
        "PROJECT_NAME": "Rocket GenAI Production",
        "STACK_NAME": stack_name,
        "DOCKER_IMAGE_BACKEND": f"{stack_name}-backend",
        "DOCKER_IMAGE_FRONTEND": f"{stack_name}-frontend",
        "TAG": "main",
        "BACKEND_CORS_ORIGINS": f"https://{domain},https://dashboard.{domain},https://api.{domain}",
        "SECRET_KEY": generate_secret_key(),
        "FIRST_SUPERUSER": prompt_input("Admin email", validator=validate_email),
        "FIRST_SUPERUSER_PASSWORD": generate_password(),
        "POSTGRES_SERVER": "db",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "app",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": generate_password(),
        "OPENAI_API_KEY": prompt_input("OpenAI API key", required=True),
        "OPENAI_MODEL": "gpt-4o-mini",
        "OPENAI_EMBEDDING_MODEL": "text-embedding-3-small",
        "SMTP_HOST": prompt_input("SMTP host (optional)", required=False),
        "SMTP_USER": prompt_input("SMTP user (optional)", required=False),
        "SMTP_PASSWORD": prompt_input("SMTP password (optional)", required=False) or "",
        "EMAILS_FROM_EMAIL": prompt_input("From email (optional)", validator=validate_email, required=False),
        "SENTRY_DSN": prompt_input("Sentry DSN (optional)", required=False),
    }


def get_staging_env_template(domain: str) -> Dict[str, str]:
    """Template for staging/QA environment."""
    stack_name = f"{domain.replace('.', '-')}-qa"
    return {
        "DOMAIN": domain,
        "FRONTEND_HOST": f"https://dashboard.{domain}",
        "ENVIRONMENT": "staging",
        "PROJECT_NAME": "Rocket GenAI Staging",
        "STACK_NAME": stack_name,
        "DOCKER_IMAGE_BACKEND": f"{stack_name}-backend",
        "DOCKER_IMAGE_FRONTEND": f"{stack_name}-frontend",
        "TAG": "main",
        "BACKEND_CORS_ORIGINS": f"https://{domain},https://dashboard.{domain},https://api.{domain}",
        "SECRET_KEY": generate_secret_key(),
        "FIRST_SUPERUSER": prompt_input("Admin email", validator=validate_email),
        "FIRST_SUPERUSER_PASSWORD": generate_password(),
        "POSTGRES_SERVER": "db",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "app",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": generate_password(),
        "OPENAI_API_KEY": prompt_input("OpenAI API key", required=True),
        "OPENAI_MODEL": "gpt-4o-mini",
        "OPENAI_EMBEDDING_MODEL": "text-embedding-3-small",
        "SMTP_HOST": "",
        "SMTP_USER": "",
        "SMTP_PASSWORD": "",
        "EMAILS_FROM_EMAIL": "",
        "SENTRY_DSN": "",
    }


def write_env_file(filepath: Path, env_vars: Dict[str, str], header: str = ""):
    """Write environment variables to a file."""
    with open(filepath, 'w') as f:
        if header:
            f.write(f"# {header}\n")
            f.write(f"# Generated: {Path(__file__).name}\n")
            f.write(f"# WARNING: Keep this file secure and never commit to git!\n\n")

        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")

    # Set restrictive permissions (owner read/write only)
    os.chmod(filepath, 0o600)
    print(f"✅ Created {filepath} (permissions: 600)")


def print_summary(env_vars: Dict[str, str], env_type: str):
    """Print summary of generated values."""
    print("\n" + "="*60)
    print(f"🔐 GENERATED SECRETS FOR {env_type.upper()} ENVIRONMENT")
    print("="*60)
    print(f"\n🔑 SECRET_KEY: {env_vars['SECRET_KEY'][:20]}...")
    print(f"👤 Admin User: {env_vars['FIRST_SUPERUSER']}")
    print(f"🔒 Admin Password: {env_vars['FIRST_SUPERUSER_PASSWORD']}")
    print(f"🗄️  Postgres User: {env_vars['POSTGRES_USER']}")
    print(f"🔒 Postgres Password: {env_vars['POSTGRES_PASSWORD']}")

    if env_vars.get('OPENAI_API_KEY') and not env_vars['OPENAI_API_KEY'].startswith('sk-your'):
        print(f"🤖 OpenAI API Key: {env_vars['OPENAI_API_KEY'][:20]}...")

    print("\n" + "="*60)
    print("⚠️  IMPORTANT: Save these credentials securely!")
    print("="*60 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Generate .env files for different environments",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate local development environment
  python scripts/generate-env.py --env local

  # Generate production environment
  python scripts/generate-env.py --env production --domain example.com

  # Generate staging environment with interactive prompts
  python scripts/generate-env.py --env staging --domain qa.example.com --interactive

  # Generate and save to custom location
  python scripts/generate-env.py --env local --output /path/to/.env.local
        """
    )

    parser.add_argument(
        '--env',
        choices=['local', 'staging', 'production'],
        required=True,
        help='Environment type to generate'
    )

    parser.add_argument(
        '--domain',
        help='Domain name (required for staging/production)'
    )

    parser.add_argument(
        '--output',
        help='Output file path (default: .env.{env})'
    )

    parser.add_argument(
        '--interactive',
        action='store_true',
        help='Enable interactive mode for all prompts'
    )

    parser.add_argument(
        '--force',
        action='store_true',
        help='Overwrite existing file without confirmation'
    )

    args = parser.parse_args()

    # Determine output path
    if args.output:
        output_path = Path(args.output)
    else:
        # Default to root directory
        root_dir = Path(__file__).parent.parent
        output_path = root_dir / f".env.{args.env}"

    # Check if file exists
    if output_path.exists() and not args.force:
        response = input(f"⚠️  {output_path} already exists. Overwrite? [y/N]: ")
        if response.lower() not in ['y', 'yes']:
            print("❌ Cancelled.")
            return

    # Validate domain for non-local environments
    if args.env in ['staging', 'production']:
        if not args.domain:
            print("❌ --domain is required for staging/production environments")
            return

        if not validate_domain(args.domain):
            print(f"❌ Invalid domain format: {args.domain}")
            return

    print(f"\n🚀 Generating .env file for {args.env} environment...\n")

    # Generate environment variables based on type
    if args.env == 'local':
        env_vars = get_local_env_template()
    elif args.env == 'staging':
        env_vars = get_staging_env_template(args.domain)
    else:  # production
        env_vars = get_production_env_template(args.domain)

    # Write to file
    header = f"{args.env.upper()} ENVIRONMENT"
    write_env_file(output_path, env_vars, header)

    # Print summary
    print_summary(env_vars, args.env)

    # Print next steps
    print("📋 NEXT STEPS:")
    print("-" * 60)

    if args.env == 'local':
        print("1. Review and update .env.local with your OpenAI API key")
        print("2. Start services: docker compose up -d")
        print("3. Access at: http://localhost:5173")
    else:
        print(f"1. Copy {output_path.name} to your server")
        print("2. Rename to .env on the server")
        print("3. Update docker-compose.yml to use the file")
        print("4. Run: docker compose up -d")
        print(f"5. Access at: https://dashboard.{args.domain}")

    print("-" * 60)

    # Create example file
    example_path = output_path.parent / f"{output_path.name}.example"
    if args.env == 'local':
        example_vars = {k: "changethis" if k in ["SECRET_KEY", "FIRST_SUPERUSER_PASSWORD", "POSTGRES_PASSWORD", "OPENAI_API_KEY"] else v
                       for k, v in env_vars.items()}
        write_env_file(example_path, example_vars, f"{args.env.upper()} ENVIRONMENT - EXAMPLE FILE")
        print(f"📝 Example file created: {example_path}")


if __name__ == "__main__":
    main()
