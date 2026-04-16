const VehicleEntry = require("../models/VehicleEntry");
const Vehicle = require("../models/VehicleEntry");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { calculateTimes } = require("../utils/timeCalculator");

//security
exports.checkInVehicle = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  for (const key in data) {
    if (data[key] === "") data[key] = undefined;
  }
  let {
    customerName,
    phone,
    vehicleNumber,
    vehicleModel,
    checkInTime,
    serviceType,
    vehicleBrand,
    fuelType,
    priority,
    paymentStatus,
    isInsuranceJob,
    estimatedCost,
  } = data;

  if (!customerName || !phone || !vehicleNumber || !vehicleModel) {
    res.status(400);
    throw new Error("Basic required fields missing");
  }

  if (!serviceType) {
    res.status(400);
    throw new Error("Service type is required");
  }

  const vehicle = await VehicleEntry.create({
    customerName,
    phone,
    vehicleNumber,
    vehicleModel,
    checkInTime: checkInTime || undefined,
    serviceType,
    vehicleBrand,
    fuelType,
    priority,
    paymentStatus,
    isInsuranceJob,
    estimatedCost,
    currentStatus: "CHECKED_IN",
    statusHistory: [{ status: "CHECKED_IN" }],
  });

  res.status(201).json(vehicle);
});

//reception
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

//advisor
exports.updateVehicleStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const vehicleId = req.params.id;

  const allowedStatuses = ["IN_SERVICE", "QC_PENDING", "READY_FOR_DELIVERY"];

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

exports.updateVehicleDetails = asyncHandler(async (req, res) => {
  //console.log("BODY:", req.body);
  const vehicle = await VehicleEntry.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  const { priority, estimatedCost, isInsuranceJob } = req.body;

  if (priority !== undefined) vehicle.priority = priority;

  if (estimatedCost !== undefined) {
    vehicle.estimatedCost = estimatedCost;
  }

  if (isInsuranceJob !== undefined) {
    vehicle.isInsuranceJob = isInsuranceJob;
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

  //console.log("Vehicle:", vehicle);
  //console.log("Jobs:", vehicle?.jobs);

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  res.json(vehicle.jobs || []);
};

exports.requestRework = asyncHandler(async (req, res) => {
  const vehicle = await VehicleEntry.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  const allowedStatuses = ["READY_FOR_DELIVERY", "REWORK_DONE"];

  if (!allowedStatuses.includes(vehicle.currentStatus)) {
    res.status(400);
    throw new Error("Rework allowed only after service completion");
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

  vehicle.currentStatus = "REWORK_DONE";

  vehicle.statusHistory.push({
    status: "REWORK_DONE",
  });

  await vehicle.save();

  res.json(vehicle);
});

// controllers/vehicleController.js
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  //console.log(req.user.role);
  const vehicle = await VehicleEntry.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  const { paymentStatus } = req.body;

  const allowed = ["PENDING", "PARTIAL", "PAID"];

  if (!paymentStatus || !allowed.includes(paymentStatus)) {
    res.status(400);
    throw new Error("Invalid payment status");
  }

  // Allow payment only when ready for delivery (recommended rule)
  if (vehicle.currentStatus !== "READY_FOR_DELIVERY") {
    res.status(400);
    throw new Error("Payment can only be updated at delivery stage");
  }

  vehicle.paymentStatus = paymentStatus;

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

    const allowedStatuses = ["READY_FOR_DELIVERY", "REWORK_DONE"];

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

// GET /vehicles
// Advisor — filterable
exports.getVehicles = async (req, res) => {
  try {
    const user = req.user;

    const {
      status,
      fuelType,
      serviceType,
      priority,
      isInsuranceJob,
      date,
      advisorId,
      paymentStatus,
    } = req.query;

    const query = {};

    if (advisorId) {
      query.assignedAdvisor = advisorId;
    }
    
    if (paymentStatus) {
      const paymentArray = paymentStatus.split(",");
      query.paymentStatus = { $in: paymentArray };
    }
    // ROLE-BASED RESTRICTION
    if (user.role === "ADVISOR") {
      query.assignedAdvisor = user._id;
    }

    // STATUS FILTER (multi)
    if (status) {
      const statusArray = status.split(",");
      query.currentStatus = { $in: statusArray };
    }

    // FUEL TYPE FILTER
    if (fuelType) {
      const fuelArray = fuelType.split(",");
      query.fuelType = { $in: fuelArray };
    }

    //  SERVICE TYPE FILTER
    if (serviceType) {
      const serviceArray = serviceType.split(",");
      query.serviceType = { $in: serviceArray };
    }

    //  PRIORITY FILTER
    if (priority) {
      const priorityArray = priority.split(",");
      query.priority = { $in: priorityArray };
    }

    //  INSURANCE JOB FILTER
    if (isInsuranceJob !== undefined) {
      query.isInsuranceJob = isInsuranceJob === "true";
    }

    //  DATE FILTER (createdAt)
    if (date) {
      const now = new Date();

      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      if (date === "today") {
        query.createdAt = {
          $gte: startOfToday,
          $lte: now,
        };
      } else if (date === "older") {
        query.createdAt = {
          $lt: startOfToday,
        };
      }
    }

    // EXECUTE QUERY
    const vehicles = await VehicleEntry.find(query)
      .populate("assignedAdvisor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get Vehicles Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching vehicles",
    });
  }
};

// controllers/adminInsightsController.js
exports.getVehicleInsights = async (req, res) => {
  try {
    const {
      status,
      serviceType,
      paymentStatus,
      priority,
      advisor,
      fuelType,
      brand,
      model,
      insurance,
      fromDate,
      toDate,
      search,
      idleGt,
      idleLt,
      page = 1,
      limit = 20,
      sortBy = "checkInTime",
      order = "desc",
    } = req.query;

    const filters = {};

    /* ---------------- BASIC FILTERS ---------------- */

    if (status) filters.currentStatus = status;
    if (serviceType) filters.serviceType = serviceType;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (priority) filters.priority = priority;
    if (advisor) filters.assignedAdvisor = advisor;
    if (fuelType) filters.fuelType = fuelType;
    if (brand) filters.vehicleBrand = brand;
    if (model) filters.vehicleModel = model;

    if (insurance !== undefined)
      filters.isInsuranceJob = insurance === "true";

    /* ---------------- DATE RANGE ---------------- */

    if (fromDate || toDate) {
      filters.checkInTime = {};

      if (fromDate) filters.checkInTime.$gte = new Date(fromDate);
      if (toDate) filters.checkInTime.$lte = new Date(toDate);
    }

    /* ---------------- SEARCH ---------------- */

    if (search) {
      filters.$or = [
        { vehicleNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    /* ---------------- QUERY DB ---------------- */

    let vehicles = await Vehicle.find(filters)
      .populate("assignedAdvisor", "name email")
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .lean();

    /* ---------------- IDLE TIME FILTER ---------------- */

    const now = new Date();

    vehicles = vehicles.map((v) => {
      const idleHours =
        (now - new Date(v.checkInTime)) / (1000 * 60 * 60);

      return {
        ...v,
        idleHours: Number(idleHours.toFixed(1)),
        jobCount: v.jobs?.length || 0,
      };
    });

    if (idleGt)
      vehicles = vehicles.filter((v) => v.idleHours > Number(idleGt));

    if (idleLt)
      vehicles = vehicles.filter((v) => v.idleHours < Number(idleLt));

    /* ---------------- PAGINATION ---------------- */

    const total = vehicles.length;
    const start = (page - 1) * limit;
    const paginated = vehicles.slice(start, start + Number(limit));

    /* ---------------- RESPONSE ---------------- */

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: paginated.length,
      data: paginated,
    });
  } catch (err) {
    console.error("Vehicle Insights Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle insights",
    });
  }
};