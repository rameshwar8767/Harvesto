import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { authApi } from '../api';

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { user, setUser, getCartCount, setShowUserLogin, setSearchQuery, searchQuery, navigate } = useAppContext();

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

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-200 bg-white sticky top-0 z-30 transition-all">
            <NavLink to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <img className="h-9 w-auto" src={assets.logo} alt="GreenCart" />
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                <NavLink to="/" className={({ isActive }) => `transition ${isActive ? 'text-primary font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>
                    Home
                </NavLink>
                <NavLink to="/products" className={({ isActive }) => `transition ${isActive ? 'text-primary font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>
                    All Products
                </NavLink>

                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 py-1 rounded-full focus-within:border-primary">
                    <input 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        value={typeof searchQuery === 'string' ? searchQuery : ''}
                        className="py-1 w-48 bg-transparent outline-none placeholder-gray-400 text-gray-700" 
                        type="text" 
                        placeholder="Search products..." 
                    />
                    <img src={assets.search_icon} alt="Search" className='w-4 h-4 opacity-60' />
                </div>

                <div onClick={() => navigate('/cart')} className="relative cursor-pointer p-1" aria-label="Shopping Cart">
                    <img src={assets.nav_cart_icon} alt="Cart" className='w-6 opacity-80 hover:opacity-100 transition' />
                    <button className="absolute -top-1 -right-2 text-xs font-bold text-white bg-primary min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center">
                        {getCartCount()}
                    </button>
                </div>

                {!user ? (
                    <button 
                        onClick={() => setShowUserLogin(true)} 
                        className="cursor-pointer px-7 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full font-medium text-sm shadow-sm"
                    >
                        Login
                    </button>
                ) : (
                    <div className='relative group cursor-pointer'>
                        <div className="flex items-center gap-2">
                            <img className='w-9 h-9 rounded-full border border-gray-200' src={assets.profile_icon} alt="Profile" />
                            <span className="text-sm font-medium text-gray-700">{user.name || "User"}</span>
                        </div>
                        <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow-lg border border-gray-200 py-1.5 w-40 rounded-md text-sm z-40'>
                            <li onClick={() => navigate('/my-orders')} className='p-2 pl-3 hover:bg-emerald-50 text-gray-700 cursor-pointer'>
                                My Orders
                            </li>
                            <li onClick={logout} className='p-2 pl-3 hover:bg-red-50 text-red-600 border-t border-gray-100 cursor-pointer'>
                                Logout
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Mobile Nav Right Section */}
            <div className='flex items-center gap-5 sm:hidden'>
                <div onClick={() => navigate('/cart')} className="relative cursor-pointer p-1">
                    <img src={assets.nav_cart_icon} alt="Cart" className='w-6 opacity-80' />
                    <button className="absolute -top-1 -right-2 text-xs font-bold text-white bg-primary min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                        {getCartCount()}
                    </button>
                </div>
                <button onClick={() => setOpen(!open)} aria-label="Toggle Menu" className="p-1 cursor-pointer">
                    <img src={assets.menu_icon} alt="Menu" className='w-6 h-6' />
                </button>
            </div>
            
            {/* Mobile Dropdown Menu */}
            {open && (
                <div className="absolute top-full left-0 w-full bg-white shadow-lg py-4 flex flex-col items-start gap-3 px-6 text-sm border-b border-gray-200 sm:hidden">
                    <NavLink to="/" onClick={() => setOpen(false)} className="block py-1 text-gray-700 font-medium w-full">
                        Home
                    </NavLink>
                    <NavLink to="/products" onClick={() => setOpen(false)} className="block py-1 text-gray-700 font-medium w-full">
                        All Products
                    </NavLink>
                    {user && (
                        <NavLink to="/my-orders" onClick={() => setOpen(false)} className="block py-1 text-gray-700 font-medium w-full">
                            My Orders
                        </NavLink>
                    )}

                    {!user ? (
                        <button 
                            onClick={() => { setOpen(false); setShowUserLogin(true); }}  
                            className="cursor-pointer w-full text-center py-2.5 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-md text-sm font-medium"
                        >
                            Login
                        </button>
                    ) : (
                        <button  
                            onClick={() => { setOpen(false); logout(); }} 
                            className="cursor-pointer w-full text-center py-2.5 mt-2 bg-red-50 hover:bg-red-100 text-red-600 transition rounded-md text-sm font-medium border border-red-200"
                        >
                            Logout
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
