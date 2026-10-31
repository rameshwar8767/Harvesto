import express from 'express';
import userRouter from './user.routes.js';
import sellerRouter from './seller.routes.js';
import productRouter from './product.routes.js';
import orderRouter from './order.routes.js';
import addressRouter from './address.routes.js';

const apiRouter = express.Router();

apiRouter.use('/user', userRouter);
apiRouter.use('/seller', sellerRouter);
apiRouter.use('/product', productRouter);
apiRouter.use('/order', orderRouter);
apiRouter.use('/address', addressRouter);

export default apiRouter;

