import mongoose from "mongoose";

const trendingSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    imageName: { type: String, required: true },
    heading: { type: String, required: true },
    subheading: { type: String, required: true },
    btnText: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Trending", trendingSchema);
