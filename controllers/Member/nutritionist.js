import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import { nutritionistModel } from "../../database/schema/healthFitness.schema.js";
import bcrypt from "bcrypt";
import ApiError from "../../Utils/ApiError.js";

export const GetNutritionist = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const { sortField = "nutritionist_id", sortOrder = "desc", search, age, experience } = req.query;

  const sort = {};
  if (sortField) sort[sortField] = sortOrder === "asc" ? 1 : -1;

  //search  functionality
  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email_id: searchRegex },
        { gender: searchRegex },
        { mobile_no: searchRegex },
      ],
    };
  }

  const filter = {};
  if (experience) filter["experience"] = { $gte: parseInt(experience) };
  if (age) filter["age"] = { $gte: parseInt(age) };

  // Fetching nutritionists
  const nutritionists = await nutritionistModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await nutritionistModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: nutritionists,
    message: "Nutritionists List.",
    totalPages: totalPages,
  });
});


