import express from 'express';
import { isSellerAuth, loginSeller, logoutSeller } from '../controllers/seller.controller.js';
import authSeller from '../middlewares/authSeller.middleware.js';

const sellerRouter = express.Router();

sellerRouter.post('/login', loginSeller);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', logoutSeller);

export default sellerRouter;
