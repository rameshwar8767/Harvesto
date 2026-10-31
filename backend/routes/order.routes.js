import express from 'express';
import { 
    placeOrder, 
    getUserOrders, 
    getAllOrders, 
    updateOrderStatus 
} from '../controllers/order.controller.js';
import { optionalAuthUser } from '../middlewares/auth.middleware.js';
import authSeller from '../middlewares/authSeller.middleware.js';

const orderRouter = express.Router();

// Customer order routes (supports both authenticated users and guest checkout)
orderRouter.post('/create', optionalAuthUser, placeOrder);
orderRouter.get('/user', optionalAuthUser, getUserOrders);

// Seller order routes
orderRouter.get('/seller/list', authSeller, getAllOrders);
orderRouter.patch('/status/:id', authSeller, updateOrderStatus);

export default orderRouter;
