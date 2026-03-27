import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  clearTokenCookie,
  signToken,
  setTokenCookie,
} from "../utils/token.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username || "",
  email: user.email,
  phone: user.phone || "",
  balance: user.balance,
  role: user.role,
});

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    balance: 1200,
  });

  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.status(201).json({
    user: sanitizeUser(user),
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = signToken(user._id);
  setTokenCookie(res, token);

  res.json({
    user: sanitizeUser(user),
  });
};

export const me = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

export const updateProfile = async (req, res) => {
  const { name, username, email, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedUsername = username?.trim() || "";
  const trimmedPhone = phone?.trim() || "";

  const existingEmail = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: user._id },
  });

  if (existingEmail) {
    return res.status(400).json({ message: "Email already registered" });
  }

  if (trimmedUsername) {
    const usernamePattern = /^[a-zA-Z0-9_]+$/;

    if (!usernamePattern.test(trimmedUsername)) {
      return res.status(400).json({
        message: "Gamer ID can only use letters, numbers, and underscores",
      });
    }

    const existingUsername = await User.findOne({
      username: trimmedUsername,
      _id: { $ne: user._id },
    });

    if (existingUsername) {
      return res.status(400).json({ message: "Gamer ID already taken" });
    }
  }

  user.name = name.trim();
  user.username = trimmedUsername || undefined;
  user.email = normalizedEmail;
  user.phone = trimmedPhone;

  await user.save();

  res.json({
    message: "Profile updated",
    user: sanitizeUser(user),
  });
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
};
