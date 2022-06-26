import { Router } from "express";
import controller from "../controllers/users.js";
import checkToken from '../middlewares/checkToken.js';
import validation from '../middlewares/validation.js';

const router = Router();

router.get('/users', checkToken, controller.GET);
router.get('/users/:userId', checkToken, controller.GET);
router.post('/login', validation, controller.LOGIN);
router.post('/register', validation, controller.REGISTER);

export default router;
