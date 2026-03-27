import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const maskCardNumber = (cardNumber) =>
  `**** **** **** ${cardNumber.slice(-4)}`;

export const getWallet = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({
    balance: user.balance,
    transactions,
  });
};

export const deposit = async (req, res) => {
  const amount = Number(req.body.amount);
  const paymentMethod = req.body.paymentMethod;
  const cardholderName = req.body.cardholderName?.trim();
  const expiry = req.body.expiry?.trim();
  const cvv = req.body.cvv?.trim();
  const cardNumber = String(req.body.cardNumber || "").replace(/\D/g, "");

  if (!amount || amount < 1) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  if (!["credit", "debit"].includes(paymentMethod)) {
    return res.status(400).json({ message: "Select credit or debit card" });
  }

  if (!cardholderName) {
    return res.status(400).json({ message: "Cardholder name is required" });
  }

  if (cardNumber.length < 12 || cardNumber.length > 19) {
    return res.status(400).json({ message: "Enter a valid card number" });
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry || "")) {
    return res.status(400).json({ message: "Expiry must be in MM/YY format" });
  }

  if (!/^\d{3,4}$/.test(cvv || "")) {
    return res.status(400).json({ message: "Enter a valid CVV" });
  }

  const user = await User.findById(req.user._id);
  user.balance += amount;
  user.totalDeposited += amount;
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "deposit",
    amount,
    status: "completed",
    note: `${paymentMethod} card ${maskCardNumber(cardNumber)}`,
  });

  res.json({ balance: user.balance, message: "Deposit successful" });
};

export const withdraw = async (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount < 1) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const user = await User.findById(req.user._id);

  if (amount > user.balance) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  user.balance -= amount;
  user.totalWithdrawn += amount;
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "withdraw",
    amount,
    status: "pending",
  });

  res.json({ balance: user.balance, message: "Withdrawal requested" });
};
