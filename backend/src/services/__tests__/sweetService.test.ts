import mongoose from 'mongoose';
import { SweetService } from '../sweetService';
import { Sweet } from '../../models/Sweet';

describe('SweetService', () => {
  let sweetService: SweetService;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/sweet-shop-test');
    sweetService = new SweetService();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Sweet.deleteMany({});
  });

  describe('createSweet', () => {
    it('should create a new sweet successfully', async () => {
      const sweetData = {
        name: 'Rasgulla',
        category: 'Milk-Based Sweets',
        price: 299,
        quantity: 10,
        unit: 'kg',
        description: 'Soft and spongy milk-based sweet',
      };

      const sweet = await sweetService.createSweet(sweetData);

      expect(sweet).toBeDefined();
      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
      expect(sweet.unit).toBe(sweetData.unit);
    });

    it('should fail to create sweet with invalid data', async () => {
      const invalidData = {
        name: 'Test',
        category: 'InvalidCategory',
        price: -5,
        unit: 'kg',
      };

      await expect(sweetService.createSweet(invalidData)).rejects.toThrow();
    });
  });

  describe('getAllSweets', () => {
    it('should return all sweets', async () => {
      await Sweet.create({ name: 'Rasgulla', category: 'Milk-Based Sweets', price: 199, quantity: 50, unit: 'kg' });
      await Sweet.create({ name: 'Gulab Jamun', category: 'Sugar Syrup-Based Sweets', price: 99, quantity: 100, unit: 'units' });
      await Sweet.create({ name: 'Kaju Katli', category: 'Dry Fruit & Nut-Based Sweets', price: 549, quantity: 75, unit: 'kg' });

      const sweets = await sweetService.getAllSweets();

      expect(sweets).toHaveLength(3);
      // Verify sorted by createdAt desc (newest first)
      expect(sweets[0].createdAt >= sweets[1].createdAt).toBe(true);
    });

    it('should return empty array when no sweets exist', async () => {
      const sweets = await sweetService.getAllSweets();

      expect(sweets).toHaveLength(0);
    });
  });

  describe('getSweetById', () => {
    it('should return sweet by id', async () => {
      const sweet = await Sweet.create({
        name: 'Rasgulla',
        category: 'Milk-Based Sweets',
        price: 199,
        quantity: 50,
        unit: 'kg',
      });

      const foundSweet = await sweetService.getSweetById(sweet._id.toString());

      expect(foundSweet).toBeDefined();
      expect(foundSweet?.name).toBe('Rasgulla');
    });

    it('should return null for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const sweet = await sweetService.getSweetById(fakeId);

      expect(sweet).toBeNull();
    });
  });

  describe('updateSweet', () => {
    it('should update sweet successfully', async () => {
      const sweet = await Sweet.create({
        name: 'Old Name',
        category: 'Milk-Based Sweets',
        price: 199,
        quantity: 50,
        unit: 'kg',
      });

      const updateData = {
        name: 'New Name',
        price: 299,
      };

      const updatedSweet = await sweetService.updateSweet(sweet._id.toString(), updateData);

      expect(updatedSweet).toBeDefined();
      expect(updatedSweet?.name).toBe('New Name');
      expect(updatedSweet?.price).toBe(299);
      expect(updatedSweet?.category).toBe('Milk-Based Sweets'); // Unchanged
    });

    it('should return null for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updatedSweet = await sweetService.updateSweet(fakeId, { name: 'Test' });

      expect(updatedSweet).toBeNull();
    });

    it('should validate updated data', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Milk-Based Sweets',
        price: 199,
        quantity: 50,
        unit: 'kg',
      });

      await expect(
        sweetService.updateSweet(sweet._id.toString(), { price: -5 })
      ).rejects.toThrow();
    });
  });

  describe('deleteSweet', () => {
    it('should delete sweet successfully', async () => {
      const sweet = await Sweet.create({
        name: 'To Delete',
        category: 'Milk-Based Sweets',
        price: 199,
        quantity: 50,
        unit: 'kg',
      });

      const deletedSweet = await sweetService.deleteSweet(sweet._id.toString());

      expect(deletedSweet).toBeDefined();
      expect(deletedSweet?.name).toBe('To Delete');

      const foundSweet = await Sweet.findById(sweet._id);
      expect(foundSweet).toBeNull();
    });

    it('should return null for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const deletedSweet = await sweetService.deleteSweet(fakeId);

      expect(deletedSweet).toBeNull();
    });
  });

  describe('searchSweets', () => {
    beforeEach(async () => {
      await Sweet.create([
        { name: 'Dark Chocolate Barfi', category: 'Chocolate-Based Sweets', price: 399, quantity: 50, unit: 'kg' },
        { name: 'Milk Chocolate Fudge', category: 'Chocolate-Based Sweets', price: 299, quantity: 100, unit: 'kg' },
        { name: 'Rasgulla', category: 'Milk-Based Sweets', price: 199, quantity: 75, unit: 'kg' },
        { name: 'Gulab Jamun', category: 'Sugar Syrup-Based Sweets', price: 99, quantity: 200, unit: 'units' },
        { name: 'Chocolate Cake', category: 'Bakery & Dessert Sweets', price: 599, quantity: 25, unit: 'units' },
      ]);
    });

    it('should search by name (case-insensitive)', async () => {
      const sweets = await sweetService.searchSweets({ name: 'chocolate' });

      expect(sweets).toHaveLength(3);
      expect(sweets.every(s => s.name.toLowerCase().includes('chocolate'))).toBe(true);
    });

    it('should search by category', async () => {
      const sweets = await sweetService.searchSweets({ category: 'Chocolate-Based Sweets' });

      expect(sweets).toHaveLength(2);
      expect(sweets.every(s => s.category === 'Chocolate-Based Sweets')).toBe(true);
    });

    it('should search by minimum price', async () => {
      const sweets = await sweetService.searchSweets({ minPrice: 300 });

      expect(sweets.length).toBeGreaterThanOrEqual(2);
      expect(sweets.every(s => s.price >= 300)).toBe(true);
    });

    it('should search by maximum price', async () => {
      const sweets = await sweetService.searchSweets({ maxPrice: 200 });

      expect(sweets).toHaveLength(2);
      expect(sweets.every(s => s.price <= 200)).toBe(true);
    });

    it('should search by price range', async () => {
      const sweets = await sweetService.searchSweets({ minPrice: 200, maxPrice: 400 });

      expect(sweets.length).toBeGreaterThanOrEqual(2);
      expect(sweets.every(s => s.price >= 200 && s.price <= 400)).toBe(true);
    });

    it('should combine multiple search criteria', async () => {
      const sweets = await sweetService.searchSweets({
        name: 'chocolate',
        category: 'Chocolate-Based Sweets',
        maxPrice: 350,
      });

      expect(sweets).toHaveLength(1);
      expect(sweets[0].name).toBe('Milk Chocolate Fudge');
    });

    it('should return empty array when no matches found', async () => {
      const sweets = await sweetService.searchSweets({ name: 'NonExistent' });

      expect(sweets).toHaveLength(0);
    });
  });
});
