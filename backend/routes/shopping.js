import express from "express";
import ShoppingItem from "../models/ShoppingItem.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// GET /api/shopping
router.get("/", async (req, res) => {
  try {
    const items = await ShoppingItem.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/shopping
router.post("/", async (req, res) => {
  try {
    const { item, quantity } = req.body;
    if (!item) return res.status(400).json({ message: "item name is required" });

    const newItem = await ShoppingItem.create({ item, quantity, userId: req.userId });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/shopping/:id - toggle completed
router.patch("/:id", async (req, res) => {
  try {
    const item = await ShoppingItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.completed = !item.completed;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/shopping/:id
router.delete("/:id", async (req, res) => {
  try {
    const item = await ShoppingItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
