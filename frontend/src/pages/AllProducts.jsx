import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { categories } from '../assets/assets';

const PRICE_RANGES = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-50', label: 'Under ₹50', test: (p) => p.offerPrice < 50 },
    { id: '50-100', label: '₹50 - ₹100', test: (p) => p.offerPrice >= 50 && p.offerPrice <= 100 },
    { id: '100-500', label: '₹100 - ₹500', test: (p) => p.offerPrice > 100 && p.offerPrice <= 500 },
    { id: 'above-500', label: 'Over ₹500', test: (p) => p.offerPrice > 500 },
];

const AllProducts = () => {
    const { products, searchQuery, setSearchQuery } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [sortBy, setSortBy] = useState("featured");
    const [filterProducts, setFilterProducts] = useState([]);

    useEffect(() => {
        let result = [...products];

        // 1. Filter by category
        if (selectedCategory !== "all") {
            result = result.filter(
                (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // 2. Filter by search query
        if (typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
            result = result.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 3. Filter by price range
        if (priceRange !== "all") {
            const rangeConfig = PRICE_RANGES.find((r) => r.id === priceRange);
            if (rangeConfig && rangeConfig.test) {
                result = result.filter(rangeConfig.test);
            }
        }

        // 4. Sort results
        if (sortBy === "price-low") {
            result.sort((a, b) => (a.offerPrice || 0) - (b.offerPrice || 0));
        } else if (sortBy === "price-high") {
            result.sort((a, b) => (b.offerPrice || 0) - (a.offerPrice || 0));
        } else if (sortBy === "discount") {
            result.sort((a, b) => {
                const discA = a.price ? (a.price - a.offerPrice) / a.price : 0;
                const discB = b.price ? (b.price - b.offerPrice) / b.price : 0;
                return discB - discA;
            });
        } else if (sortBy === "name-asc") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        setFilterProducts(result);
    }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

    const activeList = useMemo(() => {
        return filterProducts.filter((p) => p.inStock);
    }, [filterProducts]);

    const hasActiveFilters = selectedCategory !== "all" || priceRange !== "all" || sortBy !== "featured" || Boolean(searchQuery);

    const resetAllFilters = () => {
        setSelectedCategory("all");
        setPriceRange("all");
        setSortBy("featured");
        setSearchQuery("");
    };

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

                {hasActiveFilters && (
                    <button 
                        onClick={resetAllFilters}
                        className="text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-full w-fit cursor-pointer transition active:scale-95 flex items-center gap-1.5"
                    >
                        <span>✕</span> Reset All Filters
                    </button>
                )}
            </div>

            {/* Quick Filter Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
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

            {/* Secondary Controls: Price Filter Pills & Sorting Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200/80 rounded-2xl mb-8 shadow-xs">
                {/* Price Brackets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">Price:</span>
                    {PRICE_RANGES.map((range) => (
                        <button
                            key={range.id}
                            onClick={() => setPriceRange(range.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                                priceRange === range.id
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                                    : "text-slate-600 hover:bg-slate-50 border border-transparent"
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-primary focus:bg-white cursor-pointer transition"
                    >
                        <option value="featured">Featured Items</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="discount">Highest Discount</option>
                        <option value="name-asc">Alphabetical (A - Z)</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {activeList.length === 0 ? (
                <div className='flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white rounded-3xl border border-slate-200'>
                    <span className="text-4xl mb-3">🔍</span>
                    <h3 className='text-lg font-bold text-slate-800'>No matching groceries found</h3>
                    <p className='text-slate-500 text-xs sm:text-sm mt-1 max-w-sm'>
                        Try adjusting your price range, searching for another keyword, or resetting your filters.
                    </p>
                    <button 
                        onClick={resetAllFilters}
                        className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dull transition cursor-pointer shadow-sm active:scale-95"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                    {activeList.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllProducts;
