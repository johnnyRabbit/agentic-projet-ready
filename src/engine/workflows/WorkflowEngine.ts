import { Workflow } from '../types';

// ============================================================
// WORKFLOW ENGINE — Predefined Delivery Workflows
// ============================================================

export function createUserStoryWorkflow(projectId: string): Workflow {
  return {
    id: `wf-${Date.now()}`,
    name: 'User Story Delivery',
    description: 'Complete delivery workflow: Requirements → Plan → Implement → Test → Review → PR',
    status: 'pending',
    projectId,
    steps: [
      {
        id: 'step-requirements',
        name: 'Requirements Analysis',
        agentRole: 'requirements',
        status: 'pending',
        input:
          'Analyze the user story and extract requirements, acceptance criteria, and ambiguities.',
      },
      {
        id: 'step-risk',
        name: 'Risk Assessment',
        agentRole: 'risk',
        status: 'pending',
        dependsOn: ['step-requirements'],
        input: 'Based on the requirements, identify technical and project risks.',
      },
      {
        id: 'step-planning',
        name: 'Implementation Planning',
        agentRole: 'planner',
        status: 'pending',
        dependsOn: ['step-requirements'],
        input: 'Create a detailed implementation plan with tasks, estimates, and team composition.',
      },
      {
        id: 'step-development',
        name: 'Implementation',
        agentRole: 'developer',
        status: 'pending',
        dependsOn: ['step-planning'],
        input: 'Implement the feature based on the plan and requirements.',
      },
      {
        id: 'step-testing',
        name: 'Test Writing & Execution',
        agentRole: 'tester',
        status: 'pending',
        dependsOn: ['step-development'],
        input: 'Write and execute tests for the implementation.',
      },
      {
        id: 'step-review',
        name: 'Code Review',
        agentRole: 'reviewer',
        status: 'pending',
        dependsOn: ['step-development', 'step-testing'],
        input:
          'Review the implementation and tests for correctness, security, and maintainability.',
      },
      {
        id: 'step-security',
        name: 'Security Review',
        agentRole: 'security',
        status: 'pending',
        dependsOn: ['step-development'],
        input: 'Perform security review of the implementation.',
      },
    ],
  };
}

export function createBugFixWorkflow(projectId: string): Workflow {
  return {
    id: `wf-${Date.now()}`,
    name: 'Bug Fix Delivery',
    description: 'Lightweight workflow for bug fixes: Analyze → Fix → Test → Review',
    status: 'pending',
    projectId,
    steps: [
      {
        id: 'step-analyze',
        name: 'Bug Analysis',
        agentRole: 'requirements',
        status: 'pending',
        input: 'Analyze the bug report, reproduce steps, and identify root cause.',
      },
      {
        id: 'step-fix',
        name: 'Bug Fix',
        agentRole: 'developer',
        status: 'pending',
        dependsOn: ['step-analyze'],
        input: 'Implement the fix based on the analysis.',
      },
      {
        id: 'step-test',
        name: 'Regression Test',
        agentRole: 'tester',
        status: 'pending',
        dependsOn: ['step-fix'],
        input: 'Write regression tests and verify the fix.',
      },
      {
        id: 'step-review',
        name: 'Review',
        agentRole: 'reviewer',
        status: 'pending',
        dependsOn: ['step-fix', 'step-test'],
        input: 'Review the bug fix for correctness and completeness.',
      },
    ],
  };
}

export function createFeatureWorkflow(projectId: string): Workflow {
  return {
    id: `wf-${Date.now()}`,
    name: 'Feature Delivery',
    description: 'Full feature workflow with architecture phase',
    status: 'pending',
    projectId,
    steps: [
      {
        id: 'step-requirements',
        name: 'Requirements Analysis',
        agentRole: 'requirements',
        status: 'pending',
        input: 'Analyze the feature request and extract detailed requirements.',
      },
      {
        id: 'step-architecture',
        name: 'Architecture Design',
        agentRole: 'architect',
        status: 'pending',
        dependsOn: ['step-requirements'],
        input: 'Design the architecture for this feature considering existing system.',
      },
      {
        id: 'step-risk',
        name: 'Risk Assessment',
        agentRole: 'risk',
        status: 'pending',
        dependsOn: ['step-architecture'],
        input: 'Assess risks for the proposed architecture and implementation.',
      },
      {
        id: 'step-planning',
        name: 'Implementation Planning',
        agentRole: 'planner',
        status: 'pending',
        dependsOn: ['step-architecture'],
        input: 'Create implementation plan based on architecture decisions.',
      },
      {
        id: 'step-development',
        name: 'Implementation',
        agentRole: 'developer',
        status: 'pending',
        dependsOn: ['step-planning'],
        input: 'Implement the feature following the plan and architecture.',
      },
      {
        id: 'step-testing',
        name: 'Testing',
        agentRole: 'tester',
        status: 'pending',
        dependsOn: ['step-development'],
        input: 'Write comprehensive tests for the feature.',
      },
      {
        id: 'step-review',
        name: 'Code Review',
        agentRole: 'reviewer',
        status: 'pending',
        dependsOn: ['step-development', 'step-testing'],
        input: 'Review the implementation for quality and correctness.',
      },
      {
        id: 'step-security',
        name: 'Security Review',
        agentRole: 'security',
        status: 'pending',
        dependsOn: ['step-development'],
        input: 'Security audit of the feature implementation.',
      },
    ],
  };
}

export function getWorkflowForType(
  type: 'user-story' | 'bug-fix' | 'feature',
  projectId: string
): Workflow {
  switch (type) {
    case 'user-story':
      return createUserStoryWorkflow(projectId);
    case 'bug-fix':
      return createBugFixWorkflow(projectId);
    case 'feature':
      return createFeatureWorkflow(projectId);
  }
}
