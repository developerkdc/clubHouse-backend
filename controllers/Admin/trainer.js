import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import { trainerModel } from "../../database/schema/healthFitness.schema.js";
import bcrypt from "bcrypt";
import ApiError from "../../Utils/ApiError.js";

export const AddTrainer = catchAsync(async (req, res, next) => {
  const data = req.body;
  const saltRounds = 10;
  data.profile_image = null;
  data.language = data.language ? JSON.parse(data.language) : null;

  const trainerData = new trainerModel(data);

  if (!data.password) {
    return next(new ApiError("Password is required", 404));
  }
  trainerData.password = await bcrypt.hash(data.password, saltRounds);

  // Check if files were uploaded
  if (files && Object.keys(files).length > 0) {
    if (files.profile_image)
    trainerData.profile_image = files.profile_image[0].filename;
  }

  const savedTrainer = await trainerModel.create(trainerData);

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedTrainer,
    message: "Trainer created successfully.",
  });
});

export const UpdateTrainer = catchAsync(async (req, res) => {
  const trainerId = req.params.id;
  const updateData = req.body;
  const files = req.files;
  if (!mongoose.Types.ObjectId.isValid(trainerId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid trainer ID", data: null });
  }

  if (updateData.password) {
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    updateData.password = hashedPassword;
  }

  if (updateData.language)
    updateData.language = JSON.parse(updateData.language);
  updateData.updated_at = Date.now();

  if (files && Object.keys(files).length > 0) {
    updateData.profile_image = files.profile_image[0].filename;
  }

  const trainer = await trainerModel.findByIdAndUpdate(
    trainerId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!trainer) {
    return res.status(404).json({
      status: false,
      message: "Trainer not found.",
      data: null,
    });
  }

  return res.status(200).json({
    status: true,
    data: trainer,
    message: "Trainer updated successfully",
  });
});

export const ChangePasswordTrainer = catchAsync(async (req, res) => {
  const trainerId = req.params.id;
  const { confirm_password, new_password } = req.body;
  const saltRounds = 10;
  if (!mongoose.Types.ObjectId.isValid(trainerId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid trainer ID.", data: null });
  }

  const trainer = await trainerModel.findById(trainerId);
  if (!trainer) {
    return res
      .status(404)
      .json({ status: false, message: "Trainer not found", data: null });
  }

  if (!new_password || !confirm_password) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "Confirm Password and New Password both required.",
    });
  }

  if (confirm_password !== new_password) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "Confirm password is not same as New password.",
    });
  }

  const hashedPassword = await bcrypt.hash(new_password, saltRounds);
  trainer.password = hashedPassword;
  const updatedTrainer = await trainer.save();
  return res.status(200).json({
    status: true,
    data: updatedTrainer,
    message: "Password updated successfully.",
  });
});

export const GetTrainer = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const {
    sortField = "trainer_id",
    sortOrder = "desc",
    search,
    // status,
    start_date,
    end_date,
    id,
  } = req.query;

  if (id) {
    const trainer = await trainerModel.findById(id);

    if (!trainer) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Trainer not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: trainer,
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
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email_id: searchRegex },
        { gender: searchRegex },
        { mobile_no: searchRegex },
        ...(isNaN(parseInt(search))
          ? [] // If not a valid number, don't include memebr_id conditions
          : [{ experience: parseInt(search) }, { age: parseInt(search) }]),
      ],
    };
  }

  const filter = {};
  // if (status) filter["status"] = status;

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

  // Fetching trainers
  const trainers = await trainerModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await trainerModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: trainers,
    message: "Trainers List.",
    totalPages: totalDocuments,
  });
});
