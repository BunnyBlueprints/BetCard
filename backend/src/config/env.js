import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cookieSecure:
    process.env.COOKIE_SECURE === "true" ||
    (process.env.COOKIE_SECURE !== "false" && isProduction),
  cookieSameSite:
    process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax"),
};
