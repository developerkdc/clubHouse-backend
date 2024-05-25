import mongoose from "mongoose";

const SpaSchema = new mongoose.Schema({
  service_name: {
    type: String,

    required: [true, "Service name is required."],
    indexedDB: true,
    trim: true,
  },
  service_type: {
    type: String,
    required: [true, "Service type is required (Male/Female)."],
    trim: true,
    indexedDB: true,
    enum: ["Male", "Female", "Both"],
  },
  // short_description: { type: String,  trim: true, default: null },
  description: { type: String, trim: true, default: null },
  banner_image: { type: String, trim: true, default: null },
  images: [{ type: String, minlength: 2, maxlength: 250, default: null }],
  videos: [{ type: String, minlength: 2, maxlength: 250, default: null }],
  duration: { type: Number, min: 10, default: null },
  rate: { type: Number, indexedDB: true, trim: true, default: null },
  // terms_condition: { type: String, trim: true, default: null },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const spaModel = mongoose.model("spa", SpaSchema);
export default spaModel;
