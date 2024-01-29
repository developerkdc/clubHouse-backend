import express from "express";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js"
import authMiddleware from "../../middleware/adminAuth.js";
import { AddMember, ChangePassword, GetMember, UpdateMember } from "../../controllers/Admin/member.js";

const router = express.Router();


router.post("/add",authMiddleware,rolesPermissions("member", "add"), AddMember);
// router.post("/add", AddMember);
router.patch("/edit/:id",authMiddleware,  rolesPermissions("member", "edit"),UpdateMember);
// router.patch("/edit/:id",UpdateMember);
router.patch("/change-password/:id",authMiddleware,rolesPermissions("member", "edit"), ChangePassword);
// router.patch("/change-password/:id", ChangePassword);
router.get("/list",authMiddleware,rolesPermissions("member", "view"), GetMember);
// router.get("/list", FetchMember);

export default router;
