import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Order from '../Order';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Order.deleteMany({});
});

describe('Order Model', () => {
  const validUserId = new mongoose.Types.ObjectId();
  const validSweetId = new mongoose.Types.ObjectId();

  describe('Order Creation', () => {
    it('should create a valid order with all required fields', async () => {
      const order = await Order.create({
        user: validUserId,
        items: [
          {
            sweet: validSweetId,
            name: 'Chocolate Bar',
            price: 2.5,
            quantity: 2,
          },
        ],
        totalAmount: 5.0,
        status: 'completed',
      });

      expect(order.user).toEqual(validUserId);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].name).toBe('Chocolate Bar');
      expect(order.totalAmount).toBe(5.0);
      expect(order.status).toBe('completed');
    });

    it('should create order with multiple items', async () => {
      const order = await Order.create({
        user: validUserId,
        items: [
          {
            sweet: validSweetId,
            name: 'Chocolate',
            price: 2.5,
            quantity: 2,
          },
          {
            sweet: new mongoose.Types.ObjectId(),
            name: 'Candy',
            price: 1.0,
            quantity: 3,
          },
        ],
        totalAmount: 8.0,
      });

      expect(order.items).toHaveLength(2);
      expect(order.totalAmount).toBe(8.0);
    });

    it('should default status to completed', async () => {
      const order = await Order.create({
        user: validUserId,
        items: [
          {
            sweet: validSweetId,
            name: 'Candy',
            price: 1.0,
            quantity: 1,
          },
        ],
        totalAmount: 1.0,
      });

      expect(order.status).toBe('completed');
    });

    it('should have createdAt and updatedAt timestamps', async () => {
      const order = await Order.create({
        user: validUserId,
        items: [
          {
            sweet: validSweetId,
            name: 'Candy',
            price: 1.0,
            quantity: 1,
          },
        ],
        totalAmount: 1.0,
      });

      expect(order.createdAt).toBeDefined();
      expect(order.updatedAt).toBeDefined();
    });
  });

  describe('Order Validation', () => {
    it('should fail to create order without user', async () => {
      await expect(
        Order.create({
          items: [
            {
              sweet: validSweetId,
              name: 'Candy',
              price: 1.0,
              quantity: 1,
            },
          ],
          totalAmount: 1.0,
        })
      ).rejects.toThrow();
    });

    it('should fail to create order without items', async () => {
      await expect(
        Order.create({
          user: validUserId,
          totalAmount: 1.0,
        })
      ).rejects.toThrow();
    });

    it('should fail to create order with empty items array', async () => {
      await expect(
        Order.create({
          user: validUserId,
          items: [],
          totalAmount: 0,
        })
      ).rejects.toThrow();
    });

    it('should fail to create order without totalAmount', async () => {
      await expect(
        Order.create({
          user: validUserId,
          items: [
            {
              sweet: validSweetId,
              name: 'Candy',
              price: 1.0,
              quantity: 1,
            },
          ],
        })
      ).rejects.toThrow();
    });

    it('should fail with negative totalAmount', async () => {
      await expect(
        Order.create({
          user: validUserId,
          items: [
            {
              sweet: validSweetId,
              name: 'Candy',
              price: 1.0,
              quantity: 1,
            },
          ],
          totalAmount: -1.0,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      await expect(
        Order.create({
          user: validUserId,
          items: [
            {
              sweet: validSweetId,
              name: 'Candy',
              price: 1.0,
              quantity: 1,
            },
          ],
          totalAmount: 1.0,
          status: 'invalid',
        })
      ).rejects.toThrow();
    });

    it('should fail with item quantity less than 1', async () => {
      await expect(
        Order.create({
          user: validUserId,
          items: [
            {
              sweet: validSweetId,
              name: 'Candy',
              price: 1.0,
              quantity: 0,
            },
          ],
          totalAmount: 0,
        })
      ).rejects.toThrow();
    });

    it('should fail with negative item price', async () => {
      await expect(
        Order.create({
          user: validUserId,
          items: [
            {
              sweet: validSweetId,
              name: 'Candy',
              price: -1.0,
              quantity: 1,
            },
          ],
          totalAmount: -1.0,
        })
      ).rejects.toThrow();
    });
  });
});
