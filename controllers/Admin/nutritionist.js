import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import { nutritionistModel } from "../../database/schema/healthFitness.schema.js";
import bcrypt from "bcrypt";
import ApiError from "../../Utils/ApiError.js";

export const AddNutritionist = catchAsync(async (req, res, next) => {
  const nutritionistData = req.body;
  const saltRounds = 10;
  console.log(nutritionistData);

  nutritionistData.language = nutritionistData.language ? JSON.parse(nutritionistData.language) : null;

  if (!nutritionistData.password) {
    return next(new ApiError("Password is required", 404));
  }
  nutritionistData.password = await bcrypt.hash(nutritionistData.password, saltRounds);

  const savedNutritionist = await nutritionistModel.create(nutritionistData);

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedNutritionist,
    message: "Nutritionist created successfully.",
  });
});

export const UpdateNutritionist = catchAsync(async (req, res) => {
  const nutritionistId = req.params.id;
  const updateData = req.body;
  const files = req.files;
  if (!mongoose.Types.ObjectId.isValid(nutritionistId)) {
    return res.status(400).json({ status: false, message: "Invalid nutritionist ID", data: null });
  }

  if (updateData.password) {
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    updateData.password = hashedPassword;
  }

  if (updateData.language) updateData.language = JSON.parse(updateData.language);
  updateData.updated_at = Date.now();

  if (files && Object.keys(files).length > 0) {
    updateData.profile_image = files.profile_image[0].filename;
  }

  const nutritionist = await nutritionistModel.findByIdAndUpdate(nutritionistId, { $set: updateData }, { new: true, runValidators: true });
  if (!nutritionist) {
    return res.status(404).json({
      status: false,
      message: "Nutritionist not found.",
      data: null,
    });
  }

  return res.status(200).json({
    status: true,
    data: nutritionist,
    message: "Nutritionist updated successfully",
  });
});

export const ChangePasswordNutritionist = catchAsync(async (req, res) => {
  const nutritionistId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  const saltRounds = 10;
  if (!mongoose.Types.ObjectId.isValid(nutritionistId)) {
    return res.status(400).json({ status: false, message: "Invalid nutritionist ID.", data: null });
  }

  const nutritionist = await nutritionistModel.findById(nutritionistId);
  if (!nutritionist) {
    return res.status(404).json({ status: false, message: "Nutritionist not found", data: null });
  }

  if (!newPassword || !currentPassword) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "Current Password and New Password both required.",
    });
  }

  if (currentPassword == newPassword) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "New password can't be same as Current password.",
    });
  }

  // Check if the current password matches
  const isPasswordValid = await bcrypt.compare(currentPassword, nutritionist.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      status: false,
      message: "Current password is incorrect.",
      data: null,
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  nutritionist.password = hashedPassword;
  const updatedUser = await nutritionist.save();
  return res.status(200).json({
    status: true,
    data: updatedUser,
    message: "Password updated successfully.",
  });
});

export const GetNutritionist = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const {
    sortField = "nutritionist_id",
    sortOrder = "desc",
    search,
    // status,
    start_date,
    end_date,
  } = req.query;

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
          ? [] // If not a valid number, don't include experience conditions
          : [{ experience: parseInt(search) },{ age: parseInt(search) }]),
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

  // Fetching nutritionists
  const nutritionists = await nutritionistModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await nutritionistModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: nutritionists,
    message: "Nutritionists List.",
    totalPages: totalPages,
  });
});
