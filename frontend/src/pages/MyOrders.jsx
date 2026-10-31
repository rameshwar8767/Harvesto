import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { dummyOrders } from '../assets/assets';
import { orderApi } from '../api';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency } = useAppContext();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getUserOrders().catch(() => null);
        if (res && res.success && Array.isArray(res.orders) && res.orders.length > 0) {
          setMyOrders(res.orders);
          return;
        }
        setMyOrders(dummyOrders);
      } catch {
        setMyOrders(dummyOrders);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className='mt-8 mb-20 max-w-4xl mx-auto'>
      <div className='flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight'>
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and manage your recent farm grocery deliveries.
          </p>
        </div>
        <Link to="/products" className="text-xs font-bold text-primary hover:underline">
          Shop More →
        </Link>
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
          <span className="text-5xl mb-4 block">📦</span>
          <h3 className="text-xl font-bold text-slate-800">No Orders Yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            You haven't placed any orders with Harvesto yet. Start exploring fresh vegetables and fruits today!
          </p>
          <Link to="/products" className="inline-block mt-6 px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-full shadow-sm hover:bg-primary-dull transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {myOrders.map((order, index) => (
            <div key={order._id || index} className='border border-slate-200/80 rounded-2xl p-5 sm:p-6 bg-white shadow-xs hover:shadow-card transition'>
              {/* Top Meta Bar */}
              <div className='flex flex-wrap items-center justify-between text-xs pb-4 border-b border-slate-100 gap-3'>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">
                    Order #{order._id?.slice(-8) || `HVT-${index + 1}`}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {order.status || "Order Placed"}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-slate-500 font-medium">
                  <span>Method: <strong className="text-slate-700">{order.paymentMethod || "COD"}</strong></span>
                  <span>Total: <strong className="text-primary font-extrabold text-sm">{currency}{order.amount}</strong></span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 mt-2">
                {order.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-4"
                  >
                    <div className='flex items-center gap-3.5'>
                      <div className='bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0 w-14 h-14 flex items-center justify-center'>
                        <img src={item.product?.image?.[0]} className='max-h-full max-w-full object-contain' alt={item.product?.name} />
                      </div>
                      <div>
                        <h4 className='text-sm font-bold text-slate-800'>{item.product?.name || "Grocery Item"}</h4>
                        <p className='text-xs text-slate-400 capitalize'>{item.product?.category}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-slate-500">
                      <p className="text-slate-400">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className='text-slate-900 font-bold text-sm sm:text-base'>
                        {currency}{((item.product?.offerPrice || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
