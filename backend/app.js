import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import connectDB from './configs/db.js';
import apiRouter from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Allow local frontend origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('GreenCart API is running');
});

// Centralized API Router
app.use('/api', apiRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    });
});

// Allow running directly via "node app.js" while also being imported by server.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const startServer = async () => {
        try {
            await connectDB();
            app.listen(PORT, () => {
                console.log(`🚀 GreenCart backend server running on port ${PORT}`);
            });
        } catch (error) {
            console.error("❌ Failed to start server due to MongoDB error:", error.message);
        }
    };
    startServer();
}

export default app;
