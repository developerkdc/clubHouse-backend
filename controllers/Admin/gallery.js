import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import galleryModel from "../../database/schema/gallery.schema.js";
import ApiError from "../../Utils/ApiError.js";
import { deleteImagesFromStorage } from "../../Utils/MulterFunction.js";

export const AddGallery = catchAsync(async (req, res) => {
  const data = req.body;
  data.images = null;
  data.videos = null;

  const newGallery = new galleryModel(data);
  const files = req.files;

  // Check if files were uploaded
  if (files && Object.keys(files).length > 0) {
    if (files.banner_image)
      newGallery.banner_image = files.banner_image[0].filename;
    if (files.images) {
      let allImages = files?.images.map((image) => image.filename);
      newGallery.images = allImages;
    }
    // if(files.videos){
    //     let allImages = files?.images.map((image) => image.filename);
    //     newGallery.images = allImages;
    // }
  }

  const savedgallery = await newGallery.save();

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedgallery,
    message: "Album created successfully.",
  });
});

export const UpdateGallery = catchAsync(async (req, res) => {
  const galleryId = req.params.id;
  const updateData = req.body;
  const files = req.files;
  if (!mongoose.Types.ObjectId.isValid(galleryId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid album ID", data: null });
  }

  if (files && Object.keys(files).length > 0) {
    updateData.banner_image = files.banner_image[0].filename;
  }
  updateData.updated_at = Date.now();
  // console.log(updateData);

  const gallery = await galleryModel.findByIdAndUpdate(
    galleryId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!gallery) {
    return res.status(404).json({
      status: false,
      message: "Album not found.",
    });
  }

  res.status(200).json({
    status: true,
    data: gallery,
    message: "Updated successfully",
  });
});

export const GetGallery = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const {
    sortField = "created_at",
    sortOrder = "desc",
    search,
    start_date,
    end_date,
    event_date,
    id,
  } = req.query;

  if (id) {
    const gallery = await galleryModel.findById(id);

    if (!gallery) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Album not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: gallery,
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
      $or: [{ album_name: searchRegex }, { source: searchRegex }],
    };
  }

  //filter functionality
  const filter = {};
  // if (role) filter["role_id"] = role;
  if (start_date && end_date) {
    let newStartDate = new Date(start_date);
    let newEndDate = new Date(end_date);
    filter["created_at"] = { $gte: newStartDate, $lte: newEndDate };
  } else if (start_date) {
    let newStartDate = new Date(start_date);
    filter["created_at"] = { $gte: newStartDate };
  } else if (end_date) {
    let newEndDate = new Date(end_date);
    filter["created_at"] = { $gte: newEndDate };
  }

  if (event_date) {
    let newEventDate = new Date(event_date).setHours(0, 0, 1);
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

// export const AddImages = catchAsync(async (req, res) => {
//   const galleryId = req.params.id;
//   const updateData = req.body;
//   const files = req.files;

//   if (!mongoose.Types.ObjectId.isValid(galleryId)) {
//     return res.status(400).json({
//       status: false,
//       message: "Invalid album ID",
//       data: null,
//     });
//   }

//   // Retrieve existing document from the database
//   const existingGallery = await galleryModel.findById(galleryId);

//   if (!existingGallery) {
//     return res.status(404).json({
//       status: false,
//       message: "Album not found.",
//     });
//   }

//   if (files && Object.keys(files).length > 0) {
//     if (files.images.length > 0) {
//       let allImages = files.images.map((image) => image.filename);
//       if (!existingGallery.images || !Array.isArray(existingGallery.images)) {
//         updateData.images = allImages;
//       } else {
//         updateData.images = existingGallery.images.concat(allImages);
//       }
//     }
//   }

//   updateData.updated_at = Date.now();

//   const gallery = await galleryModel.findByIdAndUpdate(galleryId, { $set: updateData }, { new: true, runValidators: true });

//   if (!gallery) {
//     return res.status(404).json({
//       status: false,
//       message: "Album not found.",
//     });
//   }

//   return res.status(200).json({
//     status: true,
//     data: gallery,
//     message: "Updated successfully",
//   });
// });

// export const DeleteImages = catchAsync(async (req, res) => {
//   const galleryId = req.params.id;
//   const deletedImages = req?.body?.deleteImages; // Assuming deleteData is an array of image filenames to be deleted
//   let updateData = {};

//   if (!deletedImages) {
//     return res.status(400).json({
//       status: false,
//       message: "Please select atleast one image.",
//       data: null,
//     });
//   }

//   // Retrieve existing document from the database
//   const existingGallery = await galleryModel.findById(galleryId);
//   if (!existingGallery) {
//     return res.status(404).json({
//       status: false,
//       message: "Album not found.",
//     });
//   }

//   // Check if "images" field exists and is an array in the existing document
//   if (existingGallery.images && Array.isArray(existingGallery.images) && existingGallery.images.length > 0) {
//     // updateData.images = existingGallery.images.filter((image) => !deletedImages.includes(image));
//     const deletedImagesSet = new Set(deletedImages);
//     updateData.images = existingGallery.images.filter((image) => !deletedImagesSet.has(image));
//     updateData.updated_at = Date.now();

//     // Update the gallery document
//     const gallery = await galleryModel.findByIdAndUpdate(galleryId, { $set: updateData }, { new: true, runValidators: true });

//     if (!gallery) {
//       return res.status(404).json({
//         status: false,
//         message: "Album not found.",
//       });
//     }

//     // delete images from local storage
//     let deleteData = await deleteImagesFromStorage("uploads/gallery", deletedImages);
//     console.log(deleteData);

//     return res.status(200).json({
//       status: true,
//       data: gallery,
//       message: "Updated successfully",
//     });
//   } else {
//     // If "images" field doesn't exist or is not an array, return an error
//     return res.status(400).json({
//       status: false,
//       message: "Invalid 'images' field in the existing document.",
//       data: null,
//     });
//   }
// });

export const UpdateImages = catchAsync(async (req, res) => {
  const galleryId = req.params.id;
  const files = req.files;
  const deletedImages = req.body.deleteImages;
  const updateData = {};
  // console.log(deletedImages);

  if (!mongoose.Types.ObjectId.isValid(galleryId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid album ID",
      data: null,
    });
  }

  // Retrieve existing document from the database
  const existingGallery = await galleryModel.findById(galleryId);

  if (!existingGallery) {
    return res.status(404).json({
      status: false,
      message: "Album not found.",
    });
  }
  updateData.images = existingGallery.images;

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
          "uploads/gallery",
          deletedImagesArray
        );
        console.log(deleteData);
      } else {
        return res.status(400).json({
          status: false,
          message: "Invalid 'images' field in the existing document.",
          data: null,
        });
      }
    }
  }

  updateData.updated_at = Date.now();
  console.log(updateData);

  const gallery = await galleryModel.findByIdAndUpdate(
    galleryId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  // if (!gallery) {
  //   return res.status(404).json({
  //     status: false,
  //     message: "Album not found.",
  //   });
  // }

  return res.status(200).json({
    status: true,
    data: gallery,
    message: "Updated successfully",
  });
});
