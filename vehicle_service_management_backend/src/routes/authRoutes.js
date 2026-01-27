const express = require("express");
const router = express.Router();

//only login route needed here
const { loginUser } = require("../controllers/authController");

router.post("/login", loginUser);

module.exports = router;
