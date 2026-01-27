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
