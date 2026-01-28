const VehicleEntry = require("../models/VehicleEntry");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { calculateTimes } = require("../utils/timeCalculator");

exports.checkInVehicle = asyncHandler(async (req, res) => {
  const { customerName, phone, vehicleNumber, vehicleModel } = req.body;

  if (!customerName || !phone || !vehicleNumber || !vehicleModel) {
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

exports.assignAdvisor = asyncHandler(async (req, res) => {
  //user don't type advisor id directly in body, they select from list and id extracted via frontend
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
});

exports.updateVehicleStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const vehicleId = req.params.id;

  const allowedStatuses = [
    "IN_SERVICE",
    "QC_PENDING",
    "READY_FOR_DELIVERY",
    "DELIVERED",
  ];

  if (!status || !allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid or missing status");
  }

  const vehicle = await VehicleEntry.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle entry not found");
  }

  // Optional: enforce correct order (simple version)
  vehicle.currentStatus = status;
  vehicle.statusHistory.push({ status });

  if (status === "DELIVERED") {
    vehicle.deliveryTime = new Date();
  }

  await vehicle.save();

  res.json(vehicle);
});

exports.getVehicleTimes = asyncHandler(async (req, res) => {
  const vehicle = await VehicleEntry.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  const times = calculateTimes(vehicle.statusHistory);

  res.json({
    vehicleId: vehicle._id,
    currentStatus: vehicle.currentStatus,
    ...times,
  });
});

exports.addJob = asyncHandler(async (req, res) => {
  const { description, estimatedTimeInMinutes } = req.body;
  const vehicleId = req.params.id;

  if (!description) {
    res.status(400);
    throw new Error("Job description required");
  }

  const vehicle = await VehicleEntry.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  vehicle.jobs.push({
    description,
    estimatedTimeInMinutes,
    file: req.file ? req.file.path : null,
  });

  await vehicle.save();

  res.status(201).json(vehicle.jobs);
});

// for receptionist and admin to filter vehicles by status
exports.getVehiclesByStatus = asyncHandler(async (req, res) => {
  const { status, isReceptionCompleted } = req.query;

  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const filter = {
    currentStatus: status,
  };

  // IMPORTANT: handle boolean query param properly
  if (isReceptionCompleted !== undefined) {
    filter.isReceptionCompleted = isReceptionCompleted === "true";
  }

  const vehicles = await VehicleEntry.find(filter);
  res.json(vehicles);
});

// for advisor to get assigned vehicles
exports.getAssignedVehicles = async (req, res) => {
  const vehicles = await VehicleEntry.find({
    assignedAdvisor: req.user._id,
  });

  res.json(vehicles);
};

// to get jobs of a vehicle
exports.getVehicleJobs = async (req, res) => {
  const vehicle = await VehicleEntry.findById(req.params.id).select("jobs");

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  res.json(vehicle.jobs);
}; 

//Reception approval
exports.markReceptionDone = async (req, res) => {
  const { id } = req.params;

  const vehicle = await VehicleEntry.findById(id);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  vehicle.isReceptionCompleted = true;
  await vehicle.save();

  res.json({ message: "Vehicle marked as completed" });
};
