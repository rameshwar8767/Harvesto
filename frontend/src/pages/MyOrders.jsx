import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { dummyOrders } from '../assets/assets';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency } = useAppContext();

  useEffect(() => {
    setMyOrders(dummyOrders);
  }, []);

  return (
    <div className='mt-12 pb-16'>
      <div className='flex flex-col items-start w-max mb-8'>
        <p className='text-2xl font-semibold uppercase text-gray-800'>My Orders</p>
        <div className='w-16 h-1 bg-primary rounded-full mt-1.5'></div>
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No orders placed yet.</p>
        </div>
      ) : (
        myOrders.map((order, index) => (
          <div key={order._id || index} className='border border-gray-200 rounded-lg mb-8 p-5 max-w-4xl bg-white shadow-sm'>
            <div className='flex justify-between md:items-center text-gray-500 text-sm font-medium pb-4 border-b border-gray-100 max-md:flex-col gap-1'>
              <span>Order ID: <strong className="text-gray-700">{order._id}</strong></span>
              <span>Payment: <strong className="text-gray-700">{order.paymentMethod}</strong></span>
              <span>Total: <strong className="text-primary text-base">{currency}{order.amount}</strong></span>
            </div>
            {order.items.map((item, itemIdx) => (
              <div 
                key={itemIdx} 
                className={`relative bg-white text-gray-600 ${order.items.length !== itemIdx + 1 ? "border-b border-gray-100" : ""} flex flex-col md:flex-row md:items-center justify-between py-4 md:gap-16 w-full`}
              >
                <div className='flex items-center mb-3 md:mb-0'>
                  <div className='bg-gray-50 p-2 rounded-lg border border-gray-200 shrink-0'>
                    <img src={item.product?.image?.[0]} className='w-14 h-14 object-contain' alt={item.product?.name} />
                  </div>
                  <div className='ml-4'>
                    <h2 className='text-base font-semibold text-gray-800'>{item.product?.name}</h2>
                    <p className='text-xs text-gray-500 capitalize'>Category: {item.product?.category}</p>
                  </div>
                </div>

                <div className='flex flex-col justify-center text-sm md:ml-8 mb-3 md:mb-0'>
                  <p>Quantity: <span className="font-semibold text-gray-800">{item.quantity || 1}</span></p>
                  <p>Status: <span className="text-emerald-600 font-medium">{item.status || "Order Placed"}</span></p>
                  <p className="text-xs text-gray-400">Date: {new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <p className='text-primary text-base font-semibold'>
                  {currency}{((item.product?.offerPrice || 0) * (item.quantity || 1))}
                </p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
