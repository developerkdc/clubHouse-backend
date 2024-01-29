import express from "express";
import memberAuthMiddleware from "../../middleware/memberAppAuth.js";
import { GetBanquet } from "../../controllers/Member/banquet.js";

const router = express.Router();

router.get("/list", memberAuthMiddleware, GetBanquet);

export default router;
