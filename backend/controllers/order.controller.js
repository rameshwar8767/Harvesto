import { asyncHandler } from "../utils/asyncHandler.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

// Place Order : POST /api/order/create
export const placeOrder = asyncHandler(async (req, res) => {
    const { items, amount, address, paymentMethod } = req.body;
    const userId = req.userId || req.body.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Order must contain at least one item" });
    }

    if (!address || !amount) {
        return res.status(400).json({ success: false, message: "Address and amount are required" });
    }

    const order = await Order.create({
        userId,
        items,
        amount: Number(amount),
        address,
        paymentMethod: paymentMethod || "COD",
        isPaid: paymentMethod === "Online",
        status: "Order Placed",
    });

    // Clear user cart if user exists
    if (userId) {
        await User.findByIdAndUpdate(userId, { cartItems: {} });
    }

    return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order,
    });
});

// Get User Orders : GET /api/order/user
export const getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.userId || req.body.userId;
    const orders = await Order.find({ userId })
        .populate("items.product")
        .sort({ createdAt: -1 })
        .lean();

    return res.json({
        success: true,
        orders,
    });
});

// Get All Orders (Seller) : GET /api/order/seller/list
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate("items.product")
        .sort({ createdAt: -1 })
        .lean();

    return res.json({
        success: true,
        orders,
    });
});

// Update Order Status : PATCH /api/order/status/:id
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.json({
        success: true,
        message: "Order status updated",
        order,
    });
});

