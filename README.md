# 🚗 DriveApp - Sistema de Controle Financeiro para Motoristas

## 📖 Descrição do Sistema

O **DriveApp** é uma aplicação web completa e moderna de controle financeiro desenvolvida especificamente para motoristas de aplicativos (Uber, 99, InDrive). O sistema foi projetado com foco em **mobile-first**, oferecendo uma experiência otimizada para uso em dispositivos móveis, permitindo que os motoristas registrem seus ganhos, gastos e despesas de forma rápida e eficiente.

### Objetivo Principal

Facilitar o controle financeiro pessoal de motoristas, permitindo que eles:
- Registrem rapidamente seus dias de trabalho e ganhos
- Acompanhem gastos com combustível
- Gerenciem despesas mensais e recorrentes
- Visualizem relatórios e análises detalhadas de seu desempenho
- Acompanhem o progresso em relação às metas diárias de ganho

### Características Principais

- **Mobile First**: Interface totalmente otimizada para uso com uma mão em dispositivos móveis
- **Ações Rápidas**: Registros completos em 30-60 segundos
- **Navegação Intuitiva**: Bottom navigation sempre visível para acesso rápido às funcionalidades
- **Feedback Imediato**: Cálculos automáticos e status em tempo real
- **Relatórios Visuais**: Gráficos interativos e estatísticas detalhadas para análise de desempenho
- **Despesas Recorrentes**: Sistema inteligente de gerenciamento de despesas mensais com criação automática
- **Múltiplas Plataformas**: Suporte para registro de ganhos do Uber, 99 e InDrive
- **Tema Escuro**: Suporte completo a modo claro e escuro para melhor experiência visual

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 14.2.5** (App Router) - Framework React para aplicações web modernas
- **React 18.3.1** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.5.4** - Superset JavaScript com tipagem estática
- **Tailwind CSS 3.4.7** - Framework CSS utility-first para estilização
- **Radix UI** - Componentes acessíveis e customizáveis:
  - `@radix-ui/react-dialog` - Modais e diálogos
  - `@radix-ui/react-select` - Seletores customizados
  - `@radix-ui/react-slider` - Controles deslizantes
  - `@radix-ui/react-tabs` - Sistema de abas
- **Lucide React 0.427.0** - Biblioteca de ícones moderna e leve
- **Chart.js 4.4.3** + **React-Chartjs-2 5.2.0** - Gráficos e visualizações de dados
- **date-fns 3.6.0** - Biblioteca para manipulação de datas

### Backend & API

- **Next.js API Routes** - Rotas de API integradas ao framework
- **Prisma 5.19.0** - ORM moderno para TypeScript
- **Zod 3.23.8** - Validação de schemas TypeScript-first
- **React Hook Form 7.52.1** - Gerenciamento de formulários performático
- **@hookform/resolvers 3.3.4** - Resolvers para integração com Zod

### Banco de Dados

- **PostgreSQL** (via Neon) - Banco de dados relacional
- **Prisma Client** - Cliente type-safe gerado a partir do schema

### Autenticação & Segurança

- **Clerk 5.0.0** - Plataforma completa de autenticação e gerenciamento de usuários
  - Autenticação com Google OAuth
  - Gerenciamento de sessões
  - Middleware de proteção de rotas

### Desenvolvimento

- **ESLint 8.57.0** - Linter para JavaScript/TypeScript
- **PostCSS 8.4.40** - Processador CSS
- **Autoprefixer 10.4.19** - Adiciona prefixos CSS automaticamente
- **clsx 2.1.1** - Utilitário para construção de classes CSS condicionais
- **tailwind-merge 2.5.2** - Merge inteligente de classes Tailwind

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

## 📱 Funcionalidades Detalhadas

### 🏠 Dashboard / Tela "Hoje"

A tela principal oferece uma visão completa do dia atual:

- **Ganho Total do Dia**: Soma de todos os ganhos (Uber + 99 + InDrive)
- **Lucro Líquido**: Ganho total menos gastos com combustível calculados automaticamente
- **Meta Diária**: Barra de progresso visual mostrando o progresso em relação à meta configurável (padrão: R$ 500)
- **Gasto com Combustível**: Cálculo automático baseado em km rodados e custo por km dos últimos 30 dias
- **Destaques do Dia**:
  - Ganhos por plataforma (Uber, 99, InDrive)
  - Horas trabalhadas
  - Quilômetros rodados
  - Número de viagens (opcional)
- **Analytics dos Últimos 7 Dias**: Gráficos e métricas de desempenho
- **Alertas de Despesas**: Notificações sobre despesas pendentes próximas do vencimento

### ➕ Tela "Registrar"

Interface otimizada para registro rápido de informações:

#### Registrar Dia de Trabalho
- Data do trabalho
- Horas trabalhadas
- Quilômetros rodados
- Número de viagens (opcional)
- Ganhos do Uber
- Ganhos da 99
- Ganhos do InDrive
- Feedback imediato com cálculos automáticos de lucro líquido

#### Registrar Abastecimento
- Data do abastecimento
- Valor gasto
- Quilômetros rodados desde o último abastecimento
- Cálculo automático do custo por km

### 💰 Tela "Finanças" (Controle de Despesas)

Sistema completo de gerenciamento de despesas mensais:

- **Listagem de Despesas**: Visualização de todas as despesas com filtros por status (pago/pendente)
- **Categorização**: Organização por categorias (Casa, Água, Luz, Internet, Celular, Móveis, Cartão, etc.)
- **Despesas Recorrentes**: 
  - Configuração de despesas que se repetem mensalmente
  - Criação automática da próxima instância ao marcar como pago
  - Agrupamento inteligente de despesas recorrentes
- **Gestão de Vencimentos**: 
  - Data de vencimento ou dia do mês para despesas recorrentes
  - Alertas de despesas próximas do vencimento
- **Controle de Pagamento**: 
  - Marcação de despesas como pagas
  - Registro de data de pagamento
  - Histórico completo de pagamentos

### 📊 Tela "Relatórios"

Análise detalhada de desempenho financeiro com múltiplas visualizações:

#### Abas de Período
- **Dia**: Análise do dia atual
- **Semana**: Análise dos últimos 7 dias
- **Mês**: Análise do mês atual

#### Métricas Principais
- Total ganho (soma de todas as plataformas)
- Total gasto (combustível + despesas)
- Lucro líquido (ganho - gastos)
- Média por dia trabalhado
- Dias que bateram a meta diária
- Taxa de sucesso em relação à meta

#### Métricas de Desempenho
- **Ganho por Hora**: Eficiência de trabalho
- **Ganho por Km**: Rentabilidade por distância
- **Custo por Km**: Custo operacional
- **Comparação de Plataformas**: Análise Uber vs 99 vs InDrive

#### Visualizações
- Gráficos de linha para evolução temporal
- Gráficos de pizza para distribuição de ganhos
- Gráficos de barras para comparações
- Análise de tendências

### 👤 Tela "Perfil"

Gerenciamento de conta e configurações:

- **Informações do Usuário**: Nome, email (via Clerk)
- **Meta Diária**: Visualização e edição da meta de ganho diário
- **Resumo Mensal**: Estatísticas do mês atual
- **Logout**: Encerramento seguro de sessão

## 🗄️ Estrutura do Banco de Dados

O banco de dados utiliza PostgreSQL gerenciado pelo Neon e é modelado através do Prisma ORM:

### Modelos de Dados

#### User (Usuários)
- `id`: Identificador único (CUID)
- `clerkId`: ID do usuário no Clerk (único)
- `email`: Email do usuário
- `name`: Nome do usuário (opcional)
- `dailyGoal`: Meta diária de ganho (padrão: R$ 500)
- `createdAt` / `updatedAt`: Timestamps automáticos
- **Relacionamentos**: WorkDay[], Fueling[], MonthlyExpense[]

#### WorkDay (Dias de Trabalho)
- `id`: Identificador único
- `userId`: Referência ao usuário
- `date`: Data do trabalho (único por usuário)
- `hoursWorked`: Horas trabalhadas
- `kmDriven`: Quilômetros rodados
- `tripsCount`: Número de viagens (opcional)
- `uberEarnings`: Ganhos do Uber
- `ninetynineEarnings`: Ganhos da 99
- `inDriveEarnings`: Ganhos do InDrive
- `createdAt` / `updatedAt`: Timestamps automáticos
- **Índices**: [userId, date] para consultas otimizadas

#### Fueling (Abastecimentos)
- `id`: Identificador único
- `userId`: Referência ao usuário
- `date`: Data do abastecimento
- `amount`: Valor gasto
- `kmDriven`: Quilômetros rodados desde último abastecimento
- `createdAt` / `updatedAt`: Timestamps automáticos
- **Índices**: [userId, date] para consultas otimizadas

#### MonthlyExpense (Despesas Mensais)
- `id`: Identificador único
- `userId`: Referência ao usuário
- `name`: Nome da despesa
- `amount`: Valor da despesa
- `dueDate`: Data de vencimento
- `category`: Categoria da despesa
- `isPaid`: Status de pagamento
- `paidDate`: Data de pagamento (opcional)
- `isRecurring`: Indica se é despesa recorrente
- `dueDay`: Dia do mês para despesas recorrentes (1-31)
- `recurringExpenseId`: ID para agrupar despesas recorrentes
- `createdAt` / `updatedAt`: Timestamps automáticos
- **Índices**: [userId, dueDate], [userId, isPaid], [userId, isRecurring], [recurringExpenseId]

## 📝 Scripts

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria build de produção
- `npm run start`: Inicia servidor de produção
- `npm run db:push`: Aplica mudanças do schema ao banco
- `npm run db:studio`: Abre Prisma Studio
- `npm run db:generate`: Gera Prisma Client

## 🎨 Arquitetura e Design

### Arquitetura da Aplicação

- **Next.js App Router**: Utiliza a arquitetura moderna do Next.js 14 com Server Components e Server Actions
- **API Routes**: Endpoints RESTful para operações CRUD (Create, Read, Update, Delete)
- **Server-Side Rendering (SSR)**: Páginas renderizadas no servidor para melhor performance
- **Client Components**: Componentes interativos apenas onde necessário
- **Middleware**: Proteção de rotas e autenticação via Clerk

### Design Mobile First

O sistema foi projetado seguindo os princípios de Mobile First:

- **Uso com Uma Mão**: Todos os elementos interativos são acessíveis com o polegar
- **Ações Rápidas**: Registros completos em 30-60 segundos
- **Pouca Digitação**: Uso extensivo de seletores, sliders e campos numéricos otimizados
- **Informações Claras**: Hierarquia visual clara e informações objetivas
- **Visualização Rápida**: Dados importantes sempre visíveis sem necessidade de scroll
- **Bottom Navigation**: Navegação principal sempre acessível na parte inferior
- **Responsive Design**: Adaptação automática para tablets e desktops

### Segurança

- **Autenticação OAuth**: Login seguro via Google através do Clerk
- **Proteção de Rotas**: Middleware verifica autenticação em todas as rotas protegidas
- **Validação de Dados**: Validação server-side e client-side com Zod
- **Isolamento de Dados**: Cada usuário acessa apenas seus próprios dados
- **HTTPS**: Comunicação segura em produção

## 🔄 Fluxo de Trabalho Típico

### Para um Motorista Novo

1. **Cadastro**: Login com conta Google via Clerk
2. **Configuração Inicial**: Definir meta diária (padrão: R$ 500)
3. **Primeiro Registro**: Registrar primeiro dia de trabalho e primeiro abastecimento
4. **Configurar Despesas**: Adicionar despesas mensais recorrentes (aluguel, contas, etc.)

### Uso Diário

1. **Ao Final do Dia**: Registrar dia de trabalho com ganhos e km rodados
2. **Ao Abastecer**: Registrar abastecimento com valor e km
3. **Verificar Dashboard**: Acompanhar progresso em relação à meta diária
4. **Gerenciar Despesas**: Marcar despesas como pagas quando necessário

### Análise Semanal/Mensal

1. **Relatórios**: Visualizar análises detalhadas de desempenho
2. **Ajustes**: Ajustar meta diária se necessário
3. **Planejamento**: Usar dados históricos para planejar próximos períodos

## 🎯 Diferenciais do Sistema

- **Cálculo Automático de Custo por Km**: Sistema calcula automaticamente o custo por km baseado nos últimos 30 dias de abastecimentos
- **Despesas Recorrentes Inteligentes**: Ao marcar uma despesa recorrente como paga, o sistema automaticamente cria a próxima instância para o próximo mês
- **Alertas Proativos**: Sistema alerta sobre despesas próximas do vencimento
- **Múltiplas Plataformas**: Suporte nativo para Uber, 99 e InDrive com análise comparativa
- **Métricas Avançadas**: Cálculo automático de ganho por hora, ganho por km e custo por km
- **Interface Responsiva**: Funciona perfeitamente em mobile, tablet e desktop

## 🔧 Tecnologias e Padrões Utilizados

### Padrões de Código

- **TypeScript Strict Mode**: Tipagem forte para maior segurança de tipos
- **Component-Based Architecture**: Componentes React reutilizáveis e modulares
- **Server Components**: Uso extensivo de Server Components para melhor performance
- **API RESTful**: Endpoints seguindo padrões REST
- **Schema Validation**: Validação de dados com Zod em todas as entradas
- **Error Handling**: Tratamento robusto de erros em todas as camadas

### Performance

- **Server-Side Rendering**: Páginas renderizadas no servidor para carregamento rápido
- **Otimização de Consultas**: Índices no banco de dados para consultas rápidas
- **Lazy Loading**: Componentes carregados sob demanda
- **Caching**: Estratégias de cache para dados frequentemente acessados

### Acessibilidade

- **Radix UI**: Componentes acessíveis por padrão
- **Semantic HTML**: Uso de elementos semânticos HTML5
- **Keyboard Navigation**: Navegação completa via teclado
- **Screen Reader Support**: Suporte para leitores de tela

## 📊 Métricas e Analytics

O sistema calcula e exibe automaticamente:

- **Ganho Total**: Soma de todas as plataformas
- **Lucro Líquido**: Ganho - (Combustível + Despesas)
- **Ganho por Hora**: Total ganho / Horas trabalhadas
- **Ganho por Km**: Total ganho / Km rodados
- **Custo por Km**: Total gasto com combustível / Km rodados (últimos 30 dias)
- **Taxa de Sucesso**: Dias que bateram a meta / Total de dias trabalhados
- **Média Diária**: Total ganho / Número de dias trabalhados no período

## 🚀 Deploy e Produção

### Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# URLs de Redirecionamento
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/relatorios"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/relatorios"
```

### Build de Produção

```bash
npm run build
npm run start
```

### Migrações do Banco de Dados

```bash
npx prisma migrate dev    # Desenvolvimento
npx prisma migrate deploy # Produção
```

## 📄 Licença

Este projeto é privado.
