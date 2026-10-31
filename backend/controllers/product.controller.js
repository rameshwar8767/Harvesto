import { asyncHandler } from "../utils/asyncHandler.js";
import Product from "../models/product.model.js";

// Add Product : POST /api/product/add
export const addProduct = asyncHandler(async (req, res) => {
    const { name, price, offerPrice, description, category, inStock, image } = req.body;

    if (!name || price === undefined || offerPrice === undefined || !category) {
        return res.status(400).json({
            success: false,
            message: "Name, price, offerPrice, and category are required",
        });
    }

    const descArray = Array.isArray(description)
        ? description
        : typeof description === "string"
        ? description.split("\n").filter(Boolean)
        : [];

    const imageArray = Array.isArray(image) ? image : image ? [image] : [];

    const product = await Product.create({
        name,
        price: Number(price),
        offerPrice: Number(offerPrice),
        description: descArray,
        category: category.toLowerCase(),
        image: imageArray,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
    });

    return res.status(201).json({
        success: true,
        message: "Product added successfully",
        product,
    });
});

// Get Products : GET /api/product/list
export const getProducts = asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
        filter.category = category.toLowerCase();
    }

    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    return res.json({
        success: true,
        count: products.length,
        products,
    });
});

// Get Product by ID : GET /api/product/:id
export const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).lean();

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    return res.json({
        success: true,
        product,
    });
});

// Update Product : PUT /api/product/update/:id
export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.offerPrice !== undefined) updateData.offerPrice = Number(updateData.offerPrice);
    if (updateData.category) updateData.category = updateData.category.toLowerCase();

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    return res.json({
        success: true,
        message: "Product updated successfully",
        product,
    });
});

// Toggle / Change Product inStock : PATCH /api/product/stock/:id
export const changeStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    product.inStock = req.body.inStock !== undefined ? Boolean(req.body.inStock) : !product.inStock;
    await product.save();

    return res.json({
        success: true,
        message: `Product stock updated to ${product.inStock ? "In Stock" : "Out of Stock"}`,
        product,
    });
});

// Delete Product : DELETE /api/product/:id
export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    return res.json({
        success: true,
        message: "Product deleted successfully",
    });
});
