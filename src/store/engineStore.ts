import { create } from 'zustand';
import { AgentRun, Workflow, Risk, ApprovalRequest, EngineEvent, CostRecord, AgentRole } from '../engine/types';
import { GroqProvider } from '../engine/providers/GroqProvider';
import { ModelRouter } from '../engine/models/ModelRouter';
import { BudgetEngine } from '../engine/budget/BudgetEngine';
import { ContextEngine } from '../engine/context/ContextEngine';
import { AgentRegistry } from '../engine/agents/AgentRegistry';
import { AgentHarness } from '../engine/harness/AgentHarness';
import { getWorkflowForType } from '../engine/workflows/WorkflowEngine';

// ============================================================
// ENGINE STORE — Global State Management
// ============================================================

interface EngineState {
  // Engine instances
  modelRouter: ModelRouter;
  budgetEngine: BudgetEngine;
  contextEngine: ContextEngine;
  agentRegistry: AgentRegistry;
  harness: AgentHarness;
  groqProvider: GroqProvider;
  
  // State
  isInitialized: boolean;
  groqApiKey: string;
  isGroqConnected: boolean;
  
  // Active data
  activeRuns: AgentRun[];
  completedRuns: AgentRun[];
  activeWorkflow: Workflow | null;
  risks: Risk[];
  approvals: ApprovalRequest[];
  events: EngineEvent[];
  costRecords: CostRecord[];
  
  // UI state
  isExecuting: boolean;
  executionLog: string[];
  currentProjectId: string;
  
  // Actions
  initialize: () => void;
  setGroqApiKey: (key: string) => void;
  testGroqConnection: () => Promise<boolean>;
  executeWorkflow: (type: 'user-story' | 'bug-fix' | 'feature', input: string) => Promise<void>;
  executeSingleAgent: (role: AgentRole, input: string) => Promise<AgentRun>;
  resolveApproval: (id: string, decision: 'approved' | 'rejected') => void;
  refreshState: () => void;
  addContext: (type: 'requirements' | 'architecture' | 'task' | 'code' | 'test' | 'decision' | 'risk', content: string, source: string) => void;
}

export const useEngineStore = create<EngineState>((set, get) => ({
  // Engine instances (initialized lazily)
  modelRouter: new ModelRouter(),
  budgetEngine: new BudgetEngine(),
  contextEngine: new ContextEngine(),
  agentRegistry: new AgentRegistry(),
  harness: null as unknown as AgentHarness,
  groqProvider: new GroqProvider(),
  
  // State
  isInitialized: false,
  groqApiKey: '',
  isGroqConnected: false,
  
  // Active data
  activeRuns: [],
  completedRuns: [],
  activeWorkflow: null,
  risks: [],
  approvals: [],
  events: [],
  costRecords: [],
  
  // UI state
  isExecuting: false,
  executionLog: [],
  currentProjectId: 'proj-demo',
  
  // Actions
  initialize: () => {
    const { modelRouter, budgetEngine, contextEngine, agentRegistry, groqProvider } = get();
    
    // Register provider
    modelRouter.registerProvider(groqProvider);
    
    // Create harness
    const harness = new AgentHarness(modelRouter, budgetEngine, contextEngine, agentRegistry);
    
    // Create default budget
    budgetEngine.createBudget('project', 25.0);
    
    // Add initial context
    contextEngine.addContext('proj-demo', {
      type: 'requirements',
      content: 'User Story: Smart Charging Timeline\nAs an EV owner, I want to see a 7-day charging schedule so that I can optimize my charging costs based on electricity prices.\n\nAcceptance Criteria:\n- Timeline shows next 7 days with hourly granularity\n- Off-peak hours highlighted in green\n- User can drag to reschedule charging sessions\n- Real-time price updates from smart grid API',
      source: 'US-124',
      informationType: 'requirement',
      relevance: 1.0,
      tokens: 180
    });
    
    contextEngine.addContext('proj-demo', {
      type: 'architecture',
      content: 'Tech Stack: React Native + Expo, Node.js/NestJS backend, PostgreSQL, XState for state management, WebSocket for real-time updates',
      source: 'Architecture Decision Record',
      informationType: 'decision',
      relevance: 0.9,
      tokens: 60
    });
    
    set({ harness, isInitialized: true });
  },
  
  setGroqApiKey: (key: string) => {
    const { groqProvider } = get();
    groqProvider.setApiKey(key);
    set({ groqApiKey: key });
  },
  
  testGroqConnection: async () => {
    const { groqProvider } = get();
    const available = await groqProvider.isAvailable();
    set({ isGroqConnected: available });
    return available;
  },
  
  executeWorkflow: async (type, input) => {
    const { harness, contextEngine, currentProjectId } = get();
    
    set({ isExecuting: true, executionLog: [`🚀 Starting ${type} workflow...`] });
    
    // Add user input as context
    contextEngine.addContext(currentProjectId, {
      type: 'requirements',
      content: input,
      source: 'User Input',
      informationType: 'requirement',
      relevance: 1.0,
      tokens: Math.ceil(input.length / 4)
    });
    
    // Create and execute workflow
    const workflow = getWorkflowForType(type, currentProjectId);
    set({ activeWorkflow: workflow });
    
    const addLog = (msg: string) => {
      set(state => ({ executionLog: [...state.executionLog, msg] }));
    };
    
    // Execute step by step for visibility
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      // Check dependencies
      if (step.dependsOn) {
        const depsComplete = step.dependsOn.every(depId => {
          const dep = workflow.steps.find(s => s.id === depId);
          return dep?.status === 'complete';
        });
        if (!depsComplete) {
          step.status = 'failed';
          addLog(`❌ ${step.name}: Dependencies not met`);
          continue;
        }
      }
      
      step.status = 'running';
      step.startedAt = new Date().toISOString();
      addLog(`⚡ ${step.name} — ${step.agentRole} agent running...`);
      
      // Update state
      set(state => ({ 
        activeWorkflow: { ...state.activeWorkflow! },
        activeRuns: harness.getActiveRuns()
      }));
      
      try {
        const run = await harness.executeAgent(
          `${workflow.id}-${step.agentRole}`,
          step.agentRole,
          workflow.id,
          currentProjectId,
          step.input || ''
        );
        
        step.output = run.output || '';
        step.status = run.status === 'complete' ? 'complete' : 'failed';
        step.completedAt = new Date().toISOString();
        
        if (run.status === 'complete') {
          addLog(`✅ ${step.name} — Complete (€${run.totalCost.toFixed(4)}, ${(run.totalTokens)} tokens)`);
        } else {
          addLog(`❌ ${step.name} — Failed: ${run.errors[0]?.message || 'Unknown error'}`);
        }
        
        // Add output as context for next steps
        if (run.output) {
          contextEngine.addContext(currentProjectId, {
            type: step.agentRole === 'developer' ? 'code' : 
                  step.agentRole === 'tester' ? 'test' :
                  step.agentRole === 'reviewer' ? 'decision' : 'task',
            content: run.output,
            source: `${step.agentRole} agent output`,
            informationType: step.agentRole === 'reviewer' ? 'decision' : 'fact',
            relevance: 0.8,
            tokens: Math.ceil(run.output.length / 4)
          });
        }
        
      } catch (error) {
        step.status = 'failed';
        addLog(`❌ ${step.name} — Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
      
      // Update state after each step
      set(state => ({
        activeWorkflow: { ...state.activeWorkflow! },
        completedRuns: harness.getCompletedRuns(),
        costRecords: get().budgetEngine.getCostRecords(currentProjectId)
      }));
      
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    workflow.status = workflow.steps.every(s => s.status === 'complete') ? 'complete' : 'failed';
    workflow.completedAt = new Date().toISOString();
    
    addLog(`\n🏁 Workflow ${workflow.status === 'complete' ? 'completed successfully' : 'completed with errors'}`);
    
    set(state => ({
      isExecuting: false,
      activeWorkflow: { ...state.activeWorkflow! },
      risks: harness.getRiskRegister(),
      approvals: harness.getApprovalQueue(),
      events: harness.getEventLog()
    }));
  },
  
  executeSingleAgent: async (role, input) => {
    const { harness, currentProjectId } = get();
    
    const run = await harness.executeAgent(
      `single-${role}-${Date.now()}`,
      role,
      `task-${Date.now()}`,
      currentProjectId,
      input
    );
    
    set(state => ({
      completedRuns: harness.getCompletedRuns(),
      costRecords: get().budgetEngine.getCostRecords(currentProjectId)
    }));
    
    return run;
  },
  
  resolveApproval: (id, decision) => {
    const { harness } = get();
    harness.resolveApproval(id, decision, 'human');
    set(state => ({ approvals: harness.getApprovalQueue() }));
  },
  
  refreshState: () => {
    const { harness, budgetEngine, currentProjectId } = get();
    set({
      activeRuns: harness.getActiveRuns(),
      completedRuns: harness.getCompletedRuns(),
      risks: harness.getRiskRegister(),
      approvals: harness.getApprovalQueue(),
      events: harness.getEventLog(),
      costRecords: budgetEngine.getCostRecords(currentProjectId)
    });
  },
  
  addContext: (type, content, source) => {
    const { contextEngine, currentProjectId } = get();
    contextEngine.addContext(currentProjectId, {
      type,
      content,
      source,
      informationType: 'fact',
      relevance: 0.8,
      tokens: Math.ceil(content.length / 4)
    });
  }
}));
