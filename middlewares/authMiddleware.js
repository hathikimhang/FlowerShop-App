const jwt = require('jsonwebtoken');

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
};

const requireAuth = (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: 'Ban chua dang nhap.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'flower_shop_secret_key');
        req.user = payload;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token khong hop le hoac da het han.' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Ban chua dang nhap.' });
    }
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Ban khong duoc phep truy cap tinh nang nay.' });
    }
    return next();
};

module.exports = { requireAuth, requireRole };
