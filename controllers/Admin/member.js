import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import memberModel from "../../database/schema/member.schema.js";
import bcrypt from "bcrypt";
import ApiError from "../../Utils/ApiError.js";

// export const AddMember = catchAsync(async (req, res, next) => {
//   const memberData = req.body;
//   const saltRounds = 10;
//   const files = req.files;
//   console.log(files);
//   // Check if files were uploaded
//   if (files && Object.keys(files).length > 0) {
//     memberData.profile_image = files.profile_image[0].filename;
//   }

//   if (!memberData.password) {
//     return next(new ApiError("Password is required", 404));
//   }
//   memberData.password = await bcrypt.hash(memberData.password, saltRounds);
//   memberData.family_member = JSON.parse(memberData.family_member);

//   const savedMember = await memberModel.create(memberData);

//   // Send a success response
//   return res.status(201).json({
//     status: true,
//     data: savedMember,
//     message: "Member created successfully.",
//   });
// });

export const AddMember = catchAsync(async (req, res, next) => {
  const memberData = req.body;
  const saltRounds = 10;
  const files = req.files;
  const profileImagesMap = {};

  // Map files to their fieldnames for easy access
  files.forEach((file) => {
    profileImagesMap[file.fieldname] = file.filename;
  });

  // Assign the main profile image
  if (profileImagesMap["profile_image"]) {
    memberData.profile_image = profileImagesMap["profile_image"];
  }
  // Parse and assign family member profile images
  // memberData.family_member = JSON.parse(memberData.family_member);

  memberData?.family_member?.forEach((familyMember, index) => {
    const familyMemberImageField = `family_member[${index}][profile_image]`;
    if (profileImagesMap[familyMemberImageField]) {
      familyMember.profile_image = profileImagesMap[familyMemberImageField];
    }
  });
  console.log("57");

  // Hash the password
  if (!memberData.password) {
    return next(new ApiError("Password is required", 404));
  }
  memberData.password = await bcrypt.hash(memberData.password, saltRounds);

  // Save the member data to the database
  const savedMember = await memberModel.create(memberData);

  // Send a success response
  return res.status(201).json({
    status: true,
    data: savedMember,
    message: "Member created successfully.",
  });
});

// export const UpdateMember = catchAsync(async (req, res) => {
//   const memberId = req.params.id;
//   const updateData = req.body;

//   const files = req.files;
//   console.log(files);
//   // Check if files were uploaded
//   if (files && Object.keys(files).length > 0) {
//     updateData.profile_image = files.profile_image[0].filename;
//   }

//   if (!mongoose.Types.ObjectId.isValid(memberId)) {
//     return res
//       .status(400)
//       .json({ status: false, message: "Invalid member ID", data: null });
//   }

//   if (updateData.password) {
//     const hashedPassword = await bcrypt.hash(updateData.password, 10);
//     updateData.password = hashedPassword;
//   }
//   updateData.updated_at = Date.now();

//   const user = await memberModel.findByIdAndUpdate(
//     memberId,
//     { $set: updateData },
//     { new: true, runValidators: true }
//   );
//   if (!user) {
//     return res.status(404).json({
//       status: false,
//       message: "Member not found.",
//       data: null,
//     });
//   }

//   return res.status(200).json({
//     status: true,
//     data: user,
//     message: "Member updated successfully",
//   });
// });

export const UpdateMember = catchAsync(async (req, res) => {
  const memberId = req.params.id;
  let updateData = req.body;

  const files = req.files;

  // Validate member ID
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return res.status(400).json({ status: false, message: "Invalid member ID", data: null });
  }

  // Map files to their field names for easy access
  const profileImagesMap = {};
  files.forEach(file => {
    profileImagesMap[file.fieldname] = file.filename;
  });

  // Assign the main profile image
  if (profileImagesMap['profile_image']) {
    updateData.profile_image = profileImagesMap['profile_image'];
  }

  // Parse and assign family member profile images
  if (updateData.family_member) {
    updateData.family_member.forEach((familyMember, index) => {
      const familyMemberImageField = `family_member[${index}][profile_image]`;
      if (profileImagesMap[familyMemberImageField]) {
        familyMember.profile_image = profileImagesMap[familyMemberImageField];
      }
      
      // Ensure dob is correctly parsed as a Date object or null
      if (familyMember.dob === 'null') {
        familyMember.dob = null;
      } else if (familyMember.dob) {
        familyMember.dob = new Date(familyMember.dob);
      }
    });
  }

  // Hash the password if it is provided
  if (updateData.password) {
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    updateData.password = hashedPassword;
  }
  
  // Set the updated_at field to the current date and time
  updateData.updated_at = Date.now();

  // Update the member data in the database
  const user = await memberModel.findByIdAndUpdate(
    memberId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  // Check if the member was found and updated
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "Member not found.",
      data: null,
    });
  }

  // Return a success response
  return res.status(200).json({
    status: true,
    data: user,
    message: "Member updated successfully",
  });
});


export const ChangePassword = catchAsync(async (req, res) => {
  console.log("requesting change password", req.body);
  const memberId = req.params.id;
  const { confirm_password, new_password } = req.body;
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
    sortField,
    sortOrder ,
    search,
    // status,
    start_date,
    end_date,
    id,
  } = req.query;

  if (id) {
    const member = await memberModel.findById(id);

    if (!member) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Member not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: member,
      message: "Fetched successfully",
    });
  }

  // const sortField = req.query.sortField || "member_id";
  // const sortOrder = req.query.sortOrder || "asc";
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
    totalPages: totalDocuments,
  });
});

//dropdown list members
export const DropdownMemberMaster = catchAsync(async (req, res) => {
  const list = await memberModel.aggregate([
    {
      $project: {
        first_name: 1,
        last_name: 1,
      },
    },
  ]);
  res.status(200).json({
    result: list,
    status: true,
    message: "Members Dropdown List",
  });
});
