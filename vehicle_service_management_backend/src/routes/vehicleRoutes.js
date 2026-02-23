const express = require("express");
const router = express.Router();

const { checkInVehicle,assignAdvisor,updateVehicleStatus,getVehicleTimes,addJob } = require("../controllers/vehicleController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getVehiclesByStatus } = require("../controllers/vehicleController");
const { getAssignedVehicles } = require("../controllers/vehicleController");
const { getVehicleJobs } = require("../controllers/vehicleController");
const { markReceptionDone } = require("../controllers/vehicleController");
const { deliver } = require("../controllers/vehicleController");

router.post(
  "/checkin",
  protect,
  authorizeRoles("SECURITY"),
  checkInVehicle
);

// :id refers to vehicle entry ID
router.patch(
  "/:id/assign-advisor",
  protect,
  authorizeRoles("RECEPTIONIST"),
  assignAdvisor
);

router.patch(
  "/:id/update-status",
  protect,
  authorizeRoles("ADVISOR"),
  updateVehicleStatus
);

router.get(
  "/:id/times",
  protect,
  authorizeRoles("ADMIN", "RECEPTIONIST", "ADVISOR"),
  getVehicleTimes
);

router.post(
  "/:id/jobs",
  protect,
  authorizeRoles("ADVISOR"),
  upload.single("jobFile"),
  addJob
);

router.get(
  "/",
  protect,
  authorizeRoles("RECEPTIONIST", "ADMIN"),
  getVehiclesByStatus
);

router.get(
  "/assigned",
  protect,
  authorizeRoles("ADVISOR"),
  getAssignedVehicles
);

router.get(
  "/:id/jobs",
  protect,
  authorizeRoles("ADMIN"),
  getVehicleJobs
);

router.patch(
  "/:id/deliver",
  protect,
  authorizeRoles("RECEPTIONIST"),
  deliver
);

module.exports = router;