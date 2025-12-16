import { motion } from 'framer-motion';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { RechartsTooltipWrapper, InsightTooltipData } from './InsightTooltipCard';
import { Download } from 'lucide-react';
import { Button } from '../ui/button';

interface OpportunityDataPoint {
  category: string;
  current: number;
  baseline: number;
  confidence?: number;
  signal?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface OpportunityRadarProps {
  data?: OpportunityDataPoint[];
  title?: string;
  onDownload?: () => void;
}

const defaultData: OpportunityDataPoint[] = [
  { category: 'Innovation\nPotential', current: 75, baseline: 60, confidence: 85, signal: 'Strong pipeline', severity: 'high' },
  { category: 'Opportunity\nScore', current: 90, baseline: 75, confidence: 92, signal: 'Market gap', severity: 'critical' },
  { category: 'Risk\nLevel', current: 35, baseline: 50, confidence: 78, signal: 'Manageable', severity: 'low' },
  { category: 'Competition\nIntensity', current: 55, baseline: 70, confidence: 88, signal: 'Low saturation', severity: 'medium' },
  { category: 'Market\nReadiness', current: 80, baseline: 65, confidence: 90, signal: 'High demand', severity: 'high' },
];

export const OpportunityRadar: React.FC<OpportunityRadarProps> = ({ 
  data = defaultData,
  title = 'Opportunity Radar',
  onDownload 
}) => {
  
  const tooltipData = (payload: any, label: string): InsightTooltipData => {
    const point = data.find(d => d.category === label);
    return {
      title: label.replace(/\n/g, ' '),
      value: payload.value,
      baseline: point?.baseline,
      change: point ? Math.round(((point.current - point.baseline) / point.baseline) * 100) : undefined,
      changeLabel: 'vs Industry Baseline',
      severity: point?.severity,
      insights: point?.signal ? [point.signal] : [],
      metadata: point?.confidence ? [
        { label: 'Confidence', value: `${point.confidence}%` }
      ] : undefined,
    };
  };

  const CustomDot: React.FC<any> = (props) => {
    const { cx, cy, payload } = props;
    const point = data.find(d => d.category === payload.category);
    
    // Show inflection point marker for high-impact areas
    if (point && point.current > 75) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#ffffff" stroke="#000000" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={3} fill="#22c55e" />
          <motion.circle
            cx={cx}
            cy={cy}
            r={8}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        </g>
      );
    }
    
    return <circle cx={cx} cy={cy} r={4} fill="#ffffff" stroke="#000000" strokeWidth={2} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="border-2 border-black rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
    >
      {/* Subtle animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <h3 className="font-semibold text-base">{title}</h3>
        {onDownload && (
          <Button
            onClick={onDownload}
            variant="ghost"
            size="sm"
            className="h-8"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Subtitle */}
      <p className="text-xs text-gray-600 mb-4 relative z-10">
        Portfolio Opportunity Assessment
        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
          Current Analysis
        </span>
        <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
          Baseline (60)
        </span>
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#d1d5db" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          {/* Grid with custom styling */}
          <PolarGrid 
            stroke="#e5e7eb" 
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          
          {/* Axis labels */}
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ 
              fill: '#374151', 
              fontSize: 11, 
              fontWeight: 600,
            }}
            stroke="#9ca3af"
          />
          
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            stroke="#d1d5db"
          />

          {/* Baseline (ghost layer) */}
          <Radar
            name="Industry Baseline"
            dataKey="baseline"
            stroke="#9ca3af"
            fill="url(#baselineGradient)"
            fillOpacity={0.4}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />

          {/* Current analysis (primary layer) */}
          <Radar
            name="Current Analysis"
            dataKey="current"
            stroke="#000000"
            fill="url(#radarGradient)"
            fillOpacity={0.6}
            strokeWidth={2.5}
            dot={<CustomDot />}
          />

          {/* Confidence envelope (subtle outer layer) */}
          <Radar
            name="Confidence Range"
            dataKey="confidence"
            stroke="#60a5fa"
            fill="none"
            strokeWidth={1}
            strokeDasharray="2 2"
            fillOpacity={0}
            dot={false}
          />

          <Tooltip 
            content={(props) => (
              <RechartsTooltipWrapper {...props} tooltipData={tooltipData} />
            )}
          />
          
          <Legend 
            wrapperStyle={{ 
              fontSize: '11px', 
              paddingTop: '12px',
            }}
            iconType="circle"
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Signal tags overlay */}
      <div className="mt-2 flex flex-wrap gap-2 relative z-10">
        {data
          .filter(d => d.current > 70)
          .map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 + 0.5 }}
              className={`
                px-2 py-1 rounded text-[10px] font-medium border
                ${point.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-700' :
                  point.severity === 'high' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                  'bg-green-50 border-green-200 text-green-700'}
              `}
            >
              {point.category.replace(/\n/g, ' ')}: {point.signal}
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
};

export default OpportunityRadar;
