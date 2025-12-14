import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
} from '../controllers/orderController';

const router = Router();

// Create order (authenticated users)
router.post(
  '/',
  authenticate,
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Items must be a non-empty array'),
    body('items.*.sweetId')
      .notEmpty()
      .withMessage('Sweet ID is required'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  createOrder
);

// Get user's orders (authenticated users)
router.get('/', authenticate, getUserOrders);

// Get all orders (admin only)
router.get('/all/admin', authenticate, authorizeAdmin, getAllOrders);

// Get order by ID (authenticated users)
router.get('/:id', authenticate, getOrderById);

export default router;
