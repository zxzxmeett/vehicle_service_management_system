require("../config/cloudinary"); // Ensure cloudinary is configured
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "job_cards",
    resource_type: "auto", // allows pdf, images, etc.
  },
});

const upload = multer({ storage });

module.exports = upload;