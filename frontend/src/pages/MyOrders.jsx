import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { dummyOrders } from '../assets/assets';
import { orderApi } from '../api';
import { Link } from 'react-router-dom';

const ORDER_STEPS = [
  { label: 'Order Placed', desc: 'Order confirmed' },
  { label: 'Processing', desc: 'Harvesting & packing' },
  { label: 'Shipped', desc: 'Out for 15-min delivery' },
  { label: 'Delivered', desc: 'Delivered to door' },
];

const getStepIndex = (status) => {
  const norm = (status || '').toLowerCase();
  if (norm.includes('deliver')) return 3;
  if (norm.includes('ship') || norm.includes('out')) return 2;
  if (norm.includes('process') || norm.includes('pack')) return 1;
  if (norm.includes('cancel')) return -1;
  return 0;
};

const OrderTimeline = ({ status }) => {
  const currentStep = getStepIndex(status);
  const isCancelled = currentStep === -1;

  if (isCancelled) {
    return (
      <div className="my-4 py-2.5 px-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
        <span>⚠️</span> This order has been cancelled.
      </div>
    );
  }

  return (
    <div className="my-5 py-3 px-2 sm:px-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-6 right-6 top-3.5 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
        {/* Active progress track line */}
        <div 
          className="absolute left-6 top-3.5 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0"
          style={{ width: `${(Math.min(currentStep, 3) / 3) * 85}%` }}
        />

        {ORDER_STEPS.map((step, idx) => {
          const isCompleted = currentStep > idx;
          const isCurrent = currentStep === idx;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center max-w-[80px] sm:max-w-[100px]">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isCompleted 
                    ? 'bg-primary text-white shadow-sm ring-4 ring-emerald-100' 
                    : isCurrent 
                      ? 'bg-white border-2 border-primary text-primary shadow-md ring-4 ring-emerald-50' 
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <p className={`mt-2 text-[11px] font-bold leading-tight ${isCurrent || isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </p>
              <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5 leading-tight">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
            Real-time live tracking and delivery history for your fresh groceries.
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
            <div key={order._id || index} className='border border-slate-200/80 rounded-3xl p-5 sm:p-7 bg-white shadow-xs hover:shadow-card transition'>
              {/* Top Meta Bar */}
              <div className='flex flex-wrap items-center justify-between text-xs pb-4 border-b border-slate-100 gap-3'>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 text-sm">
                    Order #{order._id?.slice(-8) || `HVT-${index + 1}`}
                  </span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full border text-xs ${
                    (order.status || '').toLowerCase().includes('cancel')
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : (order.status || '').toLowerCase().includes('deliver')
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {order.status || "Order Placed"}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-slate-500 font-medium">
                  <span>Method: <strong className="text-slate-700">{order.paymentMethod || "COD"}</strong></span>
                  <span>Total: <strong className="text-primary font-black text-sm">{currency}{order.amount}</strong></span>
                </div>
              </div>

              {/* Order Stepper Timeline */}
              <OrderTimeline status={order.status || "Order Placed"} />

              {/* Items List */}
              <div className="divide-y divide-slate-100 mt-4">
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

              {/* Delivery Address & Footer */}
              {order.address && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📍 Delivering to:</span>
                    <span className="font-semibold text-slate-700">
                      {order.address.firstName} {order.address.lastName} — {order.address.street}, {order.address.city}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                    ⚡ 15-Min Guaranteed Express Dispatch
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
