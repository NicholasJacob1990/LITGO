#!/bin/bash

# Script de Verificação de Conformidade - LITGO5
# Este script verifica se o aplicativo está seguindo a documentação

echo "🔍 LITGO5 - Verificação de Conformidade com a Documentação"
echo "=========================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNING=0

# Função para verificar se arquivo existe
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((FAILED++))
    fi
}

# Função para verificar se diretório existe
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((FAILED++))
    fi
}

# Função para verificar conteúdo de arquivo
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ $3${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️ $3${NC}"
        ((WARNING++))
    fi
}

echo "📁 1. ESTRUTURA DO PROJETO"
echo "------------------------"
check_file "package.json" "Package.json existe"
check_file "app.config.ts" "Configuração Expo"
check_file "tsconfig.json" "Configuração TypeScript"
check_dir "app/(auth)" "Diretório de autenticação"
check_dir "app/(tabs)" "Diretório de abas principais"
check_dir "lib" "Biblioteca de utilitários"
check_dir "components" "Componentes reutilizáveis"
check_dir "supabase" "Configuração Supabase"
echo ""

echo "🔐 2. AUTENTICAÇÃO E PERFIS"
echo "--------------------------"
check_file "app/(auth)/register-lawyer.tsx" "Cadastro de advogado"
check_file "app/(auth)/register-client.tsx" "Cadastro de cliente"
check_file "lib/contexts/AuthContext.tsx" "Contexto de autenticação"
check_content "lib/contexts/AuthContext.tsx" "UserRole" "Tipos de usuário definidos"
check_content "lib/supabase.ts" "createClient" "Cliente Supabase configurado"
echo ""

echo "🗄️ 3. BANCO DE DADOS E MIGRAÇÕES"
echo "-------------------------------"
check_file "supabase/config.toml" "Configuração Supabase"
check_dir "supabase/migrations" "Diretório de migrações"
MIGRATION_COUNT=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ $MIGRATION_COUNT migrações encontradas${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Nenhuma migração encontrada${NC}"
    ((FAILED++))
fi

# Verificar migrações críticas
check_file "supabase/migrations/20250102000001_ensure_lawyers_table.sql" "Tabela lawyers"
check_file "supabase/migrations/20250103000000_create_cases_table.sql" "Tabela cases"
check_file "supabase/migrations/20250706000000_setup_cases_and_messages.sql" "Sistema de mensagens"
echo ""

echo "💼 4. FUNCIONALIDADES PRINCIPAIS"
echo "-------------------------------"
check_file "cases/LawyerCasesScreen.tsx" "Tela de casos do advogado"
check_file "app/(tabs)/_internal/chat.tsx" "Sistema de chat"
check_file "app/triagem.tsx" "Sistema de triagem"
check_content "lib/supabase.ts" "get_user_cases" "Função RPC para casos"
check_content "lib/supabase.ts" "LawyerService" "Serviço de advogados"
echo ""

echo "🎨 5. INTERFACE E COMPONENTES"
echo "----------------------------"
check_content "lib/contexts/AuthContext.tsx" "UserRole" "Tipos de usuário"
check_content "cases/LawyerCasesScreen.tsx" "LinearGradient" "Design system implementado"
check_content "app/(auth)/register-lawyer.tsx" "StepIndicator" "Onboarding multi-step"
check_file "lib/contexts/TasksContext.tsx" "Context de tarefas"
check_file "lib/contexts/CalendarContext.tsx" "Context de calendário"
echo ""

echo "📱 6. CONFIGURAÇÕES E INTEGRAÇÕES"
echo "--------------------------------"
check_file ".env.backup" "Arquivo de environment"
check_content ".env.backup" "SUPABASE_URL" "URL do Supabase configurada"
check_content ".env.backup" "GEMINI_API_KEY" "API do Gemini configurada"
check_file "CONFIGURACAO_OAUTH_GOOGLE_CALENDAR.md" "Documentação OAuth"
check_content "lib/openai.ts" "OpenAI" "Integração OpenAI presente"
echo ""

echo "📚 7. DOCUMENTAÇÃO"
echo "-----------------"
check_file "DOCUMENTACAO_COMPLETA.md" "Documentação completa"
check_file "docs/archive/MIGRACAO_APLICADA.md" "Status das migrações"
check_file "docs/archive/CORRECOES_FINAIS_APLICADAS.md" "Correções aplicadas"
check_file "VERIFICACAO_CONFORMIDADE.md" "Relatório de conformidade"
echo ""

echo "🧪 8. TESTES E QUALIDADE"
echo "-----------------------"
check_file "jest.config.js" "Configuração Jest"
check_file "jest-setup.js" "Setup de testes"
check_content "package.json" "\"test\":" "Script de teste configurado"
check_content "package.json" "\"lint\":" "Script de lint configurado"
echo ""

# Resumo final
echo "=================================================="
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "=================================================="
echo -e "${GREEN}✅ Aprovado: $PASSED${NC}"
echo -e "${YELLOW}⚠️ Avisos: $WARNING${NC}"
echo -e "${RED}❌ Falhas: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + WARNING + FAILED))
CONFORMIDADE=$((PASSED * 100 / TOTAL))

if [ $CONFORMIDADE -ge 90 ]; then
    echo -e "${GREEN}🎉 CONFORMIDADE: ${CONFORMIDADE}% - EXCELENTE${NC}"
elif [ $CONFORMIDADE -ge 75 ]; then
    echo -e "${YELLOW}👍 CONFORMIDADE: ${CONFORMIDADE}% - BOM${NC}"
elif [ $CONFORMIDADE -ge 60 ]; then
    echo -e "${YELLOW}⚠️ CONFORMIDADE: ${CONFORMIDADE}% - SATISFATÓRIO${NC}"
else
    echo -e "${RED}❌ CONFORMIDADE: ${CONFORMIDADE}% - NECESSITA MELHORIAS${NC}"
fi

echo ""
echo "📋 Para detalhes completos, consulte: VERIFICACAO_CONFORMIDADE.md"
echo ""

# Comandos sugeridos para próximos passos
echo "🚀 PRÓXIMOS PASSOS SUGERIDOS:"
echo "1. npx supabase start     # Iniciar Supabase local"
echo "2. npm run dev           # Iniciar aplicativo"
echo "3. npm run test          # Executar testes"
echo "4. npm run lint          # Verificar qualidade do código"