import express from "express";
import memberAuthMiddleware from "../../middleware/memberAppAuth.js";
import { GetNutritionist } from "../../controllers/Member/nutritionist.js";
import { GetTrainer } from "../../controllers/Member/trainer.js";

const router = express.Router();

//================nutritionist routes================//
router.get("/nutritionist/list", memberAuthMiddleware, GetNutritionist);

//============trainer routes==============//

router.get("/trainer/list", memberAuthMiddleware, GetTrainer);

export default router;
