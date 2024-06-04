import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import libraryModel from "../../database/schema/library.schema.js";
import ApiError from "../../Utils/ApiError.js";
import { deleteImagesFromStorage } from "../../Utils/MulterFunction.js";

export const AddLibrary = catchAsync(async (req, res) => {
  const data = req.body;
  console.log(data);

  data.images = null;

  const newBook = new libraryModel(data);

  // Check if files were uploaded
  const files = req.files;
  if (files && Object.keys(files).length > 0) {
    if (files.banner_image)
      newBook.banner_image = files.banner_image[0].filename;
    if (files.images) {
      let allImages = files?.images.map((image) => image.filename);
      newBook.images = allImages;
    }
  }

  const savedBook = await newBook.save();

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedBook,
    message: "Book successfully added to library.",
  });
});

export const UpdateLibrary = catchAsync(async (req, res) => {
  const bookId = req.params.id;
  const updateData = req.body;
  const files = req.files;
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid book ID", data: null });
  }

  if (files && Object.keys(files).length > 0) {
    updateData.banner_image = files.banner_image[0].filename;
  }

  updateData.updated_at = Date.now();

  // console.log(updateData);

  const book = await libraryModel.findByIdAndUpdate(
    bookId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!book) {
    return res.status(404).json({
      status: false,
      message: "Book not found.",
    });
  }

  return res.status(200).json({
    status: true,
    data: book,
    message: "Updated successfully",
  });
});

export const GetLibrary = catchAsync(async (req, res) => {
  const { sortField, sortOrder, search, id } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  if (id) {
    const library = await libraryModel.findById(id);

    if (!library) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: library,
      message: "Fetched successfully",
    });
  }

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
        { book_name: searchRegex },
        { category: searchRegex },
        { author_name: searchRegex },
        { book_location: searchRegex },
        ...(isNaN(parseInt(search))
          ? [] // If not a valid number, don't include duration and rate conditions
          : [
              { available_quantity: { $lte: parseInt(search) } },
              { booked_quantity: { $lte: parseInt(search) } },
            ]),
      ],
    };
  }

  //filter functionality
  const filter = {};

  // if (start_date && end_date) {
  //   let newStartDate = new Date(start_date).setHours(0, 0, 1);
  //   let newEndDate = new Date(end_date).setHours(23, 59, 59);
  //   // console.log(newStartDate, newEndDate);
  //   filter["created_at"] = { $gte: newStartDate, $lte: newEndDate };
  // } else if (start_date) {
  //   let newStartDate = new Date(start_date).setHours(0, 0, 1);
  //   filter["created_at"] = { $gte: newStartDate };
  // } else if (end_date) {
  //   let newEndDate = new Date(end_date).setHours(23, 59, 59);
  //   filter["created_at"] = { $lte: newEndDate };
  // }

  // Fetching library
  const library = await libraryModel
    .find({ ...filter, ...searchQuery })
    .populate({
      path: "issued_members.member_id",
      model: "member",
      select: "first_name last_name member_id",
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await libraryModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: library,
    message: "Fetched successfully",
    totalPages: totalDocuments,
  });
});

export const GetLibraryById = catchAsync(async (req, res) => {
  const id = req.params.id;
  if (id) {
    const library = await libraryModel.findById(id).populate({
      path: "issued_members.member_id",
      model: "member",
      select: "first_name last_name member_id",
    });

    if (!library) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: library,
      message: "Fetched Details By Id successfully",
    });
  }
});

export const UpdateImages = catchAsync(async (req, res) => {
  const libraryId = req.params.id;
  const files = req.files;
  const deletedImages = req.body.deleteImages;
  const updateData = {};
  // console.log(deletedImages);

  if (!mongoose.Types.ObjectId.isValid(libraryId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid book ID.",
      data: null,
    });
  }

  // Retrieve existing document from the database
  const existingLibrary = await libraryModel.findById(libraryId);

  if (!existingLibrary) {
    return res.status(404).json({
      status: false,
      message: "Book not found.",
    });
  }
  updateData.images = existingLibrary.images;

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
          "uploads/library",
          deletedImagesArray
        );
        console.log(deleteData);
      } else {
        return res.status(400).json({
          status: false,
          message: "There is no images in this book to delete.",
          data: null,
        });
      }
    }
  }

  updateData.updated_at = Date.now();
  console.log(updateData);

  const library = await libraryModel.findByIdAndUpdate(
    libraryId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  // if (!library) {
  //   return res.status(404).json({
  //     status: false,
  //     message: "Album not found.",
  //   });
  // }

  return res.status(200).json({
    status: true,
    data: library,
    message: "Updated successfully",
  });
});

export const UpdateIssueLibraryBook = catchAsync(async (req, res) => {
  const bookId = req.params.id;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid book ID", data: null });
  }
  const getBookDataById = await libraryModel.findOne({
    _id: bookId,
    issued_members: {
      $elemMatch: {
        member_id: updateData?.member_id,
        status: "not_returned",
      },
    },
  });
  if (getBookDataById) {
    return res.status(400).json({
      status: false,
      message: "Member has not returned the book",
      data: null,
    });
  }

  const book = await libraryModel.findByIdAndUpdate(
    bookId,
    {
      $push: {
        issued_members: updateData,
      },
      $inc: {
        available_quantity: -1,
        issued_quantity: 1,
      },
    },

    { new: true, runValidators: true }
  );
  if (!book) {
    return res.status(404).json({
      status: false,
      message: "Book not found.",
    });
  }

  return res.status(200).json({
    status: true,
    data: book,
    message: "Issued successfully",
  });
});

export const UpdateIssueBookReturnDate = catchAsync(async (req, res) => {
  const bookId = req.params.id;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid book ID", data: null });
  }

  const book = await libraryModel.updateOne(
    {
      _id: bookId,
      "issued_members._id": updateData?._id,
    },
    {
      $set: {
        "issued_members.$[e].status": "returned",
        "issued_members.$[e].returned_date": updateData?.returned_date,
      },
      $inc: {
        available_quantity: 1,
        issued_quantity: -1,
      },
    },

    {
      arrayFilters: [{ "e._id": updateData?._id }],
      new: true,
      runValidators: true,
    }
  );
  if (!book) {
    return res.status(404).json({
      status: false,
      message: "Book not found.",
    });
  }

  return res.status(200).json({
    status: true,
    data: book,
    message: "Issued successfully",
  });
});

export const BookingLibrary = catchAsync(async (req, res) => {});
