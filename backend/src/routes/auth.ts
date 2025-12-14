import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, (req: Request, res: Response) => authController.register(req, res));
router.post('/login', loginValidation, (req: Request, res: Response) => authController.login(req, res));

export default router;
