import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import eventModel from "../../database/schema/event.schema.js";
import ApiError from "../../Utils/ApiError.js";

export const GetEvent = catchAsync(async (req, res) => {
  const { sortField = "created_at", sortOrder = "desc", search, event_type, event_start_date } = req.query;

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
      $or: [{ category: searchRegex }, { title: searchRegex }, { event_type: searchRegex }, { duration_type: searchRegex }],
    };
  }

  //filter functionality
  const filter = {};

  if (event_start_date) {
    let newEventStartDate = new Date(event_start_date);
    filter["start_date"] = { $gte: newEventStartDate };
  }
  if (event_type) filter["event_type"] = event_type;

  // Fetching event
  const event = await eventModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await eventModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: event,
    message: "Fetched successfully",
    totalPages: totalPages,
  });
});
