import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { OpportunityRadar } from './insights';

interface InlineChatGraphProps {
    isVisible: boolean;
    onClose: () => void;
    topic?: string;
}

export const InlineChatGraph: React.FC<InlineChatGraphProps> = ({
    isVisible,
    onClose,
    topic = 'Portfolio'
}) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-black">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-400 rounded-md border-2 border-black flex items-center justify-center">
                                    <TrendingUp className="w-3 h-3 text-black" />
                                </div>
                                <span className="font-bold text-sm text-gray-800">
                                    📊 {topic} Analysis
                                </span>
                            </div>
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-red-100 rounded-md border border-gray-300"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Graph Content - Compact version */}
                        <div className="p-3">
                            <OpportunityRadar
                                title="Portfolio Opportunity Assessment"
                                onDownload={() => {
                                    console.log('Download graph');
                                }}
                            />
                        </div>

                        {/* Footer with context */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                            <p className="text-[10px] text-gray-500">
                                Analysis based on market data, patent landscape, and competitive intelligence.
                                Hover over data points for detailed insights.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InlineChatGraph;
