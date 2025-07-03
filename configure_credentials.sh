#!/bin/bash

# Verifica se o número correto de argumentos foi passado
if [ "$#" -ne 4 ]; then
    echo "❌ Uso: $0 IOS_CLIENT_ID WEB_CLIENT_ID WEB_CLIENT_SECRET ANDROID_CLIENT_ID"
    echo ""
    echo "Exemplo:"
    echo "$0 '560...ios.apps.googleusercontent.com' '560...web.apps.googleusercontent.com' 'GOCSPX-...' '560...android.apps.googleusercontent.com'"
    exit 1
fi

# Argumentos
IOS_CLIENT_ID=$1
WEB_CLIENT_ID=$2
WEB_CLIENT_SECRET=$3
ANDROID_CLIENT_ID=$4
TARGET_FILE="lib/services/calendar.ts"

echo "🔧 Configurando credenciais OAuth em $TARGET_FILE..."
echo "----------------------------------------------------"
echo "📱 iOS Client ID:     $IOS_CLIENT_ID"
echo "🤖 Android Client ID: $ANDROID_CLIENT_ID"
echo "🌐 Web Client ID:      $WEB_CLIENT_ID"
echo "🔐 Web Client Secret:  [PROTEGIDO]"
echo "----------------------------------------------------"

# Fazer backup do arquivo original
backup_file="$TARGET_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$TARGET_FILE" "$backup_file"
echo "✅ Backup do arquivo original criado em: $backup_file"

# Substituir os placeholders no arquivo. 
# Usamos placeholders genéricos para garantir que a substituição funcione mesmo que as credenciais de teste já tenham sido alteradas.
sed -i '' "s/process.env.EXPO_PUBLIC_IOS_CLIENT_ID || '[-A-Za-z0-9._]+'/'$IOS_CLIENT_ID'/g" $TARGET_FILE
sed -i '' "s/process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID || '[-A-Za-z0-9._]+'/'$ANDROID_CLIENT_ID'/g" $TARGET_FILE
sed -i '' "s/process.env.EXPO_PUBLIC_WEB_CLIENT_ID || '[-A-Za-z0-9._]+'/'$WEB_CLIENT_ID'/g" $TARGET_FILE
sed -i '' "s/process.env.EXPO_PUBLIC_WEB_CLIENT_SECRET || '[-A-Za-z0-9._]+'/'$WEB_CLIENT_SECRET'/g" $TARGET_FILE

# As linhas abaixo são um fallback para o formato antigo, caso o regex acima falhe
sed -i '' "s/const CREDENTIALS = {[^}]*};/const CREDENTIALS = {\n  iosClientId: '$IOS_CLIENT_ID',\n  androidClientId: '$ANDROID_CLIENT_ID',\n  webClientId: '$WEB_CLIENT_ID',\n  webClientSecret: '$WEB_CLIENT_SECRET',\n};/g" $TARGET_FILE


# Verificação final
if grep -q "$IOS_CLIENT_ID" "$TARGET_FILE" && grep -q "$WEB_CLIENT_ID" "$TARGET_FILE" && grep -q "$ANDROID_CLIENT_ID" "$TARGET_FILE"; then
    echo "✅ Credenciais configuradas com sucesso em $TARGET_FILE!"
    echo "🎉 Configuração concluída!"
else
    echo "❌ Erro: A substituição das credenciais falhou."
    echo "Por favor, verifique o arquivo $TARGET_FILE e o script."
    # Restaurar backup em caso de falha
    # cp "$backup_file" "$TARGET_FILE"
    exit 1
fi

echo ""
echo "📄 Backup salvo em: $backup_file"
echo ""
echo "🚀 Próximos passos:"
echo "1. Reinicie o aplicativo: npx expo start"
echo "2. Teste a integração com Google Calendar na tela de Agenda"
echo "3. Clique em 'Sincronizar' para conectar sua conta Google"
echo "" 