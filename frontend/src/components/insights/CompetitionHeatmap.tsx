import { motion } from 'framer-motion';
import { Download, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { InsightTooltipCard, InsightTooltipData } from './InsightTooltipCard';

interface Competitor {
  name: string;
  patentProtection: number;
  competition: number;
  rdActivity: number;
  entryBarriers: number;
  marketConcentration: number;
  intensity: number;
  quadrant?: string;
}

interface CompetitionHeatmapProps {
  data?: Competitor[];
  title?: string;
  onDownload?: () => void;
}

const defaultData: Competitor[] = [
  { 
    name: 'Patent\nProtection', 
    patentProtection: 90, competition: 10, rdActivity: 20, entryBarriers: 30, marketConcentration: 10,
    intensity: 90, quadrant: 'High'
  },
  { 
    name: 'Direct\nCompetition', 
    patentProtection: 20, competition: 60, rdActivity: 70, entryBarriers: 40, marketConcentration: 50,
    intensity: 60, quadrant: 'Medium'
  },
  { 
    name: 'R&D\nActivity', 
    patentProtection: 30, competition: 80, rdActivity: 55, entryBarriers: 60, marketConcentration: 45,
    intensity: 55, quadrant: 'Medium'
  },
  { 
    name: 'Entry\nBarriers', 
    patentProtection: 50, competition: 50, rdActivity: 60, entryBarriers: 70, marketConcentration: 55,
    intensity: 70, quadrant: 'High'
  },
  { 
    name: 'Market\nConcentration', 
    patentProtection: 10, competition: 40, rdActivity: 50, entryBarriers: 65, marketConcentration: 45,
    intensity: 45, quadrant: 'Low'
  },
];

export const CompetitionHeatmap: React.FC<CompetitionHeatmapProps> = ({
  data = defaultData,
  title = 'Competition Heatmap',
  onDownload,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [tooltipData, setTooltipData] = useState<InsightTooltipData | null>(null);

  const metrics = ['Patent\nProtection', 'Competition', 'R&D\nActivity', 'Entry\nBarriers', 'Market\nConcentration'];
  
  const getIntensityColor = (value: number) => {
    if (value >= 80) return { bg: '#22c55e', opacity: 0.9, label: 'High', severity: 'high' as const };
    if (value >= 60) return { bg: '#f59e0b', opacity: 0.8, label: 'Medium-High', severity: 'medium' as const };
    if (value >= 40) return { bg: '#eab308', opacity: 0.6, label: 'Medium', severity: 'medium' as const };
    if (value >= 20) return { bg: '#f97316', opacity: 0.5, label: 'Medium-Low', severity: 'low' as const };
    return { bg: '#ef4444', opacity: 0.4, label: 'Low', severity: 'low' as const };
  };

  const getCellValue = (rowIndex: number, colIndex: number): number => {
    const row = data[rowIndex];
    const colName = metrics[colIndex];
    
    if (colName.includes('Patent')) return row.patentProtection;
    if (colName.includes('Competition')) return row.competition;
    if (colName.includes('R&D')) return row.rdActivity;
    if (colName.includes('Entry')) return row.entryBarriers;
    if (colName.includes('Market')) return row.marketConcentration;
    return 0;
  };

  const handleCellHover = (rowIndex: number, colIndex: number, value: number) => {
    setHoveredCell({ row: rowIndex, col: colIndex });
    const rowData = data[rowIndex];
    const colName = metrics[colIndex].replace(/\n/g, ' ');
    const intensity = getIntensityColor(value);
    
    setTooltipData({
      title: `${rowData.name.replace(/\n/g, ' ')} × ${colName}`,
      value: value.toString(),
      severity: intensity.severity,
      insights: [
        `Intensity Score: ${value}/100`,
        `Classification: ${intensity.label}`,
        rowData.quadrant ? `Market Position: ${rowData.quadrant}` : '',
      ].filter(Boolean),
      metadata: [
        { label: 'Category', value: rowData.name.replace(/\n/g, ' ') },
        { label: 'Metric', value: colName },
      ],
    });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
    setTooltipData(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
      className="border-2 border-black rounded-lg p-4 bg-white relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="font-semibold text-base">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              Competitive Landscape Analysis
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
      <p className="text-xs text-gray-600 mb-4">
        Competitive Landscape Analysis
        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
          High (80-100)
        </span>
        <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]">
          Medium (40-80)
        </span>
        <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px]">
          Low (0-40)
        </span>
      </p>

      {/* Heatmap Grid */}
      <div className="relative">
        <div className="flex gap-1">
          {/* Row labels */}
          <div className="flex flex-col gap-1 pt-[52px]">
            {data.map((row, idx) => (
              <div
                key={idx}
                className="h-12 flex items-center justify-end pr-2 text-[10px] font-semibold text-gray-700 whitespace-pre-line text-right"
                style={{ width: '90px' }}
              >
                {row.name}
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          <div className="flex-1">
            {/* Column labels */}
            <div className="flex gap-1 mb-1">
              {metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-12 flex items-center justify-center text-[10px] font-semibold text-gray-700 whitespace-pre-line text-center"
                >
                  {metric}
                </div>
              ))}
            </div>

            {/* Cells */}
            {data.map((_row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1 mb-1">
                {metrics.map((_, colIdx) => {
                  const value = getCellValue(rowIdx, colIdx);
                  const intensity = getIntensityColor(value);
                  const isHovered = hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;
                  
                  return (
                    <motion.div
                      key={colIdx}
                      className="flex-1 h-12 rounded border-2 border-black cursor-pointer relative overflow-hidden"
                      style={{
                        backgroundColor: intensity.bg,
                        opacity: intensity.opacity,
                      }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: intensity.opacity }}
                      whileHover={{ scale: 1.05, opacity: 1, zIndex: 10 }}
                      transition={{ duration: 0.2, delay: (rowIdx * metrics.length + colIdx) * 0.02 }}
                      onMouseEnter={() => handleCellHover(rowIdx, colIdx, value)}
                      onMouseLeave={handleCellLeave}
                    >
                      {/* Density overlay pattern */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `radial-gradient(circle, rgba(0,0,0,${value / 200}) 1px, transparent 1px)`,
                          backgroundSize: '8px 8px',
                        }}
                      />
                      
                      {/* Value label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                          {value}
                        </span>
                      </div>

                      {/* Hover highlight */}
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 border-4 border-white rounded pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltipData && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
            <InsightTooltipCard data={tooltipData} active={true} />
          </div>
        )}
      </div>

      {/* Quadrant labels */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from(new Set(data.map(d => d.quadrant))).filter(Boolean).map((quadrant, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 + 1 }}
            className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-[10px] font-medium text-gray-700"
          >
            {quadrant} Intensity: {data.filter(d => d.quadrant === quadrant).length} categories
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CompetitionHeatmap;
