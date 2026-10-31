import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
    const { sellerToken } = req.cookies;

    if (!sellerToken) {
        return res.status(401).json({ success: false, message: "No seller token provided" });
    }

    try {
        const secret = process.env.JWT_SECRET || 'greencart_jwt_secret';
        const expectedEmail = process.env.SELLER_EMAIL || 'admin@greencart.com';
        const tokenDecode = jwt.verify(sellerToken, secret);

        if (tokenDecode.email === expectedEmail || tokenDecode.role === 'seller' || tokenDecode.role === 'admin') {
            req.seller = tokenDecode;
            next();
        } else {
            return res.status(403).json({ success: false, message: "Forbidden: Not authorized as seller" });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
};

export default authSeller;
