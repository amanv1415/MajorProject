const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 50;

const normalizeTags = (tags) => {
    if (tags === undefined || tags === null) {
        return { tags: [] };
    }

    if (!Array.isArray(tags)) {
        return { error: "Tags must be an array of strings" };
    }

    if (tags.some((tag) => typeof tag !== "string")) {
        return { error: "Tags must be an array of strings" };
    }

    const cleanedTags = tags.map((tag) => tag.trim()).filter(Boolean);

    if (cleanedTags.length !== tags.length || new Set(cleanedTags).size !== cleanedTags.length) {
        return { error: "Tags must be unique, non-empty strings" };
    }

    if (cleanedTags.length > MAX_TAGS) {
        return { error: `A note can have up to ${MAX_TAGS} tags` };
    }

    if (cleanedTags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
        return { error: `Each tag must be ${MAX_TAG_LENGTH} characters or fewer` };
    }

    return { tags: cleanedTags };
};

const validateNoteInput = (body = {}) => {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!title || !content) {
        return { error: "Title and content are required" };
    }

    if (title.length > 255) {
        return { error: "Title must be 255 characters or fewer" };
    }

    const tagResult = normalizeTags(body.tags);

    if (tagResult.error) {
        return tagResult;
    }

    return {
        note: {
            title,
            content,
            tags: tagResult.tags
        }
    };
};

const parseTags = (tags) => {
    if (Array.isArray(tags)) {
        return tags;
    }

    if (typeof tags !== "string") {
        return [];
    }

    try {
        const parsedTags = JSON.parse(tags);
        return Array.isArray(parsedTags) ? parsedTags : [];
    } catch {
        return [];
    }
};

const formatNote = (note) => ({
    ...note,
    tags: parseTags(note.tags)
});

module.exports = {
    formatNote,
    validateNoteInput
};
