// ============================================================
// TRACEABILITY ENGINE
// ============================================================
// Tracks the complete chain:
// Requirement → User Story → Task → Commit → Test → PR
//
// Answers: "Why was this line of code introduced?"

import { TraceabilityLink } from '../github/types';

export interface TraceabilityNode {
  id: string;
  type: 'requirement' | 'user-story' | 'task' | 'commit' | 'test' | 'pr' | 'file' | 'line';
  title: string;
  content?: string;
  parent?: string;
  children: string[];
  metadata?: Record<string, unknown>;
}

export interface TraceabilityQuery {
  from: string;
  to: string;
}

export class TraceabilityEngine {
  private nodes: Map<string, TraceabilityNode> = new Map();
  private links: TraceabilityLink[] = [];

  /**
   * Add a node to the traceability graph
   */
  addNode(node: Omit<TraceabilityNode, 'children'>): TraceabilityNode {
    const fullNode: TraceabilityNode = {
      ...node,
      children: []
    };

    this.nodes.set(node.id, fullNode);

    // Link to parent if specified
    if (node.parent) {
      const parent = this.nodes.get(node.parent);
      if (parent) {
        parent.children.push(node.id);
      }
    }

    return fullNode;
  }

  /**
   * Create a complete traceability link
   */
  createLink(link: TraceabilityLink): void {
    this.links.push(link);
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): TraceabilityNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get all nodes of a specific type
   */
  getNodesByType(type: TraceabilityNode['type']): TraceabilityNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  /**
   * Trace from a requirement to all downstream artifacts
   */
  traceFromRequirement(requirementId: string): {
    requirement: TraceabilityNode | undefined;
    userStories: TraceabilityNode[];
    tasks: TraceabilityNode[];
    commits: TraceabilityNode[];
    tests: TraceabilityNode[];
    prs: TraceabilityNode[];
  } {
    const requirement = this.nodes.get(requirementId);
    if (!requirement) {
      return { requirement: undefined, userStories: [], tasks: [], commits: [], tests: [], prs: [] };
    }

    const userStories = this.getChildrenByType(requirementId, 'user-story');
    const tasks = userStories.flatMap(us => this.getChildrenByType(us.id, 'task'));
    const commits = tasks.flatMap(t => this.getChildrenByType(t.id, 'commit'));
    const tests = commits.flatMap(c => this.getChildrenByType(c.id, 'test'));
    const prs = tests.flatMap(t => this.getChildrenByType(t.id, 'pr'));

    return { requirement, userStories, tasks, commits, tests, prs };
  }

  /**
   * Trace backwards from a file/line to its requirements
   */
  traceToFile(fileId: string): {
    file: TraceabilityNode | undefined;
    commits: TraceabilityNode[];
    tasks: TraceabilityNode[];
    userStories: TraceabilityNode[];
    requirements: TraceabilityNode[];
  } {
    const file = this.nodes.get(fileId);
    if (!file) {
      return { file: undefined, commits: [], tasks: [], userStories: [], requirements: [] };
    }

    const commits = this.getParentsByType(fileId, 'commit');
    const tasks = commits.flatMap(c => this.getParentsByType(c.id, 'task'));
    const userStories = tasks.flatMap(t => this.getParentsByType(t.id, 'user-story'));
    const requirements = userStories.flatMap(us => this.getParentsByType(us.id, 'requirement'));

    return { file, commits, tasks, userStories, requirements };
  }

  /**
   * Answer: "Why was this line of code introduced?"
   */
  explainCodeOrigin(fileId: string, line?: number): string {
    const trace = this.traceToFile(fileId);
    
    if (!trace.file) {
      return `File ${fileId} not found in traceability graph.`;
    }

    let explanation = `## Code Origin: ${trace.file.title}\n\n`;
    
    if (line) {
      explanation += `**Line ${line}** was introduced through the following chain:\n\n`;
    } else {
      explanation += `This file was introduced through the following chain:\n\n`;
    }

    if (trace.commits.length > 0) {
      explanation += `### Commits\n`;
      trace.commits.forEach(c => {
        explanation += `- \`${c.id.substring(0, 7)}\`: ${c.title}\n`;
      });
      explanation += `\n`;
    }

    if (trace.tasks.length > 0) {
      explanation += `### Tasks\n`;
      trace.tasks.forEach(t => {
        explanation += `- **${t.id}**: ${t.title}\n`;
      });
      explanation += `\n`;
    }

    if (trace.userStories.length > 0) {
      explanation += `### User Stories\n`;
      trace.userStories.forEach(us => {
        explanation += `- **${us.id}**: ${us.title}\n`;
      });
      explanation += `\n`;
    }

    if (trace.requirements.length > 0) {
      explanation += `### Requirements\n`;
      trace.requirements.forEach(r => {
        explanation += `- **${r.id}**: ${r.title}\n`;
        if (r.content) {
          explanation += `  ${r.content}\n`;
        }
      });
      explanation += `\n`;
    }

    return explanation;
  }

  /**
   * Get all traceability links
   */
  getAllLinks(): TraceabilityLink[] {
    return [...this.links];
  }

  /**
   * Get links for a specific PR
   */
  getLinksForPR(prNumber: number): TraceabilityLink[] {
    return this.links.filter(l => l.pr === `PR-${prNumber}`);
  }

  /**
   * Generate traceability report
   */
  generateReport(): string {
    const requirements = this.getNodesByType('requirement');
    const userStories = this.getNodesByType('user-story');
    const tasks = this.getNodesByType('task');
    const commits = this.getNodesByType('commit');
    const tests = this.getNodesByType('test');
    const prs = this.getNodesByType('pr');

    let report = `# Traceability Report\n\n`;
    report += `## Summary\n\n`;
    report += `- **Requirements:** ${requirements.length}\n`;
    report += `- **User Stories:** ${userStories.length}\n`;
    report += `- **Tasks:** ${tasks.length}\n`;
    report += `- **Commits:** ${commits.length}\n`;
    report += `- **Tests:** ${tests.length}\n`;
    report += `- **Pull Requests:** ${prs.length}\n\n`;

    report += `## Traceability Matrix\n\n`;
    report += `| Requirement | User Story | Task | Commit | Test | PR |\n`;
    report += `|-------------|------------|------|--------|------|----|\n`;

    this.links.forEach(link => {
      report += `| ${link.requirement} | ${link.userStory} | ${link.task} | \`${link.commit.substring(0, 7)}\` | ${link.test} | ${link.pr} |\n`;
    });

    return report;
  }

  // --- Private helpers ---

  private getChildrenByType(parentId: string, type: TraceabilityNode['type']): TraceabilityNode[] {
    const parent = this.nodes.get(parentId);
    if (!parent) return [];

    return parent.children
      .map(id => this.nodes.get(id))
      .filter((n): n is TraceabilityNode => n !== undefined && n.type === type);
  }

  private getParentsByType(childId: string, type: TraceabilityNode['type']): TraceabilityNode[] {
    const results: TraceabilityNode[] = [];
    
    for (const [, node] of this.nodes) {
      if (node.children.includes(childId) && node.type === type) {
        results.push(node);
      }
    }

    return results;
  }
}
