import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets, dummyOrders } from '../../assets/assets';

const Orders = () => {
    const { currency } = useAppContext();
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        setOrders(dummyOrders);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-xl font-medium text-gray-800">Orders List</h2>
                {orders.map((order, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center gap-5 p-5 max-w-4xl justify-between rounded-md border border-gray-200 bg-white shadow-sm">
                        <div className="flex gap-4 max-w-xs">
                            <img className="w-12 h-12 object-contain shrink-0" src={assets.box_icon} alt="boxIcon" />
                            <div>
                                {order.items.map((item, itemIdx) => (
                                    <p key={itemIdx} className="font-medium text-gray-800 text-sm">
                                        {item.product?.name || "Product"} <span className="text-primary font-bold">x {item.quantity}</span>
                                    </p>
                                ))}
                            </div>
                        </div>

                        <div className="text-sm text-gray-600">
                            <p className='font-semibold text-gray-800'>{order.address.firstName} {order.address.lastName}</p>
                            <p>{order.address.street}, {order.address.city}</p>
                            <p>{order.address.state}, {order.address.zipcode || order.address.zipCode}, {order.address.country}</p>
                            <p className="text-xs text-gray-500 mt-1">{order.address.phone}</p>
                        </div>

                        <p className="font-semibold text-lg text-primary">{currency}{order.amount}</p>

                        <div className="flex flex-col text-xs md:text-sm text-gray-500 gap-1">
                            <p><span className="font-medium text-gray-700">Method:</span> {order.paymentType || order.paymentMethod || "COD"}</p>
                            <p><span className="font-medium text-gray-700">Date:</span> {new Date(order.createdAt || order.cratedAt || Date.now()).toLocaleDateString()}</p>
                            <p>
                                <span className="font-medium text-gray-700">Payment: </span>
                                <span className={order.isPaid ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                                    {order.isPaid ? "Paid" : "Pending"}
                                </span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
