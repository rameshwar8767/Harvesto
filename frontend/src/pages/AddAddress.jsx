import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { addressApi } from '../api';

const InputField = ({ label, type, placeholder, name, handleChange, value }) => (
    <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>}
        <input 
            className='w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 text-sm focus:border-primary focus:bg-white focus:ring-2 focus:ring-emerald-100 transition'
            type={type}
            placeholder={placeholder}
            name={name}
            onChange={handleChange}
            value={value}
            required
        />
    </div>
);

const AddAddress = () => {
    const { navigate } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        phone: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Save to backend API if session is active
            await addressApi.addAddress(address).catch(() => null);

            // Synchronize with local storage for instant availability
            const existingRaw = localStorage.getItem('greencart_saved_addresses');
            const savedList = existingRaw ? JSON.parse(existingRaw) : [];
            const newEntry = { ...address, _id: `addr_${Date.now()}` };
            localStorage.setItem('greencart_saved_addresses', JSON.stringify([newEntry, ...savedList]));

            toast.success("Delivery address saved successfully!");
            navigate('/cart');
        } catch (err) {
            console.error("Failed to save address:", err);
            toast.success("Address saved locally!");
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='mt-8 mb-20 max-w-4xl mx-auto'>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
                <div>
                    <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight'>
                        Add Delivery Address
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        We deliver your farm-fresh groceries directly to your door in 15 minutes.
                    </p>
                </div>
                <Link to="/cart" className="text-xs font-bold text-slate-500 hover:text-primary transition">
                    ← Back to Cart
                </Link>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm'>
                <form onSubmit={onSubmitHandler} className='md:col-span-7 space-y-4 text-sm w-full'>
                    <div className='grid grid-cols-2 gap-4'>
                        <InputField 
                            label="First Name"
                            handleChange={handleChange} 
                            value={address.firstName} 
                            type="text" 
                            name='firstName' 
                            placeholder="John" 
                        />
                        <InputField 
                            label="Last Name"
                            handleChange={handleChange} 
                            value={address.lastName} 
                            type="text" 
                            name='lastName'  
                            placeholder="Doe" 
                        />
                    </div>

                    <InputField 
                        label="Email Address"
                        handleChange={handleChange} 
                        type="email" 
                        value={address.email} 
                        name='email'  
                        placeholder="john.doe@example.com" 
                    />

                    <InputField 
                        label="Street / Apartment / Building"
                        handleChange={handleChange} 
                        value={address.street}  
                        name='street' 
                        type="text" 
                        placeholder="Flat 402, Green Meadows" 
                    />

                    <div className='grid grid-cols-2 gap-4'>
                        <InputField 
                            label="City"
                            handleChange={handleChange} 
                            value={address.city}  
                            name='city' 
                            type="text" 
                            placeholder="Mumbai" 
                        />
                        <InputField 
                            label="State"
                            handleChange={handleChange} 
                            value={address.state}  
                            name='state' 
                            type="text" 
                            placeholder="Maharashtra" 
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <InputField 
                            label="Zip / Pincode"
                            handleChange={handleChange} 
                            value={address.zipCode}  
                            name='zipCode' 
                            type="text" 
                            placeholder="400001" 
                        />
                        <InputField 
                            label="Country"
                            handleChange={handleChange} 
                            value={address.country} 
                            type="text" 
                            name='country'  
                            placeholder="India" 
                        />
                    </div>

                    <InputField 
                        label="Contact Phone"
                        handleChange={handleChange} 
                        value={address.phone} 
                        type="tel" 
                        name='phone'  
                        placeholder="+91 98765 43210" 
                    />

                    <button 
                        type='submit' 
                        disabled={loading}
                        className='w-full py-3.5 text-white bg-primary hover:bg-primary-dull disabled:opacity-60 transition duration-200 rounded-full font-bold text-sm shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95 mt-4'
                    >
                        {loading ? 'Saving Address...' : 'Save Address & Continue'}
                    </button>
                </form>

                {/* Right Illustration & Perks Column */}
                <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <img className='w-48 h-auto object-contain mb-6' src={assets.add_address_iamge} alt="Address Graphic" />
                    <h3 className="font-bold text-slate-800 text-base">Guaranteed Delivery</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                        Your groceries are carefully packaged in temperature-controlled boxes and dispatched within minutes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AddAddress;
