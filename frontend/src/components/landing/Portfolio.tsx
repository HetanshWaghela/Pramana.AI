export const Portfolio: React.FC = () => {
    return (
        <section id="research-tools" className="bg-blue-100 py-24 border-t-2 border-black" style={{
            backgroundImage: `
        linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
      `,
            backgroundSize: '20px 20px'
        }}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4">EVIDENCE DASHBOARD</p>
                        <h2 className="text-5xl font-black text-gray-900 mb-6">All your research. One Dashboard.</h2>

                        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                            Stop switching between databases. Access trials, patents, trade data, and literature citations in one unified interface. Export citation-ready reports instantly.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="bg-white rounded-2xl border-3 border-black p-5 flex items-center space-x-4 shadow-brutal-sm">
                                <div className="w-10 h-10 bg-white rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold text-gray-900">
                                    Multi-Source <span className="bg-yellow-300 px-2 py-1 rounded">Evidence Map</span>
                                </span>
                            </div>

                            <div className="bg-white rounded-2xl border-3 border-black p-5 flex items-center space-x-4 shadow-brutal-sm">
                                <div className="w-10 h-10 bg-white rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold text-gray-900">Real-time Data Updates</span>
                            </div>
                        </div>

                        <button className="bg-white text-black px-8 py-4 rounded-full text-base font-bold border-4 border-black shadow-brutal-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
                            Explore Research Features
                        </button>
                    </div>

                    <div className="relative">
                        <div className="bg-white rounded-3xl border-4 border-black p-6 shadow-brutal-lg transform rotate-1">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black text-gray-900">Research Pipeline</h3>
                                <span className="bg-green-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold border-2 border-black">
                                    Live
                                </span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between pb-4 border-b-2 border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-black text-lg">C</span>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-gray-900">ClinicalTrials.gov</p>
                                            <p className="text-sm text-gray-500">2,450 Results</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">+New: 12</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pb-4 border-b-2 border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-black text-lg">P</span>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-gray-900">PubMed Citations</p>
                                            <p className="text-sm text-gray-500">15,200 Papers</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">+New: 45</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-300">
                                <span className="text-base font-bold text-gray-600">Total Evidence Points</span>
                                <span className="text-2xl font-black text-gray-900">62,500</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Portfolio;
