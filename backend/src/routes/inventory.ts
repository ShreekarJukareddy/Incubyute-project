import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { purchaseSweet, restockSweet } from '../controllers/inventoryController';

const router = Router();

// Purchase sweet (authenticated users)
router.post(
  '/:id/purchase',
  authenticate,
  [
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1')
  ],
  purchaseSweet
);

// Restock sweet (admin only)
router.post(
  '/:id/restock',
  authenticate,
  authorizeAdmin,
  [
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1')
  ],
  restockSweet
);

export default router;
