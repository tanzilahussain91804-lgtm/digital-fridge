import express from "express";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// GET /api/expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses
router.post("/", async (req, res) => {
  try {
    const { amount, date, category, description } = req.body;

    if (!amount || !date) {
      return res.status(400).json({ message: "amount and date are required" });
    }

    const expense = await Expense.create({ amount, date, category, description, userId: req.userId });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expenses/:id - a single expense (for the edit form)
router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/expenses/:id - edit an existing expense
router.patch("/:id", async (req, res) => {
  try {
    const { amount, date, category, description } = req.body;

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (amount !== undefined) expense.amount = amount;
    if (date !== undefined) expense.date = date;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expenses/monthly - totals grouped by month, for the dashboard chart
router.get("/summary/monthly", async (req, res) => {
  try {
    const totals = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.json(totals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
