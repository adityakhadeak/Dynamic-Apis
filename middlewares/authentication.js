const jwt = require("jsonwebtoken");
const Key = require("../database/db");
const jtoken = async (req, res, next) => {
    const authToken = req.header('auth-token');

    try {
        if (!authToken) {
            return res.status(401).json({ message: "No token is provided" });
        }
        jwt.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ success: false, message: 'Token has expired' });
                } else {
                    return res.status(401).json({ success: false, message: 'Invalid token' });
                }
            }
            if (!decoded.user) {
                return res.status(401).json({ success: false, message: 'Invalid token: No user data' });
            }
            req.user = decoded.user;
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });    }
};
module.exports = jtoken;
