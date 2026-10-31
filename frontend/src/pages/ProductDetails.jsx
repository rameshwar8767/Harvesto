import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { products, currency, navigate, addToCart } = useAppContext();
  const { id } = useParams();

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);

  const product = products.find((item) => item._id === id);

  useEffect(() => {
    if (products.length > 0 && product) {
      const filtered = products.filter(
        (item) => item.category === product.category && item._id !== product._id
      );
      setRelatedProducts(filtered.slice(0, 5));
    }
  }, [products, product]);

  useEffect(() => {
    setThumbnail(product?.image?.[0] || null);
  }, [product]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-lg font-semibold text-slate-700">Product not found</p>
        <Link to="/products" className="mt-4 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold">
          Back to Groceries
        </Link>
      </div>
    );
  }

  const discountPercent = product.price > product.offerPrice 
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <div className="mt-6 mb-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary transition">Groceries</Link>
        <span>/</span>
        <Link to={`/products/${product.category.toLowerCase()}`} className="capitalize hover:text-primary transition">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm">
        
        {/* Left Column: Image & Thumbnails */}
        <div className="md:col-span-6 flex flex-col-reverse sm:flex-row gap-4 items-center sm:items-start justify-center">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto">
            {product.image.map((image, index) => (
              <button
                key={index}
                onClick={() => setThumbnail(image)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 p-1.5 transition-all cursor-pointer bg-slate-50 shrink-0 ${
                  thumbnail === image ? "border-primary shadow-sm scale-105" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>

          {/* Main Selected Image */}
          <div className="flex-1 w-full max-w-md aspect-square rounded-2xl bg-slate-50/70 border border-slate-200/60 p-6 flex items-center justify-center relative overflow-hidden group">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-accent text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-full shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            <img
              src={thumbnail}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Right Column: Details & Order Controls */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
                {product.category}
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                ● In Stock & Ready to Dispatch
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Ratings Bar */}
            <div className="flex items-center gap-1.5 mt-3">
              <div className="flex items-center gap-0.5">
                {Array(5).fill('').map((_, i) => (
                  <img
                    key={i}
                    className="w-4 h-4"
                    src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                    alt="rating"
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 ml-1">4.2</span>
              <span className="text-xs text-slate-400">• (128 verified ratings)</span>
            </div>

            {/* Price Box */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {currency}{product.offerPrice}
                </span>
                {product.price > product.offerPrice && (
                  <span className="text-base text-slate-400 line-through">
                    MRP {currency}{product.price}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                    You save {currency}{product.price - product.offerPrice}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Inclusive of all local taxes</p>
            </div>

            {/* About Product Bullet Points */}
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">
                About this Item
              </h2>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {product.description.map((desc, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Perks Badges */}
            <div className="grid grid-cols-3 gap-2.5 mt-6 pt-6 border-t border-slate-100 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-base">🌱</span>
                <p className="text-[11px] font-bold text-slate-700 mt-1">100% Organic</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-base">⚡</span>
                <p className="text-[11px] font-bold text-slate-700 mt-1">15-Min Delivery</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-base">🛡️</span>
                <p className="text-[11px] font-bold text-slate-700 mt-1">Easy Returns</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-8 pt-4">
            <button
              onClick={() => addToCart(product._id)}
              className="flex-1 py-3.5 px-6 rounded-full font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition duration-200 cursor-pointer shadow-xs active:scale-95"
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                addToCart(product._id);
                navigate("/cart");
              }}
              className="flex-1 py-3.5 px-6 rounded-full font-bold text-sm bg-primary hover:bg-primary-dull text-white shadow-lg shadow-emerald-600/20 transition duration-200 cursor-pointer active:scale-95"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 sm:mt-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">🌿 More from this category</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Related Products</h2>
            </div>
            <Link to="/products" className="text-xs sm:text-sm font-semibold text-primary hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-6">
            {relatedProducts
              .filter((p) => p.inStock)
              .map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
