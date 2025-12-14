import { Request, Response } from 'express';
import { SweetService } from '../services/sweetService';
import { validationResult } from 'express-validator';

const sweetService = new SweetService();

export const purchaseSweet = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const sweet = await sweetService.purchaseSweet(id, quantity);
    res.status(200).json({
      ...sweet.toObject(),
      message: `${sweet.name} purchased successfully`
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Sweet not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Sweet is out of stock' || 
          error.message === 'Insufficient quantity available' ||
          error.message === 'Purchase quantity must be at least 1') {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const restockSweet = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    const sweet = await sweetService.restockSweet(id, quantity);
    res.status(200).json({
      ...sweet.toObject(),
      message: `${sweet.name} restocked successfully`
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Sweet not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Restock quantity must be at least 1') {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ message: 'Server error' });
  }
};
