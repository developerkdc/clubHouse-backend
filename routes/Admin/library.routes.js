import express from "express";
import {
  AddLibrary,
  BookingLibrary,
  GetLibrary,
  UpdateLibrary,
  UpdateImages,
  UpdateIssueLibraryBook,
  GetLibraryById,
  UpdateIssueBookReturnDate,
} from "../../controllers/Admin/library.js";

import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  rolesPermissions("library", "add"),
  MulterFunction("./uploads/library").fields([
    { name: "banner_image", maxCount: 1 },
    { name: "images" },
  ]),
  AddLibrary
);
router.patch(
  "/edit/:id",
  authMiddleware,
  rolesPermissions("library", "edit"),
  MulterFunction("./uploads/library").fields([
    { name: "banner_image", maxCount: 1 },
    { name: "images" },
  ]),
  UpdateLibrary
);
router.get(
  "/list",
  authMiddleware,
  rolesPermissions("library", "view"),
  GetLibrary
);

router.get(
  "/list/:id",
  authMiddleware,
  rolesPermissions("library", "view"),
  GetLibraryById
);

router.post(
  "/update-images/:id",
  authMiddleware,
  rolesPermissions("library", "edit"),
  MulterFunction("./uploads/library").fields([{ name: "images" }]),
  UpdateImages
);

// Library Booking
router.post(
  "/book-library/:id",
  authMiddleware,
  rolesPermissions("library", "add"),
  BookingLibrary
);

//isssue book
router.patch(
  "/issue-book/:id",
  authMiddleware,
  rolesPermissions("library", "add"),
  UpdateIssueLibraryBook
);

//update returned book date
router.patch(
  "/return-book/:id",
  authMiddleware,
  rolesPermissions("library", "edit"),
  UpdateIssueBookReturnDate
);

export default router;
