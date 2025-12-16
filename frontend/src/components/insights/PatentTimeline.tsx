import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { RechartsTooltipWrapper, InsightTooltipData } from './InsightTooltipCard';
import { Download, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface PatentEvent {
  year: number;
  patents: number;
  expiringPatents: number;
  newFilings: number;
  signal?: string;
  cliff?: boolean;
}

interface PatentTimelineProps {
  data?: PatentEvent[];
  title?: string;
  onDownload?: () => void;
}

const defaultData: PatentEvent[] = [
  { year: 2020, patents: 45, expiringPatents: 3, newFilings: 8, signal: 'Strong portfolio' },
  { year: 2021, patents: 50, expiringPatents: 2, newFilings: 7, signal: 'Growth phase' },
  { year: 2022, patents: 55, expiringPatents: 5, newFilings: 10, signal: 'Peak innovation' },
  { year: 2023, patents: 60, expiringPatents: 4, newFilings: 9, signal: 'Sustained growth', cliff: false },
  { year: 2024, patents: 52, expiringPatents: 15, newFilings: 7, signal: 'Patent cliff', cliff: true },
  { year: 2025, patents: 44, expiringPatents: 12, newFilings: 4, signal: 'Portfolio decline', cliff: true },
  { year: 2026, patents: 36, expiringPatents: 10, newFilings: 2, signal: 'Critical gap', cliff: true },
];

export const PatentTimeline: React.FC<PatentTimelineProps> = ({
  data = defaultData,
  title = 'Patent Timeline',
  onDownload,
}) => {
  
  const tooltipData = (_payload: any, label: string): InsightTooltipData => {
    const point = data.find(d => d.year.toString() === label);
    
    return {
      title: `Year ${label}`,
      value: `${point?.patents} patents`,
      severity: point?.cliff ? 'critical' : point?.expiringPatents && point.expiringPatents > 10 ? 'high' : 'low',
      insights: [
        point?.signal || 'Portfolio status',
        `Expiring: ${point?.expiringPatents} patents`,
        `New filings: ${point?.newFilings} patents`,
      ],
      metadata: [
        { label: 'Active Patents', value: point?.patents.toString() || '0' },
        { label: 'Net Change', value: `${(point?.newFilings || 0) - (point?.expiringPatents || 0) > 0 ? '+' : ''}${(point?.newFilings || 0) - (point?.expiringPatents || 0)}` },
      ],
    };
  };

  // Find cliff start point
  const cliffStartIndex = data.findIndex(d => d.cliff);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className="border-2 border-black rounded-lg p-4 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden"
    >
      {/* Animated warning background for cliff area */}
      {cliffStartIndex >= 0 && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none"
          style={{
            width: `${((data.length - cliffStartIndex) / data.length) * 100}%`,
            background: 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.4) 20%, rgba(239, 68, 68, 0.6) 100%)',
          }}
          animate={{
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
            {cliffStartIndex >= 0 && (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  Patent Cliff Detected
                </span>
              </>
            )}
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
        Patent Landscape Timeline
        <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">
          {data.filter(d => d.expiringPatents > 0).reduce((sum, d) => sum + d.expiringPatents, 0)} Expiring
        </span>
        <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">
          {data.filter(d => d.newFilings > 0).reduce((sum, d) => sum + d.newFilings, 0)} New Filings
        </span>
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <defs>
            {/* Gradient for normal period */}
            <linearGradient id="patentGradientNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#fb923c" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#fdba74" stopOpacity={0.2} />
            </linearGradient>
            {/* Gradient for cliff period (decay) */}
            <linearGradient id="patentGradientCliff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.7} />
              <stop offset="50%" stopColor="#f87171" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          
          <XAxis
            dataKey="year"
            tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
            axisLine={{ stroke: '#9ca3af', strokeWidth: 2 }}
            tickLine={{ stroke: '#9ca3af' }}
          />
          
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#9ca3af', strokeWidth: 2 }}
            tickLine={{ stroke: '#9ca3af' }}
            label={{ 
              value: 'Patent Count', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#6b7280', fontWeight: 600 }
            }}
          />

          {/* Main patent area with conditional gradient */}
          <Area
            type="monotone"
            dataKey="patents"
            stroke="#000000"
            strokeWidth={2.5}
            fill="url(#patentGradientNormal)"
            fillOpacity={1}
            dot={(props: any) => {
              const point = data[props.index];
              return (
                <g>
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={point.cliff ? 6 : 5}
                    fill="#ffffff"
                    stroke={point.cliff ? "#ef4444" : "#000000"}
                    strokeWidth={2}
                  />
                  {point.cliff && (
                    <motion.circle
                      cx={props.cx}
                      cy={props.cy}
                      r={8}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={2}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                </g>
              );
            }}
          />

          {/* Expiring patents shadow area */}
          <Area
            type="monotone"
            dataKey="expiringPatents"
            stroke="#dc2626"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
          />

          {/* Patent cliff reference line */}
          {cliffStartIndex >= 0 && (
            <ReferenceLine
              x={data[cliffStartIndex].year}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: 'Patent Cliff',
                position: 'top',
                fill: '#ef4444',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}

          <Tooltip
            content={(props) => (
              <RechartsTooltipWrapper {...props} tooltipData={tooltipData} />
            )}
            cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Signal tags */}
      <div className="mt-3 flex flex-wrap gap-2 relative z-10">
        {data
          .filter(d => d.cliff || d.expiringPatents > 10)
          .map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.15 + 0.8 }}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border
                ${point.cliff 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-orange-50 border-orange-200 text-orange-700'}
              `}
            >
              {point.cliff && <AlertTriangle className="w-3 h-3" />}
              {point.year}: {point.signal}
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
};

export default PatentTimeline;
