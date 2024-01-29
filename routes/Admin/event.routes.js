import express from "express";
import { AddEvent, GetEvent, UpdateEvent, UpdateImages } from "../../controllers/Admin/event.js";

import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  rolesPermissions("event", "add"),
  MulterFunction("./uploads/event").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  AddEvent
);
// router.post("/add", createRole);
router.patch(
  "/edit/:id",
  authMiddleware,
  rolesPermissions("event", "edit"),
  MulterFunction("./uploads/event").fields([{ name: "banner_image", maxCount: 1 }, { name: "images" }]),
  UpdateEvent
);
// router.patch("/edit/:id",updateRole);
router.get("/list", authMiddleware, rolesPermissions("event", "view"), GetEvent);

router.post(
  "/update-images/:id",
  authMiddleware,
  rolesPermissions("event", "edit"),
  MulterFunction("./uploads/event").fields([{ name: "images" }]),
  UpdateImages
);

export default router;
