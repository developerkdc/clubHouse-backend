import mongoose from "mongoose";

const SportSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 150,
    required: [true, "Sport name is required."],
    indexedDB: true,
    trim: true,
  },
  location: { type: String, required: [true, "Banquet location is required."] },
  field_name: { type: String, trim: true, default: null }, // ex:- turf for cricket, court for batmintion etc..
  field_no: { type: Number, default: null }, // if sport is batmintion then this will be court number 1,2,3 etc..
  description: { type: String, minlength: 1, trim: true, default: null },
  banner_image: { type: String, minlength: 1, trim: true, default: null },
  images: [{ type: String, minlength: 2, maxlength: 250, default: null }],
  videos: [{ type: String, minlength: 2, maxlength: 250, default: null }],
  rate: { type: Number, min: 10, indexedDB: true, trim: true, default: null },
  amenities: [{ type: String, minlength: 2, maxlength: 250, default: null }],
  terms_condition: { type: String, trim: true, default: null },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const sportModel = mongoose.model("sport", SportSchema);
export default sportModel;
