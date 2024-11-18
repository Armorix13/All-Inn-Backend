import express, { Router } from "express";
import UserController from "../controllers/user.controller";
import authenticate from "../middlewares/auth.middleware";

const router: Router = express.Router();

router.post("/register", UserController.register);
router.get("/verify", UserController.verifyLink);
router.get("/check-verify", UserController.checkVerify);
router.put("/update-password", UserController.updatePassword);
router.post("/login", UserController.login);
router.put("/update-profile", authenticate, UserController.updatePassword);
router.put("/change-password", authenticate, UserController.changePassword);
router.put("/logout", authenticate, UserController.logout);



export default router;
