const Footer = () => {
  return (
    <footer className="bg-white py-8 border-t-2 border-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-green-400 rounded-xl border-2 border-black flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Pramana.ai</span>
          </div>

          <div className="flex items-center space-x-8">
            <a href="#" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              GitHub Repo
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              Contact
            </a>
          </div>

          <div className="text-sm text-gray-600">
            © 2025 Pramana.ai. Made by team <span className="font-bold text-gray-900">GitGonewild</span>.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
