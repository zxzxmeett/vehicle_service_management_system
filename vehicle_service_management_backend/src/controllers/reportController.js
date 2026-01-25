const VehicleEntry = require("../models/VehicleEntry");
const asyncHandler = require("express-async-handler");
const { calculateTimes } = require("../utils/timeCalculator");

exports.getDailyReport = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const vehicles = await VehicleEntry.find({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
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
    date: startOfDay.toISOString().slice(0, 10),
    totalVehicles: vehicles.length,
    vehicles: report,
  });
});