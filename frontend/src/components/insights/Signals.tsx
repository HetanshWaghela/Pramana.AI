import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { RechartsTooltipWrapper, InsightTooltipData } from './InsightTooltipCard';
import { Download, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface SignalData {
  category: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'up' | 'down' | 'stable';
  isAnomaly?: boolean;
  details?: string;
}

interface SignalsProps {
  data?: SignalData[];
  title?: string;
  onDownload?: () => void;
}

const defaultData: SignalData[] = [
  { 
    category: 'Market\nBreakthroughs', 
    count: 3, 
    severity: 'high', 
    trend: 'up',
    isAnomaly: true,
    details: 'Unexpected surge in innovation signals'
  },
  { 
    category: 'Regulatory\nChanges', 
    count: 2, 
    severity: 'medium', 
    trend: 'stable',
    details: 'Standard regulatory activity'
  },
  { 
    category: 'Competitive\nMoves', 
    count: 1, 
    severity: 'low', 
    trend: 'down',
    details: 'Lower than expected activity'
  },
  { 
    category: 'Patent\nFilings', 
    count: 0, 
    severity: 'critical', 
    trend: 'down',
    isAnomaly: true,
    details: 'Critical gap in innovation pipeline'
  },
  { 
    category: 'Market\nEntries', 
    count: 2, 
    severity: 'medium', 
    trend: 'up',
    details: 'New competitors entering market'
  },
];

export const Signals: React.FC<SignalsProps> = ({
  data = defaultData,
  title = 'Signals',
  onDownload,
}) => {
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const tooltipData = (_payload: any, label: string): InsightTooltipData => {
    const point = data.find(d => d.category === label);
    const avgCount = data.reduce((sum, d) => sum + d.count, 0) / data.length;
    
    return {
      title: label.replace(/\n/g, ' '),
      value: `${point?.count} signal${point?.count !== 1 ? 's' : ''}`,
      baseline: `Avg: ${avgCount.toFixed(1)}`,
      severity: point?.severity,
      insights: [
        point?.details || 'Signal activity',
        `Trend: ${point?.trend === 'up' ? '↑ Increasing' : point?.trend === 'down' ? '↓ Decreasing' : '→ Stable'}`,
        ...(point?.isAnomaly ? ['⚠️ Anomaly detected'] : []),
      ],
      metadata: [
        { label: 'Severity', value: point?.severity.toUpperCase() || 'N/A' },
        { label: 'Status', value: point?.isAnomaly ? 'Anomaly' : 'Normal' },
      ],
    };
  };

  const avgCount = data.reduce((sum, d) => sum + d.count, 0) / data.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
      className="border-2 border-black rounded-lg p-4 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden"
    >
      {/* Animated background pulse */}
      {data.some(d => d.isAnomaly) && (
        <motion.div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="font-semibold text-base">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              Decision Signal Distribution
            </span>
          </div>
        </div>
        {onDownload && (
          <Button onClick={onDownload} variant="ghost" size="sm" className="h-8">
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Subtitle */}
      <p className="text-xs text-gray-600 mb-4 relative z-10">
        Decision Signal Distribution
        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
          {data.filter(d => d.isAnomaly).length} Anomalies
        </span>
        <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
          Avg: {avgCount.toFixed(1)}
        </span>
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 30, right: 20, bottom: 40, left: 20 }}>
          <defs>
            {data.map((entry, index) => (
              <linearGradient key={index} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getSeverityColor(entry.severity)} stopOpacity={0.9} />
                <stop offset="100%" stopColor={getSeverityColor(entry.severity)} stopOpacity={0.5} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          
          <XAxis
            dataKey="category"
            tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }}
            axisLine={{ stroke: '#9ca3af', strokeWidth: 2 }}
            tickLine={{ stroke: '#9ca3af' }}
            angle={0}
            interval={0}
          />
          
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#9ca3af', strokeWidth: 2 }}
            tickLine={{ stroke: '#9ca3af' }}
            label={{ 
              value: 'Number of Signals', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#6b7280', fontWeight: 600 }
            }}
          />

          {/* Average reference line */}
          <ReferenceLine
            y={avgCount}
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: 'Average',
              position: 'right',
              fill: '#6b7280',
              fontSize: 10,
              fontWeight: 600,
            }}
          />

          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            maxBarSize={80}
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#barGradient-${index})`}
                stroke="#000000"
                strokeWidth={2}
              />
            ))}
          </Bar>

          <Tooltip
            content={(props) => (
              <RechartsTooltipWrapper {...props} tooltipData={tooltipData} />
            )}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Anomaly markers and trend indicators */}
      <div className="mt-3 space-y-2 relative z-10">
        {/* Anomaly alerts */}
        {data.filter(d => d.isAnomaly).length > 0 && (
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-700">Anomalies Detected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data
                .filter(d => d.isAnomaly)
                .map((signal, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.6 }}
                    className="text-[10px] text-red-700 font-medium"
                  >
                    • {signal.category.replace(/\n/g, ' ')}: {signal.details}
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Trend summary */}
        <div className="flex flex-wrap gap-2">
          {data
            .filter(d => d.trend !== 'stable')
            .map((signal, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.8 }}
                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border
                  ${signal.trend === 'up' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-700'}
                `}
              >
                {signal.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {signal.category.replace(/\n/g, ' ')}: {signal.trend === 'up' ? 'Increasing' : 'Decreasing'}
              </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Signals;
