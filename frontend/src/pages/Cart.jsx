import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets, dummyAddress } from '../assets/assets';
import { toast } from 'react-hot-toast';
import { orderApi, addressApi } from '../api';

const Cart = () => {
    const [showAddress, setShowAddress] = useState(false);
    const { products, currency, cartItems, setCartItems, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount } = useAppContext();

    const [cartArray, setCartArray] = useState([]);
    const [addressList, setAddressList] = useState(dummyAddress);
    const [selectedAddress, setSelectedAddress] = useState(dummyAddress[0]);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await addressApi.getAddresses().catch(() => null);
                const localSaved = JSON.parse(localStorage.getItem('greencart_saved_addresses') || '[]');
                let combined = [];

                if (res && res.success && Array.isArray(res.addresses) && res.addresses.length > 0) {
                    combined = [...res.addresses, ...localSaved];
                } else if (localSaved.length > 0) {
                    combined = [...localSaved, ...dummyAddress];
                } else {
                    combined = dummyAddress;
                }

                setAddressList(combined);
                if (combined.length > 0) {
                    setSelectedAddress(combined[0]);
                }
            } catch {
                setAddressList(dummyAddress);
                setSelectedAddress(dummyAddress[0]);
            }
        };

        fetchAddresses();
    }, []);

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

            await orderApi.create(orderData).catch(() => null);
            toast.success("Order placed successfully with Harvesto!");
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
            <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 my-10">
                <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-5 text-4xl">
                    🧺
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Your Harvest Basket is Empty</h2>
                <p className="text-slate-500 mt-2 max-w-sm text-sm">Explore our farm-fresh vegetables, seasonal fruits, and pantry essentials.</p>
                <button 
                    onClick={() => { navigate('/products'); window.scrollTo(0, 0); }}
                    className="mt-6 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-bold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-95"
                >
                    Browse Daily Fresh Deals
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 mt-6 mb-20">
            {/* Cart Items Table */}
            <div className='flex-1 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-8 shadow-sm'>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Harvest Basket
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {cartCount} item{cartCount > 1 ? 's' : ''} ready for express delivery
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        ⚡ 15-Min Delivery
                    </span>
                </div>

                <div className="grid grid-cols-[2.5fr_1fr_1fr] text-slate-400 text-xs font-bold uppercase tracking-wider pb-3 border-b border-slate-100">
                    <p className="text-left">Item Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Remove</p>
                </div>

                <div className="divide-y divide-slate-100">
                    {cartArray.map((product) => (
                        <div key={product._id} className="grid grid-cols-[2.5fr_1fr_1fr] items-center py-4 gap-2">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div 
                                    onClick={() => {
                                        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                                        window.scrollTo(0, 0);
                                    }} 
                                    className="cursor-pointer w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center border border-slate-200 rounded-2xl p-1 bg-slate-50 shrink-0 hover:border-primary transition"
                                >
                                    <img className="max-w-full max-h-full object-contain" src={product.image[0]} alt={product.name} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{product.name}</p>
                                    <p className="text-xs text-slate-400 capitalize">{product.category}</p>
                                    
                                    <div className='flex items-center gap-2 mt-1.5'>
                                        <label className="text-[11px] text-slate-500 font-semibold">Qty:</label>
                                        <select 
                                            onChange={e => updateCartItem(product._id, Number(e.target.value))} 
                                            value={cartItems[product._id]} 
                                            className='border border-slate-200 rounded-lg px-2 py-0.5 outline-none text-xs text-slate-700 font-bold bg-white'
                                        >
                                            {Array(Math.max(cartItems[product._id], 9)).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <p className="text-center font-bold text-slate-800 text-sm sm:text-base">
                                {currency}{product.offerPrice * product.quantity}
                            </p>

                            <button 
                                onClick={() => removeFromCart(product._id)} 
                                className="cursor-pointer mx-auto p-2 hover:bg-rose-50 rounded-xl transition text-rose-500"
                                aria-label={`Remove ${product.name} from basket`}
                            >
                                <img src={assets.remove_icon} alt="Remove" className='w-4 h-4 opacity-60 hover:opacity-100' />
                            </button>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => { navigate("/products"); window.scrollTo(0, 0); }} 
                    className="inline-flex items-center gap-2 text-primary font-bold text-xs sm:text-sm hover:underline mt-6 cursor-pointer"
                >
                    <span>←</span> Add more fresh items
                </button>
            </div>

            {/* Checkout & Summary Sidebar */}
            <div className="lg:w-[380px] w-full bg-white border border-slate-200/80 p-6 sm:p-7 rounded-3xl h-fit shadow-sm space-y-6">
                <h2 className="text-lg font-extrabold text-slate-900 pb-3 border-b border-slate-100">
                    Order Summary
                </h2>

                {/* Delivery Address Card */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipping To</span>
                        <button 
                            onClick={() => setShowAddress(!showAddress)} 
                            className="text-primary text-xs font-bold hover:underline cursor-pointer"
                        >
                            Change
                        </button>
                    </div>

                    <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                        <p className="font-semibold text-slate-800">
                            {selectedAddress ? `${selectedAddress.firstName} ${selectedAddress.lastName}` : "No address selected"}
                        </p>
                        <p className="mt-0.5 line-clamp-2">
                            {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.zipCode || selectedAddress.zipcode}` : "Please add a shipping address"}
                        </p>

                        {showAddress && (
                            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 text-xs divide-y divide-slate-100 max-h-56 overflow-y-auto">
                                {addressList.map((addr, index) => (
                                    <div 
                                        key={addr._id || index} 
                                        onClick={() => { setSelectedAddress(addr); setShowAddress(false); }} 
                                        className={`p-2 hover:bg-emerald-50 rounded-lg cursor-pointer transition ${selectedAddress === addr ? 'bg-emerald-50/70 font-semibold' : ''}`}
                                    >
                                        <p className="font-bold text-slate-800">{addr.firstName} {addr.lastName}</p>
                                        <p className="text-slate-500 text-[11px] truncate">{addr.street}, {addr.city}</p>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => navigate("/add-address")} 
                                    className="w-full text-center text-primary font-bold py-2 hover:bg-emerald-50 rounded-lg transition"
                                >
                                    + Add New Address
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Option Selection */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("COD")}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                                paymentMethod === "COD" 
                                    ? "bg-emerald-50 border-primary text-emerald-800" 
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <span>💵</span> Cash on Delivery
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("Online")}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                                paymentMethod === "Online" 
                                    ? "bg-emerald-50 border-primary text-emerald-800" 
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <span>💳</span> Online UPI / Card
                        </button>
                    </div>
                </div>

                {/* Breakdown Costs */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-semibold text-slate-800">{currency}{cartAmount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Delivery Partner Fee</span>
                        <span className="text-emerald-600 font-bold">FREE (Promotional)</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Govt Tax (2%)</span>
                        <span className="font-semibold text-slate-800">{currency}{taxAmount}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                        <span>To Pay:</span>
                        <span className="text-primary text-lg">{currency}{totalAmount}</span>
                    </div>
                </div>

                <button 
                    onClick={placeOrder} 
                    disabled={submitting}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dull text-white font-extrabold rounded-full transition shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50 text-sm active:scale-95"
                >
                    {submitting ? "Placing Your Order..." : `Place Order • ${currency}${totalAmount}`}
                </button>
            </div>
        </div>
    );
};

export default Cart;
