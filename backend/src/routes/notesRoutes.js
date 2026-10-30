const express = require("express");
const {
    createNote,
    getNotes,
    updateNote,
    deleteNote
} = require("../controllers/notesController");

const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createNote);
router.get("/", authenticateToken, getNotes);
router.put("/:id", authenticateToken, updateNote);
router.delete("/:id", authenticateToken, deleteNote);

module.exports = router;