const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const reportRoutes = require("./src/routes/reportRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("Vehicle Service Management API running");
});

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const vehicleRoutes = require("./src/routes/vehicleRoutes");

const { errorHandler } = require("./src/middleware/errorMiddleware");
app.use(errorHandler);


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});