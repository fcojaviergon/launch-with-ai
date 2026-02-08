#!/bin/bash
# ============================================================
# 🚀 Solo Founder SDLC Kit — Installer
# ============================================================
# Instala skills globales, agents, hooks y configuración base
# para un workflow completo de desarrollo + cotización.
#
# Uso:
#   chmod +x install.sh
#   ./install.sh
#
# Para instalar los archivos de proyecto (CLAUDE.md, settings, 
# skills de proyecto), corre desde la raíz de tu repo:
#   ./install.sh --project
# ============================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

KIT_DIR="$(cd "$(dirname "$0")" && pwd)"

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  🚀 Solo Founder SDLC Kit — Installer${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}  ✓${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}  ⚠${NC} $1"
}

print_error() {
    echo -e "${RED}  ✗${NC} $1"
}

# ─── Install Global Skills ────────────────────────────────
install_global() {
    echo -e "\n${BOLD}📦 Instalando Skills Globales (~/.claude/skills/)${NC}\n"

    GLOBAL_SKILLS_DIR="$HOME/.claude/skills"
    mkdir -p "$GLOBAL_SKILLS_DIR"

    # SDLC Skills
    local skills=(
        "plan-feature"
        "implement"
        "test-verify"
        "review-code"
        "commit-ship"
        "write-docs"
        "triage-bug"
        "write-spec"
    )

    for skill in "${skills[@]}"; do
        mkdir -p "$GLOBAL_SKILLS_DIR/$skill"
        cp "$KIT_DIR/global-skills/$skill/SKILL.md" "$GLOBAL_SKILLS_DIR/$skill/SKILL.md"
        print_step "Skill: /\$skill"
    done

    # Business Skills
    local biz_skills=(
        "pdp-generator"
        "bootstrap-repo"
        "log-decision"
        "sprint-retro"
        "time-track"
    )

    for skill in "${biz_skills[@]}"; do
        mkdir -p "$GLOBAL_SKILLS_DIR/$skill"
        if [ -d "$KIT_DIR/global-skills/$skill/scripts" ]; then
            cp -r "$KIT_DIR/global-skills/$skill/scripts" "$GLOBAL_SKILLS_DIR/$skill/"
        fi
        if [ -d "$KIT_DIR/global-skills/$skill/templates" ]; then
            cp -r "$KIT_DIR/global-skills/$skill/templates" "$GLOBAL_SKILLS_DIR/$skill/"
        fi
        if [ -d "$KIT_DIR/global-skills/$skill/resources" ]; then
            cp -r "$KIT_DIR/global-skills/$skill/resources" "$GLOBAL_SKILLS_DIR/$skill/"
        fi
        cp "$KIT_DIR/global-skills/$skill/SKILL.md" "$GLOBAL_SKILLS_DIR/$skill/SKILL.md"
        print_step "Skill: /$skill"
    done

    echo -e "\n${BOLD}🤖 Instalando Agents (~/.claude/agents/)${NC}\n"

    mkdir -p "$HOME/.claude/agents"
    cp "$KIT_DIR/agents/qa-tester.md" "$HOME/.claude/agents/"
    print_step "Agent: qa-tester"
    cp "$KIT_DIR/agents/security-reviewer.md" "$HOME/.claude/agents/"
    print_step "Agent: security-reviewer"

    echo -e "\n${BOLD}⚙️  Instalando Settings Globales (~/.claude/settings.json)${NC}\n"

    if [ -f "$HOME/.claude/settings.json" ]; then
        cp "$HOME/.claude/settings.json" "$HOME/.claude/settings.json.backup.$(date +%s)"
        print_warn "Backup de settings.json existente creado"
    fi
    cp "$KIT_DIR/config/global-settings.json" "$HOME/.claude/settings.json"
    print_step "Settings globales con hooks instalados"

    echo -e "\n${GREEN}${BOLD}✅ Instalación global completada${NC}"
    echo -e "   Skills: ${#skills[@]} SDLC + ${#biz_skills[@]} Negocio = $((${#skills[@]} + ${#biz_skills[@]})) total"
    echo -e "   Agents: 2"
    echo -e "   Hooks: 5 (PreToolUse + PostToolUse + Stop×2 + Notification)"
}

# ─── Install Project Files ────────────────────────────────
install_project() {
    echo -e "\n${BOLD}📁 Instalando Archivos de Proyecto (.claude/ + docs/)${NC}\n"

    if [ ! -d ".git" ]; then
        print_error "No estás en la raíz de un repositorio git."
        print_error "Navega a tu proyecto y corre: $0 --project"
        exit 1
    fi

    PROJECT_NAME=$(basename "$(pwd)")

    # .claude/settings.json (proyecto)
    mkdir -p .claude
    if [ -f ".claude/settings.json" ]; then
        cp ".claude/settings.json" ".claude/settings.json.backup.$(date +%s)"
        print_warn "Backup de .claude/settings.json existente creado"
    fi
    cp "$KIT_DIR/config/project-settings.json" ".claude/settings.json"
    print_step ".claude/settings.json (permisos del proyecto)"

    # CLAUDE.md
    if [ -f "CLAUDE.md" ]; then
        print_warn "CLAUDE.md ya existe — no se sobreescribe"
        print_warn "Revisa $KIT_DIR/config/CLAUDE.md.template como referencia"
    else
        sed "s/\[NOMBRE_PROYECTO\]/$PROJECT_NAME/g" \
            "$KIT_DIR/config/CLAUDE.md.template" > "CLAUDE.md"
        print_step "CLAUDE.md creado (edita los [PLACEHOLDERS])"
    fi

    # docs/
    mkdir -p docs/decisions docs/retros specs
    if [ ! -f "docs/active-plan.md" ]; then
        echo "# Plan Activo\n\nNo hay plan activo. Usa /plan-feature para crear uno." \
            > docs/active-plan.md
        print_step "docs/active-plan.md"
    fi
    if [ ! -f "docs/decisions/README.md" ]; then
        echo "# Decisiones Técnicas (ADRs)\n\n| Fecha | Decisión | Estado |\n|-------|----------|--------|\n| | | |" \
            > docs/decisions/README.md
        print_step "docs/decisions/README.md"
    fi

    echo -e "\n${GREEN}${BOLD}✅ Proyecto configurado${NC}"
    echo -e "   Recuerda editar CLAUDE.md con tu stack y convenciones"
    echo -e "   Tus skills de frontend/backend van en .claude/skills/"
}

# ─── Main ─────────────────────────────────────────────────
print_header

case "${1:-}" in
    --project)
        install_project
        ;;
    --global)
        install_global
        ;;
    *)
        install_global
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}  Siguiente paso:${NC}"
        echo -e "  Navega a tu proyecto y corre:"
        echo -e "  ${BLUE}cd /ruta/a/tu/proyecto && $0 --project${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        ;;
esac

echo ""
