import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, "Category is required."],
    indexedDB: true,
    trim: true,
  },
  title: {
    type: String,
    minlength: 2,
    maxlength: 250,
    required: [true, "Title is required."],
    trim: true,
  },
  short_description: { type: String, trim: true, default: null },
  description: { type: String, trim: true, default: null },
  banner_image: { type: String, trim: true, default: null },
  images: [
    { type: String, minlength: 2, maxlength: 250, trim: true, default: null },
  ],
  videos: [
    { type: String, minlength: 2, maxlength: 250, trim: true, default: null },
  ],
  event_type: {
    type: String,
    indexedDB: true,
    enum: ["free", "paid"],
    default: "free",
  },
  duration_type: {
    type: String,
    indexedDB: true,
    enum: ["single", "multi"],
    default: "single",
  },
  start_date: {
    type: Date,
    required: [true, "Event start date is required."],
    trim: true,
  },
  end_date: { type: Date, trim: true },
  entry_fee: {
    type: Number,
    required: [
      function () {
        return this.event_type === "paid";
      },
      "Entry fee is required for paid event.",
    ],
    default: null,
  },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
  deleted_at: { type: Date, default: null },
});

const eventModel = mongoose.model("event", EventSchema);
export default eventModel;
