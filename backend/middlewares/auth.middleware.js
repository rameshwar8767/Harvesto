import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
    const { token } = req.cookies || {};
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    try {
        const secret = process.env.JWT_SECRET || 'greencart_jwt_secret';
        const tokenDecode = jwt.verify(token, secret);

        if (tokenDecode && tokenDecode.id) {
            req.userId = tokenDecode.id;
            if (!req.body) req.body = {};
            req.body.userId = tokenDecode.id;
            next();
        } else {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token payload" });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
};

// Optional auth: Attaches userId if logged in, but does not block guests
export const optionalAuthUser = async (req, res, next) => {
    const { token } = req.cookies || {};
    if (!token) {
        req.userId = 'guest';
        return next();
    }

    try {
        const secret = process.env.JWT_SECRET || 'greencart_jwt_secret';
        const tokenDecode = jwt.verify(token, secret);

        if (tokenDecode && tokenDecode.id) {
            req.userId = tokenDecode.id;
            if (!req.body) req.body = {};
            req.body.userId = tokenDecode.id;
        } else {
            req.userId = 'guest';
        }
    } catch {
        req.userId = 'guest';
    }
    next();
};

export default authUser;
