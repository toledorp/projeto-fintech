import { Router } from 'express';
import { FinancialEntryController } from '../controllers/FinancialEntryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.get('/', FinancialEntryController.index);
router.get('/:id', FinancialEntryController.show);
router.post('/', FinancialEntryController.create);
router.put('/:id', FinancialEntryController.update);
router.delete('/:id', FinancialEntryController.delete);

export { router as financialEntryRoutes };
