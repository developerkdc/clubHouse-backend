import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  role_name: {
    type: String,
    minlength: 2,
    maxlength: 25,
    required: [true, "Role Name is required."],
    unique: true,
    trim: true,
  },
  permissions: {
    user: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    roles: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    member: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    news: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    event: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    gallery: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    banquet: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    sport: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    salon: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    spa: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    library: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    nutritionist: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    trainer: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    payment: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    invoice: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
    support: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },

    feedback: {
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },
  },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const rolesModel = mongoose.model("roles", RoleSchema);
export default rolesModel;
