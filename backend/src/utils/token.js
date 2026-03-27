import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (userId) =>
  jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const setTokenCookie = (res, token) => {
  res.cookie("token", token, getCookieOptions());
};

export const clearTokenCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
  });
};
