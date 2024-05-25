import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema({
  album_name: {
    type: String,
    required: [true, "Album name is required."],
    indexedDB: true,
    trim: true,
  },
  event_date: { type: Date, required: [true, "Event date is required."] },
  short_description: { type: String, trim: true, default: null },
  description: { type: String, trim: true, default: null },
  banner_image: { type: String, trim: true, default: null },
  images: [
    { type: String, minlength: 2, maxlength: 250, trim: true, default: null },
  ],
  videos: [
    { type: String, minlength: 2, maxlength: 250, trim: true, default: null },
  ],
  // source: { type: String, trim: true, trim: true, default:null  },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const galleryModel = mongoose.model("gallery", GallerySchema);
export default galleryModel;
