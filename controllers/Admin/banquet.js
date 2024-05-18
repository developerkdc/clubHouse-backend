import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import banquetModel from "../../database/schema/banquet.schema.js";
import ApiError from "../../Utils/ApiError.js";
import { deleteImagesFromStorage } from "../../Utils/MulterFunction.js";

export const AddBanquet = catchAsync(async (req, res) => {
  const data = req.body;
  console.log(data);

  data.amenities = data.amenities ? JSON.parse(data.amenities) : null;
  data.tags = data.tags ? JSON.parse(data.tags) : null;
  data.images = null;
  data.videos = null;

  const newBanquet = new banquetModel(data);

  // Check if files were uploaded
  const files = req.files;
  if (files && Object.keys(files).length > 0) {
    if (files.banner_image)
      newBanquet.banner_image = files.banner_image[0].filename;
    if (files.images) {
      let allImages = files?.images.map((image) => image.filename);
      newBanquet.images = allImages;
    }
    // if(files.videos){
    //     let allImages = files?.images.map((image) => image.filename);
    //     newBanquet.images = allImages;
    // }
  }
  console.log(newBanquet);
  const savedbanquet = await newBanquet.save();

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedbanquet,
    message: "Banquet created successfully.",
  });
});

export const UpdateBanquet = catchAsync(async (req, res) => {
  const banquetId = req.params.id;
  const updateData = req.body;
  const files = req.files;
  if (!mongoose.Types.ObjectId.isValid(banquetId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid banquet ID", data: null });
  }

  if (files && Object.keys(files).length > 0) {
    updateData.banner_image = files.banner_image[0].filename;
  }

  //   console.log(updateData);
  if (updateData.amenities) {
    updateData.amenities = JSON.parse(updateData.amenities);
    if (updateData?.amenities?.length == 0) updateData.amenities = null;
  }

  if (updateData.tags) {
    updateData.tags = JSON.parse(updateData.tags);
    if (updateData.tags.length == 0) updateData.tags = null;
  }

  updateData.updated_at = Date.now();

  // console.log(updateData);

  const banquet = await banquetModel.findByIdAndUpdate(
    banquetId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!banquet) {
    return res.status(404).json({
      status: false,
      message: "Banquet not found.",
    });
  }

  return res.status(200).json({
    status: true,
    data: banquet,
    message: "Updated successfully",
  });
});

export const GetBanquet = catchAsync(async (req, res) => {
  const {
    sortField = "created_at",
    sortOrder = "desc",
    search,
    start_date,
    end_date,
    banquet_start_date,
    id,
  } = req.query;

  if (id) {
    const banquet = await banquetModel.findById(id);

    if (!banquet) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Banquet not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: banquet,
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
      $or: [
        { name: searchRegex },
        { location: searchRegex },
        ...(isNaN(parseInt(search))
          ? [] // If not a valid number, don't include duration and rate conditions
          : [
              { capacity: { $lte: parseInt(search) } },
              { rate: { $lte: parseInt(search) } },
            ]),
      ],
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

  // console.log(filter);

  // Fetching banquet
  const banquet = await banquetModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await banquetModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: banquet,
    message: "Fetched successfully",
    totalPages: totalDocuments,
  });
});

export const UpdateImages = catchAsync(async (req, res) => {
  const banquetId = req.params.id;
  const files = req.files;
  const deletedImages = req.body.deleteImages;
  const updateData = {};
  // console.log(deletedImages);

  if (!mongoose.Types.ObjectId.isValid(banquetId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid Banquet ID",
      data: null,
    });
  }

  // Retrieve existing document from the database
  const existingBanquet = await banquetModel.findById(banquetId);

  if (!existingBanquet) {
    return res.status(404).json({
      status: false,
      message: "Banquet not found.",
    });
  }
  updateData.images = existingBanquet.images;

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
      if (
        updateData.images &&
        Array.isArray(updateData.images) &&
        updateData.images.length > 0
      ) {
        const deletedImagesSet = new Set(deletedImagesArray);
        updateData.images = updateData.images.filter(
          (image) => !deletedImagesSet.has(image)
        );
        if (!updateData?.images || updateData?.images.length == 0)
          updateData.images = null;

        // Delete images from local storage
        let deleteData = await deleteImagesFromStorage(
          "uploads/banquet",
          deletedImagesArray
        );
        console.log(deleteData);
      } else {
        return res.status(400).json({
          status: false,
          message: "There is no images in this banquet to delete.",
          data: null,
        });
      }
    }
  }

  updateData.updated_at = Date.now();
  console.log(updateData);

  const banquet = await banquetModel.findByIdAndUpdate(
    banquetId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  // if (!banquet) {
  //   return res.status(404).json({
  //     status: false,
  //     message: "Album not found.",
  //   });
  // }

  return res.status(200).json({
    status: true,
    data: banquet,
    message: "Updated successfully",
  });
});

export const BookingBanquet = catchAsync(async (req, res) => {});
