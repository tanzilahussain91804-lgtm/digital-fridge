import express from "express";
import FoodItem from "../models/FoodItem.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// GET /api/food - all food items for the logged-in user
router.get("/", async (req, res) => {
  try {
    const items = await FoodItem.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/food - add a new food item
router.post("/", async (req, res) => {
  try {
    const { name, type, quantity, purchaseDate, expiryDate, imageBase64 } = req.body;

    if (!name || !type || !purchaseDate) {
      return res.status(400).json({ message: "name, type, and purchaseDate are required" });
    }

    const item = await FoodItem.create({
      name,
      type,
      quantity,
      purchaseDate,
      expiryDate: type === "packaged" ? expiryDate : undefined,
      imageBase64,
      userId: req.userId,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/food/:id - a single food item (for the edit form)
router.get("/:id", async (req, res) => {
  try {
    const item = await FoodItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/food/:id - edit an existing food item
router.patch("/:id", async (req, res) => {
  try {
    const { name, type, quantity, purchaseDate, expiryDate, imageBase64 } = req.body;

    const item = await FoodItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (name !== undefined) item.name = name;
    if (type !== undefined) item.type = type;
    if (quantity !== undefined) item.quantity = quantity;
    if (purchaseDate !== undefined) item.purchaseDate = purchaseDate;
    item.expiryDate = item.type === "packaged" ? expiryDate : undefined;
    if (imageBase64 !== undefined) item.imageBase64 = imageBase64;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/food/:id
router.delete("/:id", async (req, res) => {
  try {
    const item = await FoodItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/food/detect-expiry
// Placeholder for future AI/OCR expiry detection. Deliberately left as a
// stub for now — the frontend always has a safe fallback (manual date
// entry), so this can be wired up later without touching anything else.
router.post("/detect-expiry", async (req, res) => {
  res.json({
    detected: false,
    message: "AI detection not yet connected. Please enter the expiry date manually.",
  });
});

export default router;
