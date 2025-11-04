#!/usr/bin/env bash

set -e
set -x

echo "🧪 Running Analysis Module Tests"

# Run unit tests for analysis module
echo "📋 Running unit tests..."
python -m pytest app/tests/unit/modules/analysis/ -v --tb=short

# Run integration tests for analysis module  
echo "🔗 Running integration tests..."
python -m pytest app/tests/integration/analysis/ -v --tb=short

# Run all analysis tests with coverage
echo "📊 Running tests with coverage..."
coverage run --source=app/modules/analysis -m pytest app/tests/unit/modules/analysis/ app/tests/integration/analysis/
coverage report --show-missing
coverage html --title "Analysis Module Coverage"

echo "✅ Analysis module tests completed!"
echo "📄 Coverage report generated in htmlcov/index.html"