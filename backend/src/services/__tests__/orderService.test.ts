import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { OrderService } from '../orderService';
import Order from '../../models/Order';
import { Sweet } from '../../models/Sweet';
import { User } from '../../models/User';

let mongoServer: MongoMemoryServer;
const orderService = new OrderService();

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
  await Sweet.deleteMany({});
  await User.deleteMany({});
});

describe('OrderService', () => {
  let userId: string;
  let sweet1Id: string;
  let sweet2Id: string;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
    });
    userId = user._id.toString();

    const sweet1 = await Sweet.create({
      name: 'Rasgulla',
      category: 'Milk-Based Sweets',
      price: 250,
      quantity: 10,
      unit: 'kg',
    });
    sweet1Id = sweet1._id.toString();

    const sweet2 = await Sweet.create({
      name: 'Gulab Jamun',
      category: 'Sugar Syrup-Based Sweets',
      price: 150,
      quantity: 20,
      unit: 'kg',
    });
    sweet2Id = sweet2._id.toString();
  });

  describe('createOrder', () => {
    it('should create order with single item', async () => {
      const orderData = {
        userId,
        items: [
          {
            sweetId: sweet1Id,
            quantity: 2,
          },
        ],
      };

      const order = await orderService.createOrder(orderData);

      expect(order.user.toString()).toBe(userId);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].name).toBe('Rasgulla');
      expect(order.items[0].quantity).toBe(2);
      expect(order.totalAmount).toBe(500);
      expect(order.status).toBe('completed');
    });

    it('should create order with multiple items', async () => {
      const orderData = {
        userId,
        items: [
          { sweetId: sweet1Id, quantity: 2 },
          { sweetId: sweet2Id, quantity: 3 },
        ],
      };

      const order = await orderService.createOrder(orderData);

      expect(order.items).toHaveLength(2);
      expect(order.totalAmount).toBe(950); // (250 * 2) + (150 * 3)
    });

    it('should decrease sweet quantities after order', async () => {
      const orderData = {
        userId,
        items: [{ sweetId: sweet1Id, quantity: 3 }],
      };

      await orderService.createOrder(orderData);

      const sweet = await Sweet.findById(sweet1Id);
      expect(sweet?.quantity).toBe(7); // 10 - 3
    });

    it('should throw error if sweet not found', async () => {
      const orderData = {
        userId,
        items: [
          {
            sweetId: new mongoose.Types.ObjectId().toString(),
            quantity: 1,
          },
        ],
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Sweet not found'
      );
    });

    it('should throw error if insufficient stock', async () => {
      const orderData = {
        userId,
        items: [{ sweetId: sweet1Id, quantity: 15 }],
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Insufficient stock'
      );
    });

    it('should throw error if user not found', async () => {
      const orderData = {
        userId: new mongoose.Types.ObjectId().toString(),
        items: [{ sweetId: sweet1Id, quantity: 1 }],
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error for quantity less than 1', async () => {
      const orderData = {
        userId,
        items: [{ sweetId: sweet1Id, quantity: 0 }],
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Quantity must be at least 1'
      );
    });
  });

  describe('getUserOrders', () => {
    it('should get all orders for a user', async () => {
      await orderService.createOrder({
        userId,
        items: [{ sweetId: sweet1Id, quantity: 1 }],
      });
      await orderService.createOrder({
        userId,
        items: [{ sweetId: sweet2Id, quantity: 2 }],
      });

      const orders = await orderService.getUserOrders(userId);

      expect(orders).toHaveLength(2);
      expect(orders[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        orders[1].createdAt.getTime()
      );
    });

    it('should return empty array if user has no orders', async () => {
      const orders = await orderService.getUserOrders(userId);
      expect(orders).toHaveLength(0);
    });
  });

  describe('getOrderById', () => {
    it('should get order by id', async () => {
      const createdOrder = await orderService.createOrder({
        userId,
        items: [{ sweetId: sweet1Id, quantity: 1 }],
      });

      const order = await orderService.getOrderById(
        createdOrder._id.toString()
      );

      expect(order).toBeDefined();
      expect(order?._id.toString()).toBe(createdOrder._id.toString());
    });

    it('should return null for non-existent order', async () => {
      const order = await orderService.getOrderById(
        new mongoose.Types.ObjectId().toString()
      );
      expect(order).toBeNull();
    });
  });

  describe('getAllOrders', () => {
    it('should get all orders (admin)', async () => {
      const user2 = await User.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
        role: 'user',
      });

      await orderService.createOrder({
        userId,
        items: [{ sweetId: sweet1Id, quantity: 1 }],
      });
      await orderService.createOrder({
        userId: user2._id.toString(),
        items: [{ sweetId: sweet2Id, quantity: 1 }],
      });

      const orders = await orderService.getAllOrders();

      expect(orders).toHaveLength(2);
    });
  });
});
