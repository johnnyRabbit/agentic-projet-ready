// ============================================================
// DISAGREEMENT RESOLVER
// ============================================================
// Handles cases where agents disagree on decisions.
// Records disagreements, attempts resolution, escalates to human.

import { DecisionRecord } from '../github/types';

export interface Disagreement {
  id: string;
  topic: string;
  context: string;
  positions: AgentPosition[];
  resolution?: Resolution;
  status: 'open' | 'resolved' | 'escalated';
  createdAt: string;
  resolvedAt?: string;
}

export interface AgentPosition {
  agent: string;
  role: string;
  position: string;
  confidence: number;
  reasoning: string;
}

export interface Resolution {
  method: 'consensus' | 'lead-decision' | 'vote' | 'human-escalation';
  decision: string;
  decidedBy: string;
  confidence: number;
  reasoning: string;
}

export class DisagreementResolver {
  private disagreements: Disagreement[] = [];
  private counter = 1;

  /**
   * Record a disagreement between agents
   */
  recordDisagreement(
    topic: string,
    context: string,
    positions: AgentPosition[]
  ): Disagreement {
    const disagreement: Disagreement = {
      id: `disagreement-${this.counter++}`,
      topic,
      context,
      positions,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    this.disagreements.push(disagreement);
    return disagreement;
  }

  /**
   * Attempt to resolve a disagreement automatically
   */
  async resolve(disagreementId: string, leadAgentDecision?: string): Promise<Resolution | null> {
    const disagreement = this.disagreements.find(d => d.id === disagreementId);
    if (!disagreement) {
      throw new Error(`Disagreement not found: ${disagreementId}`);
    }

    // Strategy 1: Consensus (if all agents agree on confidence > 80%)
    const highConfidencePositions = disagreement.positions.filter(p => p.confidence >= 0.8);
    if (highConfidencePositions.length === disagreement.positions.length) {
      // All agents are confident — use the most common position
      const positionCounts = new Map<string, number>();
      highConfidencePositions.forEach(p => {
        positionCounts.set(p.position, (positionCounts.get(p.position) || 0) + 1);
      });

      const mostCommon = Array.from(positionCounts.entries()).sort((a, b) => b[1] - a[1])[0];
      if (mostCommon && mostCommon[1] === highConfidencePositions.length) {
        const resolution: Resolution = {
          method: 'consensus',
          decision: mostCommon[0],
          decidedBy: 'agents',
          confidence: 0.9,
          reasoning: 'All agents agreed with high confidence'
        };
        disagreement.resolution = resolution;
        disagreement.status = 'resolved';
        disagreement.resolvedAt = new Date().toISOString();
        return resolution;
      }
    }

    // Strategy 2: Lead agent decision (if provided)
    if (leadAgentDecision) {
      const resolution: Resolution = {
        method: 'lead-decision',
        decision: leadAgentDecision,
        decidedBy: 'lead-agent',
        confidence: 0.75,
        reasoning: 'Lead agent made final decision after considering all positions'
      };
      disagreement.resolution = resolution;
      disagreement.status = 'resolved';
      disagreement.resolvedAt = new Date().toISOString();
      return resolution;
    }

    // Strategy 3: Vote by confidence
    const avgConfidence = disagreement.positions.reduce((sum, p) => sum + p.confidence, 0) / disagreement.positions.length;
    if (avgConfidence >= 0.7) {
      // High average confidence — use weighted vote
      const weightedPositions = new Map<string, number>();
      disagreement.positions.forEach(p => {
        const current = weightedPositions.get(p.position) || 0;
        weightedPositions.set(p.position, current + p.confidence);
      });

      const winner = Array.from(weightedPositions.entries()).sort((a, b) => b[1] - a[1])[0];
      if (winner) {
        const resolution: Resolution = {
          method: 'vote',
          decision: winner[0],
          decidedBy: 'agents',
          confidence: avgConfidence,
          reasoning: `Weighted vote by confidence. Winning position: "${winner[0]}" with score ${winner[1].toFixed(2)}`
        };
        disagreement.resolution = resolution;
        disagreement.status = 'resolved';
        disagreement.resolvedAt = new Date().toISOString();
        return resolution;
      }
    }

    // Strategy 4: Escalate to human
    disagreement.status = 'escalated';
    return null;
  }

  /**
   * Resolve with human decision
   */
  resolveWithHuman(decisionId: string, humanDecision: string): Resolution {
    const disagreement = this.disagreements.find(d => d.id === decisionId);
    if (!disagreement) {
      throw new Error(`Disagreement not found: ${decisionId}`);
    }

    const resolution: Resolution = {
      method: 'human-escalation',
      decision: humanDecision,
      decidedBy: 'human',
      confidence: 1.0,
      reasoning: 'Human made final decision after agent disagreement'
    };

    disagreement.resolution = resolution;
    disagreement.status = 'resolved';
    disagreement.resolvedAt = new Date().toISOString();

    return resolution;
  }

  /**
   * Get all disagreements
   */
  getAll(): Disagreement[] {
    return [...this.disagreements];
  }

  /**
   * Get open disagreements
   */
  getOpen(): Disagreement[] {
    return this.disagreements.filter(d => d.status === 'open' || d.status === 'escalated');
  }

  /**
   * Get resolved disagreements
   */
  getResolved(): Disagreement[] {
    return this.disagreements.filter(d => d.status === 'resolved');
  }

  /**
   * Convert disagreement to decision record
   */
  toDecisionRecord(disagreement: Disagreement): DecisionRecord {
    return {
      id: disagreement.id,
      title: disagreement.topic,
      context: disagreement.context,
      options: disagreement.positions.map(p => ({
        agent: `${p.agent} (${p.role})`,
        position: p.position
      })),
      finalDecision: disagreement.resolution?.decision || 'Pending',
      confidence: disagreement.resolution?.confidence || 0,
      decidedBy: disagreement.resolution?.decidedBy === 'human' ? 'human' : 'agent',
      timestamp: disagreement.resolvedAt || disagreement.createdAt
    };
  }

  /**
   * Generate disagreement report
   */
  generateReport(): string {
    const open = this.getOpen();
    const resolved = this.getResolved();

    let report = `# Disagreement Report\n\n`;
    report += `## Summary\n\n`;
    report += `- **Total disagreements:** ${this.disagreements.length}\n`;
    report += `- **Open:** ${open.length}\n`;
    report += `- **Resolved:** ${resolved.length}\n\n`;

    if (open.length > 0) {
      report += `## Open Disagreements\n\n`;
      open.forEach(d => {
        report += `### ${d.topic}\n\n`;
        report += `**Status:** ${d.status}\n`;
        report += `**Context:** ${d.context}\n\n`;
        report += `**Positions:**\n`;
        d.positions.forEach(p => {
          report += `- **${p.agent}** (${p.role}): ${p.position} (confidence: ${(p.confidence * 100).toFixed(0)}%)\n`;
          report += `  - Reasoning: ${p.reasoning}\n`;
        });
        report += `\n`;
      });
    }

    if (resolved.length > 0) {
      report += `## Resolved Disagreements\n\n`;
      resolved.forEach(d => {
        report += `### ${d.topic}\n\n`;
        report += `**Decision:** ${d.resolution?.decision}\n`;
        report += `**Method:** ${d.resolution?.method}\n`;
        report += `**Decided by:** ${d.resolution?.decidedBy}\n`;
        report += `**Confidence:** ${((d.resolution?.confidence || 0) * 100).toFixed(0)}%\n\n`;
      });
    }

    return report;
  }
}
