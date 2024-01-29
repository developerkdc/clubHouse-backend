import express from "express";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import memberAuthMiddleware from "../../middleware/memberAppAuth.js";
import { BookingSport, GetSport } from "../../controllers/Member/sport.js";

const router = express.Router();

router.get("/list", memberAuthMiddleware, GetSport);
router.post("/book-sport/:id", memberAuthMiddleware, BookingSport);

export default router;
