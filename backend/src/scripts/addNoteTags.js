require("dotenv").config();

const { pool } = require("../config/db");

const addNoteTags = async () => {
    try {
        const [columns] = await pool.execute(
            `SELECT COLUMN_NAME
             FROM information_schema.columns
             WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
            [process.env.DB_NAME, "notes", "tags"]
        );

        if (columns.length > 0) {
            console.log("The notes.tags column already exists.");
            return;
        }

        await pool.query(
            "ALTER TABLE notes ADD COLUMN tags JSON NULL AFTER content"
        );

        console.log("Added the tags column to the notes table.");
    } catch (error) {
        console.error("Could not add the tags column:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

addNoteTags();
