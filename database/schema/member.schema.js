import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const FamilyMemberSchema = new mongoose.Schema({
  first_name: { type: String, minlength: 2, maxlength: 25, required: [true, "First name is required."], trim: true },
  last_name: { type: String, minlength: 2, maxlength: 25, required: [true, "Last name is required."], trim: true },
  dob: { type: Date, default: null },
  email_id: {
    type: String,
    minlength: 5,
    maxlength: 50,
    // required: [true, "Email ID Required"],
    trim: true,
    default: null,
  },
  mobile_no: { type: String, minlength: 10, maxlength: 10, trim: true, default: null },
  relation: { type: String, trim: true, required: [true, "Relation with member is required."], trim: true },
});

const MemberSchema = new mongoose.Schema({
  member_id: {
    type: String,
    required: [true, "Member ID required."],
    indexedDB: true,
    trim: true,
    unique: [true, "Member ID already exist."],
  },
  member_type: { type: String, required: [true, "Member type is required."], indexedDB: true, trim: true },
  first_name: { type: String, minlength: 2, maxlength: 25, required: [true, "First name is required."], trim: true },
  last_name: { type: String, minlength: 2, maxlength: 25, required: [true, "Last name is required."], trim: true },
  dob: { type: Date, default: null },
  email_id: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: [true, "Email ID required."],
    trim: true,
    unique: [true, "Email ID already exist."],
  },
  password: { type: String, required: [true, "Password is required."], trim: true },
  mobile_no: { type: String, minlength: 10, maxlength: 10, unique: [true, "Mobile Number already exist."], trim: true, default: null },
  status: { type: Boolean, default: true },
  otp: { type: String, trim: true, default: null },
  family_member: [{ type: FamilyMemberSchema, default: null }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

MemberSchema.methods.jwtToken = function (next) {
  try {
    return jwt.sign({ id: this._id, memberId: this.member_id, emailId: this.email_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
  } catch (error) {
    return next(error);
  }
};

const memberModel = mongoose.model("member", MemberSchema);
export default memberModel;
