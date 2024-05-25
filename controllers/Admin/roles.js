import ApiError from "../../Utils/ApiError.js";
import catchAsync from "../../Utils/catchAsync.js";
// import { dynamicSearch } from "../../../../Utils/dynamicSearch";
import rolesModel from "../../database/schema/roles.schema.js";

export const AddRole = catchAsync(async (req, res, next) => {
  const role = await rolesModel.create(req.body);
  if (role) {
    return res.status(201).json({
      status: true,
      data: role,
      message: "Role Created.",
    });
  }
});

export const GetRoles = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const { sortField = "created_at", sortOrder = "desc", search, role,id } = req.query;

  if (id) {
    const role = await rolesModel.findById(id);

    if (!role) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Role not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: role,
      message: "Fetched successfully",
    });
  }

  // const sortField = req?.query?.sortBy || "role_name";
  // const sortDirection = req.query.sort === "desc" ? -1 : 1;
  const sort = {};
  if (sortField) sort[sortField] = sortOrder === "asc" ? 1 : -1;

  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [
        {
          role_name: searchRegex,
        },
      ],
    };
  }

  // Fetch roles based on search and pagination
  const roles = await rolesModel.find(searchQuery).sort(sort).skip(skip).limit(limit);

  // Count total roles with or without search
  const totalRoles = await rolesModel.countDocuments(searchQuery);

  // Calculate total pages
  const totalPages = Math.ceil(totalRoles / limit);

  return res.status(200).json({
    status: true,
    data: roles,
    totalPages: totalRoles,
    message: "All Roles and Permissions",
  });
});

export const GetRolesList = catchAsync(async (req, res, next) => {
  const role = await rolesModel.aggregate([
    {
      $project: {
        _id: 1,
        role_name: 1,
      },
    },
  ]);

  if (role) {
    return res.status(200).json({
      status: true,
      data: role,
      message: "All Roles List",
    });
  }
});

export const UpdateRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const role = await rolesModel.findByIdAndUpdate(id, { ...req.body, updated_at: Date.now() }, { new: true, runValidators: true });
  console.log(role);
  if (!role) return next(new ApiError("Role Not Found", 404));
  return res.status(200).json({
    status: true,
    data: role,
    message: "Role Updated.",
  });
});
