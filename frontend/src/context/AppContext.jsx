import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { toast } from "react-hot-toast";
import { authApi, productApi } from "../api";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || '₹';
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('greencart_items');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    const [searchQuery, setSearchQuery] = useState("");

    // Sync cart with localStorage
    useEffect(() => {
        try {
            localStorage.setItem('greencart_items', JSON.stringify(cartItems));
        } catch (e) {
            console.error("Failed to save cart to localStorage", e);
        }
    }, [cartItems]);

    // Check existing authentication sessions on initial mount
    useEffect(() => {
        const verifySession = async () => {
            try {
                const userRes = await authApi.checkAuth().catch(() => null);
                if (userRes && userRes.success && userRes.user) {
                    setUser(userRes.user);
                }
            } catch {
                // Session not active
            }

            try {
                const sellerRes = await authApi.checkSellerAuth().catch(() => null);
                if (sellerRes && sellerRes.success && sellerRes.isSeller) {
                    setIsSeller(true);
                }
            } catch {
                // Seller session not active
            }
        };

        verifySession();
    }, []);

    const addToCart = (itemId) => {
        if (!itemId) return;
        const targetProduct = products.find((p) => p._id === itemId);
        if (targetProduct && (targetProduct.inStock === false || (targetProduct.stock !== undefined && targetProduct.stock <= 0))) {
            toast.error("Sorry, this item is out of stock!");
            return;
        }

        const cartData = structuredClone(cartItems);
        const currentQty = cartData[itemId] || 0;
        if (targetProduct && targetProduct.stock !== undefined && currentQty >= targetProduct.stock) {
            toast.error(`Only ${targetProduct.stock} unit(s) available in stock!`);
            return;
        }

        if (cartData[itemId]) {
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Added to cart");
    };

    const decrementStock = (orderedItems) => {
        if (!Array.isArray(orderedItems)) return;
        setProducts((prev) =>
            prev.map((prod) => {
                const match = orderedItems.find(
                    (item) => item.product === prod._id || item._id === prod._id
                );
                if (match) {
                    const currentStock = prod.stock !== undefined ? prod.stock : 25;
                    const newStock = Math.max(0, currentStock - (match.quantity || 1));
                    return {
                        ...prod,
                        stock: newStock,
                        inStock: newStock > 0,
                    };
                }
                return prod;
            })
        );
    };

    const updateCartItem = (itemId, quantity) => {
        if (!itemId) return;
        const cartData = structuredClone(cartItems);
        if (quantity <= 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
        toast.success("Cart updated");
    };

    const removeFromCart = (itemId) => {
        if (!itemId) return;
        const cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0) {
                delete cartData[itemId];
            }
        }
        setCartItems(cartData);
        toast.success("Removed from cart");
    };

    const fetchProducts = useCallback(async () => {
        try {
            const data = await productApi.getAll().catch(() => null);
            if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
                setProducts(data.products);
                return;
            }
            setProducts(dummyProducts);
        } catch (error) {
            console.warn("Using fallback dummy products:", error);
            setProducts(dummyProducts);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getCartCount = () => {
        let totalCount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalCount += cartItems[item];
            }
        }
        return totalCount;
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            const itemInfo = products.find((product) => product._id === item);
            if (itemInfo && cartItems[item] > 0) {
                const price = typeof itemInfo.offerPrice === 'number' ? itemInfo.offerPrice : Number(itemInfo.offerPrice) || 0;
                totalAmount += price * cartItems[item];
            }
        }
        return Math.floor(totalAmount);
    };

    const value = {
        backendUrl,
        navigate,
        getCartCount,
        getCartAmount,
        user,
        setUser,
        isSeller,
        setIsSeller,
        currency,
        showUserLogin,
        setShowUserLogin,
        products,
        setProducts,
        fetchProducts,
        cartItems,
        setCartItems,
        addToCart,
        decrementStock,
        updateCartItem,
        removeFromCart,
        searchQuery,
        setSearchQuery
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};
