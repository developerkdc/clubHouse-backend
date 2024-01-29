import express from "express";
import memberAuthMiddleware from "../../middleware/memberAppAuth.js";
import { GetGallery } from "../../controllers/Member/gallery.js";

const router = express.Router();

router.get("/list", memberAuthMiddleware, GetGallery);

export default router;
