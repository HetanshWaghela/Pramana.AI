import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AppMockup } from './AppMockup';

const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export const HeroSection: React.FC = () => {
    return (
        <section className="relative bg-amber-50 min-h-[calc(100vh-4rem)] overflow-hidden" style={{
            backgroundImage: `
        linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
      `,
            backgroundSize: '20px 20px'
        }}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <motion.div
                            className="inline-flex items-center space-x-2 bg-yellow-300 px-4 py-2 rounded-full mb-8"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wide">NEW: UNIFIED BIOMEDICAL DATA</span>
                        </motion.div>

                        <motion.h1
                            className="text-7xl font-black leading-tight mb-6 text-gray-900"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                        >
                            Master biomedical<br />evidence.
                        </motion.h1>

                        <motion.div
                            className="inline-block mb-8"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <h1 className="text-7xl font-black leading-tight relative">
                                <span className="relative z-10 px-4 inline-block">Without the<br />silos.</span>
                                <div className="absolute inset-0 bg-pink-300 rounded-2xl border-4 border-black transform rotate-1"></div>
                            </h1>
                        </motion.div>

                        <motion.p
                            className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed"
                            initial={{ opacity: 0, filter: "blur(8px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                        >
                            Automatically discover, normalize, and synthesize verifiable public evidence across ClinicalTrials.gov, PubMed, EPO OPS, and more. Chat with your AI research assistant for instant insights.
                        </motion.p>

                        <motion.div
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.1 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link
                                    to="/chat"
                                    className="bg-black text-white px-8 py-4 rounded-full text-base font-bold inline-flex items-center space-x-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <span>Get Started</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </motion.div>

                            <motion.button
                                onClick={() => scrollToSection('ai-assistant')}
                                className="bg-white text-black px-8 py-4 rounded-full text-base font-bold border-4 border-black inline-flex items-center space-x-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                whileHover={{ scale: 1.02, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Watch Demo</span>
                            </motion.button>
                        </motion.div>
                    </div>

                    <motion.div
                        className="relative hidden lg:block"
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                    >
                        <AppMockup />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
