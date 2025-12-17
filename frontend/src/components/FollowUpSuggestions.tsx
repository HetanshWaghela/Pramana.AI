import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Shield, Building2 } from 'lucide-react';

interface FollowUpSuggestionsProps {
    aiResponse: string;
    userQuery: string;
    onSuggestionClick: (text: string) => void;
    onGraphClick: () => void;
    isLoading?: boolean;
}

// Extract key topic from user query
const extractTopic = (query: string): string => {
    // Common pharmaceutical/biomedical keywords to look for
    const keywords = [
        'paracetamol', 'ibuprofen', 'aspirin', 'metformin', 'atorvastatin',
        'oncology', 'diabetes', 'cardiovascular', 'pain management', 'immunology',
        'vaccine', 'biosimilar', 'generic', 'api', 'formulation',
        'market', 'patent', 'clinical', 'trial', 'fda', 'approval'
    ];

    const lowerQuery = query.toLowerCase();

    // Find matching keyword
    for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
            return keyword.charAt(0).toUpperCase() + keyword.slice(1);
        }
    }

    // Extract first few meaningful words if no keyword match
    const words = query.split(' ').filter(w => w.length > 3).slice(0, 3);
    return words.join(' ') || 'this topic';
};

// Generate contextual follow-up questions
const generateSuggestions = (userQuery: string, aiResponse: string): { text: string; icon: React.ReactNode }[] => {
    const topic = extractTopic(userQuery);
    const lowerQuery = userQuery.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    const suggestions: { text: string; icon: React.ReactNode }[] = [];

    // Market-related suggestion
    if (lowerQuery.includes('market') || lowerResponse.includes('market')) {
        suggestions.push({
            text: `What are the key market trends for ${topic}?`,
            icon: <TrendingUp className="w-4 h-4" />
        });
    } else {
        suggestions.push({
            text: `What is the market opportunity for ${topic}?`,
            icon: <TrendingUp className="w-4 h-4" />
        });
    }

    // Competition/Patent suggestion
    if (lowerQuery.includes('patent') || lowerResponse.includes('patent')) {
        suggestions.push({
            text: `What patents are expiring soon for ${topic}?`,
            icon: <Shield className="w-4 h-4" />
        });
    } else if (lowerQuery.includes('competition') || lowerResponse.includes('competitor')) {
        suggestions.push({
            text: `Who are the main competitors in ${topic}?`,
            icon: <Building2 className="w-4 h-4" />
        });
    } else {
        suggestions.push({
            text: `What is the competitive landscape for ${topic}?`,
            icon: <Building2 className="w-4 h-4" />
        });
    }

    return suggestions;
};

export const FollowUpSuggestions: React.FC<FollowUpSuggestionsProps> = ({
    aiResponse,
    userQuery,
    onSuggestionClick,
    onGraphClick,
    isLoading = false
}) => {
    if (isLoading || !aiResponse) return null;

    const suggestions = generateSuggestions(userQuery, aiResponse);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-4 pt-3 border-t border-green-200"
        >
            <p className="text-xs text-gray-500 mb-2 font-medium">Follow-up suggestions:</p>
            <div className="flex flex-col sm:flex-row gap-2">
                {/* Text-based suggestions */}
                {suggestions.map((suggestion, index) => (
                    <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        onClick={() => onSuggestionClick(suggestion.text)}
                        className="flex-1 flex items-center gap-2 px-3 py-2.5 text-xs text-left bg-white border-2 border-black rounded-lg 
                       shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                       hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]
                       hover:bg-yellow-50 transition-all duration-150 font-medium text-gray-700"
                    >
                        <span className="text-yellow-600">{suggestion.icon}</span>
                        <span className="line-clamp-2">{suggestion.text}</span>
                    </motion.button>
                ))}

                {/* Graph suggestion - always present */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={onGraphClick}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 text-xs text-left bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-black rounded-lg 
                     shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                     hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]
                     hover:from-green-100 hover:to-emerald-100 transition-all duration-150 font-medium text-gray-700"
                >
                    <span className="text-green-600"><BarChart3 className="w-4 h-4" /></span>
                    <span>📊 Show portfolio analysis graph</span>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default FollowUpSuggestions;
