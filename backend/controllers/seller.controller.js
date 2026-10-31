import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

// Login Seller : POST /api/seller/login
export const loginSeller = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });  
    }
  
    const expectedEmail = process.env.SELLER_EMAIL || "admin@greencart.com";
    const expectedPassword = process.env.SELLER_PASSWORD || "admin123456";

    if (email !== expectedEmail || password !== expectedPassword) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ email, role: 'seller' }, process.env.JWT_SECRET || 'greencart_jwt_secret', { expiresIn: "7d" });
    
    res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ 
        success: true, 
        message: "Seller logged in successfully",
        seller: { email, role: 'seller' }
    });
});

// Seller isAuth : GET /api/seller/is-auth (Protected by authSeller)
export const isSellerAuth = asyncHandler(async (req, res) => {
    return res.json({ success: true, isSeller: true });
});

// Logout Seller : GET /api/seller/logout
export const logoutSeller = asyncHandler(async (req, res) => {
    res.clearCookie("sellerToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Seller logged out successfully" });
});
