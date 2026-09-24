import { useState, useEffect } from 'react';
import {
  CostOverTimeChart,
  AgentPerformanceChart,
  SuccessRateChart,
  DeliveryTrendsChart,
  TokenUsageChart,
  CostByPhaseChart,
} from '../components/charts/AnalyticsCharts';
import { TrendingUp, DollarSign, Clock, Target, Download, Activity } from 'lucide-react';

// Mock data for demonstration
const mockCostOverTime = [
  { date: '2026-03-01', cost: 2.5 },
  { date: '2026-03-02', cost: 3.2 },
  { date: '2026-03-03', cost: 1.8 },
  { date: '2026-03-04', cost: 4.1 },
  { date: '2026-03-05', cost: 2.9 },
  { date: '2026-03-06', cost: 3.5 },
  { date: '2026-03-07', cost: 2.2 },
];

const mockAgentPerformance = [
  { role: 'developer', runs: 45, cost: 12.5 },
  { role: 'reviewer', runs: 32, cost: 8.2 },
  { role: 'tester', runs: 28, cost: 6.8 },
  { role: 'planner', runs: 22, cost: 4.5 },
  { role: 'architect', runs: 15, cost: 5.1 },
];

const mockSuccessRate = [
  { name: 'Success', value: 85 },
  { name: 'Failed', value: 10 },
  { name: 'Pending', value: 5 },
];

const mockDeliveryTrends = [
  { date: '2026-03-01', count: 3 },
  { date: '2026-03-02', count: 5 },
  { date: '2026-03-03', count: 2 },
  { date: '2026-03-04', count: 7 },
  { date: '2026-03-05', count: 4 },
  { date: '2026-03-06', count: 6 },
  { date: '2026-03-07', count: 3 },
];

const mockTokenUsage = [
  { date: '2026-03-01', input: 15000, output: 8000 },
  { date: '2026-03-02', input: 18000, output: 9500 },
  { date: '2026-03-03', input: 12000, output: 6500 },
  { date: '2026-03-04', input: 22000, output: 11000 },
  { date: '2026-03-05', input: 16000, output: 8500 },
  { date: '2026-03-06', input: 19000, output: 10000 },
  { date: '2026-03-07', input: 14000, output: 7500 },
];

const mockCostByPhase = [
  { phase: 'Requirements', cost: 1.2 },
  { phase: 'Planning', cost: 1.8 },
  { phase: 'Implementation', cost: 8.5 },
  { phase: 'Testing', cost: 2.3 },
  { phase: 'Review', cost: 1.5 },
];

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState({
    totalCost: 20.2,
    totalDeliveries: 27,
    successRate: 85.2,
    totalTokens: 116000,
    avgCostPerDelivery: 0.75,
    avgDuration: 2450,
  });

  const handleExport = () => {
    const data = {
      summary,
      costOverTime: mockCostOverTime,
      agentPerformance: mockAgentPerformance,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp size={24} className="text-indigo-400" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Visual insights and performance metrics</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Download size={16} />
          Export Analytics
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-green-400" />
            <span className="text-xs text-slate-400">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-white">€{summary.totalCost.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-1">
            Avg: €{summary.avgCostPerDelivery.toFixed(2)}/delivery
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-blue-400" />
            <span className="text-xs text-slate-400">Avg Duration</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {(summary.avgDuration / 1000).toFixed(1)}s
          </div>
          <div className="text-xs text-slate-400 mt-1">{summary.totalDeliveries} deliveries</div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-purple-400" />
            <span className="text-xs text-slate-400">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-success">{summary.successRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-400 mt-1">{summary.totalDeliveries} total runs</div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-orange-400" />
            <span className="text-xs text-slate-400">Total Tokens</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {(summary.totalTokens / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-slate-400 mt-1">Across all agents</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <CostOverTimeChart data={mockCostOverTime} title="Cost Over Time (7 days)" />
        <AgentPerformanceChart data={mockAgentPerformance} title="Agent Performance" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <SuccessRateChart data={mockSuccessRate} title="Success Rate Distribution" />
        <DeliveryTrendsChart data={mockDeliveryTrends} title="Delivery Trends (7 days)" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TokenUsageChart data={mockTokenUsage} title="Token Usage (Input vs Output)" />
        <CostByPhaseChart data={mockCostByPhase} title="Cost Distribution by Phase" />
      </div>
    </div>
  );
}
