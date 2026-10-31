import React from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../assets/assets';

const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (path) => {
    navigate(`/products/${path.toLowerCase()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="mt-14 sm:mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
            <span>🧺</span> Curated Aisle
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Categories
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs">
          Hand-picked organic fruits, farm vegetables, bakery, and daily pantry staples.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
        {categories.map((category, index) => (
          <div
            key={index}
            className="group cursor-pointer rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all duration-300 border border-slate-200/70 hover:border-emerald-300 hover:shadow-card-hover hover:-translate-y-1 bg-white"
            onClick={() => handleCategoryClick(category.path)}
          >
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-2 mb-3 transition-transform group-hover:scale-110 duration-300"
              style={{ backgroundColor: category.bgColor || '#f0fdf4' }}
            >
              <img
                src={category.image}
                alt={category.text}
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain drop-shadow-sm"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                {category.text}
              </p>
              <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 transition-colors">
                Explore →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
