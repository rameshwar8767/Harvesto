import React, { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

// Route-level code splitting for enhanced performance
const AllProducts = lazy(() => import('./pages/AllProducts'));
const ProductCategory = lazy(() => import('./pages/ProductCategory'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const AddAddress = lazy(() => import('./pages/AddAddress'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const SellerLogin = lazy(() => import('./components/seller/SellerLogin'));
const SellerLayout = lazy(() => import('./pages/seller/SellerLayout'));
const AddProduct = lazy(() => import('./pages/seller/AddProduct'));
const ProductList = lazy(() => import('./pages/seller/ProductList'));
const Orders = lazy(() => import('./pages/seller/Orders'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <LoadingSpinner size="lg" />
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Harvesting Fresh Groceries...</span>
  </div>
);

function App() {
  const isSellerPath = useLocation().pathname.includes('seller');
  const { showUserLogin, isSeller } = useAppContext();

  return (
    <ErrorBoundary>
      <div className='min-h-screen flex flex-col justify-between bg-slate-50/70 text-slate-800 antialiased'> 
        {!isSellerPath && <Navbar />}
        {showUserLogin && <Login />}

        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 2800,
            style: {
              borderRadius: '12px',
              background: '#0f172a',
              color: '#fff',
              fontSize: '13.5px',
              fontWeight: '500',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />

        <main className={`flex-1 ${isSellerPath ? '' : 'px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28 py-4 max-w-7xl mx-auto w-full'}`}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<AllProducts />} />
              <Route path="/products/:category" element={<ProductCategory />} />
              <Route path="/products/:category/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/add-address" element={<AddAddress />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/seller" element={isSeller ? <SellerLayout /> : <SellerLogin />}>
                <Route index element={isSeller ? <AddProduct /> : null} />
                <Route path='products-list' element={<ProductList />} />
                <Route path='orders' element={<Orders />} />
              </Route>
            </Routes>
          </Suspense>
        </main>

        {!isSellerPath && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
