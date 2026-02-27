const VehicleEntry = require("../models/VehicleEntry");
const asyncHandler = require("express-async-handler");
const { calculateTimes } = require("../utils/timeCalculator");

exports.getDailyReport = asyncHandler(async (req, res) => {
  const now = new Date();

  // IST offset = +5:30 = 330 minutes
  const IST_OFFSET = 330 * 60 * 1000;

  // Convert current time to IST
  const istNow = new Date(now.getTime() + IST_OFFSET);

  // Start of IST day
  const startOfDay = new Date(istNow);
  startOfDay.setHours(0, 0, 0, 0);

  // End of IST day
  const endOfDay = new Date(istNow);
  endOfDay.setHours(23, 59, 59, 999);

  // Convert back to UTC for MongoDB comparison
  const startUTC = new Date(startOfDay.getTime() - IST_OFFSET);
  const endUTC = new Date(endOfDay.getTime() - IST_OFFSET);

  const vehicles = await VehicleEntry.find({
    createdAt: {
      $gte: startUTC,
      $lte: endUTC,
    },
  });

  const report = vehicles.map((vehicle) => {
    const times = calculateTimes(vehicle.statusHistory);

    return {
      vehicleId: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      currentStatus: vehicle.currentStatus,
      serviceTimeInMinutes: times.serviceTimeInMinutes,
      idleTimeInMinutes: times.idleTimeInMinutes,
    };
  });

  res.json({
    date: istNow.toLocaleDateString("en-CA"),
    totalVehicles: vehicles.length,
    vehicles: report,
  });
});

exports.getSummaryReport = asyncHandler(async (req, res) => {
  const range = req.query.range || "30d";

  const now = new Date();
  const IST_OFFSET = 330 * 60 * 1000;
  const istNow = new Date(now.getTime() + IST_OFFSET);

  let startOfRange;

  if (range === "month") {
    // Start of current month (IST)
    startOfRange = new Date(istNow.getFullYear(), istNow.getMonth(), 1);
  } else {
    // Last 30 days
    startOfRange = new Date(istNow);
    startOfRange.setDate(startOfRange.getDate() - 30);
  }

  startOfRange.setHours(0, 0, 0, 0);

  const startUTC = new Date(startOfRange.getTime() - IST_OFFSET);
  const endUTC = new Date(istNow.getTime() - IST_OFFSET);

  const matchStage = {
    createdAt: { $gte: startUTC, $lte: endUTC },
  };

  //  Status counts
  const statusCounts = await VehicleEntry.aggregate([
    { $match: matchStage },
    { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
  ]);

  //  Service type counts
  const serviceTypeCounts = await VehicleEntry.aggregate([
    { $match: matchStage },
    { $group: { _id: "$serviceType", count: { $sum: 1 } } },
  ]);

  //  Payment status counts (optional but useful)
  const paymentCounts = await VehicleEntry.aggregate([
    { $match: matchStage },
    { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
  ]);

  //  Overall KPIs
  const totals = await VehicleEntry.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        totalEstimatedRevenue: { $sum: "$estimatedCost" },
        insuranceJobs: {
          $sum: { $cond: ["$isInsuranceJob", 1, 0] },
        },
      },
    },
  ]);

  res.json({
    range,
    periodStart: startOfRange,
    periodEnd: istNow,

    totals: totals[0] || {
      totalVehicles: 0,
      totalEstimatedRevenue: 0,
      insuranceJobs: 0,
    },

    statusCounts,
    serviceTypeCounts,
    paymentCounts,
  });
});

exports.getVehicleInsights = async (req, res) => {
  try {
    const { from, to } = req.query;

    // Default = last 30 days
    const endDate = to ? new Date(to) : new Date();
    const startDate = from
      ? new Date(from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const vehicles = await VehicleEntry.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .select(
        "vehicleNumber customerName serviceType status idleTime jobs createdAt deliveryDate paymentStatus",
      )
      .sort({ createdAt: -1 });

    // Send lightweight response (no full job details)
    const now = new Date();

    const response = vehicles.map((v) => {
      let status = "In Service";

      if (v.deliveryDate) status = "Delivered";
      else if (v.paymentStatus === "PAID") status = "Ready";

      return {
        _id: v._id,
        vehicleNumber: v.vehicleNumber,
        customerName: v.customerName,
        serviceType: v.serviceType,
        status,
        idleTime: v.createdAt
          ? ((now - new Date(v.createdAt)) / (1000 * 60 * 60)).toFixed(1) +
            " hrs"
          : "-",
        jobCount: v.jobs?.length || 0,
        inDate: v.createdAt,
        deliveryDate: v.deliveryDate,
        paymentStatus: v.paymentStatus,
      };
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch vehicle insights" });
  }
};
