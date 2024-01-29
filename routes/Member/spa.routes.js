import express from "express";
import memberAuthMiddleware from "../../middleware/memberAppAuth.js";
import { BookingSpa, GetSpa } from "../../controllers/Member/spa.js";

const router = express.Router();

router.get("/list", memberAuthMiddleware, GetSpa);

// Spa Booking
router.post(
  "/book-spa/:id",
  memberAuthMiddleware,
  BookingSpa
);

export default router;
