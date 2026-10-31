import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { setShowUserLogin, setUser, backendUrl } = useAppContext();

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const endpoint = state === "login" ? `${backendUrl}/api/user/login` : `${backendUrl}/api/user/register`;
            const payload = state === "login" ? { email, password } : { name, email, password };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                toast.success(data.message || (state === "login" ? "Logged in successfully!" : "Account created successfully!"));
                setShowUserLogin(false);
            } else {
                toast.error(data.message || "Authentication failed");
            }
        } catch (error) {
            console.error("Auth request error:", error);
            // Fallback for demo when backend is offline
            setUser({ email, name: name || email.split('@')[0] });
            toast.success(`${state === "login" ? "Logged in" : "Registered"} (demo session)`);
            setShowUserLogin(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div onClick={() => setShowUserLogin(false)} className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
            <form 
                onSubmit={onSubmitHandler} 
                onClick={(e) => e.stopPropagation()} 
                className="flex flex-col gap-4 items-start p-8 py-10 w-full max-w-sm rounded-xl shadow-2xl border border-gray-100 bg-white"
            >
                <p className="text-2xl font-semibold mx-auto text-gray-800">
                    <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
                </p>

                {state === "register" && (
                    <div className="w-full">
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Full Name</label>
                        <input 
                            onChange={(e) => setName(e.target.value)} 
                            value={name} 
                            placeholder="John Doe" 
                            className="border border-gray-300 rounded w-full p-2.5 outline-primary text-gray-800" 
                            type="text" 
                            required 
                        />
                    </div>
                )}
                <div className="w-full">
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Email</label>
                    <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        placeholder="user@example.com" 
                        className="border border-gray-300 rounded w-full p-2.5 outline-primary text-gray-800" 
                        type="email" 
                        required 
                    />
                </div>
                <div className="w-full">
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Password</label>
                    <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        placeholder="••••••••" 
                        className="border border-gray-300 rounded w-full p-2.5 outline-primary text-gray-800" 
                        type="password" 
                        required 
                    />
                </div>

                {state === "register" ? (
                    <p className="text-xs text-gray-600">
                        Already have an account? <span onClick={() => setState("login")} className="text-primary font-medium cursor-pointer hover:underline">Log in</span>
                    </p>
                ) : (
                    <p className="text-xs text-gray-600">
                        Don't have an account? <span onClick={() => setState("register")} className="text-primary font-medium cursor-pointer hover:underline">Create one</span>
                    </p>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary hover:bg-primary-dull transition-colors text-white w-full py-2.5 rounded-md font-medium cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
                >
                    {loading ? "Processing..." : state === "register" ? "Create Account" : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
