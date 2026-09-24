# 🌍 Internacionalização (i18n) - Guia Rápido

## ✅ Implementado

- ✅ **3 Idiomas:** Português (BR), Inglês (US), Espanhol (ES)
- ✅ **Detecção Automática:** Detecta idioma do navegador
- ✅ **Persistência:** Salva preferência no localStorage
- ✅ **LanguageSwitcher:** Componente para trocar idioma
- ✅ **Hook useI18n:** Fácil uso em componentes

---

## 🚀 Como Usar

### 1. Trocar Idioma

Clique no ícone de globo (🌐) no header e selecione o idioma:

- 🇧🇷 Português
- 🇺🇸 English
- 🇪🇸 Español

### 2. Usar em Componentes

```typescript
import { useI18n } from './i18n/useI18n';

function MyComponent() {
  const { t, changeLanguage, currentLanguage } = useI18n();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>

      <button onClick={() => changeLanguage('en-US')}>
        Switch to English
      </button>
    </div>
  );
}
```

### 3. Adicionar Novo Texto

**Passo 1:** Adicionar em todos os arquivos de locale:

```json
// src/i18n/locales/pt-BR.json
{
  "myComponent": {
    "title": "Meu Componente",
    "description": "Descrição do componente"
  }
}

// src/i18n/locales/en-US.json
{
  "myComponent": {
    "title": "My Component",
    "description": "Component description"
  }
}

// src/i18n/locales/es-ES.json
{
  "myComponent": {
    "title": "Mi Componente",
    "description": "Descripción del componente"
  }
}
```

**Passo 2:** Usar no componente:

```typescript
<h1>{t('myComponent.title')}</h1>
<p>{t('myComponent.description')}</p>
```

---

## 📁 Estrutura

```
src/i18n/
├── config.ts              # Configuração i18next
├── useI18n.ts             # Hook personalizado
└── locales/
    ├── pt-BR.json         # Português
    ├── en-US.json         # Inglês
    └── es-ES.json         # Espanhol
```

---

## 🎯 Categorias de Textos

- `common.*` - Textos comuns (save, cancel, delete, etc.)
- `nav.*` - Navegação (menu items)
- `dashboard.*` - Dashboard principal
- `agents.*` - Página de agentes
- `analytics.*` - Dashboard de analytics
- `kanban.*` - Quadro Kanban
- `delivery.*` - Dashboard de entrega
- `auth.*` - Autenticação
- `status.*` - Status do sistema

---

## 🔧 API do Hook useI18n

```typescript
const { t, changeLanguage, currentLanguage, availableLanguages } = useI18n();

// t(key) - Traduz texto
t('dashboard.title'); // "Centro de Comando"

// changeLanguage(code) - Troca idioma
changeLanguage('en-US');

// currentLanguage - Idioma atual
console.log(currentLanguage); // "pt-BR"

// availableLanguages - Lista de idiomas
availableLanguages.map((lang) => lang.name);
```

---

## 📊 Idiomas Suportados

| Código | Idioma             | Bandeira |
| ------ | ------------------ | -------- |
| pt-BR  | Português (Brasil) | 🇧🇷       |
| en-US  | English (US)       | 🇺🇸       |
| es-ES  | Español (España)   | 🇪🇸       |

---

## 💡 Dicas

1. **Use chaves descritivas:** `dashboard.title` em vez de `t1`
2. **Mantenha consistência:** Mesma estrutura em todos os idiomas
3. **Teste todos os idiomas:** Verifique se tudo está traduzido
4. **Use fallback:** Inglês é o fallback padrão

---

**Status:** ✅ Completo e funcional  
**Idiomas:** 3 (PT-BR, EN-US, ES-ES)  
**Pronto para uso!** 🌍
