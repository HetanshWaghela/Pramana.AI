import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessedEvent } from '@/components/ActivityTimeline';

interface SequentialThinkingFlowProps {
    events: ProcessedEvent[];
    isLoading: boolean;
    className?: string;
}

/**
 * SequentialThinkingFlow - Displays thinking steps inline that flow into the output.
 * 
 * This component shows each step of the agent's thinking process in a sequential,
 * unified manner without a separate card. Steps flow naturally into the final content.
 */
export const SequentialThinkingFlow: React.FC<SequentialThinkingFlowProps> = ({
    events,
    isLoading,
    className,
}) => {
    // Render initial loading state if no events yet
    if (isLoading && events.length === 0) {
        return (
            <div className={cn('space-y-2', className)}>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-sm text-gray-600"
                >
                    <div className="flex-shrink-0">
                        <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                    </div>
                    <span className="italic">Analyzing your request...</span>
                </motion.div>
            </div>
        );
    }

    if (events.length === 0 && !isLoading) {
        return null;
    }

    return (
        <div className={cn('space-y-2', className)}>
            {/* Render completed and in-progress steps */}
            <AnimatePresence mode="popLayout">
                {events.map((event, index) => {
                    const isLast = index === events.length - 1;
                    const isCurrentStep = isLast && isLoading;

                    return (
                        <motion.div
                            key={`${event.title}-${index}`}
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: 'easeOut',
                                delay: index * 0.05
                            }}
                            className="flex items-start gap-3"
                        >
                            {/* Step indicator */}
                            <div className="flex-shrink-0 mt-0.5">
                                {isCurrentStep ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Circle className="w-4 h-4 text-green-500 fill-green-100" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        <Check className="w-4 h-4 text-green-600" />
                                    </motion.div>
                                )}
                            </div>

                            {/* Step content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        'text-sm font-medium',
                                        isCurrentStep ? 'text-gray-800' : 'text-gray-600'
                                    )}>
                                        {event.title}
                                    </span>
                                    {isCurrentStep && (
                                        <motion.span
                                            animate={{ opacity: [1, 0.4, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="text-xs text-green-600"
                                        >
                                            in progress
                                        </motion.span>
                                    )}
                                </div>
                                <p className={cn(
                                    'text-xs mt-0.5 leading-relaxed',
                                    isCurrentStep ? 'text-gray-600' : 'text-gray-500'
                                )}>
                                    {typeof event.data === 'string'
                                        ? event.data
                                        : Array.isArray(event.data)
                                            ? event.data.join(', ')
                                            : JSON.stringify(event.data)}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Continue loading indicator after last step */}
            {isLoading && events.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 text-sm text-gray-500 pt-1"
                >
                    <div className="flex-shrink-0">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-green-500" />
                    </div>
                    <span className="text-xs italic">Processing...</span>
                </motion.div>
            )}

            {/* Divider when content will follow */}
            {!isLoading && events.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="pt-3 pb-1"
                >
                    <div className="h-px bg-gradient-to-r from-green-200 via-green-300 to-transparent" />
                </motion.div>
            )}
        </div>
    );
};

export default SequentialThinkingFlow;
