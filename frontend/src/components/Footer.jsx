import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-agrogreen-950 text-white border-t border-agrogreen-900 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-agrogreen-900">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="bg-gradient-to-tr from-agrogreen-600 to-agrogreen-500 p-2 rounded-xl text-white">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Agro<span className="text-agrogreen-400 font-semibold">Link</span>
              </span>
            </div>
            <p className="text-agrogreen-200/70 text-sm max-w-sm leading-relaxed">
              Empowering Indian Agriculture through direct marketplace connections, smart temperature-controlled logistics, and real-time mandi data insights.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-agrogreen-900/60 hover:bg-agrogreen-800 p-2.5 rounded-lg text-agrogreen-200 transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="bg-agrogreen-900/60 hover:bg-agrogreen-800 p-2.5 rounded-lg text-agrogreen-200 transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-agrogreen-400 font-bold uppercase tracking-wider text-xs mb-6">Marketplace & Resources</h4>
            <ul className="space-y-3.5 text-sm text-agrogreen-200/80">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Buy Crops</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Sell Produce</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Mandi rates API</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Cold Storage Units</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-agrogreen-400 font-bold uppercase tracking-wider text-xs mb-6">Legal & Support</h4>
            <ul className="space-y-3.5 text-sm text-agrogreen-200/80">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Support & Help</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Partner Program</Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-agrogreen-300/60">
          <p>© 2026 AgroLink Technologies. Empowering Indian Agriculture.</p>
          <p className="mt-2 sm:mt-0 font-medium">Tuljapur, Maharashtra Office</p>
        </div>
      </div>
    </footer>
  );
}
