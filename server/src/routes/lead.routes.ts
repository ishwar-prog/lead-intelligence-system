import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import rateLimit from 'express-rate-limit';

const router = Router();
const controller = new LeadController();

const extractionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, 
    standardHeaders : true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many extraction requests from this IP, please try again after a minute' },
})

/**
 * Lead Routes
 *
 * POST   /api/leads          — Create and analyze a new lead
 * GET    /api/leads          — Get all leads (with filters and pagination)
 * GET    /api/leads/:id      — Get a single lead by ID
 * PATCH  /api/leads/:id/review — Submit human review for a lead
 *
 * .bind(controller) is necessary when using class methods as Express handlers
 * Without it, 'this' context inside the method is lost
 */
router.post('/', controller.create.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.post('/extract', extractionLimiter, controller.extract.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.patch('/:id/review', controller.humanReview.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
``

export default router;