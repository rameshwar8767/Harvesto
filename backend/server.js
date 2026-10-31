import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./configs/db.js";

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(PORT, () => {
            console.log(`🚀 Harvesto backend server running on port ${PORT}`);
        });

        // Graceful shutdown handling
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
            if (server) {
                server.close(async () => {
                    console.log("🔒 HTTP server closed.");
                    try {
                        await mongoose.connection.close(false);
                        console.log("🔒 MongoDB connection disconnected.");
                        process.exit(0);
                    } catch (err) {
                        console.error("Error closing MongoDB connection:", err);
                        process.exit(1);
                    }
                });
            } else {
                process.exit(0);
            }
        };

        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    } catch (error) {
        console.error("❌ Failed to start server due to MongoDB error:", error.message);
        process.exit(1);
    }
};

startServer();
