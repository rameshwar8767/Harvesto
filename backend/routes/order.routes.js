import express from 'express';
import { 
    placeOrder, 
    getUserOrders, 
    getAllOrders, 
    updateOrderStatus 
} from '../controllers/order.controller.js';
import authUser from '../middlewares/auth.middleware.js';
import authSeller from '../middlewares/authSeller.middleware.js';

const orderRouter = express.Router();

// Customer order routes
orderRouter.post('/create', authUser, placeOrder);
orderRouter.get('/user', authUser, getUserOrders);

// Seller order routes
orderRouter.get('/seller/list', authSeller, getAllOrders);
orderRouter.patch('/status/:id', authSeller, updateOrderStatus);

export default orderRouter;

