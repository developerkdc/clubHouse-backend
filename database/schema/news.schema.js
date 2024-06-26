import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Type is required."],
    indexedDB: true,
    trim: true,
    enum: ["News", "Circular"],
  },
  title: {
    type: String,
    required: [true, "Title is required."],
    trim: true,
  },
  short_description: { type: String, trim: true, default: null },
  description: { type: String, trim: true, default: null },
  banner_image: { type: String, trim: true, default: null },
  source: { type: String, trim: true, default: null },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const newsModel = mongoose.model("news", NewsSchema);
export default newsModel;
