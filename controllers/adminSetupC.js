import bcrypt from "bcryptjs";
import User from "../models/loginM.js";

const createInitialAdmin = async (req, res) => {
    try {
        const existingAdmin = await User.findOne({
            role: "admin"
        });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists"
            });
        }

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            username,
            password: hashedPassword,
            role: "admin"
        });

        return res.status(201).json({
            success: true,
            message: "Initial Admin Created Successfully",
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create initial admin",
            error: error.message
        });
    }
};

export {
    createInitialAdmin
};