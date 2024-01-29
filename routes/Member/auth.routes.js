import express from "express";
import { LoginMember, ResetPassword, SendOTP, UpdateProfile, VerifyOTPAndUpdatePassword } from "../../controllers/Member/auth.js";
import memberAuthMiddleware from "../../middleware/memberAppAuth.js";

const router = express.Router();

router.post("/login", LoginMember);
router.post("/forgot-password", SendOTP);
router.post("/verify-otp", VerifyOTPAndUpdatePassword);
router.patch("/update-profile", memberAuthMiddleware, UpdateProfile);
router.patch("/reset-password", memberAuthMiddleware, ResetPassword);

export default router;
