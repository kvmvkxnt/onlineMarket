import { Router } from "express";
import checkToken from '../middlewares/checkToken.js';
import validation from '../middlewares/validation.js';
import controller from '../controllers/products.js';

const router = Router();

router.get('/products', controller.GET);
router.get('/products/:id', controller.GET);
router.post('/products', validation, checkToken, controller.POST);
router.put('/products/:id', validation, checkToken, controller.PUT);
router.delete('/products/:id', checkToken, controller.DELETE);

export default router;
