import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import banquetModel from "../../database/schema/banquet.schema.js";
import ApiError from "../../Utils/ApiError.js";

export const GetBanquet = catchAsync(async (req, res) => {
  const { sortField = "created_at", sortOrder = "desc", search, capacity, rate } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const sort = {};
  if (sortField) sort[sortField] = sortOrder === "asc" ? 1 : -1;

  //search  functionality
  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [{ name: searchRegex }, { location: searchRegex }],
    };
  }

  //filter functionality
  const filter = {};
  if (capacity) filter["capacity"] = { $gte: parseInt(capacity) };
  if (rate) filter["rate"] = { $gte: parseInt(rate) };

  // Fetching banquet
  const banquet = await banquetModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await banquetModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);
console.log(totalDocuments,"totalDocumentstotalDocuments")
  return res.status(200).json({
    status: true,
    data: banquet,
    message: "Fetched successfully",
    totalPages: totalDocuments,
  });
});

export const BookingBanquet = catchAsync(async (req, res) => {});
