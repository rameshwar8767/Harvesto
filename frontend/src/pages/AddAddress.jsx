import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

// Declared outside to prevent re-creation and loss of cursor focus on keystrokes
const InputField = ({ type, placeholder, name, handleChange, value }) => (
    <input 
        className='w-full px-3 py-2.5 border border-gray-300 rounded outline-none text-gray-700 focus:border-primary transition'
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={handleChange}
        value={value}
        required
    />
);

const AddAddress = () => {
    const { navigate } = useAppContext();
    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
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
        toast.success("Shipping address saved successfully!");
        navigate('/cart');
    };

    return (
        <div className='mt-12 pb-16'>
            <p className='text-2xl md:text-3xl text-gray-700 font-medium'>
                Add Shipping <span className='font-semibold text-primary'>Address</span>
            </p>

            <div className='flex flex-col-reverse md:flex-row justify-between items-start gap-12 mt-8'>
                <div className='flex-1 max-w-lg w-full'>
                    <form onSubmit={onSubmitHandler} className='space-y-3.5 text-sm'>
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField 
                                handleChange={handleChange} 
                                value={address.firstName} 
                                type="text" 
                                name='firstName' 
                                placeholder="First Name" 
                            />
                            <InputField 
                                handleChange={handleChange} 
                                value={address.lastName} 
                                type="text" 
                                name='lastName'  
                                placeholder="Last Name" 
                            />
                        </div>
                        <InputField 
                            handleChange={handleChange} 
                            type="email" 
                            value={address.email} 
                            name='email'  
                            placeholder="Email address" 
                        />
                        <InputField 
                            handleChange={handleChange} 
                            value={address.street}  
                            name='street' 
                            type="text" 
                            placeholder="Street Address" 
                        />

                        <div className='grid grid-cols-2 gap-4'>
                            <InputField 
                                handleChange={handleChange} 
                                value={address.city}  
                                name='city' 
                                type="text" 
                                placeholder="City" 
                            />
                            <InputField 
                                handleChange={handleChange} 
                                value={address.state}  
                                name='state' 
                                type="text" 
                                placeholder="State" 
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <InputField 
                                handleChange={handleChange} 
                                value={address.zipCode}  
                                name='zipCode' 
                                type="text" 
                                placeholder="Zip Code" 
                            />
                            <InputField 
                                handleChange={handleChange} 
                                value={address.country} 
                                type="text" 
                                name='country'  
                                placeholder="Country" 
                            />
                        </div>
                        <InputField 
                            handleChange={handleChange} 
                            value={address.phone} 
                            type="tel" 
                            name='phone'  
                            placeholder="Phone number" 
                        />
                        <button 
                            type='submit' 
                            className='w-full px-4 py-3 text-white bg-primary hover:bg-primary-dull transition duration-300 rounded font-medium cursor-pointer uppercase tracking-wider mt-2'
                        >
                            Save Address
                        </button>
                    </form>
                </div>
                <div className="hidden md:flex justify-center items-center w-80">
                    <img className='max-w-full h-auto' src={assets.add_address_iamge} alt="Shipping Address Illustration" />
                </div>
            </div>
        </div>
    );
};

export default AddAddress;
