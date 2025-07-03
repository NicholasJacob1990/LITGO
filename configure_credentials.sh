#!/bin/bash

if [ $# -ne 3 ]; then
    echo "❌ Uso: $0 IOS_CLIENT_ID WEB_CLIENT_ID WEB_CLIENT_SECRET"
    echo ""
    echo "Exemplo:"
    echo "$0 '560320433156-abc123.apps.googleusercontent.com' '560320433156-def456.apps.googleusercontent.com' 'GOCSPX-abc123def456'"
    exit 1
fi

IOS_CLIENT_ID=$1
WEB_CLIENT_ID=$2
WEB_CLIENT_SECRET=$3

echo "🔧 Configurando credenciais OAuth no código..."
echo ""
echo "📱 iOS Client ID: $IOS_CLIENT_ID"
echo "🌐 Web Client ID: $WEB_CLIENT_ID"
echo "🔐 Web Client Secret: $WEB_CLIENT_SECRET"
echo ""

# Fazer backup do arquivo original
cp lib/services/calendar.ts lib/services/calendar.ts.backup

# Substituir as credenciais no arquivo
sed -i '' "s/560320433156-8k5h3j9l2m4n6p7q8r9s0t1u2v3w4x5y.apps.googleusercontent.com/$IOS_CLIENT_ID/g" lib/services/calendar.ts
sed -i '' "s/560320433156-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p.apps.googleusercontent.com/$WEB_CLIENT_ID/g" lib/services/calendar.ts
sed -i '' "s/GOCSPX-1234567890abcdefghijklmnopqrstuvwx/$WEB_CLIENT_SECRET/g" lib/services/calendar.ts

echo "✅ Credenciais configuradas com sucesso!"
echo ""
echo "📄 Backup salvo em: lib/services/calendar.ts.backup"
echo ""
echo "🚀 Próximos passos:"
echo "1. Reinicie o aplicativo: npx expo start"
echo "2. Teste a integração com Google Calendar na tela de Agenda"
echo "3. Clique em 'Sincronizar' para conectar sua conta Google"
echo "" 