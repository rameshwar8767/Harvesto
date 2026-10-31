import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams, Link } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';

const ProductCategory = () => {
    const { products } = useAppContext();
    const { category } = useParams();

    const searchCategory = categories.find((item) => item.path.toLowerCase() === category?.toLowerCase());
    const filterProducts = products.filter((product) => product.category?.toLowerCase() === category?.toLowerCase());

    return (
        <div className='mt-8 mb-20 flex flex-col'>
            {/* Category Breadcrumbs & Header */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
                <Link to="/" className="hover:text-primary transition">Home</Link>
                <span>/</span>
                <Link to="/products" className="hover:text-primary transition">Groceries</Link>
                <span>/</span>
                <span className="text-slate-800 font-bold capitalize">{searchCategory?.text || category}</span>
            </div>

            <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80'>
                <div>
                    <h1 className='text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight capitalize'>
                        {searchCategory ? searchCategory.text : category}
                    </h1>
                    <p className='text-xs sm:text-sm text-slate-500 mt-1'>
                        Showing {filterProducts.length} items in this aisle
                    </p>
                </div>

                {/* Switch Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat, idx) => (
                        <Link
                            key={idx}
                            to={`/products/${cat.path}`}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 capitalize ${
                                cat.path.toLowerCase() === category?.toLowerCase()
                                    ? "bg-primary text-white shadow-xs"
                                    : "bg-white text-slate-600 border border-slate-200/80 hover:border-emerald-200"
                            }`}
                        >
                            {cat.text}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {filterProducts.length > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-6'> 
                    {filterProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center min-h-[45vh] text-center p-8 bg-white rounded-3xl border border-slate-200'>
                    <span className="text-5xl mb-3">🧺</span>
                    <h3 className='text-xl font-bold text-slate-800'>No products currently in stock</h3>
                    <p className='text-slate-500 text-sm mt-1 max-w-sm'>
                        We are currently harvesting and restocking {searchCategory?.text || category}. Check back soon!
                    </p>
                    <Link 
                        to="/products"
                        className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dull transition"
                    >
                        Browse All Groceries
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ProductCategory;
