import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import spaModel from "../../database/schema/spa.schema.js";
import ApiError from "../../Utils/ApiError.js";

export const GetSpa = catchAsync(async (req, res) => {
  const { sortField = "created_at", sortOrder = "desc", search, rate, duration } = req.query;

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
      $or: [{ service_name: searchRegex }, { service_type: searchRegex }],
    };
  }

  //filter functionality
  const filter = {};
  if (rate) filter["rate"] = { $gte: rate };
  if (duration) filter["duration"] = { $gte: duration };

  // Fetching spa
  const spa = await spaModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await spaModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: spa,
    message: "Fetched successfully",
    totalPages: totalDocuments,
  });
});

export const BookingSpa = catchAsync(async (req, res) => {});
