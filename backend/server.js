import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import foodRoutes from "./routes/food.js";
import expenseRoutes from "./routes/expenses.js";
import shoppingRoutes from "./routes/shopping.js";

dotenv.config();
connectDB();

const app = express();

// In development, with no FRONTEND_URL set, this allows any origin (fine
// for local testing). In production, set FRONTEND_URL to your deployed
// frontend's exact URL so only your own app can call this API.
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json({ limit: "10mb" })); // higher limit so base64 images fit

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/shopping", shoppingRoutes);

app.get("/", (req, res) => {
  res.send("Digital Fridge API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
