import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import memberModel from "../../database/schema/member.schema.js";
import bcrypt from "bcrypt";
import ApiError from "../../Utils/ApiError.js";

export const AddMember = catchAsync(async (req, res, next) => {
  const memberData = req.body;
  const saltRounds = 10;

  if (!memberData.password) {
    return next(new ApiError("Password is required", 404));
  }
  memberData.password = await bcrypt.hash(memberData.password, saltRounds);

  const savedMember = await memberModel.create(memberData);

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedMember,
    message: "Member created successfully.",
  });
});

export const UpdateMember = catchAsync(async (req, res) => {
  const memberId = req.params.id;
  const updateData = req.body;
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid member ID", data: null });
  }

  if (updateData.password) {
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    updateData.password = hashedPassword;
  }
  updateData.updated_at = Date.now();

  const user = await memberModel.findByIdAndUpdate(
    memberId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "Member not found.",
      data: null,
    });
  }

  return res.status(200).json({
    status: true,
    data: user,
    message: "Member updated successfully",
  });
});

export const ChangePassword = catchAsync(async (req, res) => {
  const memberId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  const saltRounds = 10;
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid member ID.", data: null });
  }

  const user = await memberModel.findById(memberId);
  if (!user) {
    return res
      .status(404)
      .json({ status: false, message: "Member not found", data: null });
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
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      status: false,
      message: "Current password is incorrect.",
      data: null,
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  user.password = hashedPassword;
  const updatedUser = await user.save();
  return res.status(200).json({
    status: true,
    data: updatedUser,
    message: "Password updated successfully.",
  });
});

export const GetMember = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const {
    sortField = "member_id",
    sortOrder = "desc",
    search,
    // status,
    start_date,
    end_date,
  } = req.query;

  // const sortField = req.query.sortField || "member_id";
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
        { member_type: searchRegex },
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email_id: searchRegex },
        { mobile_no: searchRegex },
        ...(isNaN(parseInt(search))
        ? [] // If not a valid number, don't include memebr_id conditions
        : [{ member_id: parseInt(search) }]),
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

  // Fetching users
  const members = await memberModel
    .find({ ...filter, ...searchQuery })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //total pages
  const totalDocuments = await memberModel.countDocuments({
    ...filter,
    ...searchQuery,
  });
  const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: members,
    message: "Members List.",
    totalPages: totalPages,
  });
});
