import express from "express";
import { registerUser,loginUser ,getMe} from "../controllers/authcontroller.js";
import authMiddleware from "../middleware/authmiddleware.js";
const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);

export default router;