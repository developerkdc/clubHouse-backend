import mongoose from "mongoose";

const BanquetBookingSchema = new mongoose.Schema({
  member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "memberModel",
    indexedDB: true,
    default: null,
  },
  banquet_id: { type: mongoose.Schema.Types.ObjectId, ref: "banquetModel", indexedDB: true, required: [true, "Banquet is required."] },
  total_slots: { type: Number, min: 1, required: [true, "Select minimum one slot."] },
  slots: { type: String, required: [true, "Select minimum one slot."] },
  amount_paid: { type: Number },
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const banquetModel = mongoose.model("banquet_booking", BanquetBookingSchema);
export default banquetModel;
