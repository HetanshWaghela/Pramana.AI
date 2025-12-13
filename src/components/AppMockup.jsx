import { motion } from 'framer-motion';

const AppMockup = () => {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 flex flex-col items-end space-y-6">
        <motion.div 
          className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 w-80 transform rotate-2"
          initial={{ opacity: 0, x: 60 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: [0, -8, 0]
          }}
          transition={{ 
            opacity: { duration: 0.6, delay: 0.2 },
            x: { duration: 0.6, delay: 0.2 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          whileHover={{ scale: 1.03, boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}
        >
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-10 h-10 bg-white rounded-full border-2 border-black flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900">Research Query</h3>
              <p className="text-xs text-gray-500">Just now • ClinicalTrials.gov</p>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
            <p className="text-sm text-gray-800 font-medium">"Find COVID-19 vaccine trials"</p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 w-80 transform -rotate-1"
          initial={{ opacity: 0, x: 60 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: [0, 8, 0]
          }}
          transition={{ 
            opacity: { duration: 0.6, delay: 0.4 },
            x: { duration: 0.6, delay: 0.4 },
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }}
          whileHover={{ scale: 1.03, boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900">Evidence Synthesis</h3>
            <motion.div 
              className="bg-green-400 text-gray-900 text-xs font-bold px-2.5 py-1 rounded border-2 border-black"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Live
            </motion.div>
          </div>
          <div className="flex items-end justify-between h-32 space-x-2 mb-3">
            {[55, 70, 85, 65, 90].map((height, index) => (
              <motion.div
                key={index}
                className="bg-blue-500 border-2 border-black rounded-t-lg flex-1"
                style={{ height: `${height}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1, ease: "easeOut" }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-900 text-center font-bold">Data Visualization</p>
        </motion.div>

        <motion.div 
          className="bg-gray-900 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 w-80 transform rotate-1"
          initial={{ opacity: 0, x: 60 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: [0, -8, 0]
          }}
          transition={{ 
            opacity: { duration: 0.6, delay: 0.6 },
            x: { duration: 0.6, delay: 0.6 },
            y: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }}
          whileHover={{ scale: 1.03, boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">AI Research Assistant</p>
              <p className="text-sm text-white font-semibold">"Found 557 clinical trials across 45 countries"</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AppMockup;
