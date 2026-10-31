import { isAuth, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { Router } from "express";
import authUser from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/security.middleware.js";

const userRouter = Router();

userRouter.post('/register', authRateLimiter, registerUser);
userRouter.post('/login', authRateLimiter, loginUser);
userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout', authUser, logoutUser);

export default userRouter;
