import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
    text: string;
    speed?: number; // milliseconds per character
    onComplete?: () => void;
    className?: string;
    children?: (displayedText: string, isComplete: boolean) => React.ReactNode;
}

/**
 * TypewriterText component that reveals text character by character
 * with a natural typing effect.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    speed = 15, // Default: 15ms per character (~66 chars/second)
    onComplete,
    className,
    children,
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const indexRef = useRef(0);
    const previousTextRef = useRef('');

    useEffect(() => {
        // If text changed (new message), reset
        if (text !== previousTextRef.current) {
            // If new text starts with old text, continue from where we left off
            if (text.startsWith(previousTextRef.current) && previousTextRef.current.length > 0) {
                // Text is being appended (streaming), continue from current position
                indexRef.current = previousTextRef.current.length;
            } else {
                // Completely new text, reset
                indexRef.current = 0;
                setDisplayedText('');
                setIsComplete(false);
            }
            previousTextRef.current = text;
        }

        if (indexRef.current >= text.length) {
            if (!isComplete) {
                setIsComplete(true);
                onComplete?.();
            }
            return;
        }

        // Add slight randomness to speed for more natural feel
        const randomizedSpeed = speed + Math.random() * 10 - 5;

        const timer = setTimeout(() => {
            // Add multiple characters at once for faster perceived speed
            const charsToAdd = Math.min(3, text.length - indexRef.current);
            const newText = text.slice(0, indexRef.current + charsToAdd);
            indexRef.current += charsToAdd;
            setDisplayedText(newText);
        }, randomizedSpeed);

        return () => clearTimeout(timer);
    }, [text, displayedText, speed, onComplete, isComplete]);

    // If using render props pattern
    if (children) {
        return <>{children(displayedText, isComplete)}</>;
    }

    return (
        <span className={className}>
            {displayedText}
            {!isComplete && (
                <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-pulse" />
            )}
        </span>
    );
};

/**
 * Hook version for more control
 */
export const useTypewriter = (text: string, speed: number = 15) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const indexRef = useRef(0);
    const previousTextRef = useRef('');

    useEffect(() => {
        if (text !== previousTextRef.current) {
            if (text.startsWith(previousTextRef.current) && previousTextRef.current.length > 0) {
                indexRef.current = previousTextRef.current.length;
            } else {
                indexRef.current = 0;
                setDisplayedText('');
                setIsComplete(false);
            }
            previousTextRef.current = text;
        }

        if (indexRef.current >= text.length) {
            if (!isComplete) {
                setIsComplete(true);
            }
            return;
        }

        const timer = setTimeout(() => {
            const charsToAdd = Math.min(3, text.length - indexRef.current);
            indexRef.current += charsToAdd;
            setDisplayedText(text.slice(0, indexRef.current));
        }, speed + Math.random() * 10 - 5);

        return () => clearTimeout(timer);
    }, [text, displayedText, speed, isComplete]);

    return { displayedText, isComplete };
};

export default TypewriterText;
