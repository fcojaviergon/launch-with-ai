#!/usr/bin/env python3
"""
Quick script to test database connection
Run from backend directory: python test_db_connection.py
"""
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from sqlmodel import Session, create_engine, select
from app.modules.users.models import User

def test_connection():
    print("=" * 60)
    print("Testing Database Connection")
    print("=" * 60)

    print(f"\nEnvironment: {settings.ENVIRONMENT}")
    print(f"Database: {settings.POSTGRES_DB}")
    print(f"Host: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}")
    print(f"User: {settings.POSTGRES_USER}")

    # Build connection string
    db_url = str(settings.SQLALCHEMY_DATABASE_URI)
    # Hide password in output
    safe_url = db_url.replace(settings.POSTGRES_PASSWORD, "****")
    print(f"Connection URL: {safe_url}")

    print("\nAttempting to connect...")

    try:
        engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

        with Session(engine) as session:
            # Try to query users
            statement = select(User).limit(1)
            result = session.exec(statement).first()

            print("✅ Connection successful!")

            if result:
                print(f"✅ Found user: {result.email}")
            else:
                print("⚠️  No users found in database")
                print("   Run 'fastapi dev app/main.py' to initialize database")

    except Exception as e:
        print(f"❌ Connection failed!")
        print(f"Error: {type(e).__name__}: {e}")
        return 1

    print("\n" + "=" * 60)
    return 0

if __name__ == "__main__":
    sys.exit(test_connection())
