const VehicleEntry = require("../models/VehicleEntry");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

exports.assignAdvisor = async (req, res) => {
  const { advisorId } = req.body;
  const vehicleId = req.params.id;

  if (!advisorId) {
    res.status(400);
    throw new Error("Advisor ID is required");
  }

  const advisor = await User.findById(advisorId);

  if (!advisor || advisor.role !== "ADVISOR") {
    res.status(400);
    throw new Error("Invalid advisor");
  }

  const vehicle = await VehicleEntry.findById(vehicleId);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle entry not found");
  }

  vehicle.assignedAdvisor = advisorId;
  vehicle.currentStatus = "ADVISOR_ASSIGNED";

  vehicle.statusHistory.push({
    status: "ADVISOR_ASSIGNED",
  });

  await vehicle.save();

  res.json(vehicle);
};

exports.checkInVehicle = asyncHandler(async (req, res) => {
  const { customerName, phone, vehicleNumber, vehicleModel } = req.body;

  if (!customerName || !phone || !vehicleNumber) {
    res.status(400);
    throw new Error("Required fields are missing");
  }

  const vehicle = await VehicleEntry.create({
    customerName,
    phone,
    vehicleNumber,
    vehicleModel,
    currentStatus: "CHECKED_IN",
    statusHistory: [
      {
        status: "CHECKED_IN",
      },
    ],
  });

  res.status(201).json(vehicle);
});
