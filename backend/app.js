import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import connectDB from './configs/db.js';
import apiRouter from './routes/index.js';
import { securityHeaders, sanitizeInput } from './middlewares/security.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Apply security HTTP headers and request sanitization
app.use(securityHeaders);
app.use(sanitizeInput);

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
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];

    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors || {}).map((e) => e.message);
    }

    // Handle Mongoose Bad ObjectId (CastError)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid format for resource identifier: ${err.value}`;
    }

    // Handle MongoDB Duplicate Key Error (E11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `A record with this ${field} already exists`;
    }

    if (process.env.NODE_ENV !== 'production') {
        console.error(`[Server Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
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
