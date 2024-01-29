import express from "express";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import authMiddleware from "../../middleware/adminAuth.js";
import { AddUser, ChangePassword, GetUsers, UpdateUser } from "../../controllers/Admin/user.js";

const router = express.Router();

router.post("/add", authMiddleware, rolesPermissions("user", "add"), AddUser);
// router.post("/add", AddUser);
router.patch("/edit/:id", authMiddleware, rolesPermissions("user", "edit"), UpdateUser);
// router.patch("/edit/:id",UpdateUser);
router.patch("/change-password/:id", authMiddleware, rolesPermissions("user", "edit"), ChangePassword);
router.get("/list", authMiddleware, rolesPermissions("user", "view"), GetUsers);

export default router;
