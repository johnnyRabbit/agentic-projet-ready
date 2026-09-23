# 🔍 Qualidade de Código - Guia Rápido

## ✅ Implementado

- ✅ **ESLint** - Linting de código
- ✅ **Prettier** - Formatação automática
- ✅ **Husky** - Git hooks
- ✅ **lint-staged** - Lint em arquivos modificados
- ✅ **commitlint** - Mensagens de commit convencionais

---

## 🚀 Comandos

```bash
# Linting
npm run lint              # Verificar erros
npm run lint:fix          # Corrigir automaticamente

# Formatação
npm run format            # Formatar tudo
npm run format:check      # Verificar formatação

# Qualidade completa
npm run quality           # Typecheck + Lint + Format

# Testes
npm test                  # Rodar testes
npm run test:coverage     # Cobertura de testes
```

---

## 📝 Conventional Commits

### Formato
```
<tipo>(<escopo>): <descrição>
```

### Tipos
- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `docs` - Documentação
- `style` - Formatação
- `refactor` - Refatoração
- `perf` - Performance
- `test` - Testes
- `build` - Build/dependências
- `ci` - CI/CD
- `chore` - Outros

### Exemplos
```bash
✅ feat(auth): add OAuth login
✅ fix(budget): prevent overspending
✅ docs(readme): update installation
✅ refactor(engine): simplify logic

❌ update code
❌ fix bug
❌ WIP
```

---

## 🎨 Estilo de Código

### TypeScript
```typescript
// ✅ Bom
const user: User = getUser();
function process(data: Data): Result { }

// ❌ Ruim
const user: any = getUser();  // Evite any
function process(data) { }    // Faltam tipos
```

### React
```typescript
// ✅ Bom
function Component() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}

// ❌ Ruim
function Component() {
  var state = 0;  // Use const/let
  console.log(state);  // Evite console.log
}
```

### Formatação (Prettier)
```typescript
// Automático com Prettier
const user = {
  name: 'John',      // Single quotes
  age: 30,
  email: 'a@b.com',  // Trailing comma
};
```

---

## 🔧 Hooks Automáticos

### Pre-commit
- Roda ESLint + Prettier nos arquivos staged
- Corrige problemas automaticamente
- Bloqueia commit se houver erros

### Commit-msg
- Valida formato da mensagem
- Exige Conventional Commits
- Bloqueia commit inválido

---

## 📊 Workflow

1. **Escrever código**
2. **git add** → Pre-commit hook roda
3. **git commit** → Commit-msg hook valida
4. **Push** → CI roda quality checks

---

## 🚨 Problemas Comuns

### ESLint não roda
```bash
npm install
npm run lint:fix
```

### Prettier não formata
```bash
npm run format
```

### Husky não funciona
```bash
npm run prepare
chmod +x .husky/*
```

### Commit rejeitado
```bash
# Use formato correto
git commit -m "feat(scope): description"
```

---

## 📁 Arquivos de Configuração

```
├── eslint.config.js          # ESLint config
├── .prettierrc               # Prettier config
├── .prettierignore           # Ignorar arquivos
├── .lintstagedrc.json        # lint-staged config
├── commitlint.config.js      # Commitlint config
└── .husky/
    ├── pre-commit            # Pre-commit hook
    └── commit-msg            # Commit-msg hook
```

---

## 🎯 Benefícios

✅ Código consistente  
✅ Detecção precoce de bugs  
✅ Formatação automática  
✅ Commits organizados  
✅ Code review mais rápido  
✅ Onboarding facilitado  

---

**Status:** ✅ Completo  
**Build:** ✅ Sucesso  
**Lint:** ✅ Configurado  
**Format:** ✅ Configurado  
**Hooks:** ✅ Configurado
