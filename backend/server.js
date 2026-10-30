const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./src/routes/authRoutes");
const { authenticateToken } = require("./src/middleware/authMiddleware");
const notesRoutes = require("./src/routes/notesRoutes");
const { createContentRoutes } = require("./src/routes/contentRoutes");


const { connectDB } = require("./src/config/db");

const app = express();

const PORT = process.env.PORT || 5001;

// Connect to MySQL
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/documents", createContentRoutes("documents"));
app.use("/api/bookmarks", createContentRoutes("bookmarks"));

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Personal Second Brain Backend is working!"
    });
});

app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "You accessed a protected route!",
        user: req.user
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});