import express from "express";
import memberAuthMiddleware from "../../middleware/memberAppAuth.js";
import { BookingLibrary, GetLibrary } from "../../controllers/Member/library.js";

const router = express.Router();

router.get("/list", memberAuthMiddleware, GetLibrary);

// Library Booking
router.post("/book-library/:id", memberAuthMiddleware, BookingLibrary);

export default router;
