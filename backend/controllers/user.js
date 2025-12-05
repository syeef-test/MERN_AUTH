import { registerSchema } from "../config/zod.js";
import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import { redisClient } from "../index.js";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto"; //inbuilt nodejs
import {getOtpHtml,getVerifyEmailHtml} from "../config/html.js";

export const registerUser = TryCatch(async (req, res) => {
  const sanitezedBody = sanitize(req.body);

  const validation = registerSchema.safeParse(sanitezedBody);

  if (!validation.success) {
    const zodError = validation.error;

    let firstErrorMessage = "Validation failed";
    let allErrors = [];
    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issue) => ({
        field: issue.path ? issue.path.join(".") : "unknown",
        message: issue.message || "Validation  Error",
        code: issue.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }
    return res.status({ message: firstErrorMessage, error: allErrors });
  }

  const { name, email, password } = validation.data;

  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "To many requests, try again later",
    });
  }

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    res.status(400).json({ message: "User allready exist" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString("hex");

  const verifyKey = `verify:${verifyToken}`;

  const datatoStore = JSON.stringify({
    name,
    email,
    password: hashPassword,
  });

  await redisClient.set(verifyKey, datatoStore, { EX: 300 });

  const subject = "verify your email for Account creation";
  const html = getVerifyEmailHtml({email,token});

  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.json({
    message:
      "If your email is valid,a verification link has been sent.It will expire in 5 minutes.",
  });
});
