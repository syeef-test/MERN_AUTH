import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";
import { User } from "../models/User.js";
import { isSessionActive } from "../config/generateToken.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(403).json({
        message: "Please login",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedData) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Check if session still exists
    const sessionData = await redisClient.get(
      `session:${decodedData.sessionId}`
    );
    if (!sessionData) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    const sessionActive = await isSessionActive(
      decodedData.id,
      decodedData.sessionId
    );

    if (!sessionActive) {
      
      await redisClient.del(`session:${decodedData.sessionId}`);

      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      return res.status(401).json({
        message:
          "Session expired. You have been logged in from another device.",
      });
    }

    const cacheUser = await redisClient.get(`user:${decodedData.id}`);

    if (cacheUser) {
      req.user = JSON.parse(cacheUser);
      req.sessionId = decodedData.sessionId;
      return next();
    }

    const user = await User.findById(decodedData.id).select("-password");

    if (!user) {
      return res.status(400).json({ message: "no user with this id" });
    }

    await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user));

    req.user = user;
    req.sessionId = decodedData.sessionId;
    next();
  } catch (error) {
    // Handle JWT errors
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      res.clearCookie("accessToken");
      return res
        .status(401)
        .json({ message: "Session expired. Please login again." });
    }
    res.status(500).json({ message: error.message });
  }
};

export const authorizedAdmin = async (req, res, next) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(401).json({
      message: "You are not allowed for this activity.",
    });
  }

  next();
};
