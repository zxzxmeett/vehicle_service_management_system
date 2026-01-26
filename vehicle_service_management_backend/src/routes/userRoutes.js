const express = require("express");
const router = express.Router();

const { createUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getUsersByRole } = require("../controllers/userController");

//only ADMIN can create users

router.post("/", protect, authorizeRoles("ADMIN"), createUser);

router.get("/", protect, authorizeRoles("ADMIN","RECEPTIONIST"), getUsersByRole);

module.exports = router;