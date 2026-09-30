import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["packaged", "fresh"], required: true },
    quantity: { type: String, default: "1" },
    purchaseDate: { type: Date, required: true },
    expiryDate: { type: Date }, // only for packaged items
    imageBase64: { type: String }, // optional product image, stored inline
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("FoodItem", foodItemSchema);
