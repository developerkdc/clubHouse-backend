import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import spaModel from "../../database/schema/spa.schema.js";
import ApiError from "../../Utils/ApiError.js";
import { deleteImagesFromStorage } from "../../Utils/MulterFunction.js";

export const AddSpa = catchAsync(async (req, res) => {
  const data = req.body;
  console.log(data);

  data.images = null;
  data.videos = null;

  const newSpa = new spaModel(data);

  // Check if files were uploaded
  const files = req.files;
  if (files && Object.keys(files).length > 0) {
    if (files.banner_image) newSpa.banner_image = files.banner_image[0].filename;
    if (files.images) {
      let allImages = files?.images.map((image) => image.filename);
      newSpa.images = allImages;
    }
    // if(files.videos){
    //     let allImages = files?.images.map((image) => image.filename);
    //     newSpa.images = allImages;
    // }
  }
  console.log(newSpa);
  const savedspa = await newSpa.save();

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedspa,
    message: "Spa Service created successfully.",
  });
});

export const UpdateSpa = catchAsync(async (req, res) => {
  const spaId = req.params.id;
  const updateData = req.body;
  const files = req.files;
  if (!mongoose.Types.ObjectId.isValid(spaId)) {
    return res.status(400).json({ status: false, message: "Invalid spa service ID", data: null });
  }

  if (files && Object.keys(files).length > 0) {
    updateData.banner_image = files.banner_image[0].filename;
  }

  updateData.updated_at = Date.now();

  // console.log(updateData);

  const spa = await spaModel.findByIdAndUpdate(spaId, { $set: updateData }, { new: true, runValidators: true });
  if (!spa) {
    return res.status(404).json({
      status: false,
      message: "Spa service not found.",
    });
  }

  return res.status(200).json({
    status: true,
    data: spa,
    message: "Updated successfully",
  });
});

export const GetSpa = catchAsync(async (req, res) => {
  const { sortField , sortOrder , search, start_date, end_date, spa_start_date, id } = req.query;

  if (id) {
    const spa = await spaModel.findById(id);

    if (!spa) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Spa not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: spa,
      message: "Fetched successfully",
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const sort = {};

  if (sortField) {
    sort[sortField] = sortOrder === "asc" ? 1 : -1;
  } else {
    sort["created_at"] = -1;
  }

  //search  functionality
  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [
        { service_name: searchRegex },
        { service_type: searchRegex },
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

export const UpdateImages = catchAsync(async (req, res) => {
  const spaId = req.params.id;
  const files = req.files;
  const deletedImages = req.body.deleteImages;
  const updateData = {};
  // console.log(deletedImages);

  if (!mongoose.Types.ObjectId.isValid(spaId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid Spa service ID.",
      data: null,
    });
  }

  // Retrieve existing document from the database
  const existingSpa = await spaModel.findById(spaId);

  if (!existingSpa) {
    return res.status(404).json({
      status: false,
      message: "Spa service not found.",
    });
  }
  updateData.images = existingSpa.images;

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
        let deleteData = await deleteImagesFromStorage("uploads/spa", deletedImagesArray);
        console.log(deleteData);
      } else {
        return res.status(400).json({
          status: false,
          message: "There is no images in this spa service to delete.",
          data: null,
        });
      }
    }
  }

  updateData.updated_at = Date.now();
  console.log(updateData);

  const spa = await spaModel.findByIdAndUpdate(spaId, { $set: updateData }, { new: true, runValidators: true });

  // if (!spa) {
  //   return res.status(404).json({
  //     status: false,
  //     message: "Album not found.",
  //   });
  // }

  return res.status(200).json({
    status: true,
    data: spa,
    message: "Updated successfully",
  });
});

export const BookingSpa = catchAsync(async (req, res) => {});
