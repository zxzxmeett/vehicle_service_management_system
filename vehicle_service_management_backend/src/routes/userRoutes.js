const express = require("express");
const router = express.Router();

const { createUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getUsersByRole } = require("../controllers/userController");
const { updateUserStatus } = require("../controllers/userController")

//only ADMIN can create users

router.post("/", protect, authorizeRoles("ADMIN"), createUser);

router.get("/", protect, authorizeRoles("ADMIN","RECEPTIONIST"), getUsersByRole);

router.patch("/:id/status", protect, authorizeRoles("ADMIN"), updateUserStatus);

module.exports = router;