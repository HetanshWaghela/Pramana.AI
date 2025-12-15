import { Link } from 'react-router-dom';

export const CTA: React.FC = () => {
    return (
        <section className="bg-yellow-300 py-24 border-t-2 border-black">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                <h2 className="text-6xl font-black text-gray-900 mb-6">
                    Stop searching silos. Start discovering evidence.
                </h2>

                <p className="text-xl text-gray-800 mb-10 leading-relaxed">
                    Join research teams accelerating drug repurposing with Pramana.ai. Built with LangGraph, FastAPI, and PostgreSQL for speed and reliability.
                </p>

                <Link
                    to="/app"
                    className="bg-black text-white px-10 py-5 rounded-full text-lg font-bold border-4 border-white hover:bg-gray-800 transition-colors mb-6 inline-block"
                >
                    Request Demo
                </Link>

                <p className="text-sm font-bold text-gray-900 mt-6">
                    Open Source • Real-time APIs • Citation-First
                </p>
            </div>
        </section>
    );
};

export default CTA;
