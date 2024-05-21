import mongoose from "mongoose";

const BanquetSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 150,
    required: [true, "Banquet name is required."],
    indexedDB: true,
    trim: true,
  },
  location: { type: String, required: [true, "Banquet location is required."] },
  // short_description: { type: String, minlength: 1, trim: true, default: null },
  description: { type: String, minlength: 1, trim: true, default: null },
  banner_image: { type: String, minlength: 1, trim: true, default: null },
  images: [{ type: String, minlength: 2, maxlength: 250, default: null }],
  videos: [{ type: String, minlength: 2, maxlength: 250, default: null }],
  capacity: { type: Number, min: 10, indexedDB: true, trim: true, default: null },
  rate: { type: Number, min: 1000, indexedDB: true, trim: true, default: null },
  amenities: [{ type: String, minlength: 2, maxlength: 250, default: null }],
  tags: [{ type: String, minlength: 1, maxlength: 250, default: null }],
  // terms_condition: { type: String, trim: true, default: null },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const banquetModel = mongoose.model("banquet", BanquetSchema);
export default banquetModel;
