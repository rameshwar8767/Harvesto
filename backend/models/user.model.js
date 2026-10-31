import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'admin'],
        default: 'user',
    },
    cartItems: {
        type: Object,
        default: {},
    },
}, {
    timestamps: true,
    minimize: false,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
