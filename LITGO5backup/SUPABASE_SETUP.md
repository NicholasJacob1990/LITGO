# Configuração do Supabase para LITGO

Este guia explica como configurar o Supabase com PostGIS para o sistema de busca de advogados por proximidade.

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login e clique em "New Project"
3. Escolha sua organização
4. Configure:
   - **Name**: `litgo-app`
   - **Database Password**: Senha forte (guarde-a!)
   - **Region**: Escolha a mais próxima (ex: São Paulo)
5. Clique em "Create new project"

### 2. Habilitar Extensões PostGIS

1. No Dashboard do Supabase, vá para **Settings** → **Database**
2. Role até **Extensions**
3. Habilite as seguintes extensões:
   - ✅ `postgis`
   - ✅ `cube`
   - ✅ `earthdistance`

### 3. Executar Script SQL

1. No Dashboard, vá para **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo do arquivo `supabase-setup.sql`
4. Clique em **Run** para executar

### 4. Configurar Variáveis de Ambiente

1. No Dashboard, vá para **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public** key

3. Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_project_url_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

4. Atualize o arquivo `lib/supabase.ts`:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

### 5. Configurar Realtime (Opcional)

1. No Dashboard, vá para **Database** → **Replication**
2. Encontre a tabela `lawyers`
3. Clique em **Enable** para Realtime

### 6. Testar a Configuração

Execute o app e teste a busca de advogados:

```bash
npm start
```

## 📊 Estrutura do Banco

### Tabela `lawyers`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do advogado |
| `name` | VARCHAR(255) | Nome completo |
| `oab_number` | VARCHAR(50) | Número OAB (único) |
| `primary_area` | VARCHAR(100) | Área principal |
| `specialties` | TEXT[] | Array de especialidades |
| `rating` | DECIMAL(3,2) | Avaliação (0-5) |
| `review_count` | INTEGER | Número de avaliações |
| `experience` | INTEGER | Anos de experiência |
| `avatar_url` | TEXT | URL da foto |
| `lat` | DECIMAL(10,8) | Latitude |
| `lng` | DECIMAL(11,8) | Longitude |
| `response_time` | VARCHAR(50) | Tempo de resposta |
| `success_rate` | INTEGER | Taxa de sucesso (%) |
| `hourly_rate` | DECIMAL(10,2) | Taxa horária |
| `consultation_fee` | DECIMAL(10,2) | Taxa de consulta |
| `is_available` | BOOLEAN | Disponível agora |
| `is_approved` | BOOLEAN | Aprovado pela OAB |
| `next_availability` | VARCHAR(100) | Próxima disponibilidade |
| `languages` | TEXT[] | Idiomas falados |
| `consultation_types` | TEXT[] | Tipos de consulta |

### Funções RPC

#### `lawyers_nearby(lat, lng, radius_km, area, rating_min, available)`

Busca advogados próximos com filtros básicos.

**Parâmetros:**
- `lat`: Latitude do usuário
- `lng`: Longitude do usuário  
- `radius_km`: Raio de busca em km (padrão: 50)
- `area`: Área de especialização (opcional)
- `rating_min`: Rating mínimo (opcional)
- `available`: Apenas disponíveis (opcional)

#### `lawyers_with_filters(lat, lng, radius_km, areas, languages, consultation_types, min_rating, available_only, max_distance)`

Busca avançada com múltiplos filtros.

## 🔒 Segurança

### Row Level Security (RLS)

- **Leitura pública**: Apenas advogados aprovados
- **Edição**: Advogados podem editar apenas seus dados
- **Inserção**: Advogados podem inserir seus dados

### Políticas de Privacidade

- Endereços exatos só são mostrados após contratação
- Distâncias são aproximadas antes do pagamento
- Conformidade com LGPD e regras OAB

## 🗺️ Índices de Performance

- **GIST**: Para buscas espaciais rápidas
- **Parcial**: Para advogados aprovados/disponíveis
- **Rating**: Para ordenação por avaliação

## 📱 Integração no App

### 1. Instalar Dependências

```bash
npm install @supabase/supabase-js react-native-maps
```

### 2. Configurar LocationService

O `LocationService` já está configurado para:
- Solicitar permissões de localização
- Obter coordenadas GPS
- Calcular distâncias

### 3. Usar no Código

```typescript
import { LawyerService } from '@/lib/supabase';

// Buscar advogados próximos
const lawyers = await LawyerService.getLawyersNearby({
  _lat: userLat,
  _lng: userLng,
  _radius_km: 30
});
```

## 🧪 Testando

### 1. Dados de Exemplo

O script SQL inclui 4 advogados de exemplo em São Paulo:
- Dr. Ana Silva (Civil)
- Dr. Carlos Mendes (Trabalhista)  
- Dra. Maria Santos (Consumidor)
- Dr. João Oliveira (Previdenciário)

### 2. Teste de Busca

```sql
-- Testar função básica
SELECT * FROM lawyers_nearby(-23.5505, -46.6333, 10);

-- Testar com filtros
SELECT * FROM lawyers_with_filters(
  -23.5505, -46.6333, 20,
  ARRAY['Direito Civil'],
  ARRAY['Português'],
  ARRAY['video'],
  4.5,
  true,
  10
);
```

## 🚨 Troubleshooting

### Erro: "Extension postgis does not exist"

1. Verifique se as extensões estão habilitadas
2. Aguarde alguns minutos após criar o projeto
3. Execute novamente o script SQL

### Erro: "Function lawyers_nearby does not exist"

1. Verifique se o script SQL foi executado completamente
2. Confirme que não há erros no SQL Editor
3. Recarregue a página do Dashboard

### App não encontra advogados

1. Verifique as variáveis de ambiente
2. Confirme que os dados de exemplo foram inseridos
3. Teste a função diretamente no SQL Editor

## 📈 Próximos Passos

1. **Autenticação**: Implementar login de advogados
2. **Upload de Fotos**: Configurar Storage para avatares
3. **Notificações**: Configurar Edge Functions para push
4. **Analytics**: Implementar tracking de uso
5. **Backup**: Configurar backup automático

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps) 