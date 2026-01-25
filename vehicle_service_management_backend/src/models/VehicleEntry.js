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
  { _id: false }
);
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "CHECKED_IN",
        "WAITING_FOR_ADVISOR",
        "ADVISOR_ASSIGNED",
        "IN_SERVICE",
        "QC_PENDING",
        "READY_FOR_DELIVERY",
        "DELIVERED",
      ],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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
        "WAITING_FOR_ADVISOR",
        "ADVISOR_ASSIGNED",
        "IN_SERVICE",
        "QC_PENDING",
        "READY_FOR_DELIVERY",
        "DELIVERED",
      ],
      default: "CHECKED_IN",
    },

    statusHistory: [
      statusHistorySchema
    ],

    assignedAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    jobs: [
      jobSchema
    ],

    checkInTime: {
      type: Date,
      default: Date.now,
    },

    deliveryTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VehicleEntry", vehicleEntrySchema);