import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { authApi } from '../api';

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { user, setUser, getCartCount, getCartAmount, currency, setShowUserLogin, setSearchQuery, searchQuery, navigate } = useAppContext();

    const logout = async () => {
        try {
            await authApi.logout().catch(() => null);
        } finally {
            setUser(null);
            navigate('/');
        }
    };

    useEffect(() => {
        if (typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
            navigate('/products');
        }
    }, [searchQuery, navigate]);

    const cartCount = getCartCount();
    const cartAmount = getCartAmount();

    return (
        <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 transition-all duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28 py-3.5 flex items-center justify-between gap-4">
                
                {/* Brand Logo */}
                <NavLink to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 group shrink-0">
                    <img className="h-10 w-auto group-hover:scale-[1.02] transition-transform duration-200" src={assets.logo} alt="Harvesto - Fresh Daily Groceries" />
                </NavLink>

                {/* Desktop Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md mx-4 items-center gap-2.5 bg-slate-100/90 border border-slate-200/80 px-4 py-2 rounded-full focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <img src={assets.search_icon} alt="Search" className="w-4 h-4 opacity-50 shrink-0" />
                    <input 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        value={typeof searchQuery === 'string' ? searchQuery : ''}
                        className="w-full bg-transparent outline-none placeholder-slate-400 text-slate-700 text-sm" 
                        type="text" 
                        placeholder="Search fresh vegetables, dairy, snacks..." 
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-xs text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    )}
                </div>

                {/* Desktop Nav Links & Actions */}
                <div className="hidden sm:flex items-center gap-6">
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Home
                    </NavLink>
                    <NavLink 
                        to="/products" 
                        className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        All Groceries
                    </NavLink>

                    {/* Cart Button with Count and Amount Pill */}
                    <button 
                        onClick={() => navigate('/cart')} 
                        className="flex items-center gap-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs group"
                        aria-label="Shopping Cart"
                    >
                        <div className="relative">
                            <img src={assets.nav_cart_icon} alt="Cart" className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-semibold">
                            {currency}{cartAmount}
                        </span>
                    </button>

                    {/* User Auth Profile / Login */}
                    {!user ? (
                        <button 
                            onClick={() => setShowUserLogin(true)} 
                            className="cursor-pointer px-5 py-2 bg-primary hover:bg-primary-dull transition-colors text-white rounded-full font-medium text-xs tracking-wide shadow-sm"
                        >
                            Sign In
                        </button>
                    ) : (
                        <div className="relative group cursor-pointer">
                            <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 py-1.5 px-3 rounded-full transition">
                                <img className="w-6 h-6 rounded-full object-cover" src={assets.profile_icon} alt="Profile" />
                                <span className="text-xs font-semibold text-slate-700 max-w-[90px] truncate">{user.name || "My Account"}</span>
                            </div>
                            <div className="hidden group-hover:block absolute top-full right-0 pt-2 w-48 z-50">
                                <ul className="bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-sm overflow-hidden">
                                    <li onClick={() => navigate('/my-orders')} className="px-4 py-2 hover:bg-emerald-50 text-slate-700 cursor-pointer flex items-center gap-2 text-xs font-medium">
                                        📦 My Orders
                                    </li>
                                    <li onClick={() => navigate('/cart')} className="px-4 py-2 hover:bg-emerald-50 text-slate-700 cursor-pointer flex items-center gap-2 text-xs font-medium">
                                        🛒 View Cart
                                    </li>
                                    <li onClick={logout} className="px-4 py-2 hover:bg-rose-50 text-rose-600 border-t border-slate-100 cursor-pointer flex items-center gap-2 text-xs font-medium">
                                        🚪 Logout
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Seller Link */}
                    <Link to="/seller" className="text-xs font-medium text-slate-400 hover:text-primary border-l border-slate-200 pl-4 transition">
                        Seller Hub
                    </Link>
                </div>

                {/* Mobile Right Controls */}
                <div className="flex items-center gap-3 sm:hidden">
                    <button 
                        onClick={() => navigate('/cart')} 
                        className="relative p-2 bg-emerald-50 text-emerald-800 rounded-full cursor-pointer"
                        aria-label="Cart"
                    >
                        <img src={assets.nav_cart_icon} alt="Cart" className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setOpen(!open)} 
                        aria-label="Toggle Menu" 
                        className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                        <img src={assets.menu_icon} alt="Menu" className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown & Search Drawer */}
            {open && (
                <div className="border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 sm:hidden shadow-lg animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-full">
                        <img src={assets.search_icon} alt="Search" className="w-4 h-4 opacity-50 shrink-0" />
                        <input 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            value={typeof searchQuery === 'string' ? searchQuery : ''}
                            className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" 
                            type="text" 
                            placeholder="Search fresh groceries..." 
                        />
                    </div>

                    <div className="flex flex-col space-y-1 pt-1 text-sm font-medium text-slate-700">
                        <NavLink to="/" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-primary">
                            🏠 Home
                        </NavLink>
                        <NavLink to="/products" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-primary">
                            🍎 All Groceries
                        </NavLink>
                        {user && (
                            <NavLink to="/my-orders" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-primary">
                                📦 My Orders
                            </NavLink>
                        )}
                        <NavLink to="/seller" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-primary">
                            🏪 Seller Dashboard
                        </NavLink>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        {!user ? (
                            <button 
                                onClick={() => { setOpen(false); setShowUserLogin(true); }}  
                                className="w-full py-2.5 bg-primary hover:bg-primary-dull text-white rounded-lg font-semibold text-sm cursor-pointer shadow-sm"
                            >
                                Sign In / Register
                            </button>
                        ) : (
                            <button  
                                onClick={() => { setOpen(false); logout(); }} 
                                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-semibold text-sm border border-rose-200 cursor-pointer"
                            >
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
