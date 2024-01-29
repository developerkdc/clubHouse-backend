import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import libraryModel from "../../database/schema/library.schema.js";
import ApiError from "../../Utils/ApiError.js";

export const GetLibrary = catchAsync(async (req, res) => {
  const { sortField = "created_at", sortOrder = "desc", search, available_quantity } = req.query;

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
      $or: [{ book_name: searchRegex }, { category: searchRegex }, { author_name: searchRegex }],
    };
  }

  //filter functionality
  const filter = {};
  if (available_quantity) filter["available_quantity"] = { $gte: parseInt(available_quantity) };

  // Fetching library
  const library = await libraryModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await libraryModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: library,
    message: "Fetched successfully",
    totalPages: totalPages,
  });
});

export const BookingLibrary = catchAsync(async (req, res) => {});
