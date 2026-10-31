import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const MainBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl mt-4">
      {/* Decorative Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 px-6 sm:px-10 md:px-14 lg:px-16 py-12 md:py-16 lg:py-20 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Left Content Column */}
        <div className="max-w-xl text-center md:text-left">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-200 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span>Farm-Fresh Everyday • 15 Min Delivery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
            Daily Groceries <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-200 to-amber-200">
              Harvested For You.
            </span>
          </h1>

          <p className="mt-4 text-emerald-100/90 text-sm sm:text-base md:text-lg font-normal leading-relaxed max-w-lg">
            Hand-picked organic vegetables, crisp fruits, daily dairy, and bakery essentials delivered directly from verified local farms to your kitchen.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-accent hover:bg-accent-hover text-slate-950 font-bold text-sm sm:text-base rounded-full shadow-lg shadow-amber-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              Explore Fresh Deals
              <span>→</span>
            </Link>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-full border border-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer"
            >
              Browse Catalog
            </Link>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/10 text-xs sm:text-sm text-emerald-200/80">
            <div>
              <p className="font-bold text-white text-base sm:text-lg">100%</p>
              <p className="text-[11px] sm:text-xs text-emerald-300">Organic Certified</p>
            </div>
            <div>
              <p className="font-bold text-white text-base sm:text-lg">0 Fee</p>
              <p className="text-[11px] sm:text-xs text-emerald-300">First 3 Orders</p>
            </div>
            <div>
              <p className="font-bold text-white text-base sm:text-lg">15 Mins</p>
              <p className="text-[11px] sm:text-xs text-emerald-300">Speed Delivery</p>
            </div>
          </div>
        </div>

        {/* Right Graphic Card Illustration */}
        <div className="relative shrink-0 max-w-xs sm:max-w-sm lg:max-w-md w-full flex items-center justify-center">
          <div className="relative w-full aspect-square rounded-3xl bg-emerald-700/30 border border-white/10 p-6 flex flex-col justify-center items-center shadow-2xl backdrop-blur-md overflow-hidden group">
            <img 
              src={assets.organic_vegitable_image} 
              alt="Harvesto Fresh Vegetables" 
              className="w-48 sm:w-60 md:w-72 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl" 
            />
            {/* Floating Highlights */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1.5 rounded-full shadow-md text-xs font-bold flex items-center gap-1.5">
              <span>🌱</span> Fresh Harvest
            </div>
            <div className="absolute bottom-4 right-4 bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-full shadow-md text-xs font-bold flex items-center gap-1">
              <span>⭐</span> Top Quality
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MainBanner;
