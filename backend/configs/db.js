import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const dbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/greencart";
        const connectionInstance = await mongoose.connect(dbUri);

        console.log(`✅ MongoDB connected | Host: ${connectionInstance.connection.host}`);
        return connectionInstance;
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        throw error;
    }
};

export default connectDB;
