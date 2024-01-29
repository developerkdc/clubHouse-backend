import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import galleryModel from "../../database/schema/gallery.schema.js";

export const GetGallery = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const { sortField = "created_at", sortOrder = "desc", search, start_date, end_date,event_date } = req.query;

  const sort = {};
  if (sortField) sort[sortField] = sortOrder === "asc" ? 1 : -1;

  //search  functionality
  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [{ album_name: searchRegex }],
    };
  }

  //filter functionality
  const filter = {};
  if (event_date) {
    let newEventDate = new Date(event_date);
    filter["event_date"] = { $gte: newEventDate };
  }

  // Fetching gallery
  const gallery = await galleryModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await galleryModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: gallery,
    message: "Fetched successfully",
    totalPages: totalPages,
  });
});
