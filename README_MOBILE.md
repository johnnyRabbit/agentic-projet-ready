# 📱 Mobile Responsive - Guia Rápido

## ✅ Implementado

- ✅ **Sidebar Colapsável:** Menu hamburger em mobile
- ✅ **Layouts Adaptativos:** Grids e cards responsivos
- ✅ **Touch-Friendly:** Botões com min 44px
- ✅ **Breakpoints:** Mobile, tablet, desktop
- ✅ **Hooks Responsivos:** useMobile, useTablet, useDesktop

---

## 🚀 Como Usar

### 1. Detectar Dispositivo

```typescript
import { useMobile, useTablet, useDesktop } from './hooks/useMediaQuery';

function MyComponent() {
  const isMobile = useMobile();   // ≤768px
  const isTablet = useTablet();   // ≤1024px
  const isDesktop = useDesktop(); // >1024px

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

### 2. Layouts Responsivos com Tailwind

```typescript
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>

// Sidebar colapsável
<aside className="hidden md:block w-64">
  {/* Sidebar desktop */}
</aside>

// Mobile menu
<button className="md:hidden">
  <Menu />
</button>
```

### 3. Breakpoints Padrão

| Dispositivo | Largura      | Classe Tailwind |
| ----------- | ------------ | --------------- |
| Mobile      | ≤768px       | default         |
| Tablet      | 769px-1024px | md:             |
| Desktop     | >1024px      | lg:             |

---

## 📱 MobileSidebar

**Arquivo:** `src/components/MobileSidebar.tsx`

**Features:**

- ✅ Menu hamburger (☰) no canto superior esquerdo
- ✅ Sidebar deslizante da esquerda
- ✅ Backdrop escuro ao abrir
- ✅ Fecha ao clicar fora
- ✅ Fecha ao navegar
- ✅ Totalmente traduzido (i18n)
- ✅ Scroll interno
- ✅ Status do sistema no rodapé

**Uso:**

```typescript
import { MobileSidebar } from './components/MobileSidebar';

<MobileSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
```

---

## 🎯 Padrões Responsivos

### Cards

```typescript
// Mobile: 1 coluna
// Tablet: 2 colunas
// Desktop: 4 colunas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="bg-dark-800 rounded-xl p-6">
    {/* Card content */}
  </div>
</div>
```

### Tabelas

```typescript
// Mobile: scroll horizontal
// Desktop: tabela completa
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Table content */}
  </table>
</div>
```

### Modais

```typescript
// Mobile: fullscreen
// Desktop: centralizado com max-width
<div className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md">
  {/* Modal content */}
</div>
```

### Botões

```typescript
// Touch-friendly (min 44px)
<button className="min-h-[44px] px-4 py-2">
  Click me
</button>
```

---

## 📊 Breakpoints

### useMediaQuery

```typescript
import { useMediaQuery } from './hooks/useMediaQuery';

const isSmall = useMediaQuery('(max-width: 640px)');
const isMedium = useMediaQuery('(max-width: 768px)');
const isLarge = useMediaQuery('(max-width: 1024px)');
```

### Hooks Prontos

```typescript
import { useMobile, useTablet, useDesktop } from './hooks/useMediaQuery';

const isMobile = useMobile(); // ≤768px
const isTablet = useTablet(); // ≤1024px
const isDesktop = useDesktop(); // >1024px
```

---

## 🧪 Testando

### Chrome DevTools

1. Abra DevTools (F12)
2. Clique em "Toggle device toolbar" (Ctrl+Shift+M)
3. Selecione dispositivo:
   - iPhone 12/13/14 (390x844)
   - iPad (768x1024)
   - Pixel 5 (393x851)
4. Teste diferentes orientações

### Dispositivos Reais

1. Use ngrok ou similar para expor localhost
2. Acesse pelo celular
3. Teste todas as funcionalidades
4. Verifique performance

---

## 💡 Dicas

1. **Mobile First:** Comece pelo mobile e adicione complexidade
2. **Touch Targets:** Mínimo 44x44px para botões
3. **Font Size:** Mínimo 14px para legibilidade
4. **Spacing:** Use espaçamento generoso em mobile
5. **Images:** Use lazy loading e formatos modernos (WebP)
6. **Performance:** Otimize para conexões lentas

---

## 📁 Estrutura

```
src/
├── hooks/
│   └── useMediaQuery.ts         # Hooks responsivos
├── components/
│   └── MobileSidebar.tsx        # Sidebar mobile
└── App.tsx                      # Integrado com MobileSidebar
```

---

## 🎨 Exemplos de Layout

### Dashboard

```typescript
// Mobile: 1 coluna
// Tablet: 2 colunas
// Desktop: 4 colunas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Kanban Board

```typescript
// Mobile: scroll horizontal
// Desktop: colunas lado a lado
<div className="flex gap-4 overflow-x-auto pb-4 md:overflow-visible">
  <KanbanColumn />
  <KanbanColumn />
  <KanbanColumn />
  <KanbanColumn />
</div>
```

### Analytics

```typescript
// Mobile: 1 gráfico por linha
// Desktop: 2 gráficos por linha
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Chart />
  <Chart />
</div>
```

---

**Status:** ✅ Completo e funcional  
**Breakpoints:** Mobile, Tablet, Desktop  
**Pronto para uso!** 📱
