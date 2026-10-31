import React from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const BestSellers = () => {
  const { products } = useAppContext();

  const bestSelling = products
    .filter((product) => product.inStock)
    .slice(0, 10);

  return (
    <section className="mt-14 sm:mt-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
            <span>🔥</span> High Demand
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Today's Best Sellers
          </h2>
        </div>
        <Link 
          to="/products" 
          className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-dull transition flex items-center gap-1 group"
        >
          <span>View All</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-6">
        {bestSelling.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
