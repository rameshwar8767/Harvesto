import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const SellerLogin = () => {
    const { isSeller, setIsSeller, navigate } = useAppContext();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (isSeller) {
            navigate('/seller');
        }
    }, [isSeller, navigate]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        // Sets seller authenticated locally
        setIsSeller(true);
    };

    return !isSeller && (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center text-sm text-gray-600 px-4'> 
            <div className='flex flex-col gap-5 m-auto items-start p-8 py-10 w-full max-w-sm rounded-lg shadow-lg border border-gray-200 bg-white'>
                <p className='text-2xl font-medium mx-auto'>
                    <span className='text-primary'>Seller </span>Login
                </p>

                <div className='w-full'>
                    <label className='block text-xs font-semibold uppercase text-gray-500 mb-1'>Email</label>
                    <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        className='border border-gray-300 rounded w-full p-2.5 outline-primary text-gray-800' 
                        type="email"  
                        placeholder='seller@greencart.com' 
                        required
                    />
                </div>
                <div className='w-full'>
                    <label className='block text-xs font-semibold uppercase text-gray-500 mb-1'>Password</label>
                    <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        className='border border-gray-300 rounded w-full p-2.5 outline-primary text-gray-800'  
                        type="password" 
                        placeholder='••••••••' 
                        required 
                    />
                </div>

                <button type="submit" className='bg-primary hover:bg-primary-dull transition-colors text-white w-full py-2.5 rounded-md font-medium cursor-pointer mt-2'>
                    Login as Seller
                </button>
            </div>
        </form>
    );
};

export default SellerLogin;
