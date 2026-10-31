import express from 'express';
import userRouter from './user.routes.js';
import sellerRouter from './seller.routes.js';
import productRouter from './product.routes.js';
import orderRouter from './order.routes.js';

const apiRouter = express.Router();

apiRouter.use('/user', userRouter);
apiRouter.use('/seller', sellerRouter);
apiRouter.use('/product', productRouter);
apiRouter.use('/order', orderRouter);

export default apiRouter;

