import mongoose from "mongoose";

const LibrarySchema = new mongoose.Schema({
  book_name: {
    type: String,
    minlength: 1,
    maxlength: 150,
    required: [true, "Book name is required."],
    indexedDB: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Book Category is required."],
    trim: true,
    indexedDB: true,
  },
  author_name: { type: String, minlength: 1, indexedDB: true, trim: true, default: null },
  banner_image: { type: String, minlength: 1, default: null },
  images: [{ type: String, minlength: 2, maxlength: 250, default: null }],
  book_summary: { type: String, minlength: 1, default: null },
  book_location: { type: String, minlength: 1, maxlength: 250, default: null },
  total_quantity: { type: Number, default: 0 },
  booked_quantity: { type: Number, default: 0 },
  issued_quantity: { type: Number, default: 0 },
  available_quantity: { type: Number, default: 0, indexedDB: true },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const libraryModel = mongoose.model("library", LibrarySchema);
export default libraryModel;
