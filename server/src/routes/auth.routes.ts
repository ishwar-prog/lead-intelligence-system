import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));
router.post('/logout', controller.logout.bind(controller));
router.get('/me', requireAuth, controller.me.bind(controller));

export default router;