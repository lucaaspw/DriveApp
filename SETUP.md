# 🚀 Guia de Configuração - DriveApp

## Passo a Passo para Configurar o Projeto

### 1. Configurar Neon (PostgreSQL)

1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Copie a connection string (DATABASE_URL)
5. Ela deve ter o formato:
   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

### 2. Configurar Clerk (Autenticação)

1. Acesse [clerk.com](https://clerk.com)
2. Crie uma conta ou faça login
3. Crie uma nova aplicação
4. Configure o Google OAuth:
   - Vá em "User & Authentication" > "Social Connections"
   - Ative o Google
   - Configure as credenciais do Google OAuth
5. Copie as chaves:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (começa com `pk_`)
   - `CLERK_SECRET_KEY` (começa com `sk_`)
6. Configure as URLs de redirecionamento:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

### 3. Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 4. Instalar Dependências

```bash
npm install
```

### 5. Configurar o Banco de Dados

```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar schema ao banco de dados
npx prisma db push
```

### 6. Executar o Projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 7. Primeiro Acesso

1. Você será redirecionado para a tela de login
2. Clique em "Sign up" ou "Sign in"
3. Use sua conta Google para fazer login
4. Após o login, você será redirecionado para a tela "Hoje"

## 🎯 Próximos Passos

1. **Registrar primeiro dia de trabalho**:
   - Vá em "Registrar"
   - Preencha os dados do dia
   - Salve

2. **Registrar primeiro abastecimento**:
   - Vá em "Registrar"
   - Selecione "Abastecimento"
   - Preencha valor e km rodados
   - Salve

3. **Visualizar relatórios**:
   - Vá em "Relatórios"
   - Explore as abas: Dia, Semana, Mês

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar produção
npm run start

# Abrir Prisma Studio (visualizar dados)
npm run db:studio

# Aplicar mudanças no schema
npm run db:push

# Gerar Prisma Client
npm run db:generate
```

## 🐛 Solução de Problemas

### Erro de conexão com o banco
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que o banco está acessível
- Verifique se o SSL está habilitado (`sslmode=require`)

### Erro de autenticação Clerk
- Verifique se as chaves estão corretas
- Certifique-se de que as URLs estão configuradas no Clerk
- Verifique se o Google OAuth está configurado

### Erro ao gerar Prisma Client
- Execute `npm install` novamente
- Verifique se o `DATABASE_URL` está configurado
- Execute `npx prisma generate` manualmente

## 📱 Testando no Mobile

Para testar no seu celular:

1. Descubra o IP da sua máquina na rede local
2. Execute: `npm run dev -- -H 0.0.0.0`
3. Acesse no celular: `http://SEU_IP:3000`

Ou use um túnel como ngrok:
```bash
npx ngrok http 3000
```
