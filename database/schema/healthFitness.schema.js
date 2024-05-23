import mongoose from "mongoose";

//  Nutritionist models and schema
const NutritionistSchema = new mongoose.Schema({
  first_name: {
    type: String,
    minlength: 2,
    maxlength: 25,
    required: [true, "First name is required."],
    trim: true,
  },
  last_name: {
    type: String,
    minlength: 2,
    maxlength: 25,
    required: [true, "Last name is required."],
    trim: true,
  },
  gender: {
    type: String,
    required: [true, "Gender is required."],
    trim: true,
    enum: ["Male", "Female"],
  },
  age: { type: Number, min: 20, default: null },
  email_id: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: [true, "Email ID required."],
    trim: true,
    unique: true,
  },
  profile_image: { type: String, trim: true, default: null },
  // password: { type: String, required: [true, "Password is required."], trim: true },
  mobile_no: {
    type: String,
    minlength: 10,
    maxlength: 10,
    unique: true,
    trim: true,
    default: null,
  },
  experience: { type: Number, trim: true, default: 0 },
  nutritionist_available: {
    monday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    tuesday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    wednesday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    thursday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    friday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    saturday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    sunday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
  },
  description: {
    type: String,
    trim: true,
  },
  language: {
    type: [String],
    trim: true,
    default: null,
    // default: function() { return this.language || null; },
    // validate: {
    //   validator: function(val) {
    //     // Ensure that the array does not contain empty strings
    //     return val.filter(Boolean).length === val.length;
    //   },
    //   message: 'Language array should not contain empty strings.',
    // },
  },
  // available_from: { type: String, trim: true, default: null },
  // available_till: { type: String, trim: true, default: null },
  otp: { type: String, trim: true, default: null },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

export const nutritionistModel = mongoose.model(
  "nutritionist",
  NutritionistSchema
);

//  Trainer models and schema
const TrainerSchema = new mongoose.Schema({
  first_name: {
    type: String,
    minlength: 2,
    maxlength: 25,
    required: [true, "First name is required."],
    trim: true,
  },
  last_name: {
    type: String,
    minlength: 2,
    maxlength: 25,
    required: [true, "Last name is required."],
    trim: true,
  },
  gender: {
    type: String,
    required: [true, "Gender is required."],
    trim: true,
    enum: ["Male", "Female"],
  },
  age: { type: Number, min: 20, default: null },
  email_id: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: [true, "Email ID required."],
    trim: true,
    unique: true,
  },
  profile_image: { type: String, trim: true, default: null },
  // password: { type: String, required: [true, "Password is required."], trim: true },
  mobile_no: {
    type: String,
    minlength: 10,
    maxlength: 10,
    unique: true,
    trim: true,
    default: null,
  },
  trainer_available: {
    monday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    tuesday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    wednesday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    thursday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    friday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    saturday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
    sunday: [
      {
        available_from: { type: String, trim: true, default: null },
        available_till: { type: String, trim: true, default: null },
        status: { type: Boolean, default: false },
      },
    ],
  },
  description: {
    type: String,
    trim: true,
  },
  experience: { type: Number, trim: true, default: 0 },
  language: { type: [{ type: String, trim: true }], default: null },
  // available_from: { type: String, trim: true, default: null },
  // available_till: { type: String, trim: true, default: null },
  otp: { type: String, trim: true, default: null },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

export const trainerModel = mongoose.model("trainer", TrainerSchema);
