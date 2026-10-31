import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    offerPrice: {
        type: Number,
        required: true,
    },
    description: {
        type: Array,
        required: true,
    },
    image: {
        type: Array,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    inStock: {
        type: Boolean,
        required: true,
        default: true,
    }
}, {
    timestamps: true,
});

// Indexes for query performance and fast category / text search
productSchema.index({ category: 1, inStock: 1, offerPrice: 1 });
productSchema.index({ name: 'text' });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
