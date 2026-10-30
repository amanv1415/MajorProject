const { pool } = require("../config/db");

const parseTags = (tags) => {
    if (Array.isArray(tags)) {
        return tags;
    }

    if (typeof tags !== "string") {
        return [];
    }

    try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const normalizeTags = (tags) => {
    if (tags === undefined || tags === null || tags === "") {
        return [];
    }

    if (!Array.isArray(tags)) {
        return { error: "Tags must be an array of strings" };
    }

    const cleanedTags = tags.map((tag) => typeof tag === "string" ? tag.trim() : "");
    if (cleanedTags.some((tag) => !tag) || new Set(cleanedTags).size !== cleanedTags.length) {
        return { error: "Tags must be unique, non-empty strings" };
    }

    if (cleanedTags.length > 10 || cleanedTags.some((tag) => tag.length > 50)) {
        return { error: "Use up to 10 tags, with 50 characters or fewer each" };
    }

    return cleanedTags;
};

const validators = {
    documents: (body) => {
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const content = typeof body.content === "string" ? body.content.trim() : "";
        const tags = normalizeTags(body.tags);

        if (!title || !content) return { error: "Title and content are required" };
        if (title.length > 255) return { error: "Title must be 255 characters or fewer" };
        if (tags.error) return tags;
        return { values: [title, content, JSON.stringify(tags)] };
    },
    bookmarks: (body) => {
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const url = typeof body.url === "string" ? body.url.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";
        const tags = normalizeTags(body.tags);

        if (!title || !url) return { error: "Title and URL are required" };
        try {
            const parsedUrl = new URL(url);
            if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
        } catch {
            return { error: "Enter a valid http or https URL" };
        }
        if (title.length > 255) return { error: "Title must be 255 characters or fewer" };
        if (tags.error) return tags;
        return { values: [title, url, description, JSON.stringify(tags)] };
    }
};

const resources = {
    documents: {
        table: "documents",
        columns: "title, content, tags",
        insertColumns: "title, content, tags"
    },
    bookmarks: {
        table: "bookmarks",
        columns: "title, url, description, tags",
        insertColumns: "title, url, description, tags"
    }
};

const createContentController = (resourceName) => {
    const resource = resources[resourceName];
    const validate = validators[resourceName];

    const getAll = async (req, res) => {
        try {
            const [items] = await pool.execute(
                `SELECT id, ${resource.columns}, created_at, updated_at
                 FROM ${resource.table} WHERE user_id = ? ORDER BY updated_at DESC`,
                [req.user.userId]
            );
            res.json({ success: true, items: items.map((item) => ({ ...item, tags: parseTags(item.tags) })) });
        } catch (error) {
            console.error(`Get ${resourceName} error:`, error.message);
            res.status(500).json({ success: false, message: `Unable to load ${resourceName}` });
        }
    };

    const create = async (req, res) => {
        try {
            const result = validate(req.body || {});
            if (result.error) return res.status(400).json({ success: false, message: result.error });

            const placeholders = result.values.map(() => "?").join(", ");
            const [created] = await pool.execute(
                `INSERT INTO ${resource.table} (user_id, ${resource.insertColumns}) VALUES (?, ${placeholders})`,
                [req.user.userId, ...result.values]
            );
            res.status(201).json({ success: true, id: created.insertId });
        } catch (error) {
            console.error(`Create ${resourceName} error:`, error.message);
            res.status(500).json({ success: false, message: `Unable to create ${resourceName}` });
        }
    };

    const update = async (req, res) => {
        try {
            const result = validate(req.body || {});
            if (result.error) return res.status(400).json({ success: false, message: result.error });

            const assignments = resource.insertColumns.split(", ").map((column) => `${column} = ?`).join(", ");
            const [updated] = await pool.execute(
                `UPDATE ${resource.table} SET ${assignments} WHERE id = ? AND user_id = ?`,
                [...result.values, req.params.id, req.user.userId]
            );
            if (!updated.affectedRows) return res.status(404).json({ success: false, message: `${resourceName} not found` });
            res.json({ success: true });
        } catch (error) {
            console.error(`Update ${resourceName} error:`, error.message);
            res.status(500).json({ success: false, message: `Unable to update ${resourceName}` });
        }
    };

    const remove = async (req, res) => {
        try {
            const [deleted] = await pool.execute(
                `DELETE FROM ${resource.table} WHERE id = ? AND user_id = ?`,
                [req.params.id, req.user.userId]
            );
            if (!deleted.affectedRows) return res.status(404).json({ success: false, message: `${resourceName} not found` });
            res.json({ success: true });
        } catch (error) {
            console.error(`Delete ${resourceName} error:`, error.message);
            res.status(500).json({ success: false, message: `Unable to delete ${resourceName}` });
        }
    };

    return { getAll, create, update, remove };
};

module.exports = { createContentController };
