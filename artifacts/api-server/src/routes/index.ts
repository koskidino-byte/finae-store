import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import klaviyoRouter from "./klaviyo";
import stripeCheckoutRouter from "./stripe-checkout";
import uploadRouter from "./upload";
import settingsRouter from "./settings";
import reviewsRouter from "./reviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(klaviyoRouter);
router.use(stripeCheckoutRouter);
router.use(uploadRouter);
router.use(settingsRouter);
router.use(reviewsRouter);

export default router;
