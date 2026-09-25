// ============================================================
// ANALYTICS ENGINE — Historical Metrics & Insights
// ============================================================
// Tracks and analyzes historical data to provide insights
// on performance, costs, success rates, and trends.

import { database, PullRequestRecord, EventRecord } from '../persistence/Database';

export interface AnalyticsSummary {
  totalProjects: number;
  totalDeliveries: number;
  totalCost: number;
  totalTokens: number;
  totalDuration: number;
  averageCostPerDelivery: number;
  averageDurationPerDelivery: number;
  successRate: number;
  topAgents: Array<{ role: string; count: number; cost: number }>;
  costByPhase: Array<{ phase: string; cost: number; percentage: number }>;
  deliveryTrend: Array<{ date: string; count: number; cost: number }>;
}

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  deliveries: number;
  totalCost: number;
  totalTokens: number;
  totalDuration: number;
  averageCost: number;
  averageDuration: number;
  successRate: number;
  lastDelivery: string;
}

export class AnalyticsEngine {
  /**
   * Get overall analytics summary
   */
  async getSummary(): Promise<AnalyticsSummary> {
    const projects = await database.getAll('projects');
    const agentRuns = await database.getAll('agentRuns');
    const pullRequests = await database.getAll('pullRequests');

    const totalCost = agentRuns.reduce((sum, run) => sum + run.cost, 0);
    const totalTokens = agentRuns.reduce((sum, run) => sum + run.tokens, 0);
    const totalDuration = agentRuns.reduce((sum, run) => sum + run.duration, 0);
    const successfulRuns = agentRuns.filter((r) => r.status === 'complete').length;

    // Top agents by usage
    const agentMap = new Map<string, { count: number; cost: number }>();
    for (const run of agentRuns) {
      const existing = agentMap.get(run.agentRole) || { count: 0, cost: 0 };
      existing.count++;
      existing.cost += run.cost;
      agentMap.set(run.agentRole, existing);
    }

    const topAgents = Array.from(agentMap.entries())
      .map(([role, data]) => ({ role, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Cost by phase (approximate from agent roles)
    const phaseMap = new Map<string, number>();
    for (const run of agentRuns) {
      const phase = this.roleToPhase(run.agentRole);
      phaseMap.set(phase, (phaseMap.get(phase) || 0) + run.cost);
    }

    const costByPhase = Array.from(phaseMap.entries())
      .map(([phase, cost]) => ({
        phase,
        cost,
        percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
      }))
      .sort((a, b) => b.cost - a.cost);

    // Delivery trend (last 7 days)
    const deliveryTrend = this.calculateDeliveryTrend(pullRequests);

    return {
      totalProjects: projects.length,
      totalDeliveries: pullRequests.length,
      totalCost,
      totalTokens,
      totalDuration,
      averageCostPerDelivery: pullRequests.length > 0 ? totalCost / pullRequests.length : 0,
      averageDurationPerDelivery: pullRequests.length > 0 ? totalDuration / pullRequests.length : 0,
      successRate: agentRuns.length > 0 ? (successfulRuns / agentRuns.length) * 100 : 0,
      topAgents,
      costByPhase,
      deliveryTrend,
    };
  }

  /**
   * Get analytics for a specific project
   */
  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | null> {
    const project = await database.get('projects', projectId);
    if (!project) return null;

    const agentRuns = await database.getByIndex('agentRuns', 'projectId', projectId);
    const pullRequests = await database.getByIndex('pullRequests', 'projectId', projectId);

    const totalCost = agentRuns.reduce((sum, run) => sum + run.cost, 0);
    const totalTokens = agentRuns.reduce((sum, run) => sum + run.tokens, 0);
    const totalDuration = agentRuns.reduce((sum, run) => sum + run.duration, 0);
    const successfulRuns = agentRuns.filter((r) => r.status === 'complete').length;

    const lastDelivery =
      pullRequests.length > 0
        ? pullRequests.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0].createdAt
        : '';

    return {
      projectId,
      projectName: project.name,
      deliveries: pullRequests.length,
      totalCost,
      totalTokens,
      totalDuration,
      averageCost: pullRequests.length > 0 ? totalCost / pullRequests.length : 0,
      averageDuration: pullRequests.length > 0 ? totalDuration / pullRequests.length : 0,
      successRate: agentRuns.length > 0 ? (successfulRuns / agentRuns.length) * 100 : 0,
      lastDelivery,
    };
  }

  /**
   * Get cost breakdown over time
   */
  async getCostOverTime(
    days: number = 30
  ): Promise<Array<{ date: string; cost: number; tokens: number }>> {
    const agentRuns = await database.getAll('agentRuns');
    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const dailyMap = new Map<string, { cost: number; tokens: number }>();

    for (const run of agentRuns) {
      const runDate = new Date(run.createdAt);
      if (runDate < cutoff) continue;

      const dateKey = runDate.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { cost: 0, tokens: 0 };
      existing.cost += run.cost;
      existing.tokens += run.tokens;
      dailyMap.set(dateKey, existing);
    }

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get agent performance metrics
   */
  async getAgentPerformance(): Promise<
    Array<{
      role: string;
      runs: number;
      successRate: number;
      averageCost: number;
      averageDuration: number;
      averageConfidence: number;
    }>
  > {
    const agentRuns = await database.getAll('agentRuns');

    const roleMap = new Map<
      string,
      {
        runs: number;
        successes: number;
        totalCost: number;
        totalDuration: number;
        totalConfidence: number;
      }
    >();

    for (const run of agentRuns) {
      const existing = roleMap.get(run.agentRole) || {
        runs: 0,
        successes: 0,
        totalCost: 0,
        totalDuration: 0,
        totalConfidence: 0,
      };

      existing.runs++;
      if (run.status === 'complete') existing.successes++;
      existing.totalCost += run.cost;
      existing.totalDuration += run.duration;
      existing.totalConfidence += run.confidence;

      roleMap.set(run.agentRole, existing);
    }

    return Array.from(roleMap.entries())
      .map(([role, data]) => ({
        role,
        runs: data.runs,
        successRate: data.runs > 0 ? (data.successes / data.runs) * 100 : 0,
        averageCost: data.runs > 0 ? data.totalCost / data.runs : 0,
        averageDuration: data.runs > 0 ? data.totalDuration / data.runs : 0,
        averageConfidence: data.runs > 0 ? data.totalConfidence / data.runs : 0,
      }))
      .sort((a, b) => b.runs - a.runs);
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 20): Promise<
    Array<{
      type: string;
      description: string;
      timestamp: string;
    }>
  > {
    const events = await database.getAll('events');

    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map((event) => ({
        type: event.type,
        description: this.formatEventDescription(event),
        timestamp: event.timestamp,
      }));
  }

  /**
   * Export analytics as JSON
   */
  async exportAnalytics(): Promise<string> {
    const summary = await this.getSummary();
    const costOverTime = await this.getCostOverTime();
    const agentPerformance = await this.getAgentPerformance();

    return JSON.stringify(
      {
        summary,
        costOverTime,
        agentPerformance,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  // --- Private helpers ---

  private roleToPhase(role: string): string {
    const mapping: Record<string, string> = {
      requirements: 'Requirements',
      planner: 'Planning',
      developer: 'Implementation',
      tester: 'Testing',
      reviewer: 'Review',
      security: 'Security',
      lead: 'Orchestration',
      architect: 'Architecture',
    };
    return mapping[role] || 'Other';
  }

  private calculateDeliveryTrend(
    pullRequests: PullRequestRecord[]
  ): Array<{ date: string; count: number; cost: number }> {
    const now = new Date();
    const trend: Array<{ date: string; count: number; cost: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];

      const dayPRs = pullRequests.filter((pr) => {
        const prDate = new Date(pr.createdAt).toISOString().split('T')[0];
        return prDate === dateKey;
      });

      trend.push({
        date: dateKey,
        count: dayPRs.length,
        cost: dayPRs.reduce((sum, pr) => sum + (pr.costReport?.totalCost || 0), 0),
      });
    }

    return trend;
  }

  private formatEventDescription(event: EventRecord): string {
    const { type, data } = event;

    switch (type) {
      case 'project.created':
        return `Project "${data.name}" created`;
      case 'delivery.completed':
        return `Delivery completed: PR #${data.prNumber}`;
      case 'agent.completed':
        return `${data.agentRole} agent completed (${data.duration}ms)`;
      case 'worktree.created':
        return `Worktree created: ${data.branch}`;
      case 'decision.made':
        return `Decision made: ${data.title}`;
      default:
        return `${type} event`;
    }
  }
}

// Singleton instance
export const analyticsEngine = new AnalyticsEngine();
