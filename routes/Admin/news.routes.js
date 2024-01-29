import express from "express";
import {
    AddNews,
  GetNews,
  UpdateNews,
} from "../../controllers/Admin/news.js";

import authMiddleware from "../../middleware/adminAuth.js";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import { MulterFunction } from "../../Utils/MulterFunction.js";

const router = express.Router();

router.post("/add",authMiddleware,rolesPermissions("news", "add"),MulterFunction("./uploads/news").fields([
  { name: "banner_image", maxCount: 1 },
]), AddNews);
// router.post("/add", createRole);
router.patch("/edit/:id",authMiddleware,rolesPermissions("news", "edit"),MulterFunction("./uploads/news").fields([
  { name: "banner_image", maxCount: 1 }]),UpdateNews);
// router.patch("/edit/:id",updateRole);
router.get("/list", authMiddleware, rolesPermissions("news", "view"), GetNews);

export default router;
