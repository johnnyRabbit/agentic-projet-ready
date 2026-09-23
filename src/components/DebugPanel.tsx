import { useState, useEffect } from 'react';
import { auditLog } from '../observability/AuditLog';
import { errorTracker } from '../observability/ErrorTracker';
import { performanceMonitor } from '../observability/PerformanceMonitor';
import { X, Activity, AlertCircle, Clock, Database } from 'lucide-react';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'errors' | 'performance'>('audit');
  const [auditEntries, setAuditEntries] = useState(auditLog.getRecent(50));
  const [errorEntries, setErrorEntries] = useState(errorTracker.getRecent(50));
  const [perfMetrics, setPerfMetrics] = useState(performanceMonitor.getRecent(50));
  const [webVitals, setWebVitals] = useState(performanceMonitor.getWebVitals());

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setAuditEntries(auditLog.getRecent(50));
      setErrorEntries(errorTracker.getRecent(50));
      setPerfMetrics(performanceMonitor.getRecent(50));
      setWebVitals(performanceMonitor.getWebVitals());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-full p-3 shadow-lg transition-colors"
        title="Open Debug Panel"
      >
        <Activity size={20} className="text-indigo-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-dark-800 border border-dark-500 rounded-xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-500">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Activity size={16} className="text-indigo-400" />
          Debug Panel
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-500">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'audit'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <Database size={14} />
            Audit ({auditEntries.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'errors'
              ? 'text-red-400 border-b-2 border-red-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <AlertCircle size={14} />
            Errors ({errorEntries.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'performance'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <Clock size={14} />
            Perf ({perfMetrics.length})
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'audit' && (
          <div className="space-y-2">
            {auditEntries.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No audit entries</p>
            ) : (
              auditEntries.map((entry) => (
                <div key={entry.id} className="bg-dark-700 rounded-lg p-3 border border-dark-500">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-medium text-white">{entry.action}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      entry.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      entry.severity === 'error' ? 'bg-orange-500/20 text-orange-400' :
                      entry.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {entry.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{entry.resource}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-2">
            {errorEntries.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No errors</p>
            ) : (
              errorEntries.map((entry) => (
                <div key={entry.id} className="bg-dark-700 rounded-lg p-3 border border-red-500/20">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-medium text-white">{entry.message}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      entry.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {entry.severity}
                    </span>
                  </div>
                  {entry.component && (
                    <div className="text-xs text-slate-400">Component: {entry.component}</div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            {/* Web Vitals */}
            <div className="bg-dark-700 rounded-lg p-3 border border-dark-500">
              <h4 className="text-xs font-semibold text-white mb-2">Web Vitals</h4>
              <div className="grid grid-cols-2 gap-2">
                {webVitals.fcp !== undefined && (
                  <div>
                    <div className="text-xs text-slate-400">FCP</div>
                    <div className="text-sm font-medium text-white">{webVitals.fcp.toFixed(0)}ms</div>
                  </div>
                )}
                {webVitals.lcp !== undefined && (
                  <div>
                    <div className="text-xs text-slate-400">LCP</div>
                    <div className="text-sm font-medium text-white">{webVitals.lcp.toFixed(0)}ms</div>
                  </div>
                )}
                {webVitals.fid !== undefined && (
                  <div>
                    <div className="text-xs text-slate-400">FID</div>
                    <div className="text-sm font-medium text-white">{webVitals.fid.toFixed(0)}ms</div>
                  </div>
                )}
                {webVitals.cls !== undefined && (
                  <div>
                    <div className="text-xs text-slate-400">CLS</div>
                    <div className="text-sm font-medium text-white">{webVitals.cls.toFixed(3)}</div>
                  </div>
                )}
                {webVitals.ttfb !== undefined && (
                  <div>
                    <div className="text-xs text-slate-400">TTFB</div>
                    <div className="text-sm font-medium text-white">{webVitals.ttfb.toFixed(0)}ms</div>
                  </div>
                )}
                {Object.keys(webVitals).length === 0 && (
                  <p className="text-xs text-slate-500 col-span-2">No Web Vitals collected yet</p>
                )}
              </div>
            </div>

            {/* Recent Metrics */}
            <div>
              <h4 className="text-xs font-semibold text-white mb-2">Recent Metrics</h4>
              <div className="space-y-2">
                {perfMetrics.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No metrics</p>
                ) : (
                  perfMetrics.map((metric) => (
                    <div key={metric.id} className="bg-dark-700 rounded-lg p-3 border border-dark-500">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-white">{metric.name}</span>
                        <span className="text-xs text-green-400">
                          {metric.value.toFixed(2)} {metric.unit}
                        </span>
                      </div>
                      {metric.component && (
                        <div className="text-xs text-slate-400">{metric.component}</div>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-dark-500 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          {auditEntries.length} audit • {errorEntries.length} errors • {perfMetrics.length} metrics
        </div>
        <button
          onClick={() => {
            auditLog.clear();
            errorTracker.clear();
            performanceMonitor.clear();
            setAuditEntries([]);
            setErrorEntries([]);
            setPerfMetrics([]);
          }}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
