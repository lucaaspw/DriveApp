# 🚗 DriveApp - Sistema de Controle Financeiro para Motoristas

Sistema mobile-first de controle financeiro para motoristas Uber e 99, desenvolvido com Next.js, Prisma, Neon e Clerk.

## 🎯 Características

- **Mobile First**: Interface otimizada para uso com uma mão
- **Ações rápidas**: Registros em 30-60 segundos
- **Navegação simples**: Bottom navigation sempre visível
- **Feedback imediato**: Cálculos e status em tempo real
- **Relatórios visuais**: Gráficos e estatísticas para análise

## 🛠️ Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma** + **Neon** (PostgreSQL)
- **Clerk** (Autenticação com Google)
- **Tailwind CSS**
- **React Hook Form** + **Zod**
- **Chart.js** (Gráficos)

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Neon (PostgreSQL)
- Conta no Clerk (Autenticação)

## 🚀 Instalação

1. Clone o repositório:

```bash
git clone <seu-repositorio>
cd DriveApp
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/relatorios
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/relatorios
```

4. Configure o banco de dados:

```bash
npx prisma generate
npx prisma db push
```

5. Execute o projeto:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📱 Funcionalidades

### 🏠 Tela "Hoje"

- Ganho do dia
- Lucro líquido
- Meta diária (R$ 500) com barra de progresso
- Gasto com combustível
- Destaques: Uber, 99, horas trabalhadas, km rodados

### ➕ Tela "Registrar"

- **Registrar Dia de Trabalho**: Data, horas, km, ganhos Uber e 99
- **Registrar Abastecimento**: Valor e km rodados
- Feedback imediato com cálculos automáticos

### 📊 Tela "Relatórios"

- Abas: Dia, Semana, Mês
- Total ganho, gasto e lucro líquido
- Média por dia
- Dias que bateram a meta
- Desempenho: ganho por hora, ganho por km, custo por km
- Comparação Uber vs 99

### 👤 Tela "Perfil"

- Informações do usuário
- Meta diária (visualização)
- Resumo mensal
- Logout

## 🗄️ Estrutura do Banco de Dados

- **User**: Usuários do sistema
- **WorkDay**: Dias de trabalho registrados
- **Fueling**: Abastecimentos registrados

## 📝 Scripts

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria build de produção
- `npm run start`: Inicia servidor de produção
- `npm run db:push`: Aplica mudanças do schema ao banco
- `npm run db:studio`: Abre Prisma Studio
- `npm run db:generate`: Gera Prisma Client

## 🎨 Design Mobile First

O sistema foi pensado para:

- Uso com uma mão
- Ações rápidas (30-60 segundos)
- Pouca digitação
- Informações claras e objetivas
- Visualização rápida

## 📄 Licença

Este projeto é privado.
