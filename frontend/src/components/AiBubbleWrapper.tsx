import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiBubbleWrapperProps {
    children: React.ReactNode;
    className?: string;
    agentName?: string;
    isPortfolioStrategist?: boolean;
}

export const AiBubbleWrapper: React.FC<AiBubbleWrapperProps> = ({
    children,
    className,
    agentName = 'Pramana AI',
    isPortfolioStrategist = true,
}) => {
    // Determine styles based on agent type
    // Portfolio Strategist (and default): Green theme
    // Others could have different themes if needed, but keeping consistent for now

    const bgClass = isPortfolioStrategist ? 'bg-green-50' : 'bg-green-50';
    const borderClass = isPortfolioStrategist ? 'border-green-200' : 'border-green-200';
    const iconBgClass = isPortfolioStrategist ? 'bg-green-400' : 'bg-green-400';
    const shadowClass = isPortfolioStrategist
        ? 'shadow-[4px_4px_0px_0px_rgba(74,222,128,0.6)]'
        : 'shadow-[4px_4px_0px_0px_rgba(74,222,128,0.6)]';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
            }}
            className={cn(
                `relative break-words flex flex-col group max-w-[85%] md:max-w-[80%] w-full rounded-2xl p-5 border-2 border-black text-gray-900 rounded-bl-md min-h-[56px]`,
                bgClass,
                shadowClass,
                className
            )}
        >
            {/* AI Response Header */}
            <div className={cn("flex items-center gap-2 mb-3 pb-2 border-b", borderClass)}>
                <div className={cn("w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", iconBgClass)}>
                    <Sparkles className="w-3 h-3 text-black" />
                </div>
                <span className="text-sm font-bold text-gray-700">{agentName}</span>
            </div>

            {children}
        </motion.div>
    );
};
