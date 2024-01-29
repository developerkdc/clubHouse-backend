import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import sportModel from "../../database/schema/sport.schema.js";
import ApiError from "../../Utils/ApiError.js";

export const GetSport = catchAsync(async (req, res) => {
  const { sortField = "created_at", sortOrder = "desc", search, rate } = req.query;

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
  if (rate) filter["rate"] = { $gte: rate };

  // Fetching sport
  const sport = await sportModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await sportModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: sport,
    message: "Fetched successfully",
    totalPages: totalPages,
  });
});

export const BookingSport = catchAsync(async (req, res) => {});
