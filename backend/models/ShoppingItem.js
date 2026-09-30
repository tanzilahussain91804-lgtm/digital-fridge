import mongoose from "mongoose";

const shoppingItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    quantity: { type: String, default: "1" },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ShoppingItem", shoppingItemSchema);
