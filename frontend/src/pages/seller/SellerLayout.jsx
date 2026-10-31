import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { authApi } from '../../api';

const SellerLayout = () => {
    const { setIsSeller } = useAppContext();

    const sidebarLinks = [
        { name: "Add Product", path: '/seller', icon: assets.add_icon },
        { name: "Product Catalog", path: '/seller/products-list', icon: assets.product_list_icon },
        { name: "Customer Orders", path: '/seller/orders', icon: assets.order_icon },
    ];

    const logout = async () => {
        try {
            await authApi.sellerLogout().catch(() => null);
        } finally {
            setIsSeller(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Top Navigation */}
            <header className="flex items-center justify-between px-6 md:px-10 border-b border-slate-200 py-3.5 bg-white sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <Link to='/'>
                        <img src={assets.logo} alt="Harvesto Logo" className="cursor-pointer h-9 w-auto" />
                    </Link>
                    <span className="hidden sm:inline-block bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200">
                        Seller Hub
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-800">Store Manager</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">● Store Online</p>
                    </div>
                    <button 
                        onClick={logout} 
                        className="border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition text-slate-600 rounded-full text-xs font-bold px-4 py-1.5 cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content Area with Sidebar */}
            <div className="flex flex-1">
                {/* Modern Sidebar */}
                <aside className="md:w-64 w-16 border-r border-slate-200/80 bg-white pt-6 flex flex-col transition-all duration-300 shrink-0">
                    <div className="px-4 mb-3 hidden md:block">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Management</p>
                    </div>
                    <nav className="space-y-1.5 px-2">
                        {sidebarLinks.map((item) => (
                            <NavLink 
                                to={item.path} 
                                key={item.name} 
                                end={item.path === "/seller"}
                                className={({ isActive }) => `flex items-center py-2.5 px-3.5 gap-3 rounded-xl transition-all ${
                                    isActive 
                                        ? "bg-primary text-white font-bold shadow-xs shadow-emerald-600/30"
                                        : "hover:bg-slate-100 text-slate-600 font-medium"
                                }`}
                            >
                                <img src={item.icon} alt={item.name} className="w-5 h-5 shrink-0" />
                                <span className="md:block hidden text-xs sm:text-sm">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-auto p-4 border-t border-slate-100 hidden md:block">
                        <Link to="/" className="text-xs font-bold text-slate-500 hover:text-primary transition flex items-center gap-1.5">
                            <span>←</span> Back to Storefront
                        </Link>
                    </div>
                </aside>

                {/* Nested Outlet View */}
                <main className="flex-1 overflow-y-auto max-h-[calc(100vh-65px)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;
