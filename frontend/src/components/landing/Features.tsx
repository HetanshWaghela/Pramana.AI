export const Features: React.FC = () => {
    return (
        <section id="features" className="bg-white py-24 border-t-2 border-black" style={{
            backgroundImage: `
        linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
      `,
            backgroundSize: '20px 20px'
        }}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="text-center mb-16">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">BIOMEDICAL EVIDENCE PLATFORM</p>
                    <h2 className="text-5xl font-black text-gray-900">Everything you need for drug discovery research</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-yellow-300 rounded-3xl border-4 border-black p-8 shadow-brutal hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
                        <div className="w-12 h-12 bg-white rounded-xl border-3 border-black flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-4">Unified Data Discovery</h3>
                        <p className="text-gray-800 mb-6 leading-relaxed">Search across ClinicalTrials.gov, PubMed, EPO OPS, UN Comtrade, and openFDA in one query. No more switching platforms.</p>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-bold text-gray-900">557K+ Clinical Trials</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-bold text-gray-900">39M+ Citations</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-bold text-gray-900">Real-time API Integration</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-300 rounded-3xl border-4 border-black p-8 shadow-brutal hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold">
                            TOP FEATURE
                        </div>

                        <div className="w-12 h-12 bg-white rounded-xl border-3 border-black flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-4">AI-Powered Synthesis</h3>
                        <p className="text-gray-800 mb-6 leading-relaxed">LangGraph orchestration with local LLMs analyzes, normalizes, and generates citation-first evidence briefs automatically.</p>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-bold text-gray-900">LangChain Tools & Parsers</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-bold text-gray-900">Ollama/vLLM Models</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-bold text-gray-900">Structured Outputs</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-pink-300 rounded-3xl border-4 border-black p-8 shadow-brutal hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
                        <div className="w-12 h-12 bg-white rounded-xl border-3 border-black flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-4">Rapid Research Pipeline</h3>
                        <p className="text-gray-800 mb-6 leading-relaxed">Cut drug repurposing research from 2-3 months to under a week with automated workflows and smart caching.</p>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-bold text-gray-900">6-8 Molecules/Month</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-bold text-gray-900">~40% Cost Reduction</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-bold text-gray-900">Real-time Reports</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
