import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingDropdownProps {
    isThinking: boolean;
    thinkingContent?: string;
    thinkingTitle?: string;
    className?: string;
}

// Generate realistic thinking steps based on query context
const generateThinkingSteps = (): string[] => {
    const baseSteps = [
        `Analyzing the query parameters and identifying key entities...`,
        `Searching through pharmaceutical databases for relevant information...`,
        `Cross-referencing clinical trial data with market intelligence...`,
        `Evaluating patent landscape and freedom-to-operate considerations...`,
        `Synthesizing insights from multiple data sources...`,
        `Applying decision heuristics to identify opportunities...`,
        `Generating strategic recommendations based on evidence...`,
    ];

    // Select 3-4 random steps
    const shuffled = baseSteps.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
};

export const ThinkingDropdown: React.FC<ThinkingDropdownProps> = ({
    isThinking,
    thinkingContent,
    thinkingTitle = 'Analyzing your request',
    className,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [displayedContent, setDisplayedContent] = useState('');

    // Generate thinking steps on mount
    useEffect(() => {
        if (isThinking) {
            setThinkingSteps(generateThinkingSteps());
            setCurrentStepIndex(0);
        }
    }, [isThinking, thinkingTitle]);

    // Animate through thinking steps
    useEffect(() => {
        if (!isThinking || thinkingSteps.length === 0) return;

        const interval = setInterval(() => {
            setCurrentStepIndex((prev) => {
                if (prev < thinkingSteps.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 800); // Change step every 800ms

        return () => clearInterval(interval);
    }, [isThinking, thinkingSteps]);

    // Build displayed content with typewriter effect on current step
    useEffect(() => {
        if (thinkingSteps.length === 0) return;

        const completedSteps = thinkingSteps.slice(0, currentStepIndex + 1);
        setDisplayedContent(completedSteps.join('\n\n'));
    }, [currentStepIndex, thinkingSteps]);

    // Use provided content if available, otherwise use generated
    const contentToShow = thinkingContent || displayedContent;

    return (
        <div className={cn('mb-3', className)}>
            {/* Thinking Header - Always visible when thinking or has content */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                    'border-2 w-full justify-between',
                    isThinking
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex items-center gap-2">
                    {/* Animated sparkle icon */}
                    <motion.div
                        className={cn(
                            'w-6 h-6 rounded-lg flex items-center justify-center',
                            isThinking
                                ? 'bg-gradient-to-br from-purple-400 to-blue-500'
                                : 'bg-gray-300'
                        )}
                        animate={isThinking ? {
                            rotate: [0, 180, 360],
                            scale: [1, 1.1, 1],
                        } : {}}
                        transition={{
                            duration: 2,
                            repeat: isThinking ? Infinity : 0,
                            ease: 'linear',
                        }}
                    >
                        {isThinking ? (
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        ) : (
                            <Brain className="w-3.5 h-3.5 text-white" />
                        )}
                    </motion.div>

                    {/* Title with animated dots */}
                    <span className="flex items-center gap-1">
                        {isThinking ? (
                            <>
                                <span>{thinkingTitle}</span>
                                <motion.span
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-purple-400"
                                >
                                    ...
                                </motion.span>
                            </>
                        ) : (
                            <span>Thought process</span>
                        )}
                    </span>
                </div>

                {/* Chevron indicator */}
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </motion.button>

            {/* Animated border while thinking */}
            {isThinking && (
                <motion.div
                    className="h-0.5 rounded-full bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400 mt-1"
                    animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    style={{
                        backgroundSize: '200% 200%',
                    }}
                />
            )}

            {/* Expandable content */}
            <AnimatePresence>
                {isExpanded && contentToShow && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <div className="space-y-3">
                                {contentToShow.split('\n\n').map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.3 }}
                                        className="flex items-start gap-2"
                                    >
                                        <div className={cn(
                                            'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                                            index === currentStepIndex && isThinking
                                                ? 'bg-purple-500 animate-pulse'
                                                : 'bg-gray-400'
                                        )} />
                                        <p className={cn(
                                            'text-sm leading-relaxed',
                                            index === currentStepIndex && isThinking
                                                ? 'text-gray-800 font-medium italic'
                                                : 'text-gray-600'
                                        )}>
                                            {step}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThinkingDropdown;
