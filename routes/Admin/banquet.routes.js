import express from "express";
import { AddBanquet, BookingBanquet, GetBanquet, UpdateBanquet, UpdateImages } from "../../controllers/Admin/banquet.js";

import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  rolesPermissions("banquet", "add"),
  MulterFunction("./uploads/banquet").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  AddBanquet
);
router.patch(
  "/edit/:id",
  authMiddleware,
  rolesPermissions("banquet", "edit"),
  MulterFunction("./uploads/banquet").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  UpdateBanquet
);
router.get("/list", authMiddleware, rolesPermissions("banquet", "view"), GetBanquet);

router.post(
  "/update-images/:id",
  authMiddleware,
  rolesPermissions("banquet", "edit"),
  MulterFunction("./uploads/banquet").fields([{ name: "images" }]),
  UpdateImages
);

// Banquet Booking
router.post(
  "/book-banquet/:id",
  authMiddleware,
  rolesPermissions("banquet", "add"),
  BookingBanquet
);

export default router;
