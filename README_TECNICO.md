# 🛠️ README TÉCNICO - LITGO5

## 📋 Índice Rápido

- [🚀 Quick Start](#-quick-start)
- [🏗️ Arquitetura](#️-arquitetura)
- [📁 Estrutura de Arquivos](#-estrutura-de-arquivos)
- [🔧 Configuração](#-configuração)
- [🗄️ Banco de Dados](#️-banco-de-dados)
- [🤖 Integração OpenAI](#-integração-openai)
- [🎨 Componentes](#-componentes)
- [�� Segurança](#-segurança)

---

## 🚀 Quick Start

### Pré-requisitos
```bash
node >= 18.0.0
npm >= 9.0.0
expo-cli >= 6.0.0
supabase-cli >= 1.0.0
```

### Instalação Rápida
```bash
# Clone e instale
git clone <repo-url> && cd LITGO5
npm install

# Configure ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# Inicie Supabase local
supabase start
supabase db push

# Execute o app
npm start
```

---

## 🏗️ Arquitetura

### Stack Tecnológico
```
Frontend:     React Native + Expo
Backend:      Supabase (PostgreSQL + Auth + Realtime)
IA:           OpenAI GPT-4o-mini
Estado:       React Context API
Navegação:    Expo Router (File-based)
Estilização:  StyleSheet + LinearGradient
```

### Padrões de Arquitetura
- **Atomic Design**: Atoms → Molecules → Organisms
- **Feature-based**: Organização por funcionalidade
- **Context Pattern**: Estado global com React Context
- **RLS Pattern**: Segurança a nível de banco
- **Repository Pattern**: Abstração de dados

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Mantenedor**: Equipe LITGO5
