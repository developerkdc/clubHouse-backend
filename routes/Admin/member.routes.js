import express from "express";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import authMiddleware from "../../middleware/adminAuth.js";
import {
  AddMember,
  ChangePassword,
  DropdownMemberMaster,
  GetMember,
  UpdateMember,
} from "../../controllers/Admin/member.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";

const router = express.Router();
router.post(
  "/add",
  authMiddleware,
  rolesPermissions("member", "add"),
  MulterFunction("./uploads/member").fields([
    { name: "profile_image", maxCount: 1 },
  ]),
  AddMember
);
// router.post("/add", AddMember);
router.patch(
  "/edit/:id",
  authMiddleware,
  rolesPermissions("member", "edit"),
  MulterFunction("./uploads/member").fields([
    { name: "profile_image", maxCount: 1 },
  ]),
  UpdateMember
);
// router.patch("/edit/:id",UpdateMember);
router.patch(
  "/change-password/:id",
  authMiddleware,
  rolesPermissions("member", "edit"),
  ChangePassword
);
// router.patch("/change-password/:id", ChangePassword);
router.get(
  "/list",
  authMiddleware,
  rolesPermissions("member", "view"),
  GetMember
);
// router.get("/list", FetchMember);
//dropdown list
router.get(
  "/dropdown-list",
  authMiddleware,
  rolesPermissions("member", "view"),
  DropdownMemberMaster
);

export default router;
