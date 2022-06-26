import { Router } from "express";
import controller from '../controllers/categories.js';
import checkToken from "../middlewares/checkToken.js";

const router = Router();

// categories
router.get('/categories', controller.GET);
router.get('/categories/:id', controller.GET);
router.post('/categories', checkToken, controller.POST);
router.put('/categories/:id', checkToken, controller.PUT);
router.delete('/categories/:id', checkToken, controller.DELETE);

export default router;
