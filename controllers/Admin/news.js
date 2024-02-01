import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import newsModel from "../../database/schema/news.schema.js";
import ApiError from "../../Utils/ApiError.js";

export const AddNews = catchAsync(async (req, res) => {
  const data = req.body;

  const newNews = new newsModel(data);
  const files = req.files;
  console.log(files);
  // Check if files were uploaded
  if (files && Object.keys(files).length > 0) {
    newNews.banner_image = files.banner_image[0].filename;
  }

  const savednews = await newNews.save();

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savednews,
    message: "News created successfully.",
  });
});

export const UpdateNews = catchAsync(async (req, res) => {
  const newsId = req.params.id;
  const updateData = req.body;
  const files = req.files;
  if (!mongoose.Types.ObjectId.isValid(newsId)) {
    return res.status(400).json({ status: false, message: "Invalid news ID", data: null });
  }

  if (files && Object.keys(files).length > 0) {
    updateData.banner_image = files.banner_image[0].filename;
  }
  updateData.updated_at = Date.now();
  // console.log(updateData);

  const news = await newsModel.findByIdAndUpdate(newsId, { $set: updateData }, { new: true, runValidators: true });
  if (!news) {
    return res.status(404).json({
      status: false,
      message: "News not found.",
    });
  }

  res.status(200).json({
    status: true,
    data: news,
    message: "Updated successfully",
  });
});

export const GetNews = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const { sortField = "created_at", sortOrder = "desc", search, role, start_date, end_date } = req.query;

  const sort = {};
  if (sortField) sort[sortField] = sortOrder === "asc" ? 1 : -1;

  //search  functionality
  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [{ type: searchRegex }, { title: searchRegex }, { source: searchRegex }],
    };
  }

  //filter functionality
  const filter = {};
  // if (role) filter["role_id"] = role;
  if (start_date && end_date) {
    let newStartDate = new Date(start_date).setHours(0, 0, 1);
    let newEndDate = new Date(end_date).setHours(23, 59, 59);
    filter["created_at"] = { $gte: newStartDate, $lte: newEndDate };
  } else if (start_date) {
    let newStartDate = new Date(start_date).setHours(0, 0, 1);
    filter["created_at"] = { $gte: newStartDate };
  } else if (end_date) {
    let newEndDate = new Date(end_date).setHours(23, 59, 59);
    filter["created_at"] = { $lte: newEndDate };
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
    totalPages: totalPages,
  });
});
