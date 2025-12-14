import mongoose from 'mongoose';
import { SweetService } from '../sweetService';
import { Sweet } from '../../models/Sweet';

describe('SweetService - Inventory Management', () => {
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

  describe('purchaseSweet', () => {
    it('should decrease quantity by 1 when purchasing', async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });

      const updatedSweet = await sweetService.purchaseSweet(sweet._id.toString(), 1);

      expect(updatedSweet).toBeDefined();
      expect(updatedSweet?.quantity).toBe(9);
    });

    it('should decrease quantity by specified amount', async () => {
      const sweet = await Sweet.create({
        name: 'Gummy Bears',
        category: 'Gummy',
        price: 1.99,
        quantity: 50,
      });

      const updatedSweet = await sweetService.purchaseSweet(sweet._id.toString(), 5);

      expect(updatedSweet).toBeDefined();
      expect(updatedSweet?.quantity).toBe(45);
    });

    it('should throw error if sweet not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        sweetService.purchaseSweet(fakeId, 1)
      ).rejects.toThrow('Sweet not found');
    });

    it('should throw error if insufficient quantity', async () => {
      const sweet = await Sweet.create({
        name: 'Limited Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 3,
      });

      await expect(
        sweetService.purchaseSweet(sweet._id.toString(), 5)
      ).rejects.toThrow('Insufficient quantity available');
    });

    it('should throw error if quantity is 0', async () => {
      const sweet = await Sweet.create({
        name: 'Out of Stock',
        category: 'Candy',
        price: 1.99,
        quantity: 0,
      });

      await expect(
        sweetService.purchaseSweet(sweet._id.toString(), 1)
      ).rejects.toThrow('Sweet is out of stock');
    });

    it('should throw error if purchase quantity is invalid', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });

      await expect(
        sweetService.purchaseSweet(sweet._id.toString(), 0)
      ).rejects.toThrow('Purchase quantity must be at least 1');

      await expect(
        sweetService.purchaseSweet(sweet._id.toString(), -5)
      ).rejects.toThrow('Purchase quantity must be at least 1');
    });

    it('should allow purchasing all remaining quantity', async () => {
      const sweet = await Sweet.create({
        name: 'Last One',
        category: 'Chocolate',
        price: 2.99,
        quantity: 1,
      });

      const updatedSweet = await sweetService.purchaseSweet(sweet._id.toString(), 1);

      expect(updatedSweet?.quantity).toBe(0);
    });
  });

  describe('restockSweet', () => {
    it('should increase quantity when restocking', async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 5,
      });

      const updatedSweet = await sweetService.restockSweet(sweet._id.toString(), 10);

      expect(updatedSweet).toBeDefined();
      expect(updatedSweet?.quantity).toBe(15);
    });

    it('should restock from 0 quantity', async () => {
      const sweet = await Sweet.create({
        name: 'Out of Stock',
        category: 'Candy',
        price: 1.99,
        quantity: 0,
      });

      const updatedSweet = await sweetService.restockSweet(sweet._id.toString(), 50);

      expect(updatedSweet?.quantity).toBe(50);
    });

    it('should throw error if sweet not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        sweetService.restockSweet(fakeId, 10)
      ).rejects.toThrow('Sweet not found');
    });

    it('should throw error if restock quantity is invalid', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });

      await expect(
        sweetService.restockSweet(sweet._id.toString(), 0)
      ).rejects.toThrow('Restock quantity must be at least 1');

      await expect(
        sweetService.restockSweet(sweet._id.toString(), -5)
      ).rejects.toThrow('Restock quantity must be at least 1');
    });

    it('should handle large restock quantities', async () => {
      const sweet = await Sweet.create({
        name: 'Popular Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });

      const updatedSweet = await sweetService.restockSweet(sweet._id.toString(), 1000);

      expect(updatedSweet?.quantity).toBe(1010);
    });
  });
});
