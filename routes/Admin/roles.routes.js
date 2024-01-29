import express from "express";
import {
  AddRole,
  GetRoles,
  GetRolesList,
  UpdateRole,
} from "../../controllers/Admin/roles.js";

import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";

const router = express.Router();

router.post("/add",authMiddleware,rolesPermissions("roles", "add"), AddRole);
// router.post("/add", createRole);
router.patch("/edit/:id",authMiddleware,rolesPermissions("roles", "edit"),UpdateRole);
// router.patch("/edit/:id",updateRole);
router.get("/list", authMiddleware, rolesPermissions("roles", "view"), GetRoles);
router.get("/rolesList", GetRolesList);

export default router;
