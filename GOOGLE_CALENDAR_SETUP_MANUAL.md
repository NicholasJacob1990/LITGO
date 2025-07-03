# 🗓️ Configuração Manual do Google Calendar API

Como o comando `gcloud alpha oauth` está apresentando problemas, vamos configurar manualmente pelo Console Web.

## ✅ Já Concluído
- ✅ Projeto criado: `litgo5-nicholasjacob`
- ✅ Faturamento vinculado
- ✅ APIs habilitadas:
  - `calendar-json.googleapis.com` (Google Calendar API)
  - `identitytoolkit.googleapis.com` (Identity Toolkit)
  - `iamcredentials.googleapis.com` (IAM Credentials)

## 📋 Próximos Passos (Manual)

### 1. Acessar o Google Cloud Console
Abra: https://console.cloud.google.com/

### 2. Selecionar o Projeto
- Certifique-se de que está no projeto: **litgo5-nicholasjacob**

### 3. Configurar OAuth Consent Screen
1. Vá para: **APIs & Services** → **OAuth consent screen**
2. Escolha **External** (para permitir qualquer usuário Google)
3. Preencha:
   - **App name**: LITGO5 Mobile
   - **User support email**: nicholasjacob90@gmail.com
   - **Developer contact email**: nicholasjacob90@gmail.com
4. Clique **Save and Continue**
5. Em **Scopes**, adicione:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
6. **Save and Continue** até o final

### 4. Criar Credentials
1. Vá para: **APIs & Services** → **Credentials**
2. Clique **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**

#### 4.1 Client ID para iOS
1. **Application type**: iOS
2. **Name**: LITGO5 - iOS
3. **Bundle ID**: `com.anonymous.boltexponativewind`
4. Clique **CREATE**
5. **Copie o Client ID** (formato: `xxxxx.apps.googleusercontent.com`)

#### 4.2 Client ID para Web (Expo)
1. **Application type**: Web application
2. **Name**: LITGO5 - Expo (Web)
3. **Authorized redirect URIs**: 
   - `https://auth.expo.io/@SEU_EXPO_USERNAME/litgo5`
   - (Substitua `SEU_EXPO_USERNAME` pelo seu username do Expo)
4. Clique **CREATE**
5. **Copie o Client ID e Client Secret**

## 🔧 Configurar no Código

Após obter as credenciais, edite `lib/services/calendar.ts`:

```typescript
export const useGoogleAuth = () => {
  const redirectUri = makeRedirectUri({
    scheme: 'com.anonymous.boltexponativewind',
    path: 'redirect'
  });
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: 'SEU_IOS_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'SEU_WEB_CLIENT_ID.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    clientSecret: 'SEU_WEB_CLIENT_SECRET',
    redirectUri,
  });

  return { request, response, promptAsync, redirectUri };
};
```

## 🚀 Testar a Integração

1. Substitua as credenciais no código
2. Execute: `npx expo start`
3. Abra a tela "Agenda" no app
4. Toque em "Conectar Google Calendar"
5. Complete o fluxo de autorização

## 📝 Variáveis de Ambiente (Recomendado)

Para maior segurança, adicione as credenciais no `.env`:

```env
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=seu_ios_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=seu_web_client_id
GOOGLE_WEB_CLIENT_SECRET=seu_web_client_secret
```

E use no código:
```typescript
iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
clientSecret: process.env.GOOGLE_WEB_CLIENT_SECRET,
```

---

**Links Úteis:**
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [Expo AuthSession Docs](https://docs.expo.dev/guides/authentication/) 