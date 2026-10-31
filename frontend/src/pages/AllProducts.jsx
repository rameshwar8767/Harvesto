import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { categories } from '../assets/assets';

const AllProducts = () => {
    const { products, searchQuery, setSearchQuery } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [filterProducts, setFilterProducts] = useState([]);

    useEffect(() => {
        let result = products;

        if (selectedCategory !== "all") {
            result = result.filter(
                (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        if (typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
            result = result.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilterProducts(result);
    }, [products, searchQuery, selectedCategory]);

    const activeList = useMemo(() => {
        return filterProducts.filter((p) => p.inStock);
    }, [filterProducts]);

    return (
        <div className='mt-8 mb-20 flex flex-col'>
            
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6'>
                <div>
                    <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight'>
                        {selectedCategory === "all" ? "All Groceries" : categories.find(c => c.path === selectedCategory)?.text || selectedCategory}
                    </h1>
                    <p className='text-xs sm:text-sm text-slate-500 mt-1'>
                        Showing {activeList.length} fresh products
                        {searchQuery ? ` matching "${searchQuery}"` : ""}
                    </p>
                </div>

                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery("")}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full w-fit cursor-pointer"
                    >
                        Clear search filters ✕
                    </button>
                )}
            </div>

            {/* Quick Filter Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
                <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        selectedCategory === "all"
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300"
                    }`}
                >
                    All Items
                </button>
                {categories.map((cat, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedCategory(cat.path)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer capitalize flex items-center gap-1.5 ${
                            selectedCategory === cat.path
                                ? "bg-primary text-white shadow-sm"
                                : "bg-white text-slate-600 border border-slate-200/80 hover:border-emerald-200"
                        }`}
                    >
                        <span>{cat.text}</span>
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            {activeList.length === 0 ? (
                <div className='flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white rounded-2xl border border-slate-200'>
                    <span className="text-4xl mb-3">🔍</span>
                    <h3 className='text-lg font-bold text-slate-800'>No matching groceries found</h3>
                    <p className='text-slate-500 text-xs sm:text-sm mt-1 max-w-sm'>
                        Try searching for a different keyword or browse through our categories.
                    </p>
                    <button 
                        onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                        className="mt-4 px-5 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dull transition cursor-pointer"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-6'>
                    {activeList.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllProducts;
