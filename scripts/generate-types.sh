#!/bin/bash
# =============================================================================
# Generate TypeScript Types from Backend OpenAPI Spec
# =============================================================================
# This script generates TypeScript types from the FastAPI backend's OpenAPI spec.
#
# USAGE:
#   ./scripts/generate-types.sh
#
# WORKFLOW:
#   1. Extracts OpenAPI JSON from running FastAPI app
#   2. Generates TypeScript client using @hey-api/openapi-ts
#   3. Formats generated code with Biome
#
# WHEN TO RUN:
#   - After adding/modifying backend endpoints
#   - After changing Pydantic schemas in backend
#   - After modifying response_model in endpoints
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🔄 Generating TypeScript types from backend OpenAPI spec...${NC}"
echo ""

# Step 1: Generate OpenAPI spec from backend
echo -e "${YELLOW}Step 1/3:${NC} Extracting OpenAPI spec from FastAPI..."
cd "$PROJECT_ROOT/backend"

# Use venv python if available, otherwise try system python
PYTHON_CMD="python"
if [ -f ".venv/bin/python" ]; then
    PYTHON_CMD=".venv/bin/python"
elif [ -f "venv/bin/python" ]; then
    PYTHON_CMD="venv/bin/python"
fi

if ! $PYTHON_CMD -c "import app.main" 2>/dev/null; then
    echo -e "${RED}Error: Cannot import backend app.${NC}"
    echo "Make sure you have installed dependencies: cd backend && pip install -e ."
    exit 1
fi

$PYTHON_CMD -c "import app.main; import json; print(json.dumps(app.main.app.openapi(), indent=2))" > "$PROJECT_ROOT/frontend/openapi.json"
echo -e "  ${GREEN}✓${NC} OpenAPI spec generated at frontend/openapi.json"

# Step 2: Generate TypeScript client
echo -e "${YELLOW}Step 2/3:${NC} Generating TypeScript types..."
cd "$PROJECT_ROOT/frontend"

if ! npm run generate-client 2>/dev/null; then
    echo -e "${RED}Error: Failed to generate client. Check openapi-ts configuration.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} TypeScript types generated in src/client/"

# Step 3: Format generated code
echo -e "${YELLOW}Step 3/3:${NC} Formatting generated code..."
npx biome format --write ./src/client > /dev/null 2>&1
echo -e "  ${GREEN}✓${NC} Code formatted with Biome"

echo ""
echo -e "${GREEN}✅ Types generated successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Review generated types in ${YELLOW}src/client/${NC}"
echo "  2. Update domain services in ${YELLOW}domains/*/services/${NC} if signatures changed"
echo "  3. Run ${YELLOW}npm run build${NC} - TypeScript will flag any mismatches"
echo ""
echo -e "${BLUE}Tip:${NC} If you only changed response types (not method signatures),"
echo "     your services should work without changes."
