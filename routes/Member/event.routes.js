import express from "express";

import memberAuthMiddleware from "../../middleware/memberAppAuth.js";
import { GetEvent } from "../../controllers/Member/event.js";

const router = express.Router();

router.get("/list", memberAuthMiddleware, GetEvent);

export default router;
