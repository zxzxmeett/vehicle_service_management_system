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
    customerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    vehicleModel: {
      type: String,
    },

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

    qcRemarks: {
      type: String,
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

module.exports = mongoose.model("VehicleEntry", vehicleEntrySchema);
 