const Comparison = () => {
  return (
    <section className="bg-stone-50 py-24 border-t-2 border-black" style={{
      backgroundImage: `
        linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <h2 className="text-5xl font-black text-gray-900 text-center mb-12">Why switch to Pramana.ai?</h2>

        <div className="bg-white rounded-3xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="grid grid-cols-3">
            <div className="bg-black text-white p-6 border-r-4 border-black">
              <h3 className="text-xl font-black">Feature</h3>
            </div>
            <div className="bg-black text-white p-6 border-r-4 border-black">
              <h3 className="text-xl font-black">Manual Research</h3>
            </div>
            <div className="bg-yellow-300 p-6">
              <h3 className="text-xl font-black text-gray-900">Pramana.ai</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t-4 border-black">
            <div className="p-6 border-r-4 border-black bg-gray-50">
              <p className="text-lg font-bold text-gray-900">Data Sources</p>
            </div>
            <div className="p-6 border-r-4 border-black">
              <p className="text-lg text-gray-700">Manual Research (scattered)</p>
            </div>
            <div className="p-6 bg-yellow-50">
              <p className="text-lg font-bold text-gray-900">Unified APIs (ClinicalTrials, PubMed, EPO, etc.)</p>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t-4 border-black">
            <div className="p-6 border-r-4 border-black bg-gray-50">
              <p className="text-lg font-bold text-gray-900">Research Speed</p>
            </div>
            <div className="p-6 border-r-4 border-black">
              <p className="text-lg text-gray-700">2-3 months/molecule</p>
            </div>
            <div className="p-6 bg-yellow-50">
              <p className="text-lg font-bold text-gray-900">&lt;1 week/molecule</p>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t-4 border-black">
            <div className="p-6 border-r-4 border-black bg-gray-50">
              <p className="text-lg font-bold text-gray-900">Cost</p>
            </div>
            <div className="p-6 border-r-4 border-black">
              <p className="text-lg text-gray-700">100% baseline</p>
            </div>
            <div className="p-6 bg-yellow-50">
              <p className="text-lg font-bold text-gray-900">~40% cost reduction</p>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t-4 border-black">
            <div className="p-6 border-r-4 border-black bg-gray-50">
              <p className="text-lg font-bold text-gray-900">Citation Quality</p>
            </div>
            <div className="p-6 border-r-4 border-black">
              <p className="text-lg text-gray-700">Manual verification</p>
            </div>
            <div className="p-6 bg-yellow-50">
              <p className="text-lg font-bold text-gray-900">Auto-generated with provenance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
