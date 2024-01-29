import express from "express";
import { AddSpa, BookingSpa, GetSpa, UpdateSpa, UpdateImages } from "../../controllers/Admin/spa.js";

import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  rolesPermissions("spa", "add"),
  MulterFunction("./uploads/spa").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  AddSpa
);
router.patch(
  "/edit/:id",
  authMiddleware,
  rolesPermissions("spa", "edit"),
  MulterFunction("./uploads/spa").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  UpdateSpa
);
router.get("/list", authMiddleware, rolesPermissions("spa", "view"), GetSpa);

router.post(
  "/update-images/:id",
  authMiddleware,
  rolesPermissions("spa", "edit"),
  MulterFunction("./uploads/spa").fields([{ name: "images" }]),
  UpdateImages
);

// Spa Booking
router.post(
  "/book-spa/:id",
  authMiddleware,
  rolesPermissions("spa", "add"),
  BookingSpa
);

export default router;
