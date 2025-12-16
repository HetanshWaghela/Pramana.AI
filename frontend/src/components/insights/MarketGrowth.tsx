import { motion } from 'framer-motion';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  LabelList,
} from 'recharts';
import { RechartsTooltipWrapper, InsightTooltipData } from './InsightTooltipCard';
import { Download, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';

interface MarketDataPoint {
  year: string;
  value: number;
  forecast?: number;
  forecastLow?: number;
  forecastHigh?: number;
  milestone?: string;
  isForecast?: boolean;
}

interface MarketGrowthProps {
  data?: MarketDataPoint[];
  title?: string;
  cagr?: number;
  onDownload?: () => void;
}

const defaultData: MarketDataPoint[] = [
  { year: '2025', value: 48600, forecast: 48600, forecastLow: 47000, forecastHigh: 50200 },
  { year: '2026', value: 53275, forecast: 53275, forecastLow: 51500, forecastHigh: 55100 },
  { year: '2027', value: 58319, forecast: 58319, forecastLow: 56200, forecastHigh: 60500, milestone: 'New regulations' },
  { year: '2028', value: 63819, forecast: 63819, forecastLow: 61200, forecastHigh: 66500, isForecast: true },
  { year: '2029', value: 69742, forecast: 69742, forecastLow: 66700, forecastHigh: 72900, isForecast: true, milestone: 'Market expansion' },
];

export const MarketGrowth: React.FC<MarketGrowthProps> = ({
  data = defaultData,
  title = 'Market Growth',
  cagr = 7.9,
  onDownload,
}) => {
  
  const tooltipData = (_payload: any, label: string): InsightTooltipData => {
    const point = data.find(d => d.year === label);
    const prevPoint = data[data.findIndex(d => d.year === label) - 1];
    
    const change = prevPoint ? ((point!.value - prevPoint.value) / prevPoint.value) * 100 : undefined;
    
    return {
      title: label,
      value: `$${(point!.value / 1000).toFixed(1)}B`,
      baseline: prevPoint ? `$${(prevPoint.value / 1000).toFixed(1)}B` : undefined,
      change: change ? Math.round(change * 10) / 10 : undefined,
      changeLabel: 'YoY Growth',
      severity: point?.isForecast ? 'medium' : 'low',
      insights: [
        point?.milestone || `${point?.isForecast ? 'Projected' : 'Historical'} market value`,
        ...(point?.forecastHigh && point?.forecastLow ? 
          [`Range: $${(point.forecastLow / 1000).toFixed(1)}B - $${(point.forecastHigh / 1000).toFixed(1)}B`] : 
          []
        ),
      ],
      metadata: [
        { label: 'CAGR', value: `${cagr}%` },
        ...(point?.isForecast ? [{ label: 'Type', value: 'Forecast' }] : [{ label: 'Type', value: 'Actual' }]),
      ],
    };
  };

  const CustomBar: React.FC<any> = (props) => {
    const { x, y, width, height, payload } = props;
    
    return (
      <g>
        <defs>
          <linearGradient id={`barGradient-${payload.year}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={payload.isForecast ? "#60a5fa" : "#22c55e"} stopOpacity={0.9} />
            <stop offset="100%" stopColor={payload.isForecast ? "#93c5fd" : "#86efac"} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <motion.rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={`url(#barGradient-${payload.year})`}
          stroke="#000000"
          strokeWidth={2}
          initial={{ height: 0, y: y + height }}
          animate={{ height, y }}
          transition={{ duration: 0.8, delay: data.findIndex(d => d.year === payload.year) * 0.1 }}
        />
        {payload.milestone && (
          <motion.circle
            cx={x + width / 2}
            cy={y - 8}
            r={4}
            fill="#f59e0b"
            stroke="#000000"
            strokeWidth={1.5}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: data.findIndex(d => d.year === payload.year) * 0.1 + 0.5 }}
          />
        )}
      </g>
    );
  };

  const CustomLabel: React.FC<any> = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill="#000000"
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
      >
        ${(value / 1000).toFixed(0)}B
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      className="border-2 border-black rounded-lg p-4 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(96, 165, 250, 0.3) 100%)',
        }}
        animate={{
          x: [-10, 10, -10],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="font-semibold text-base">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">
              CAGR: {cagr}%
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
        Projected Market Growth (CAGR: {cagr}%)
        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
          Historical
        </span>
        <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px]">
          Forecast
        </span>
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 30, right: 20, bottom: 20, left: 0 }}>
          <defs>
            <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05} />
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
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}B`}
            label={{ 
              value: 'Market Size (USD Billions)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#6b7280', fontWeight: 600 }
            }}
          />

          {/* Forecast confidence band */}
          <Area
            type="monotone"
            dataKey="forecastHigh"
            stroke="none"
            fill="url(#confidenceBand)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="forecastLow"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
          />

          {/* Main bars */}
          <Bar
            dataKey="value"
            shape={<CustomBar />}
            radius={[6, 6, 0, 0]}
          >
            <LabelList content={<CustomLabel />} />
          </Bar>

          {/* Trend line */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#000000"
            strokeWidth={2.5}
            dot={{ fill: '#ffffff', stroke: '#000000', strokeWidth: 2, r: 5 }}
            strokeDasharray="5 5"
          />

          {/* Reference line for current year */}
          <ReferenceLine
            x="2027"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="3 3"
            label={{ value: 'Now', position: 'top', fill: '#f59e0b', fontSize: 11, fontWeight: 600 }}
          />

          <Tooltip
            content={(props) => (
              <RechartsTooltipWrapper {...props} tooltipData={tooltipData} />
            )}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Milestone indicators */}
      <div className="mt-3 flex flex-wrap gap-2 relative z-10">
        {data
          .filter(d => d.milestone)
          .map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 + 1 }}
              className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[10px] font-medium text-amber-800"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              {point.year}: {point.milestone}
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
};

export default MarketGrowth;
