const express = require("express");
const router = express.Router();

const { createUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("ADMIN"), createUser);

module.exports = router;