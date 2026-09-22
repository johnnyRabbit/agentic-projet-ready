export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'web' | 'mobile' | 'backend' | 'fullstack' | 'ai';
  tasks: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedHours: number;
  }>;
  agents: string[];
  estimatedCost: number;
  estimatedDuration: string;
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'react-web-app',
    name: 'Aplicação Web React',
    description: 'Template para criar uma aplicação web moderna com React, TypeScript e Tailwind CSS',
    icon: '🌐',
    category: 'web',
    tasks: [
      {
        title: 'Configurar projeto React + TypeScript',
        description: 'Inicializar projeto com Vite, configurar TypeScript e estrutura de pastas',
        priority: 'high',
        estimatedHours: 2
      },
      {
        title: 'Configurar Tailwind CSS',
        description: 'Instalar e configurar Tailwind CSS com tema personalizado',
        priority: 'high',
        estimatedHours: 1
      },
      {
        title: 'Criar layout principal',
        description: 'Implementar header, sidebar e área de conteúdo principal',
        priority: 'medium',
        estimatedHours: 4
      },
      {
        title: 'Implementar autenticação',
        description: 'Criar páginas de login/registro com validação',
        priority: 'high',
        estimatedHours: 6
      },
      {
        title: 'Criar componentes reutilizáveis',
        description: 'Buttons, inputs, modals, cards e outros componentes base',
        priority: 'medium',
        estimatedHours: 8
      },
      {
        title: 'Implementar roteamento',
        description: 'Configurar React Router com rotas protegidas',
        priority: 'medium',
        estimatedHours: 3
      },
      {
        title: 'Integrar API',
        description: 'Criar hooks para chamadas API com tratamento de erros',
        priority: 'high',
        estimatedHours: 6
      },
      {
        title: 'Adicionar testes',
        description: 'Testes unitários e de integração com Vitest',
        priority: 'medium',
        estimatedHours: 8
      }
    ],
    agents: ['Frontend Developer', 'UI/UX Designer', 'QA Engineer'],
    estimatedCost: 12.50,
    estimatedDuration: '3-4 dias'
  },
  {
    id: 'node-api',
    name: 'API REST com Node.js',
    description: 'Template para criar uma API RESTful com Node.js, Express e PostgreSQL',
    icon: '⚙️',
    category: 'backend',
    tasks: [
      {
        title: 'Configurar projeto Node.js',
        description: 'Inicializar projeto com TypeScript e estrutura MVC',
        priority: 'high',
        estimatedHours: 2
      },
      {
        title: 'Configurar banco de dados',
        description: 'Configurar PostgreSQL com Prisma ORM',
        priority: 'high',
        estimatedHours: 3
      },
      {
        title: 'Implementar autenticação JWT',
        description: 'Criar sistema de autenticação com JWT e refresh tokens',
        priority: 'high',
        estimatedHours: 6
      },
      {
        title: 'Criar endpoints CRUD',
        description: 'Implementar endpoints RESTful para recursos principais',
        priority: 'high',
        estimatedHours: 8
      },
      {
        title: 'Adicionar validação',
        description: 'Validar inputs com Zod em todos os endpoints',
        priority: 'medium',
        estimatedHours: 4
      },
      {
        title: 'Implementar rate limiting',
        description: 'Proteger API contra abuso com rate limiting',
        priority: 'medium',
        estimatedHours: 2
      },
      {
        title: 'Adicionar logs e monitoramento',
        description: 'Configurar logging estruturado e métricas',
        priority: 'low',
        estimatedHours: 3
      },
      {
        title: 'Escrever testes',
        description: 'Testes unitários e de integração',
        priority: 'medium',
        estimatedHours: 8
      }
    ],
    agents: ['Backend Developer', 'Database Specialist', 'QA Engineer'],
    estimatedCost: 15.00,
    estimatedDuration: '4-5 dias'
  },
  {
    id: 'fullstack-saas',
    name: 'SaaS Fullstack',
    description: 'Template completo para aplicação SaaS com frontend, backend e pagamentos',
    icon: '🚀',
    category: 'fullstack',
    tasks: [
      {
        title: 'Configurar monorepo',
        description: 'Setup com Turborepo para frontend e backend',
        priority: 'high',
        estimatedHours: 4
      },
      {
        title: 'Implementar autenticação',
        description: 'Auth com OAuth (Google, GitHub) e email/password',
        priority: 'high',
        estimatedHours: 8
      },
      {
        title: 'Criar dashboard do usuário',
        description: 'Interface principal com métricas e configurações',
        priority: 'high',
        estimatedHours: 12
      },
      {
        title: 'Implementar sistema de billing',
        description: 'Integrar Stripe para assinaturas e pagamentos',
        priority: 'high',
        estimatedHours: 10
      },
      {
        title: 'Criar API REST',
        description: 'Endpoints para todas as funcionalidades do SaaS',
        priority: 'high',
        estimatedHours: 16
      },
      {
        title: 'Implementar email transacional',
        description: 'Enviar emails de boas-vindas, notificações, etc',
        priority: 'medium',
        estimatedHours: 4
      },
      {
        title: 'Adicionar analytics',
        description: 'Tracking de eventos e métricas de uso',
        priority: 'medium',
        estimatedHours: 6
      },
      {
        title: 'Configurar CI/CD',
        description: 'Pipeline de deploy automático',
        priority: 'medium',
        estimatedHours: 4
      },
      {
        title: 'Testes e documentação',
        description: 'Testes completos e documentação da API',
        priority: 'medium',
        estimatedHours: 12
      }
    ],
    agents: ['Fullstack Developer', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'QA Engineer'],
    estimatedCost: 45.00,
    estimatedDuration: '2-3 semanas'
  },
  {
    id: 'react-native-app',
    name: 'App Mobile React Native',
    description: 'Template para criar um app mobile com React Native e Expo',
    icon: '📱',
    category: 'mobile',
    tasks: [
      {
        title: 'Configurar Expo',
        description: 'Inicializar projeto React Native com Expo e TypeScript',
        priority: 'high',
        estimatedHours: 2
      },
      {
        title: 'Configurar navegação',
        description: 'Implementar React Navigation com stack e tabs',
        priority: 'high',
        estimatedHours: 4
      },
      {
        title: 'Criar componentes UI',
        description: 'Buttons, inputs, cards adaptados para mobile',
        priority: 'medium',
        estimatedHours: 6
      },
      {
        title: 'Implementar autenticação',
        description: 'Login com biometria e OAuth mobile',
        priority: 'high',
        estimatedHours: 8
      },
      {
        title: 'Integrar API',
        description: 'Hooks para chamadas API com cache offline',
        priority: 'high',
        estimatedHours: 6
      },
      {
        title: 'Adicionar notificações push',
        description: 'Configurar push notifications com Firebase',
        priority: 'medium',
        estimatedHours: 4
      },
      {
        title: 'Otimizar performance',
        description: 'Lazy loading, memoização e animações',
        priority: 'medium',
        estimatedHours: 6
      },
      {
        title: 'Testes em dispositivos',
        description: 'Testar em iOS e Android',
        priority: 'high',
        estimatedHours: 8
      }
    ],
    agents: ['Mobile Developer', 'UI/UX Designer', 'QA Engineer'],
    estimatedCost: 18.00,
    estimatedDuration: '1-2 semanas'
  },
  {
    id: 'ai-agent-workflow',
    name: 'Workflow de Agente IA',
    description: 'Template para criar um workflow automatizado com agentes de IA',
    icon: '🤖',
    category: 'ai',
    tasks: [
      {
        title: 'Definir requisitos do agente',
        description: 'Documentar objetivos, inputs e outputs esperados',
        priority: 'high',
        estimatedHours: 4
      },
      {
        title: 'Configurar Model Router',
        description: 'Selecionar e configurar modelos de IA apropriados',
        priority: 'high',
        estimatedHours: 3
      },
      {
        title: 'Implementar sistema de contexto',
        description: 'Criar sistema de gerenciamento de contexto para o agente',
        priority: 'high',
        estimatedHours: 6
      },
      {
        title: 'Criar prompts otimizados',
        description: 'Desenvolver e testar prompts para cada etapa',
        priority: 'high',
        estimatedHours: 8
      },
      {
        title: 'Implementar ferramentas',
        description: 'Criar ferramentas que o agente pode usar (APIs, DB, etc)',
        priority: 'high',
        estimatedHours: 10
      },
      {
        title: 'Adicionar validação',
        description: 'Validar outputs do agente antes de executar ações',
        priority: 'medium',
        estimatedHours: 4
      },
      {
        title: 'Implementar fallback',
        description: 'Criar mecanismos de fallback para quando o agente falhar',
        priority: 'medium',
        estimatedHours: 4
      },
      {
        title: 'Testes e avaliação',
        description: 'Testar workflow em diferentes cenários',
        priority: 'high',
        estimatedHours: 8
      }
    ],
    agents: ['AI Engineer', 'Backend Developer', 'QA Engineer'],
    estimatedCost: 25.00,
    estimatedDuration: '1-2 semanas'
  }
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return projectTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: ProjectTemplate['category']): ProjectTemplate[] {
  return projectTemplates.filter(t => t.category === category);
}

export function createProjectFromTemplate(template: ProjectTemplate) {
  return {
    name: template.name,
    description: template.description,
    tasks: template.tasks.map((task, index) => ({
      id: `task-${index + 1}`,
      ...task,
      status: 'pending' as const,
      assignee: null
    })),
    agents: template.agents,
    estimatedCost: template.estimatedCost,
    estimatedDuration: template.estimatedDuration,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
