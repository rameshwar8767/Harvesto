import React from 'react';
import { assets, footerLinks } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Mission Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white/95 p-2 rounded-xl inline-block">
              <img
                src={assets.logo}
                alt="Harvesto"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Harvesto brings direct-from-farm organic produce, dairy, fruits, and bakery goods straight to your doorstep with 15-minute quick delivery.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400 text-sm">
              <span className="cursor-pointer hover:text-white transition">🐦</span>
              <span className="cursor-pointer hover:text-white transition">📸</span>
              <span className="cursor-pointer hover:text-white transition">📘</span>
              <span className="cursor-pointer hover:text-white transition">💼</span>
            </div>
          </div>

          {/* Nav Links Columns */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        className="hover:text-emerald-400 transition-colors inline-block"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Harvesto Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
