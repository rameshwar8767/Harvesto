import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.Mixed,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    name: { type: String },
    price: { type: Number },
    image: { type: Array },
}, { _id: false });

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.Mixed,
        default: 'guest',
    },
    items: {
        type: [orderItemSchema],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    address: {
        firstName: { type: String, default: 'Customer' },
        lastName: { type: String, default: '' },
        email: { type: String, default: '' },
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        zipcode: { type: String, default: '' },
        country: { type: String, default: 'India' },
        phone: { type: String, default: '' },
    },
    status: {
        type: String,
        enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Order Placed',
    },
    paymentMethod: {
        type: String,
        default: 'COD',
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    transactionId: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Indexes for fast customer query lookup and seller status filtering
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
