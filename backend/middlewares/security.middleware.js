/**
 * Security Middleware for GreenCart / Harvesto Backend
 * Implements:
 * 1. HTTP Security Headers (Strict headers without external dependencies)
 * 2. Sliding window Rate Limiter for authentication and sensitive routes
 * 3. NoSQL Injection & Query Sanitization
 */

// In-memory sliding window rate limiter
const requestCounts = new Map();

export const rateLimiter = ({
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // max 100 requests per IP within window
    message = "Too many requests from this IP, please try again later",
} = {}) => {
    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const record = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
        } else {
            record.count += 1;
        }

        requestCounts.set(ip, record);

        // Periodically clean up expired entries
        if (requestCounts.size > 1000) {
            for (const [key, value] of requestCounts.entries()) {
                if (now > value.resetTime) requestCounts.delete(key);
            }
        }

        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

        if (record.count > max) {
            return res.status(429).json({
                success: false,
                message,
                retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
            });
        }

        next();
    };
};

// Strict auth rate limiter (max 15 login/register attempts per 15 minutes)
export const authRateLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
});

// Security headers middleware
export const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.removeHeader('X-Powered-By');
    next();
};

// Basic NoSQL operator sanitization
export const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$')) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    if (req.query) sanitize(req.query);
    next();
};

