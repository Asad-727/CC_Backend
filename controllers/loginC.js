import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/loginM.js";

 const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Username check
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                message: "Username not found"
            });
        }

        // 2. Password check
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        // 3. JWT Token
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 4. Login response
        res.status(200).json({
            message: "Login Successfully",
            token: token,
            employee: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

export {
    login
}