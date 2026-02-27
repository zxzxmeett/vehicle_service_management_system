const express = require("express");
const router = express.Router();

const { getDailyReport } = require("../controllers/reportController");
const { getSummaryReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getVehicleInsights } = require("../controllers/reportController");

router.get(
  "/daily",
  protect,
  authorizeRoles("ADMIN"),
  getDailyReport
);

router.get(
  "/summary",
  protect,
  authorizeRoles("ADMIN"),
  getSummaryReport
);

router.get(
  "/vehicle-insights",
  protect,
  authorizeRoles("ADMIN"),
  getVehicleInsights
);
module.exports = router;
