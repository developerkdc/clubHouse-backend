import express from "express";
import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";
import { AddNutritionist, ChangePasswordNutritionist, GetNutritionist, UpdateNutritionist } from "../../controllers/Admin/nutritionist.js";
import { AddTrainer, GetTrainer, UpdateTrainer, ChangePasswordTrainer } from "../../controllers/Admin/trainer.js";

const router = express.Router();

//================nutritionist routes================//
router.post(
  "/nutritionist/add",
  authMiddleware,
  rolesPermissions("nutritionist", "add"),
  MulterFunction("./uploads/nutritionist").fields([{ name: "profile_image", maxCount: 1 }]),
  AddNutritionist
);
router.patch(
  "/nutritionist/edit/:id",
  authMiddleware,
  rolesPermissions("nutritionist", "edit"),
  MulterFunction("./uploads/nutritionist").fields([{ name: "profile_image", maxCount: 1 }]),
  UpdateNutritionist
);
router.get("/nutritionist/list", authMiddleware, rolesPermissions("nutritionist", "view"), GetNutritionist);
router.patch("/nutritionist/change-password/:id", authMiddleware, rolesPermissions("member", "edit"), ChangePasswordNutritionist);

//============trainer routes==============//
router.post(
  "/trainer/add",
  authMiddleware,
  rolesPermissions("trainer", "add"),
  MulterFunction("./uploads/nutritionist").fields([{ name: "profile_image", maxCount: 1 }]),
  AddTrainer
);
router.patch(
  "/trainer/edit/:id",
  authMiddleware,
  rolesPermissions("trainer", "edit"),
  MulterFunction("./uploads/nutritionist").fields([{ name: "profile_image", maxCount: 1 }]),
  UpdateTrainer
);
router.get("/trainer/list", authMiddleware, rolesPermissions("trainer", "view"), GetTrainer);
router.patch("/trainer/change-password/:id", authMiddleware, rolesPermissions("member", "edit"), ChangePasswordTrainer);

export default router;
