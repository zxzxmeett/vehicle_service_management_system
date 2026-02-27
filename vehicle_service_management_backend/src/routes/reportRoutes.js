const express = require("express");
const router = express.Router();

const { getDailyReport } = require("../controllers/reportController");
const { getSummaryReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

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
module.exports = router;
