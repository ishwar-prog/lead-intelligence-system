import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import rateLimit from 'express-rate-limit';
import { aiRateLimiter } from '../app';

const router = Router();
const controller = new LeadController();

const extractionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, 
    standardHeaders : true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many extraction requests from this IP, please try again after a minute' },
});

/**
 * Lead Routes
 *
 * .bind(controller) is necessary when using class methods as Express handlers
 * Without it, 'this' context inside the method is lost
 */

// Standard Operations — Protected by the global AI / general limiter
router.post('/', aiRateLimiter, controller.create.bind(controller));
router.get('/', aiRateLimiter, controller.getAll.bind(controller));
router.get('/:id', aiRateLimiter, controller.getById.bind(controller));
router.patch('/:id/review', aiRateLimiter, controller.humanReview.bind(controller));
router.delete('/:id', aiRateLimiter, controller.delete.bind(controller));

// AI Extraction Utility (Perfectly isolated with its own extractionLimiter)
router.post('/extract', extractionLimiter, controller.extract.bind(controller));

export default router;