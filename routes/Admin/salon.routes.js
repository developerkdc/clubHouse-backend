import express from "express";
import { AddSalon, BookingSalon, GetSalon, UpdateSalon, UpdateImages } from "../../controllers/Admin/salon.js";

import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  rolesPermissions("salon", "add"),
  MulterFunction("./uploads/salon").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  AddSalon
);
router.patch(
  "/edit/:id",
  authMiddleware,
  rolesPermissions("salon", "edit"),
  MulterFunction("./uploads/salon").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  UpdateSalon
);
router.get("/list", authMiddleware, rolesPermissions("salon", "view"), GetSalon);

router.post(
  "/update-images/:id",
  authMiddleware,
  rolesPermissions("salon", "edit"),
  MulterFunction("./uploads/salon").fields([{ name: "images" }]),
  UpdateImages
);

// Salon Booking
router.post(
  "/book-salon/:id",
  authMiddleware,
  rolesPermissions("salon", "add"),
  BookingSalon
);

export default router;
