import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';

export interface InsightTooltipData {
  title: string;
  value: string | number;
  baseline?: string | number;
  change?: number;
  changeLabel?: string;
  insights?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: { label: string; value: string }[];
}

interface InsightTooltipCardProps {
  data: InsightTooltipData;
  active?: boolean;
  position?: { x: number; y: number };
}

export const InsightTooltipCard: React.FC<InsightTooltipCardProps> = ({ 
  data, 
  active = false 
}) => {
  if (!active) return null;

  const severityColors = {
    low: 'bg-green-50 border-green-200 text-green-900',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    high: 'bg-orange-50 border-orange-200 text-orange-900',
    critical: 'bg-red-50 border-red-200 text-red-900',
  };

  const getTrendIcon = () => {
    if (!data.change) return null;
    return data.change > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 min-w-[240px] max-w-[320px] z-50"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3 pb-2 border-b border-gray-200">
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-900 mb-1">
              {data.title}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {data.value}
              </span>
              {data.change !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className={`text-xs font-medium ${
                    data.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.change > 0 ? '+' : ''}{data.change}%
                  </span>
                </div>
              )}
            </div>
          </div>
          {data.severity && (
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              severityColors[data.severity]
            }`}>
              {data.severity.toUpperCase()}
            </div>
          )}
        </div>

        {/* Baseline Comparison */}
        {data.baseline && (
          <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">
                {data.changeLabel || 'Baseline'}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {data.baseline}
              </span>
            </div>
          </div>
        )}

        {/* Insights */}
        {data.insights && data.insights.length > 0 && (
          <div className="space-y-2">
            {data.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {idx === 0 && <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
                {idx > 0 && <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
                <p className="text-xs text-gray-700 leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        {data.metadata && data.metadata.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
            {data.metadata.map((meta, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-gray-600">{meta.label}</span>
                <span className="text-gray-900 font-medium">{meta.value}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Simple wrapper for Recharts custom tooltip
export const RechartsTooltipWrapper: React.FC<any> = ({ active, payload, label, tooltipData }) => {
  if (!active || !payload || !payload[0]) return null;

  const data = tooltipData?.(payload[0], label) || {
    title: label || 'Data Point',
    value: payload[0].value,
  };

  return <InsightTooltipCard data={data} active={active} />;
};

export default InsightTooltipCard;
