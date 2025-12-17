import { InputForm } from './InputForm';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { DEMO_QUERIES } from '@/types/workflow';
import { useState } from 'react';
import { AgentId } from '@/types/agents';

interface WelcomeScreenProps {
  handleSubmit: (
    submittedInputValue: string,
    effort: string,
    model: string,
    agentId: string
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
  selectedAgent: string;
  onAgentChange: (agentId: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  handleSubmit,
  onCancel,
  isLoading,
  selectedAgent,
  onAgentChange,
}) => {
  const [hoveredDemo, setHoveredDemo] = useState<number | null>(null);

  // Handle demo button click - runs the query in chat
  const handleDemoClick = (query: string) => {
    // Switch to Portfolio Strategist agent and submit the query
    onAgentChange(AgentId.PORTFOLIO_STRATEGIST);
    handleSubmit(query, 'medium', 'llama-3.3-70b-versatile', AgentId.PORTFOLIO_STRATEGIST);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 flex-1 mb-16 w-full max-w-3xl mx-auto gap-6">
      <div className="flex flex-col items-center gap-6">
        <motion.div 
          className="w-20 h-20 bg-green-400 rounded-2xl border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </motion.div>
        <div>
          <motion.h1 
            className="text-5xl md:text-6xl font-black text-gray-900 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Pramana.ai
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Master biomedical evidence. Without the silos.
          </motion.p>
        </div>
      </div>

      {/* Demo Query Buttons - Neobrutalist Style */}
      <motion.div 
        className="flex flex-col items-center gap-3 mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Try a demo query:</span>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {DEMO_QUERIES.map((demo, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleDemoClick(demo.query)}
              onMouseEnter={() => setHoveredDemo(idx)}
              onMouseLeave={() => setHoveredDemo(null)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 font-bold"
              whileTap={{ scale: 0.98 }}
            >
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-gray-800">Demo {idx + 1}</span>
            </motion.button>
          ))}
        </div>
        
        {/* Query Preview on Hover */}
        <div className="h-16 flex items-center justify-center">
          {hoveredDemo !== null && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="max-w-xl px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm"
            >
              <p className="text-xs text-gray-500 font-medium mb-1">Query:</p>
              <p className="text-sm text-gray-700 font-medium line-clamp-2">
                {DEMO_QUERIES[hoveredDemo].query}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div 
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <InputForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={onCancel}
          hasHistory={false}
          selectedAgent={selectedAgent}
          onAgentChange={onAgentChange}
        />
      </motion.div>
      <motion.p 
        className="text-sm text-gray-500 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        Powered by <span className="text-gray-700 font-semibold">Groq</span>, <span className="text-gray-700 font-semibold">LangChain</span> & <span className="text-gray-700 font-semibold">LangGraph</span>
      </motion.p>
    </div>
  );
};
