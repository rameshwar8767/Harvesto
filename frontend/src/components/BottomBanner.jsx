import React from 'react';
import { features } from '../assets/assets';

const BottomBanner = () => {
  return (
    <section className="mt-16 sm:mt-24 rounded-2xl md:rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 p-6 sm:p-10 md:p-14 border border-emerald-100 shadow-sm relative overflow-hidden">
      {/* Decorative Blur Circles */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-white/80 border border-emerald-200/80 px-3.5 py-1 rounded-full shadow-xs">
            🌿 The Harvesto Difference
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Why Shop with Harvesto?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            We are dedicated to bringing farm-level transparency, exceptional freshness, and unbeatable speed to your daily shopping.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-300 hover:shadow-card-hover transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                <img className="w-8 h-8 object-contain" src={feature.icon} alt={feature.title} />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BottomBanner;
