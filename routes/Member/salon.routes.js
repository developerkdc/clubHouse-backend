import express from "express";
import rolesPermissions from "../../middleware/rolesPermissionAuth.js";
import memberAuthMiddleware from "../../middleware/memberAppAuth.js";
import { BookingSalon, GetSalon } from "../../controllers/Member/salon.js";

const router = express.Router();

router.get("/list", memberAuthMiddleware, GetSalon);

// Salon Booking
router.post(
  "/book-salon/:id",
  memberAuthMiddleware,
  BookingSalon
);

export default router;
