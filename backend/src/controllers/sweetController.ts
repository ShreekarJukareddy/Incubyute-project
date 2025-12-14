import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { SweetService } from '../services/sweetService';
import { AuthRequest } from '../middleware/auth';

const sweetService = new SweetService();

export class SweetController {
  async createSweet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const sweet = await sweetService.createSweet(req.body);
      res.status(201).json(sweet);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllSweets(req: Request, res: Response): Promise<void> {
    try {
      const sweets = await sweetService.getAllSweets();
      res.status(200).json(sweets);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getSweetById(req: Request, res: Response): Promise<void> {
    try {
      const sweet = await sweetService.getSweetById(req.params.id);
      
      if (!sweet) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      res.status(200).json(sweet);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateSweet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const sweet = await sweetService.updateSweet(req.params.id, req.body);
      
      if (!sweet) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      res.status(200).json(sweet);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteSweet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sweet = await sweetService.deleteSweet(req.params.id);
      
      if (!sweet) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      res.status(200).json({ message: 'Sweet deleted successfully', sweet });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async searchSweets(req: Request, res: Response): Promise<void> {
    try {
      const { name, category, minPrice, maxPrice } = req.query;
      
      const searchQuery: any = {};
      if (name) searchQuery.name = name as string;
      if (category) searchQuery.category = category as string;
      if (minPrice) searchQuery.minPrice = parseFloat(minPrice as string);
      if (maxPrice) searchQuery.maxPrice = parseFloat(maxPrice as string);

      const sweets = await sweetService.searchSweets(searchQuery);
      res.status(200).json(sweets);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
