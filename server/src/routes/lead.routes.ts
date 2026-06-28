import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { aiRateLimiter, extractionLimiter } from '../middleware/rateLimiters';

const router = Router();
const controller = new LeadController();

/**
 * Lead Routes
 *
 * .bind(controller) is necessary when using class methods as Express handlers
 * Without it, 'this' context inside the method is lost
 */

// Standard Operations — Protected by the global AI / general limiter
router.post('/', aiRateLimiter, controller.create.bind(controller));
router.get('/', aiRateLimiter, controller.getAll.bind(controller));
router.get('/deleted', aiRateLimiter, controller.getAllDeleted.bind(controller));
router.post('/restore-all', aiRateLimiter, controller.restoreAll.bind(controller));
router.delete('/clean-all', aiRateLimiter, controller.permanentlyDeleteAll.bind(controller));

router.get('/:id', aiRateLimiter, controller.getById.bind(controller));
router.patch('/:id/review', aiRateLimiter, controller.humanReview.bind(controller));
router.post('/:id/restore', aiRateLimiter, controller.restore.bind(controller));
router.delete('/:id/permanent', aiRateLimiter, controller.permanentlyDelete.bind(controller));
router.delete('/:id', aiRateLimiter, controller.delete.bind(controller));

// AI Extraction Utility (Perfectly isolated with its own extractionLimiter)
router.post('/extract', extractionLimiter, controller.extract.bind(controller));

export default router;
