import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sub: { type: String, default: "" }, // e.g., sub-category or subtitle
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    sizes: { type: [String], default: [] }, // e.g., ["S","M","L"]
    imageUrl: { type: String, required: true },
    imageName: { type: String, required: true }, // stored filename on disk
    description: { type: String, required: true },
    isBestSelling: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
