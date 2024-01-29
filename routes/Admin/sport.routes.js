import express from "express";
import { AddSport, BookingSport, GetSport, UpdateSport, UpdateImages } from "../../controllers/Admin/sport.js";

import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  rolesPermissions("sport", "add"),
  MulterFunction("./uploads/sport").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  AddSport
);
router.patch(
  "/edit/:id",
  authMiddleware,
  rolesPermissions("sport", "edit"),
  MulterFunction("./uploads/sport").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  UpdateSport
);
router.get("/list", authMiddleware, rolesPermissions("sport", "view"), GetSport);

router.post(
  "/update-images/:id",
  authMiddleware,
  rolesPermissions("sport", "edit"),
  MulterFunction("./uploads/sport").fields([{ name: "images" }]),
  UpdateImages
);

// Sport Booking
router.post(
  "/book-sport/:id",
  authMiddleware,
  rolesPermissions("sport", "add"),
  BookingSport
);

export default router;
