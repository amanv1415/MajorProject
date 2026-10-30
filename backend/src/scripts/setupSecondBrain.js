require("dotenv").config();

const { pool } = require("../config/db");

const ensureColumn = async (table, column, definition) => {
    const [columns] = await pool.execute(
        `SELECT COLUMN_NAME
         FROM information_schema.columns
         WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
        [process.env.DB_NAME, table, column]
    );

    if (columns.length === 0) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`Added ${table}.${column}.`);
    }
};

const setupSecondBrain = async () => {
    try {
        await ensureColumn("users", "avatar_url", "VARCHAR(2048) NULL AFTER email");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content LONGTEXT NOT NULL,
                tags JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_documents_user_updated (user_id, updated_at)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookmarks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                url VARCHAR(2048) NOT NULL,
                description TEXT NULL,
                tags JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_bookmarks_user_updated (user_id, updated_at)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS code_snippets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                language VARCHAR(100) NOT NULL,
                code MEDIUMTEXT NOT NULL,
                description TEXT NULL,
                tags JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_code_snippets_user_updated (user_id, updated_at)
            )
        `);

        console.log("Second Brain content tables are ready.");
    } catch (error) {
        console.error("Second Brain setup failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

setupSecondBrain();
