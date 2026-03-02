const express = require("express");
const router = express.Router();

const { checkInVehicle,assignAdvisor,updateVehicleStatus,getVehicleTimes,addJob } = require("../controllers/vehicleController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getAssignedVehicles } = require("../controllers/vehicleController");
const { getVehicleJobs } = require("../controllers/vehicleController");
const { deliver } = require("../controllers/vehicleController");
const { updateVehicleDetails } = require("../controllers/vehicleController");
const {requestRework,startRework,sendReworkToQC,completeRework,} = require("../controllers/vehicleController");
const { updatePaymentStatus } = require("../controllers/vehicleController");
const { getVehicles } = require("../controllers/vehicleController");
const { getVehiclesByStatus } = require("../controllers/vehicleController");
const { getVehicleInsights } = require("../controllers/vehicleController");

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
//advisor can add details
router.patch(
  "/:id/details",
  protect,
  authorizeRoles("ADVISOR"),
  updateVehicleDetails
)

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
  "/:id/request-rework",
  protect,
  authorizeRoles("RECEPTIONIST"),
  requestRework
);

router.patch(
  "/:id/start-rework",
  protect,
  authorizeRoles("ADVISOR"),
  startRework
);

router.patch(
  "/:id/rework-qc",
  protect,
  authorizeRoles("ADVISOR"),
  sendReworkToQC
);

router.patch(
  "/:id/rework-done",
  protect,
  authorizeRoles("ADVISOR"),
  completeRework
);

// routes/vehicleRoutes.js

router.patch(
  "/:id/payment",
  protect,
  authorizeRoles("RECEPTIONIST"), // or "RECEPTION_DELIVERY"
  updatePaymentStatus
);

router.patch(
  "/:id/deliver",
  protect,
  authorizeRoles("RECEPTIONIST"),
  deliver
);

//endpoint GET/vehicles
router.get(
  "/filter",
  protect,
  authorizeRoles("ADVISOR", "ADMIN", "RECEPTIONIST"),
  getVehicles
);

//filter for admin only
router.get(
  "/vehicle-insights",
  protect,
  authorizeRoles("ADMIN"),
  getVehicleInsights
);
module.exports = router;