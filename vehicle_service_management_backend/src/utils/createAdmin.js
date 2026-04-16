const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config({ path: "../../.env" });

mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await User.create({
    name: "Admin User",
    email: "admin@test.com",
    password: hashedPassword,
    role: "ADMIN",
  });

  //console.log("Admin user created");
  process.exit();
};

createAdmin();