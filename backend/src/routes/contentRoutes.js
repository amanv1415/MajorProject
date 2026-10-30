const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { createContentController } = require("../controllers/contentController");

const createContentRoutes = (resourceName) => {
    const router = express.Router();
    const controller = createContentController(resourceName);

    router.use(authenticateToken);
    router.get("/", controller.getAll);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.remove);

    return router;
};

module.exports = { createContentRoutes };
