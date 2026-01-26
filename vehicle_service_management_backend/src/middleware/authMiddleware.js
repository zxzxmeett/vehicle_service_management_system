const jwt = require("jsonwebtoken");
const User = require("../models/User");

//authorize user for every request
//make sure the user is authenticated and JWT is valid

const protect = async (req, res, next) => {
  let token;  

  //reading token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //get token from header
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //fetches whole user forom DB except password and attaches to req.user
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};

module.exports = { protect };