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
        name: 'Rasgulla',
        category: 'Milk-Based Sweets',
        price: 299,
        quantity: 10,
        unit: 'kg' as const,
        description: 'Soft and spongy milk-based sweet',
        imageUrl: 'https://example.com/rasgulla.jpg',
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
      expect(sweet.unit).toBe(sweetData.unit);
      expect(sweet.description).toBe(sweetData.description);
      expect(sweet.imageUrl).toBe(sweetData.imageUrl);
      expect(sweet.createdAt).toBeDefined();
      expect(sweet.updatedAt).toBeDefined();
    });

    it('should create a sweet with default quantity of 0 and unit as units', async () => {
      const sweetData = {
        name: 'Gulab Jamun',
        category: 'Sugar Syrup-Based Sweets',
        price: 150,
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet.quantity).toBe(0);
      expect(sweet.unit).toBe('units');
    });

    it('should create a sweet without optional fields', async () => {
      const sweetData = {
        name: 'Kaju Katli',
        category: 'Dry Fruit & Nut-Based Sweets',
        price: 599,
        quantity: 5,
        unit: 'kg' as const,
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet.description).toBeUndefined();
      expect(sweet.imageUrl).toBeUndefined();
    });
  });

  describe('Sweet Validation', () => {
    it('should fail to create sweet without name', async () => {
      const sweetData = {
        category: 'Milk-Based Sweets',
        price: 199,
        quantity: 10,
        unit: 'kg' as const,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet without category', async () => {
      const sweetData = {
        name: 'Test Sweet',
        price: 199,
        quantity: 10,
        unit: 'kg' as const,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet without price', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Milk-Based Sweets',
        quantity: 10,
        unit: 'kg' as const,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet with invalid category', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'InvalidCategory',
        price: 199,
        quantity: 10,
        unit: 'kg' as const,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet with negative price', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Milk-Based Sweets',
        price: -199,
        quantity: 10,
        unit: 'kg' as const,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should fail to create sweet with negative quantity', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Milk-Based Sweets',
        price: 199,
        quantity: -10,
        unit: 'kg' as const,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it('should trim whitespace from name and category', async () => {
      const sweetData = {
        name: '  Rasgulla  ',
        category: 'Milk-Based Sweets',
        price: 299,
        quantity: 5,
        unit: 'kg' as const,
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet.name).toBe('Rasgulla');
    });

    it('should accept all valid categories', async () => {
      const categories = [
        'Milk-Based Sweets',
        'Sugar Syrup-Based Sweets',
        'Dry Fruit & Nut-Based Sweets',
        'Chocolate-Based Sweets',
        'Bakery & Dessert Sweets',
      ];

      for (const category of categories) {
        const sweetData = {
          name: `Test ${category}`,
          category: category,
          price: 199,
          quantity: 10,
          unit: 'kg' as const,
        };

        const sweet = await Sweet.create(sweetData);
        expect(sweet.category).toBe(category);
      }
    });
  });
});
