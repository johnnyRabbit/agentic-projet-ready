# 🔍 Qualidade de Código

## ✅ Implementação Completa

**Data:** 2026-03-05  
**Status:** ✅ Completo e funcional

---

## 📊 Ferramentas Implementadas

### 1. **ESLint** - Linting de Código
- ✅ Configuração para TypeScript + React
- ✅ Regras recomendadas do TypeScript
- ✅ Regras de React e React Hooks
- ✅ Detecção de variáveis não usadas
- ✅ Detecção de `any` explícito
- ✅ Regras de boas práticas

### 2. **Prettier** - Formatação de Código
- ✅ Formatação automática
- ✅ Single quotes
- ✅ Trailing commas
- ✅ Print width: 100
- ✅ Tab width: 2
- ✅ Configuração consistente

### 3. **Husky** - Git Hooks
- ✅ Pre-commit hook (lint-staged)
- ✅ Commit-msg hook (commitlint)
- ✅ Hooks automáticos

### 4. **lint-staged** - Lint em Arquivos Modificados
- ✅ ESLint + Prettier em arquivos .ts/.tsx
- ✅ Prettier em arquivos .json/.md/.css
- ✅ Apenas arquivos staged

### 5. **commitlint** - Mensagens de Commit
- ✅ Conventional Commits
- ✅ Validação de formato
- ✅ Tipos permitidos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

---

## 🚀 Como Usar

### Scripts Disponíveis

```bash
# Linting
npm run lint              # Verificar erros de lint
npm run lint:fix          # Corrigir erros de lint automaticamente

# Formatação
npm run format            # Formatar todos os arquivos
npm run format:check      # Verificar se arquivos estão formatados

# Qualidade completa
npm run quality           # Typecheck + Lint + Format check

# Testes
npm test                  # Rodar testes
npm run test:coverage     # Gerar relatório de cobertura
```

### Hooks Automáticos

**Pre-commit:**
- Roda ESLint e Prettier apenas nos arquivos modificados
- Corrige problemas automaticamente quando possível
- Bloqueia commit se houver erros

**Commit-msg:**
- Valida formato da mensagem de commit
- Exige Conventional Commits
- Bloqueia commit se formato inválido

---

## 📝 Conventional Commits

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos Permitidos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças na documentação
- **style**: Formatação, ponto e vírgula, etc (sem mudança de lógica)
- **refactor**: Refatoração de código (sem mudar funcionalidade)
- **perf**: Melhoria de performance
- **test**: Adicionar ou corrigir testes
- **build**: Mudanças no build ou dependências
- **ci**: Mudanças na configuração de CI
- **chore**: Outras mudanças (sem modificar src ou test)
- **revert**: Reverter commit anterior

### Exemplos

```bash
# Bom ✅
feat(auth): add OAuth login with GitHub
fix(budget): prevent overspending in budget engine
docs(readme): update installation instructions
style(components): format code with Prettier
refactor(engine): simplify model router logic
perf(api): optimize database queries
test(auth): add unit tests for login flow
build(deps): update React to 18.3.0
ci(workflow): add automated testing
chore(husky): update git hooks

# Ruim ❌
update code
fix bug
WIP
asdfasdf
```

---

## 📋 Regras de Lint

### TypeScript

```typescript
// ✅ Bom
const userName: string = 'John';
function getUser(id: number): User { ... }

// ❌ Ruim
const userName: any = 'John';  // @typescript-eslint/no-explicit-any
function getUser(id) { ... }   // Missing return type
```

### React

```typescript
// ✅ Bom
function MyComponent() {
  const [state, setState] = useState(0);
  
  useEffect(() => {
    // ...
  }, []);
  
  return <div>{state}</div>;
}

// ❌ Ruim
function MyComponent() {
  var state = 0;  // no-var
  console.log(state);  // no-console
  
  useEffect(() => {
    // ...
  });  // react-hooks/exhaustive-deps
}
```

### Geral

```typescript
// ✅ Bom
const user = getUser();
if (user) {
  doSomething();
}

// ❌ Ruim
var user = getUser();  // no-var
if (user == null) { ... }  // eqeqeq (use ===)
```

---

## 🎨 Regras de Formatação (Prettier)

```json
{
  "semi": true,           // Adiciona ponto e vírgula
  "singleQuote": true,    // Usa aspas simples
  "trailingComma": "es5", // Trailing commas onde válido em ES5
  "printWidth": 100,      // 100 caracteres por linha
  "tabWidth": 2,          // 2 espaços por tab
  "arrowParens": "always" // Sempre usa parênteses em arrow functions
}
```

### Exemplo

```typescript
// Antes (sem formatação)
const user={name:"John",age:30,email:"john@example.com",address:{street:"Main St",city:"NYC"}}

// Depois (com Prettier)
const user = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
  address: {
    street: 'Main St',
    city: 'NYC',
  },
};
```

---

## 🔧 Configurações

### ESLint (`eslint.config.js`)

- **Parser:** TypeScript
- **Plugins:** React, React Hooks, TypeScript
- **Regras:** Recomendadas + customizações
- **Ignora:** node_modules, dist, build, coverage, configs

### Prettier (`.prettierrc`)

- **Semi:** true
- **Single Quote:** true
- **Tab Width:** 2
- **Print Width:** 100
- **Trailing Comma:** es5

### Husky (`.husky/`)

- **pre-commit:** Roda lint-staged
- **commit-msg:** Roda commitlint

### lint-staged (`.lintstagedrc.json`)

- **\*.{ts,tsx,js,jsx}:** ESLint + Prettier
- **\*.{json,md,css,scss}:** Prettier

### commitlint (`commitlint.config.js`)

- **Extends:** @commitlint/config-conventional
- **Tipos:** feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **Header max length:** 100 caracteres

---

## 📊 Workflow de Desenvolvimento

### 1. Escrever Código

```typescript
// src/components/MyComponent.tsx
export function MyComponent() {
  return <div>Hello World</div>;
}
```

### 2. Stage Arquivos

```bash
git add src/components/MyComponent.tsx
```

### 3. Pre-commit Hook (Automático)

```
husky > pre-commit
lint-staged → ESLint + Prettier
✓ Formatação aplicada
✓ Lint corrigido
✓ Commit permitido
```

### 4. Commit

```bash
git commit -m "feat(components): add MyComponent"
```

### 5. Commit-msg Hook (Automático)

```
husky > commit-msg
commitlint → Validando mensagem
✓ Formato válido
✓ Commit concluído
```

---

## 🚨 Problemas Comuns

### 1. ESLint não roda

**Solução:**
```bash
# Reinstalar dependências
npm install

# Limpar cache
rm -rf node_modules/.cache
```

### 2. Prettier não formata

**Solução:**
```bash
# Rodar manualmente
npm run format

# Verificar configuração
cat .prettierrc
```

### 3. Husky hooks não rodam

**Solução:**
```bash
# Reinstalar hooks
npm run prepare

# Verificar permissões
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### 4. Commitlint rejeita mensagem

**Solução:**
```bash
# Usar formato correto
git commit -m "feat(scope): description"

# Exemplos válidos:
# feat(auth): add login
# fix(budget): prevent overspending
# docs(readme): update instructions
```

### 5. Lint-staged demora muito

**Solução:**
```bash
# Rodar apenas em arquivos específicos
npx lint-staged --diff=main

# Ou desativar temporariamente
git commit --no-verify
```

---

## 📈 Benefícios

### Qualidade de Código
- ✅ Código consistente em todo o projeto
- ✅ Detecção precoce de bugs
- ✅ Melhores práticas aplicadas automaticamente
- ✅ Código mais legível e mantível

### Produtividade
- ✅ Formatação automática
- ✅ Correções automáticas
- ✅ Menos tempo em code review
- ✅ Onboarding mais rápido

### Colaboração
- ✅ Padrões claros
- ✅ Commits organizados
- ✅ Histórico limpo
- ✅ Changelog automático

---

## 🎯 Próximos Passos

1. **Rodar lint em todo o projeto:** `npm run lint:fix`
2. **Formatar todos os arquivos:** `npm run format`
3. **Configurar CI/CD** para rodar quality checks
4. **Adicionar mais regras** conforme necessário
5. **Treinar equipe** em Conventional Commits

---

## 📚 Recursos

- [ESLint Docs](https://eslint.org/docs/latest/)
- [Prettier Docs](https://prettier.io/docs/en/)
- [Husky Docs](https://typicode.github.io/husky/)
- [Commitlint Docs](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Status:** ✅ Completo e funcional  
**Build:** ✅ Sucesso  
**Lint:** ✅ Configurado  
**Format:** ✅ Configurado  
**Hooks:** ✅ Configurado  
**Commits:** ✅ Configurado
