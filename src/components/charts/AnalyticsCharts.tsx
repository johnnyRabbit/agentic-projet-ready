import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ============================================================
// ANALYTICS CHARTS - Visual Data Representation
// ============================================================

interface ChartProps {
  data: any[];
  title?: string;
  height?: number;
}

// 1. Line Chart - Cost Over Time
export function CostOverTimeChart({ data, title = 'Cost Over Time', height = 300 }: ChartProps) {
  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-500">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2b3a" />
          <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1b25',
              border: '1px solid #2a2b3a',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: '#6366f1', r: 4 }}
            name="Cost (€)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Bar Chart - Agent Performance
export function AgentPerformanceChart({
  data,
  title = 'Agent Performance',
  height = 300,
}: ChartProps) {
  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-500">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2b3a" />
          <XAxis dataKey="role" stroke="#64748b" style={{ fontSize: '12px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1b25',
              border: '1px solid #2a2b3a',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="runs" fill="#6366f1" name="Runs" radius={[8, 8, 0, 0]} />
          <Bar dataKey="cost" fill="#8b5cf6" name="Cost (€)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Pie Chart - Success Rate
export function SuccessRateChart({ data, title = 'Success Rate', height = 300 }: ChartProps) {
  const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-500">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1b25',
              border: '1px solid #2a2b3a',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. Area Chart - Delivery Trends
export function DeliveryTrendsChart({ data, title = 'Delivery Trends', height = 300 }: ChartProps) {
  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-500">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2b3a" />
          <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1b25',
              border: '1px solid #2a2b3a',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            fillOpacity={1}
            fill="url(#colorDeliveries)"
            name="Deliveries"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 5. Multi-line Chart - Token Usage
export function TokenUsageChart({ data, title = 'Token Usage', height = 300 }: ChartProps) {
  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-500">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2b3a" />
          <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1b25',
              border: '1px solid #2a2b3a',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="input"
            stroke="#6366f1"
            strokeWidth={2}
            name="Input Tokens"
          />
          <Line
            type="monotone"
            dataKey="output"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Output Tokens"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 6. Stacked Bar Chart - Cost by Phase
export function CostByPhaseChart({ data, title = 'Cost by Phase', height = 300 }: ChartProps) {
  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-500">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2b3a" />
          <XAxis dataKey="phase" stroke="#64748b" style={{ fontSize: '12px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1b25',
              border: '1px solid #2a2b3a',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="cost" stackId="a" fill="#6366f1" name="Cost (€)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
