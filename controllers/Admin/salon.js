import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import salonModel from "../../database/schema/salon.schema.js";
import ApiError from "../../Utils/ApiError.js";
import { deleteImagesFromStorage } from "../../Utils/MulterFunction.js";

export const AddSalon = catchAsync(async (req, res) => {
  const data = req.body;
  console.log(data);

  // data.amenities = data.amenities ? JSON.parse(data.amenities) : null;
  // data.tags = data.tags ? JSON.parse(data.tags) : null;
  data.images = null;
  data.videos = null;

  const newSalon = new salonModel(data);

  // Check if files were uploaded
  const files = req.files;
  if (files && Object.keys(files).length > 0) {
    if (files.banner_image) newSalon.banner_image = files.banner_image[0].filename;
    if (files.images) {
      let allImages = files?.images.map((image) => image.filename);
      newSalon.images = allImages;
    }
    // if(files.videos){
    //     let allImages = files?.images.map((image) => image.filename);
    //     newSalon.images = allImages;
    // }
  }
  console.log(newSalon);
  const savedsalon = await newSalon.save();

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedsalon,
    message: "Salon service created successfully.",
  });
});

export const UpdateSalon = catchAsync(async (req, res) => {
  const salonId = req.params.id;
  const updateData = req.body;
  const files = req.files;
  if (!mongoose.Types.ObjectId.isValid(salonId)) {
    return res.status(400).json({ status: false, message: "Invalid salon service ID", data: null });
  }

  if (files && Object.keys(files).length > 0) {
    updateData.banner_image = files.banner_image[0].filename;
  }

  //   console.log(updateData);
  // if (updateData.amenities) {
  //   updateData.amenities = JSON.parse(updateData.amenities);
  //   if (updateData?.amenities?.length == 0) updateData.amenities = null;
  // }

  // if (updateData.tags) {
  //   updateData.tags = JSON.parse(updateData.tags);
  //   if (updateData.tags.length == 0) updateData.tags = null;
  // }

  updateData.updated_at = Date.now();

  // console.log(updateData);

  const salon = await salonModel.findByIdAndUpdate(salonId, { $set: updateData }, { new: true, runValidators: true });
  if (!salon) {
    return res.status(404).json({
      status: false,
      message: "Salon service not found.",
    });
  }

  return res.status(200).json({
    status: true,
    data: salon,
    message: "Updated successfully",
  });
});

export const GetSalon = catchAsync(async (req, res) => {
  const { sortField = "created_at", sortOrder = "desc", search, start_date, end_date, salon_start_date, id} = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  if (id) {
    const salon = await salonModel.findById(id);

    if (!salon) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Salon not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: salon,
      message: "Fetched successfully",
    });
  }

  const sort = {};
  if (sortField) sort[sortField] = sortOrder === "asc" ? 1 : -1;

  //search  functionality
  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [
        { service_name: searchRegex },
        { service_type: searchRegex },
        // { duration: isNaN(parseInt(search)) ? null : { $lte: parseInt(search) } },
        // { rate: isNaN(parseInt(search)) ? null : { $lte: parseInt(search) } },
        ...(isNaN(parseInt(search))
          ? [] // If not a valid number, don't include duration and rate conditions
          : [{ duration: { $lte: parseInt(search) } }, { rate: { $lte: parseInt(search) } }]),
      ],
    };
  }

  //filter functionality
  const filter = {};

  if (start_date && end_date) {
    let newStartDate = new Date(start_date).setHours(0, 0, 1);
    let newEndDate = new Date(end_date).setHours(23, 59, 59);
    // console.log(newStartDate, newEndDate);
    filter["created_at"] = { $gte: newStartDate, $lte: newEndDate };
  } else if (start_date) {
    let newStartDate = new Date(start_date).setHours(0, 0, 1);
    filter["created_at"] = { $gte: newStartDate };
  } else if (end_date) {
    let newEndDate = new Date(end_date).setHours(23, 59, 59);
    filter["created_at"] = { $lte: newEndDate };
  }

  // console.log(searchQuery);

  // Fetching salon
  const salon = await salonModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await salonModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: salon,
    message: "Fetched successfully",
    totalPages: totalDocuments,
  });
});

export const UpdateImages = catchAsync(async (req, res) => {
  const salonId = req.params.id;
  const files = req.files;
  const deletedImages = req.body.deleteImages;
  const updateData = {};
  // console.log(deletedImages);

  if (!mongoose.Types.ObjectId.isValid(salonId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid Salon service ID",
      data: null,
    });
  }

  // Retrieve existing document from the database
  const existingSalon = await salonModel.findById(salonId);

  if (!existingSalon) {
    return res.status(404).json({
      status: false,
      message: "Salon service not found.",
    });
  }
  updateData.images = existingSalon.images;

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
        let deleteData = await deleteImagesFromStorage("uploads/salon", deletedImagesArray);
        console.log(deleteData);
      } else {
        return res.status(400).json({
          status: false,
          message: "There is no images in this salon service to delete.",
          data: null,
        });
      }
    }
  }

  updateData.updated_at = Date.now();
  console.log(updateData);

  const salon = await salonModel.findByIdAndUpdate(salonId, { $set: updateData }, { new: true, runValidators: true });

  // if (!salon) {
  //   return res.status(404).json({
  //     status: false,
  //     message: "Album not found.",
  //   });
  // }

  return res.status(200).json({
    status: true,
    data: salon,
    message: "Updated successfully",
  });
});

export const BookingSalon = catchAsync(async (req, res) => {});
