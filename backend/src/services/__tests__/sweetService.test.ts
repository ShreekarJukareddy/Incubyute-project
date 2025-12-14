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
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
        description: 'Delicious milk chocolate',
      };

      const sweet = await sweetService.createSweet(sweetData);

      expect(sweet).toBeDefined();
      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
    });

    it('should fail to create sweet with invalid data', async () => {
      const invalidData = {
        name: 'Test',
        category: 'InvalidCategory',
        price: -5,
      };

      await expect(sweetService.createSweet(invalidData)).rejects.toThrow();
    });
  });

  describe('getAllSweets', () => {
    it('should return all sweets', async () => {
      await Sweet.create({ name: 'Sweet 1', category: 'Chocolate', price: 1.99, quantity: 50 });
      await Sweet.create({ name: 'Sweet 2', category: 'Candy', price: 0.99, quantity: 100 });
      await Sweet.create({ name: 'Sweet 3', category: 'Gummy', price: 2.49, quantity: 75 });

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
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 1.99,
        quantity: 50,
      });

      const foundSweet = await sweetService.getSweetById(sweet._id.toString());

      expect(foundSweet).toBeDefined();
      expect(foundSweet?.name).toBe('Test Sweet');
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
        category: 'Chocolate',
        price: 1.99,
        quantity: 50,
      });

      const updateData = {
        name: 'New Name',
        price: 2.99,
      };

      const updatedSweet = await sweetService.updateSweet(sweet._id.toString(), updateData);

      expect(updatedSweet).toBeDefined();
      expect(updatedSweet?.name).toBe('New Name');
      expect(updatedSweet?.price).toBe(2.99);
      expect(updatedSweet?.category).toBe('Chocolate'); // Unchanged
    });

    it('should return null for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updatedSweet = await sweetService.updateSweet(fakeId, { name: 'Test' });

      expect(updatedSweet).toBeNull();
    });

    it('should validate updated data', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 1.99,
        quantity: 50,
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
        category: 'Chocolate',
        price: 1.99,
        quantity: 50,
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
        { name: 'Dark Chocolate Bar', category: 'Chocolate', price: 3.99, quantity: 50 },
        { name: 'Milk Chocolate Bar', category: 'Chocolate', price: 2.99, quantity: 100 },
        { name: 'Gummy Bears', category: 'Gummy', price: 1.99, quantity: 75 },
        { name: 'Lollipop', category: 'Lollipop', price: 0.99, quantity: 200 },
        { name: 'Chocolate Cake', category: 'Cake', price: 5.99, quantity: 25 },
      ]);
    });

    it('should search by name (case-insensitive)', async () => {
      const sweets = await sweetService.searchSweets({ name: 'chocolate' });

      expect(sweets).toHaveLength(3);
      expect(sweets.every(s => s.name.toLowerCase().includes('chocolate'))).toBe(true);
    });

    it('should search by category', async () => {
      const sweets = await sweetService.searchSweets({ category: 'Chocolate' });

      expect(sweets).toHaveLength(2);
      expect(sweets.every(s => s.category === 'Chocolate')).toBe(true);
    });

    it('should search by minimum price', async () => {
      const sweets = await sweetService.searchSweets({ minPrice: 3.0 });

      expect(sweets.length).toBeGreaterThanOrEqual(2);
      expect(sweets.every(s => s.price >= 3.0)).toBe(true);
    });

    it('should search by maximum price', async () => {
      const sweets = await sweetService.searchSweets({ maxPrice: 2.0 });

      expect(sweets).toHaveLength(2);
      expect(sweets.every(s => s.price <= 2.0)).toBe(true);
    });

    it('should search by price range', async () => {
      const sweets = await sweetService.searchSweets({ minPrice: 2.0, maxPrice: 4.0 });

      expect(sweets.length).toBeGreaterThanOrEqual(2);
      expect(sweets.every(s => s.price >= 2.0 && s.price <= 4.0)).toBe(true);
    });

    it('should combine multiple search criteria', async () => {
      const sweets = await sweetService.searchSweets({
        name: 'chocolate',
        category: 'Chocolate',
        maxPrice: 3.5,
      });

      expect(sweets).toHaveLength(1);
      expect(sweets[0].name).toBe('Milk Chocolate Bar');
    });

    it('should return empty array when no matches found', async () => {
      const sweets = await sweetService.searchSweets({ name: 'NonExistent' });

      expect(sweets).toHaveLength(0);
    });
  });
});
