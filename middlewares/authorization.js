const jwt = require("jsonwebtoken");
const Key = require("../database/db");
const jtoken = async (req, res, next) => {
const token = req.headers["Authorization"];

  try {
    if (!token) {
      return res.status(401).json({ message: "No token is provided" });
    }
    jwt.verify(token, Key, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.decoded = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: "Internal server error" });
  }
};
module.exports=jtoken;
