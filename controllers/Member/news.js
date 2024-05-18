import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import newsModel from "../../database/schema/news.schema.js";


export const GetNews = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const {
    sortField = "created_at",
    sortOrder = "desc",
    search,
    date
  } = req.query;

  const sort = {};
  if (sortField) sort[sortField] = sortOrder === "asc" ? 1 : -1;

  //search  functionality
  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [
        { type: searchRegex },
        { title: searchRegex },
      ],
    };
  }

  //filter functionality
  const filter = {};
  // if (role) filter["role_id"] = role;
  if (date) {
    let newDate = new Date(date);
    filter["created_at"] = newDate;
  }

  // Fetching news
  const news = await newsModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await newsModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: news,
    message: "Fetched successfully",
    totalPages: totalDocuments,
  });
});
