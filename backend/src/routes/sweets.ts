import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { SweetController } from '../controllers/sweetController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();
const sweetController = new SweetController();

// Validation rules
const createSweetValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('category')
    .trim()
    .isIn([
      'Milk-Based Sweets',
      'Sugar Syrup-Based Sweets',
      'Dry Fruit & Nut-Based Sweets',
      'Chocolate-Based Sweets',
      'Bakery & Dessert Sweets',
    ])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('unit')
    .trim()
    .isIn(['kg', 'units'])
    .withMessage('Unit must be either "kg" or "units"'),
];

const updateSweetValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('category')
    .optional()
    .trim()
    .isIn([
      'Milk-Based Sweets',
      'Sugar Syrup-Based Sweets',
      'Dry Fruit & Nut-Based Sweets',
      'Chocolate-Based Sweets',
      'Bakery & Dessert Sweets',
    ])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('unit')
    .optional()
    .trim()
    .isIn(['kg', 'units'])
    .withMessage('Unit must be either "kg" or "units"'),
];

// Routes
router.post('/', authenticate, authorizeAdmin, createSweetValidation, (req: Request, res: Response) => 
  sweetController.createSweet(req, res)
);

router.get('/', (req: Request, res: Response) => 
  sweetController.getAllSweets(req, res)
);

router.get('/search', (req: Request, res: Response) => 
  sweetController.searchSweets(req, res)
);

router.get('/:id', (req: Request, res: Response) => 
  sweetController.getSweetById(req, res)
);

router.put('/:id', authenticate, authorizeAdmin, updateSweetValidation, (req: Request, res: Response) => 
  sweetController.updateSweet(req, res)
);

router.delete('/:id', authenticate, authorizeAdmin, (req: Request, res: Response) => 
  sweetController.deleteSweet(req, res)
);

export default router;
