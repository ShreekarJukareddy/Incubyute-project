import { Router } from 'express';
import Sweet from '../models/Sweet';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// Create sweet
router.post('/', async (req, res, next) => {
  try {
    const { name, category, price, quantity } = req.body;
    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const sweet = await Sweet.create({ name, category, price, quantity });
    res.status(201).json(sweet.toJSON());
  } catch (err) {
    next(err);
  }
});

// List all sweets
router.get('/', async (_req, res, next) => {
  try {
    const sweets = await Sweet.find();
    res.json(sweets.map((s) => s.toJSON()));
  } catch (err) {
    next(err);
  }
});

// Search
router.get('/search', async (req, res, next) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    const query: any = {};
    if (name && typeof name === 'string') {
      query.name = { $regex: name, $options: 'i' };
    }
    if (category && typeof category === 'string') {
      query.category = { $regex: category, $options: 'i' };
    }
    if ((minPrice && !isNaN(Number(minPrice))) || (maxPrice && !isNaN(Number(maxPrice)))) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
    }

    const sweets = await Sweet.find(query);
    res.json(sweets.map((s) => s.toJSON()));
  } catch (err) {
    next(err);
  }
});

// Update
router.put('/:id', async (req, res, next) => {
  try {
    const sweet = await Sweet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sweet) return res.status(404).json({ message: 'Not found' });
    res.json(sweet.toJSON());
  } catch (err) {
    next(err);
  }
});

// Delete (admin only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Purchase
router.post('/:id/purchase', async (req, res, next) => {
  try {
    const qty = Number(req.body?.quantity ?? 1);
    if (Number.isNaN(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });

    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Not found' });
    if (sweet.quantity < qty) return res.status(400).json({ message: 'Insufficient stock' });

    sweet.quantity -= qty;
    await sweet.save();
    res.json(sweet.toJSON());
  } catch (err) {
    next(err);
  }
});

// Restock (admin only)
router.post('/:id/restock', requireAdmin, async (req, res, next) => {
  try {
    const qty = Number(req.body?.quantity ?? 1);
    if (Number.isNaN(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });

    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Not found' });

    sweet.quantity += qty;
    await sweet.save();
    res.json(sweet.toJSON());
  } catch (err) {
    next(err);
  }
});

export default router;
