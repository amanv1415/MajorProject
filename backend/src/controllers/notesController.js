const { pool } = require("../config/db");
const { formatNote, validateNoteInput } = require("../utils/noteUtils");

const createNote = async (req, res) => {
    try {
        const { note, error } = validateNoteInput(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        // Get logged-in user's ID from JWT
        const userId = req.user.userId;

        // Insert note
        const [result] = await pool.execute(
            "INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)",
            [userId, note.title, note.content, JSON.stringify(note.tags)]
        );

        res.status(201).json({
            success: true,
            message: "Note created successfully",
            noteId: result.insertId
        });

    } catch (error) {
        console.error("Create note error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



const getNotes = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [notes] = await pool.execute(
            `SELECT id, title, content, tags, created_at, updated_at
             FROM notes
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            count: notes.length,
            notes: notes.map(formatNote)
        });

    } catch (error) {
        console.error("Get notes error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const updateNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const userId = req.user.userId;
        const { note, error } = validateNoteInput(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        // Update only the user's own note
        const [result] = await pool.execute(
            `UPDATE notes
             SET title = ?, content = ?, tags = ?
             WHERE id = ? AND user_id = ?`,
            [note.title, note.content, JSON.stringify(note.tags), noteId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Note updated successfully"
        });

    } catch (error) {
        console.error("Update note error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const deleteNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const userId = req.user.userId;

        // Delete only the user's own note
        const [result] = await pool.execute(
            "DELETE FROM notes WHERE id = ? AND user_id = ?",
            [noteId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });

    } catch (error) {
        console.error("Delete note error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
module.exports = {
    createNote,
    getNotes,
    updateNote,
    deleteNote
};
