const VehicleEntry = require("../models/VehicleEntry");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { calculateTimes } = require("../utils/timeCalculator");

exports.checkInVehicle = asyncHandler(async (req, res) => {
  const { customerName, phone, vehicleNumber, vehicleModel, checkInTime } =
    req.body;

  if (!customerName || !phone || !vehicleNumber || !vehicleModel) {
    res.status(400);
    throw new Error("Required fields are missing");
  }

  const vehicle = await VehicleEntry.create({
    customerName,
    phone,
    vehicleNumber,
    vehicleModel,
    checkInTime: checkInTime || undefined,
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

exports.requestRework = asyncHandler(async (req, res) => {
  const vehicle = await VehicleEntry.findById(req.params.id);
  
  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }
  
  if (vehicle.currentStatus !== "READY_FOR_DELIVERY") {
    res.status(400);
    throw new Error("Rework allowed only after READY_FOR_DELIVERY");
  }

  const { reason } = req.body;

  if (!reason) {
    res.status(400);
    throw new Error("Rework reason is required");
  }

  vehicle.currentStatus = "REWORK_REQUESTED";
  vehicle.reworkReason = reason;
  vehicle.reworkCount = (vehicle.reworkCount || 0) + 1;
  vehicle.lastReworkAt = new Date();

  vehicle.statusHistory.push({
    status: "REWORK_REQUESTED",
  });

  await vehicle.save();

  res.json(vehicle);
});

exports.startRework = asyncHandler(async (req, res) => {
  const vehicle = await VehicleEntry.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  if (vehicle.currentStatus !== "REWORK_REQUESTED") {
    res.status(400);
    throw new Error("Rework not requested");
  }

  vehicle.currentStatus = "IN_REWORK";

  vehicle.statusHistory.push({
    status: "IN_REWORK",
  });

  await vehicle.save();

  res.json(vehicle);
});

exports.sendReworkToQC = asyncHandler(async (req, res) => {
  const vehicle = await VehicleEntry.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  if (vehicle.currentStatus !== "IN_REWORK") {
    res.status(400);
    throw new Error("Vehicle not in rework");
  }

  vehicle.currentStatus = "REWORK_QC_PENDING";
  
  vehicle.statusHistory.push({
    status: "REWORK_QC_PENDING",
  });

  await vehicle.save();

  res.json(vehicle);
});

exports.completeRework = asyncHandler(async (req, res) => {
  const vehicle = await VehicleEntry.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  if (vehicle.currentStatus !== "REWORK_QC_PENDING") {
    res.status(400);
    throw new Error("Rework QC not completed");
  }

  const { qcRemarks } = req.body;

  vehicle.currentStatus = "REWORK_DONE";

  if (qcRemarks) {
    vehicle.qcRemarks = qcRemarks;
  }

  vehicle.statusHistory.push({
    status: "REWORK_DONE",
  });

  await vehicle.save();

  res.json(vehicle);
});

//Delivery by reception
exports.deliver = async (req, res) => {
  try {
    const vehicle = await VehicleEntry.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const allowedStatuses = [
      "READY_FOR_DELIVERY",
      "REWORK_DONE",
    ];

    if (!allowedStatuses.includes(vehicle.currentStatus)) {
      return res.status(400).json({
        message: "Vehicle not ready for delivery",
      });
    }

    vehicle.currentStatus = "DELIVERED";
    vehicle.deliveryTime = new Date();
    vehicle.isReceptionCompleted = true;

    vehicle.statusHistory.push({
      status: "DELIVERED",
    });

    await vehicle.save();

    res.json({
      message: "Vehicle delivered successfully",
      vehicle,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};