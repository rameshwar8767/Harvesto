import React from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    currency,
    navigate
  } = useAppContext();

  if (!product) return null;

  const isInCart = Boolean(cartItems[product._id]);
  const currentQty = cartItems[product._id] || 0;
  const rating = 4;

  const discountPercent = product.price > product.offerPrice 
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <div 
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className="group relative bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-card-hover hover:border-emerald-300 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between w-full mb-2">
        {discountPercent > 0 ? (
          <span className="bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {discountPercent}% OFF
          </span>
        ) : (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full">
            Fresh
          </span>
        )}
        <span className="text-[11px] text-slate-400 capitalize font-medium">
          {product.category}
        </span>
      </div>

      {/* Product Image Area */}
      <div className="w-full aspect-square flex items-center justify-center p-2 mb-2 rounded-xl bg-slate-50/60 group-hover:bg-emerald-50/30 transition-colors">
        <img
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          src={product.image?.[0]}
          alt={product.name}
          loading="lazy"
        />
      </div>

      {/* Details Area */}
      <div className="flex flex-col flex-1 justify-between mt-1">
        <div>
          <h3 className="text-slate-800 font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors" title={product.name}>
            {product.name}
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mt-1">
            {Array(5).fill('').map((_, i) => (
              <img
                key={i}
                className="w-3 sm:w-3.5 h-3 sm:h-3.5"
                src={i < rating ? assets.star_icon : assets.star_dull_icon}
                alt="star"
              />
            ))}
            <span className="text-[11px] text-slate-400 font-medium ml-1">4.0</span>
          </div>
        </div>

        {/* Price & Cart Control Row */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-slate-900 font-bold text-base sm:text-lg">
                {currency}{product.offerPrice}
              </span>
              {product.price > product.offerPrice && (
                <span className="line-through text-xs text-slate-400">
                  {currency}{product.price}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold">In Stock</p>
          </div>

          {/* Add / Quantity Stepper Button */}
          <div onClick={(e) => e.stopPropagation()}>
            {!isInCart ? (
              <button
                onClick={() => addToCart(product._id)}
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-primary hover:text-white text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
                aria-label={`Add ${product.name} to cart`}
              >
                <img src={assets.cart_icon} alt="cart" className="w-3.5 h-3.5 opacity-80" />
                <span>ADD</span>
              </button>
            ) : (
              <div className="flex items-center justify-between bg-primary text-white rounded-full px-2 py-1 gap-2 text-xs font-bold shadow-xs">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="w-5 h-5 flex items-center justify-center hover:bg-black/20 rounded-full transition cursor-pointer text-sm font-black"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[12px] text-center text-xs font-bold">{currentQty}</span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="w-5 h-5 flex items-center justify-center hover:bg-black/20 rounded-full transition cursor-pointer text-sm font-black"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
