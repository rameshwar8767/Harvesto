import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

// Place Order : POST /api/order/create
export const placeOrder = asyncHandler(async (req, res) => {
    const { items, amount, address, paymentMethod, isPaid, transactionId } = req.body;
    const userId = req.userId || req.body?.userId || "guest";

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Order must contain at least one item" });
    }

    if (!address || amount === undefined) {
        return res.status(400).json({ success: false, message: "Address and amount are required" });
    }

    // Normalize address to prevent missing field validation errors
    const normalizedAddress = {
        firstName: address.firstName || "Customer",
        lastName: address.lastName || "",
        email: address.email || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: String(address.zipCode || address.zipcode || "400001"),
        zipcode: String(address.zipCode || address.zipcode || "400001"),
        country: address.country || "India",
        phone: address.phone || "",
    };

    // Normalize items: capture product id, snapshot name, price, and image
    const normalizedItems = items.map((item) => ({
        product: item.product?._id || item.product || item._id,
        name: item.name || item.product?.name || "Grocery Item",
        price: Number(item.price || item.offerPrice || item.product?.offerPrice || 0),
        image: item.image || item.product?.image || [],
        quantity: Number(item.quantity) || 1,
    }));

    const isOnlinePayment = Boolean(
        isPaid ||
        paymentMethod === "Online" ||
        paymentMethod === "Online UPI" ||
        paymentMethod === "Card" ||
        paymentMethod === "UPI"
    );

    const generatedTxnId = transactionId || (isOnlinePayment ? `TXN_HVT_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}` : "");

    // If MongoDB is not connected, gracefully respond with mock order
    if (mongoose.connection.readyState !== 1) {
        const mockOrder = {
            _id: `ord_${Date.now()}`,
            userId,
            items: normalizedItems,
            amount: Number(amount),
            address: normalizedAddress,
            paymentMethod: paymentMethod || "COD",
            isPaid: isOnlinePayment,
            transactionId: generatedTxnId,
            status: "Order Placed",
            createdAt: new Date().toISOString(),
        };

        return res.status(201).json({
            success: true,
            message: "Order placed successfully (Offline Mode)",
            order: mockOrder,
        });
    }

    const order = await Order.create({
        userId,
        items: normalizedItems,
        amount: Number(amount),
        address: normalizedAddress,
        paymentMethod: paymentMethod || "COD",
        isPaid: isOnlinePayment,
        transactionId: generatedTxnId,
        status: "Order Placed",
    });

    // Automatically decrement stock for each ordered item
    for (const item of normalizedItems) {
        if (mongoose.isValidObjectId(item.product)) {
            const prod = await Product.findById(item.product).catch(() => null);
            if (prod) {
                const currentStock = prod.stock !== undefined ? prod.stock : 25;
                const newStock = Math.max(0, currentStock - item.quantity);
                prod.stock = newStock;
                if (newStock <= 0) {
                    prod.inStock = false;
                }
                await prod.save().catch(() => null);
            }
        }
    }

    // Clear user cart if userId is a valid MongoDB ObjectId
    if (userId && mongoose.isValidObjectId(userId)) {
        await User.findByIdAndUpdate(userId, { cartItems: {} }).catch(() => null);
    }

    return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order,
    });
});

// Get User Orders : GET /api/order/user
export const getUserOrders = asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json({
            success: true,
            orders: [],
        });
    }

    const userId = req.userId || req.body?.userId;
    const query = (userId && userId !== 'guest') ? { userId } : {};

    let orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    // Ensure items.product is always a properly populated object
    orders = orders.map((order) => ({
        ...order,
        items: (order.items || []).map((item) => {
            const productObj = (typeof item.product === 'object' && item.product !== null)
                ? item.product
                : {
                    _id: item.product,
                    name: item.name || "Harvesto Farm Fresh Item",
                    price: item.price || 0,
                    offerPrice: item.price || 0,
                    image: Array.isArray(item.image) && item.image.length > 0 ? item.image : ["https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"],
                    category: "Groceries",
                };
            return {
                ...item,
                product: productObj,
            };
        }),
    }));

    return res.json({
        success: true,
        orders,
    });
});

// Get All Orders (Seller) : GET /api/order/seller/list
export const getAllOrders = asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json({
            success: true,
            orders: [],
        });
    }

    let orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    orders = orders.map((order) => ({
        ...order,
        items: (order.items || []).map((item) => {
            const productObj = (typeof item.product === 'object' && item.product !== null)
                ? item.product
                : {
                    _id: item.product,
                    name: item.name || "Harvesto Farm Fresh Item",
                    price: item.price || 0,
                    offerPrice: item.price || 0,
                    image: Array.isArray(item.image) && item.image.length > 0 ? item.image : ["https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"],
                    category: "Groceries",
                };
            return {
                ...item,
                product: productObj,
            };
        }),
    }));

    return res.json({
        success: true,
        orders,
    });
});

// Update Order Status : PATCH /api/order/status/:id
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (mongoose.connection.readyState !== 1) {
        return res.json({
            success: true,
            message: "Order status updated (Local Mode)",
        });
    }

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
