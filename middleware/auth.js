import jwt from "jsonwebtoken";
import User from "../models/loginM.js";

const auth = async (req, res, next) => {
    try {
        // Authorization header se token lena
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required"
            });
        }

        // Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token not found"
            });
        }

        // Token verify
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Database se user find
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Logged-in user request mein save
        req.user = user;

        // Next controller
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message
        });
    }
};

export default auth;