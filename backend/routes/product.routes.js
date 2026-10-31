import express from 'express';
import { 
    addProduct, 
    getProducts, 
    getProduct, 
    updateProduct, 
    changeStock, 
    deleteProduct 
} from '../controllers/product.controller.js';
import authSeller from '../middlewares/authSeller.middleware.js';

const productRouter = express.Router();

// Public routes
productRouter.get('/list', getProducts);
productRouter.get('/:id', getProduct);

// Protected seller routes
productRouter.post('/add', authSeller, addProduct);
productRouter.put('/update/:id', authSeller, updateProduct);
productRouter.patch('/stock/:id', authSeller, changeStock);
productRouter.delete('/:id', authSeller, deleteProduct);

export default productRouter;

