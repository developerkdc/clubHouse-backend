import express from "express";
import {
  AddGallery,
  // AddImages,
  // DeleteImages,
  GetGallery,
  UpdateGallery,
  UpdateImages,
} from "../../controllers/Admin/gallery.js";

import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  rolesPermissions("gallery", "add"),
  MulterFunction("./uploads/gallery").fields([
    { name: "banner_image", maxCount: 1 },
    { name: "images" },
  ]),
  AddGallery
);
// router.post("/add", createRole);
router.patch(
  "/edit/:id",
  authMiddleware,
  rolesPermissions("gallery", "edit"),
  MulterFunction("./uploads/gallery").fields([
    { name: "banner_image", maxCount: 1 },
    { name: "images" },
  ]),
  UpdateGallery
);
// router.patch("/edit/:id",updateRole);
router.get(
  "/list",
  authMiddleware,
  rolesPermissions("gallery", "view"),
  GetGallery
);

// router.post(
//   "/add-images/:id",
//   authMiddleware,
//   rolesPermissions("gallery", "edit"),
//   MulterFunction("./uploads/gallery").fields([
//     { name: "images" },
//   ]),
//   AddImages
// );
// router.post(
//   "/delete-images/:id",
//   authMiddleware,
//   rolesPermissions("gallery", "edit"),
//   DeleteImages
// );

router.post(
    "/update-images/:id",
    authMiddleware,
    rolesPermissions("gallery", "edit"),
    MulterFunction("./uploads/gallery").fields([
      { name: "images" },
    ]),
    UpdateImages
  );

export default router;
