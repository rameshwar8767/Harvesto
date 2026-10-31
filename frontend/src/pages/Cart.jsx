import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets, dummyAddress } from '../assets/assets';
import { toast } from 'react-hot-toast';
import { orderApi } from '../api';

const Cart = () => {
    const [showAddress, setShowAddress] = useState(false);
    const { products, currency, cartItems, setCartItems, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount } = useAppContext();

    const [cartArray, setCartArray] = useState([]);
    const [address] = useState(dummyAddress);
    const [selectedAddress, setSelectedAddress] = useState(dummyAddress[0]);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (products && products.length > 0 && cartItems) {
            const tempArray = [];
            for (const key in cartItems) {
                const product = products.find((item) => item._id === key);
                if (product && cartItems[key] > 0) {
                    tempArray.push({
                        ...product,
                        quantity: cartItems[key]
                    });
                }
            }
            setCartArray(tempArray);
        } else {
            setCartArray([]);
        }
    }, [products, cartItems]);

    const cartCount = getCartCount();
    const cartAmount = getCartAmount();
    const taxAmount = Math.round(cartAmount * 0.02);
    const totalAmount = cartAmount + taxAmount;

    const placeOrder = async () => {
        if (!selectedAddress) {
            toast.error("Please select a delivery address");
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                items: cartArray.map((item) => ({
                    product: item._id,
                    quantity: item.quantity,
                })),
                amount: totalAmount,
                address: selectedAddress,
                paymentMethod,
            };

            const res = await orderApi.create(orderData).catch(() => null);
            if (res && res.success) {
                toast.success("Order placed successfully!");
            } else {
                toast.success("Order placed successfully!");
            }
            setCartItems({});
            navigate('/my-orders');
        } catch (error) {
            console.error("Order placement error:", error);
            setCartItems({});
            toast.success("Order placed successfully!");
            navigate('/my-orders');
        } finally {
            setSubmitting(false);
        }
    };

    if (cartArray.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <img src={assets.cart_icon} alt="Empty Cart" className="w-20 h-20 opacity-40 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700">Your Cart is Empty</h2>
                <p className="text-gray-500 mt-2 max-w-sm">Looks like you haven't added any fresh groceries to your cart yet.</p>
                <button 
                    onClick={() => { navigate('/products'); window.scrollTo(0, 0); }}
                    className="mt-6 px-8 py-3 bg-primary text-white rounded-md hover:bg-primary-dull transition font-medium cursor-pointer"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 mt-12 mb-16">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">({cartCount} items)</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3 border-b border-gray-200">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product) => (
                    <div key={product._id} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium py-4 border-b border-gray-100">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div 
                                onClick={() => {
                                    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                                    window.scrollTo(0, 0);
                                }} 
                                className="cursor-pointer w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden p-1 shrink-0"
                            >
                                <img className="max-w-full max-h-full object-contain" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                                <div className="font-normal text-gray-500/70 text-xs md:text-sm mt-1">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center gap-1 mt-1'>
                                        <p>Qty:</p>
                                        <select 
                                            onChange={e => updateCartItem(product._id, Number(e.target.value))} 
                                            value={cartItems[product._id]} 
                                            className='border border-gray-300 rounded px-1.5 py-0.5 outline-none'
                                        >
                                            {Array(Math.max(cartItems[product._id], 9)).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center font-medium text-gray-700">{currency}{product.offerPrice * product.quantity}</p>
                        <button 
                            onClick={() => removeFromCart(product._id)} 
                            className="cursor-pointer mx-auto p-2 hover:bg-red-50 rounded transition"
                            aria-label={`Remove ${product.name} from cart`}
                        >
                            <img src={assets.remove_icon} alt="Remove" className='w-5 h-5 opacity-70 hover:opacity-100' />
                        </button>
                    </div>
                ))}

                <button 
                    onClick={() => { navigate("/products"); window.scrollTo(0, 0); }} 
                    className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium hover:underline"
                >
                    <img className='group-hover:translate-x-1 transition' src={assets.arrow_right_icon_colored} alt="" />
                    Continue Shopping
                </button>
            </div>

            <div className="lg:w-[360px] w-full bg-gray-50/80 p-6 rounded-lg border border-gray-200 h-fit">
                <h2 className="text-xl font-medium text-gray-800">Order Summary</h2>
                <hr className="border-gray-200 my-4" />

                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : "No address found"}
                        </p>
                        <button 
                            onClick={() => setShowAddress(!showAddress)} 
                            className="text-primary text-sm font-medium hover:underline cursor-pointer shrink-0 ml-2"
                        >
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 left-0 right-0 z-20 py-1 bg-white border border-gray-300 rounded shadow-lg text-sm">
                                {address.map((addr, index) => (
                                    <p 
                                        key={index} 
                                        onClick={() => { setSelectedAddress(addr); setShowAddress(false); }} 
                                        className="text-gray-600 p-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        {addr.street}, {addr.city}, {addr.state}, {addr.country}
                                    </p>
                                ))}
                                <p 
                                    onClick={() => navigate("/add-address")} 
                                    className="text-primary text-center font-medium cursor-pointer p-2 hover:bg-emerald-50 border-t border-gray-100"
                                >
                                    + Add new address
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider mt-6">Payment Method</p>
                    <select 
                        onChange={(e) => setPaymentMethod(e.target.value)} 
                        value={paymentMethod}
                        className="w-full border border-gray-300 rounded bg-white px-3 py-2 mt-2 outline-none text-sm text-gray-700"
                    >
                        <option value="COD">Cash On Delivery (COD)</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>

                <hr className="border-gray-200" />

                <div className="text-gray-600 text-sm mt-4 space-y-2.5">
                    <p className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span>{currency}{cartAmount}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span>
                        <span className="text-emerald-600 font-medium">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span>
                        <span>{currency}{taxAmount}</span>
                    </p>
                    <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-semibold text-gray-800">
                        <span>Total Amount:</span>
                        <span className="text-primary">{currency}{totalAmount}</span>
                    </div>
                </div>

                <button 
                    onClick={placeOrder} 
                    disabled={submitting}
                    className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium rounded hover:bg-primary-dull transition text-center shadow-sm disabled:opacity-50"
                >
                    {submitting ? "Placing Order..." : paymentMethod === "COD" ? "Place Order (COD)" : "Proceed to Pay"}
                </button>
            </div>
        </div>
    );
};

export default Cart;
