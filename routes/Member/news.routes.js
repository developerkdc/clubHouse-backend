import express from "express";

import memberAuthMiddleware from "../../middleware/memberAppAuth.js";
import { GetNews } from "../../controllers/Member/news.js";

const router = express.Router();

router.get("/list", memberAuthMiddleware, GetNews);

export default router;
