import mongoose from 'mongoose';
import { Sweet, ISweet } from '../Sweet';

describe('Sweet Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/sweet-shop-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Sweet.deleteMany({});
  });

  describe('Sweet Creation', () => {
    it('should create a valid sweet with all required fields', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
        description: 'Delicious milk chocolate bar',
        imageUrl: 'https://example.com/chocolate.jpg',
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
      expect(sweet.description).toBe(sweetData.description);
      expect(sweet.imageUrl).toBe(sweetData.imageUrl);
      expect(sweet.createdAt).toBeDefined();
      expect(sweet.updatedAt).toBeDefined();
    });

    it('should create a sweet with default quantity of 0', async () => {
      const sweetData = {
        name: 'Gummy Bears',
        category: 'Gummy',
        price: 1.99,
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet.quantity).toBe(0);
    });

    it('should create a sweet without optional fields', async () => {
      const sweetData = {
        name: 'Lollipop',
        category: 'Lollipop',
        price: 0.99,
        quantity: 50,
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet.description).toBeUndefined();
      expect(sweet.imageUrl).toBeUndefined();
    });
  });

  describe('Sweet Validation', () => {
    it('should fail to create sweet without name', async () => {
      const sweetData = {
        category: 'Candy',
        price: 1.99,
        quantity: 10,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet without category', async () => {
      const sweetData = {
        name: 'Test Sweet',
        price: 1.99,
        quantity: 10,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet without price', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Candy',
        quantity: 10,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet with invalid category', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'InvalidCategory',
        price: 1.99,
        quantity: 10,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet with negative price', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Candy',
        price: -1.99,
        quantity: 10,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet with negative quantity', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Candy',
        price: 1.99,
        quantity: -10,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should trim whitespace from name and category', async () => {
      const sweetData = {
        name: '  Chocolate Bar  ',
        category: 'Chocolate',
        price: 2.99,
        quantity: 50,
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet.name).toBe('Chocolate Bar');
    });

    it('should accept all valid categories', async () => {
      const categories = ['Chocolate', 'Candy', 'Gummy', 'Lollipop', 'Cookie', 'Cake', 'Other'];

      for (const category of categories) {
        const sweetData = {
          name: `Test ${category}`,
          category: category,
          price: 1.99,
          quantity: 10,
        };

        const sweet = await Sweet.create(sweetData);
        expect(sweet.category).toBe(category);
      }
    });
  });
});
