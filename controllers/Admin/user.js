import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import userModel from "../../database/schema/user.schema.js";
import bcrypt from "bcrypt";
import ApiError from "../../Utils/ApiError.js";

export const AddUser = catchAsync(async (req, res) => {
  const userData = req.body;
  const saltRounds = 10;

  if (!userData.password) {
    return next(new ApiError("Password is required", 404));
  }
  userData.password = await bcrypt.hash(userData.password, saltRounds);
  const newUser = new userModel(userData);
  const savedUser = await newUser.save();

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedUser,
    message: "User created successfully",
  });
});

export const UpdateUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;
  updateData.updated_at = Date.now();
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ status: false, message: "Invalid user ID", data: null });
  }

  if (updateData.password) {
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    updateData.password = hashedPassword;
  }
  updateData.updated_at = Date.now();

  const user = await userModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found.",
    });
  }

  res.status(200).json({
    status: true,
    data: user,
    message: "Updated successfully",
  });
});

export const ChangePassword = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const { confirmPassword, newPassword } = req.body;
  const saltRounds = 10;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ status: false, message: "Invalid user ID.", data: null });
  }
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ status: false, message: "User not found", data: null });
  }

  if (!newPassword) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "New Password is required.",
    });
  }

  if (confirmPassword !== newPassword) {
    return res.status(400).json({
      status: false,
      data: null,
      message: "Confirm password is not same as New password.",
    });
  }

  // Check if the current password matches
  // const isPasswordValid = await bcrypt.compare(newPassword, user.password);

  // if (!isPasswordValid) {
  //   return res.status(401).json({
  //     status: false,
  //     message: "Current password is incorrect.",
  //     data: null,
  //   });
  // }
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  user.password = hashedPassword;
  const updatedUser = await user.save();
  return res.status(200).json({
    status: true,
    data: updatedUser,
    message: "Password updated successfully",
  });
});

export const GetUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const { sortField = "user_id", sortOrder = "desc", search, role, start_date, end_date } = req.query;
  // const sortField = req.query.sortField || "user_id";
  // const sortOrder = req.query.sortOrder || "asc";
  const sort = {};
  if (sortField) sort[sortField] = sortOrder === "asc" ? 1 : -1;

  //search  functionality
  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [
        // {
        //   user_id: isNaN(parseInt(search)) ? null : parseInt(search),
        // },
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email_id: searchRegex },
        { mobile_no: searchRegex },
        ...(isNaN(parseInt(search))
          ? [] // If not a valid number, don't include user_id conditions
          : [{ user_id: parseInt(search) }]),
      ],
    };
  }

  //filter functionality
  const filter = {};
  if (role) filter["role_id"] = role;

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
console.log(sort);
  // Fetching users
  const users = await userModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await userModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: users,
    message: "Fetched successfully",
    totalPages: totalPages,
  });
});
