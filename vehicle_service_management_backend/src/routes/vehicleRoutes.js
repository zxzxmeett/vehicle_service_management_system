const express = require("express");
const router = express.Router();

const { assignAdvisor} = require("../controllers/vehicleController");
const { checkInVehicle } = require("../controllers/vehicleController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post(
  "/checkin",
  protect,
  authorizeRoles("SECURITY"),
  checkInVehicle
);

router.patch(
  "/:id/assign-advisor",
  protect,
  authorizeRoles("RECEPTIONIST"),
  assignAdvisor
);

module.exports = router;