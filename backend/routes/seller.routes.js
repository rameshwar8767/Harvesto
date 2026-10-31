import express from 'express';
import { isSellerAuth, loginSeller, logoutSeller } from '../controllers/seller.controller.js';
import authSeller from '../middlewares/authSeller.middleware.js';
import { authRateLimiter } from '../middlewares/security.middleware.js';

const sellerRouter = express.Router();

sellerRouter.post('/login', authRateLimiter, loginSeller);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', logoutSeller);

export default sellerRouter;
