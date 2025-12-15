import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export const Navigation: React.FC = () => {
    return (
        <motion.nav
            className="border-b border-gray-200 bg-white sticky top-0 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="w-9 h-9 bg-green-400 rounded-xl border-2 border-black flex items-center justify-center">
                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Pramana.ai</span>
                    </motion.div>

                    {/* Navigation Links - Centered */}
                    <div className="hidden md:flex items-center justify-center flex-1">
                        <div className="flex items-center space-x-10">
                            <motion.button
                                onClick={() => scrollToSection('features')}
                                className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors relative group"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                Features
                            </motion.button>
                            <motion.button
                                onClick={() => scrollToSection('ai-assistant')}
                                className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors relative group"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                AI Assistant
                            </motion.button>
                            <motion.button
                                onClick={() => scrollToSection('research-tools')}
                                className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors relative group"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                Research Tools
                            </motion.button>
                            <Link to="/login">
                                <motion.button
                                    className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors relative group"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Login
                                </motion.button>
                            </Link>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Link
                            to="/login"
                            className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold border-3 border-black inline-block"
                        >
                            Get Started
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navigation;
