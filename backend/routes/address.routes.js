import express from 'express';
import authUser from '../middlewares/auth.middleware.js';
import {
    addAddress,
    getUserAddresses,
    deleteAddress,
} from '../controllers/address.controller.js';

const addressRouter = express.Router();

addressRouter.post('/add', authUser, addAddress);
addressRouter.get('/list', authUser, getUserAddresses);
addressRouter.delete('/:id', authUser, deleteAddress);

export default addressRouter;

