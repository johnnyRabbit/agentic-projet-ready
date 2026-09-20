import { useState, useEffect } from 'react';
import { analyticsEngine } from '../analytics/AnalyticsEngine';
import { TrendingUp, DollarSign, Clock, Target, Download, BarChart3 } from 'lucide-react';

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [costOverTime, setCostOverTime] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const summaryData = await analyticsEngine.getSummary();
    setSummary(summaryData);

    const costData = await analyticsEngine.getCostOverTime(30);
    setCostOverTime(costData);

    const agentData = await analyticsEngine.getAgentPerformance();
    setAgentPerformance(agentData);

    const activityData = await analyticsEngine.getRecentActivity(10);
    setRecentActivity(activityData);
  };

  const handleExport = async () => {
    const data = await analyticsEngine.exportAnalytics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number): string => {
    return '€' + value.toFixed(2);
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return ms + 'ms';
    if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
    return (ms / 60000).toFixed(1) + 'm';
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
          <p className="text-slate-400 text-sm mt-1">
            Historical Metrics • Performance Insights • Cost Analysis
          </p>
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
          <div className="text-2xl font-bold text-white">
            {summary ? formatCurrency(summary.totalCost) : '€0.00'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Avg: {summary ? formatCurrency(summary.averageCostPerDelivery) : '€0.00'}/delivery
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-blue-400" />
            <span className="text-xs text-slate-400">Avg Duration</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {summary ? formatDuration(summary.averageDurationPerDelivery) : '0ms'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {summary?.totalDeliveries || 0} deliveries
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-purple-400" />
            <span className="text-xs text-slate-400">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-success">
            {summary?.successRate.toFixed(1) || '0'}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {summary?.totalDeliveries || 0} total runs
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={18} className="text-orange-400" />
            <span className="text-xs text-slate-400">Total Tokens</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {summary ? (summary.totalTokens / 1000).toFixed(1) + 'k' : '0'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across all agents
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Cost Over Time */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Cost Over Time (30 days)</h2>
          {costOverTime.length > 0 ? (
            <div className="space-y-2">
              {costOverTime.slice(-7).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-20">{item.date}</span>
                  <div className="flex-1 h-2 bg-dark-500 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min((item.cost / Math.max(...costOverTime.map(d => d.cost))) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-white w-16 text-right">
                    {formatCurrency(item.cost)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No cost data yet</p>
          )}
        </div>

        {/* Agent Performance */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Agent Performance</h2>
          {agentPerformance.length > 0 ? (
            <div className="space-y-3">
              {agentPerformance.slice(0, 5).map((agent, i) => (
                <div key={i} className="bg-dark-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium capitalize">{agent.role}</span>
                    <span className="text-xs text-slate-400">{agent.runs} runs</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-400">Success</div>
                      <div className="text-success">{agent.successRate.toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Avg Cost</div>
                      <div className="text-white">{formatCurrency(agent.averageCost)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Avg Time</div>
                      <div className="text-white">{formatDuration(agent.averageDuration)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No agent data yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-3 bg-dark-700 rounded-lg p-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <div className="flex-1">
                  <div className="text-sm text-white">{activity.description}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-slate-500 capitalize">{activity.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No recent activity</p>
        )}
      </div>
    </div>
  );
}
