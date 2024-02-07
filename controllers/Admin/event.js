import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import eventModel from "../../database/schema/event.schema.js";
import ApiError from "../../Utils/ApiError.js";
import { deleteImagesFromStorage } from "../../Utils/MulterFunction.js";

export const AddEvent = catchAsync(async (req, res) => {
  const data = req.body;
  data.images = null;
  data.videos = null;

  const newEvent = new eventModel(data);
  const files = req.files;
  console.log(data);
  // Check if files were uploaded
  if (files && Object.keys(files).length > 0) {
    if (files.banner_image) newEvent.banner_image = files.banner_image[0].filename;
    if (files.images) {
      let allImages = files?.images.map((image) => image.filename);
      newEvent.images = allImages;
    }
    // if(files.videos){
    //     let allImages = files?.images.map((image) => image.filename);
    //     newEvent.images = allImages;
    // }
  }

  if ((newEvent.duration_type == "multi") & !newEvent.end_date) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "End date is required for multi days event.",
    });
  }
  if ((newEvent.event_type == "paid") & !newEvent.entry_fee) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "Entry fee is required for paid event.",
    });
  }

  console.log(newEvent);

  const savedevent = await newEvent.save();

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedevent,
    message: "Event created successfully.",
  });
});

export const UpdateEvent = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const updateData = req.body;
  const files = req.files;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ status: false, message: "Invalid event ID", data: null });
  }

  if (files && Object.keys(files).length > 0) {
    updateData.banner_image = files.banner_image[0].filename;
  }
  updateData.updated_at = Date.now();

  if ((updateData.duration_type == "multi") & !updateData.end_date) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "End date is required for multi days event.",
    });
  }
  if ((updateData.event_type == "paid") & !updateData.entry_fee) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "Entry fee is required for paid event.",
    });
  }
  // console.log(updateData);

  const event = await eventModel.findByIdAndUpdate(eventId, { $set: updateData }, { new: true, runValidators: true });
  if (!event) {
    return res.status(404).json({
      status: false,
      message: "Event not found.",
    });
  }

  return res.status(200).json({
    status: true,
    data: event,
    message: "Updated successfully",
  });
});

export const GetEvent = catchAsync(async (req, res) => {
  const { sortField = "created_at", sortOrder = "desc", search, start_date, end_date, event_start_date, id} = req.query;

  if (id) {
    const event = await eventModel.findById(id);

    if (!event) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: event,
      message: "Fetched successfully",
    });
  }

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
      $or: [{ category: searchRegex }, { title: searchRegex }, { event_type: searchRegex }, { duration_type: searchRegex }, { source: searchRegex }],
    };
  }

  //filter functionality
  const filter = {};

  if (start_date && end_date) {
    let newStartDate = new Date(start_date);
    let newEndDate = new Date(new Date(end_date).setHours(23, 59, 59));
    // console.log(newStartDate, newEndDate);
    filter["created_at"] = { $gte: newStartDate, $lte: newEndDate };
  } else if (start_date) {
    let newStartDate = new Date(start_date);
    filter["created_at"] = { $gte: newStartDate };
  } else if (end_date) {
    let newEndDate = new Date(new Date(end_date).setHours(23, 59, 59));
    filter["created_at"] = { $lte: newEndDate };
  }

  if (event_start_date) {
    let newEventStartDate = new Date(event_start_date);
    filter["start_date"] = { $gte: newEventStartDate };
  }
  // console.log(filter);

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

export const UpdateImages = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const files = req.files;
  const deletedImages = req.body.deleteImages;
  const updateData = {};
  // console.log(deletedImages);

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid Event ID",
      data: null,
    });
  }

  // Retrieve existing document from the database
  const existingEvent = await eventModel.findById(eventId);

  if (!existingEvent) {
    return res.status(404).json({
      status: false,
      message: "Event not found.",
    });
  }
  updateData.images = existingEvent.images;

  if (files && Object.keys(files).length > 0) {
    // Add images
    if (files.images.length > 0) {
      let allImages = files.images.map((image) => image.filename);
      if (!updateData.images || !Array.isArray(updateData.images)) {
        updateData.images = allImages;
      } else {
        updateData.images = updateData.images.concat(allImages);
      }
    }
  }
  console.log(updateData, "269");

  if (deletedImages) {
    let deletedImagesArray = JSON.parse(deletedImages);

    if (Array.isArray(deletedImagesArray) && deletedImagesArray.length > 0) {
      if (updateData.images && Array.isArray(updateData.images) && updateData.images.length > 0) {
        const deletedImagesSet = new Set(deletedImagesArray);
        updateData.images = updateData.images.filter((image) => !deletedImagesSet.has(image));

        if (!updateData?.images || updateData?.images.length == 0) updateData.images = null;

        // Delete images from local storage
        let deleteData = await deleteImagesFromStorage("uploads/event", deletedImagesArray);
        console.log(deleteData);
      } else {
        return res.status(400).json({
          status: false,
          message: "There is no images in this event to delete.",
          data: null,
        });
      }
    }
  }

  updateData.updated_at = Date.now();
  console.log(updateData);

  const event = await eventModel.findByIdAndUpdate(eventId, { $set: updateData }, { new: true, runValidators: true });

  // if (!event) {
  //   return res.status(404).json({
  //     status: false,
  //     message: "Album not found.",
  //   });
  // }

  return res.status(200).json({
    status: true,
    data: event,
    message: "Updated successfully",
  });
});
