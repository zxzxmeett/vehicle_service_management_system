const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    estimatedTimeInMinutes: {
      type: Number,
    },
    file: {
      type: String, // path to uploaded file
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "CHECKED_IN",
        "ADVISOR_ASSIGNED",
        "IN_SERVICE",
        "QC_PENDING",
        "READY_FOR_DELIVERY",
        //rework cycle
        "REWORK_REQUESTED",
        "IN_REWORK",
        "REWORK_QC_PENDING",
        "REWORK_DONE",
        "DELIVERED",
      ],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

// jobSchema and statusHistorySchema are sub-schemas used within vehicleEntrySchema
const vehicleEntrySchema = new mongoose.Schema(
  {
    //basic details
    vehicleNumber: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    
    //service details
    vehicleBrand: {
      type: String,
    },
    vehicleModel: {
      type: String,
    },
    fuelType: {
      type: String,
      enum: ["PETROL", "DIESEL", "CNG", "EV", "HYBRID"],
    },
    serviceType: {
      type: String,
      enum: ["PAID_SERVICE", "FREE_SERVICE", "ACCIDENT"],
      required: true,
    },

    //addition by advisor
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "EMERGENCY"],
      default: "NORMAL",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID"],
      default: "PENDING",
    },
    isInsuranceJob: {
      type: Boolean,
      default: false,
    },
    estimatedCost: {
      type: Number,
    },

    //status tracking
    currentStatus: {
      type: String,
      enum: [
        "CHECKED_IN",
        "ADVISOR_ASSIGNED",
        "IN_SERVICE",
        "QC_PENDING",
        "READY_FOR_DELIVERY",
        "REWORK_REQUESTED",
        "IN_REWORK",
        "REWORK_QC_PENDING",
        "REWORK_DONE",
        "DELIVERED",
      ],
      default: "CHECKED_IN",
    },
    statusHistory: [statusHistorySchema],

    assignedAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    //rework details
    reworkReason: {
      type: String,
    },

    reworkCount: {
      type: Number,
      default: 0,
    },

    lastReworkAt: {
      type: Date,
    },

    jobs: [jobSchema],

    checkInTime: {
      type: Date,
      default: Date.now,
    },

    deliveryTime: {
      type: Date,
    },
    isReceptionCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

vehicleEntrySchema.index({ currentStatus: 1 });
vehicleEntrySchema.index({ fuelType: 1 });
vehicleEntrySchema.index({ serviceType: 1 });
vehicleEntrySchema.index({ priority: 1 });
vehicleEntrySchema.index({ isInsuranceJob: 1 });
vehicleEntrySchema.index({ assignedAdvisor: 1 });
vehicleEntrySchema.index({ createdAt: -1 });
vehicleEntrySchema.index({ assignedAdvisor: 1, currentStatus: 1 });
//1 - ascending order, -1 descending order

module.exports = mongoose.model("VehicleEntry", vehicleEntrySchema);
