const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const createToken = (user) => jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
);

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!name?.trim() || !normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const [existingUsers] = await pool.execute(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with that email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            [name.trim(), normalizedEmail, hashedPassword]
        );

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: { id: result.insertId, name: name.trim(), email: normalizedEmail }
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to create your account right now"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const [users] = await pool.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
            [normalizedEmail]
        );

        if (users.length === 0 || !(await bcrypt.compare(password, users[0].password_hash))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = { id: users[0].id, name: users[0].name, email: users[0].email };
        return res.status(200).json({
            success: true,
            token: createToken(user),
            user
        });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to log in right now"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};
