import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrderService } from '../services/orderService';
import { validationResult } from 'express-validator';

const orderService = new OrderService();

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    const order = await orderService.createOrder({ userId: userId!, items });
    
    res.status(201).json({
      ...order.toObject(),
      message: 'Order placed successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Sweet not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Insufficient stock') || 
          error.message.includes('Quantity must be')) {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const orders = await orderService.getUserOrders(userId!);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
