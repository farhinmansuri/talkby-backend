const {STATUS} =require("../db/status")
const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(STATUS.UNAUTHORIZED).json({ message: 'Access Denied: No Token Provided!' });
    }

    try {
        // Verify the token using your secret key
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET );

        // Attach decoded user data to the request object
        req.user = verified;

        // Pass control to the next middleware or route handler
        next();
    } catch (error) {
        // Return error if token is invalid or expired
        return res.status(STATUS.FORBIDDEN).json({ message: 'Invalid or Expired Token!' });
    }
}
module.exports = verifyToken