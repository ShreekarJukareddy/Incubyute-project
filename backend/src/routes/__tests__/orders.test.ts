import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../server';
import Order from '../../models/Order';
import { Sweet } from '../../models/Sweet';
import { User } from '../../models/User';
import { AuthService } from '../../services/authService';

let mongoServer: MongoMemoryServer;
const authService = new AuthService();

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

describe('Order API', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let sweet1Id: string;
  let sweet2Id: string;

  beforeEach(async () => {
    const user = await authService.register({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password123',
    });
    userToken = user.token;
    userId = user.user.id;

    const adminUser = await authService.register({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
    });
    // Update admin role
    await User.findByIdAndUpdate(adminUser.user.id, { role: 'admin' });
    const adminLogin = await authService.login({
      email: 'admin@test.com',
      password: 'password123',
    });
    adminToken = adminLogin.token;

    const sweet1 = await Sweet.create({
      name: 'Chocolate',
      category: 'Chocolate',
      price: 2.5,
      quantity: 10,
    });
    sweet1Id = sweet1._id.toString();

    const sweet2 = await Sweet.create({
      name: 'Candy',
      category: 'Candy',
      price: 1.0,
      quantity: 20,
    });
    sweet2Id = sweet2._id.toString();
  });

  describe('POST /api/orders', () => {
    it('should create order with single item', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweetId: sweet1Id, quantity: 2 }],
        })
        .expect(201);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.totalAmount).toBe(5.0);
      expect(response.body.message).toContain('Order placed successfully');
    });

    it('should create order with multiple items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            { sweetId: sweet1Id, quantity: 2 },
            { sweetId: sweet2Id, quantity: 3 },
          ],
        })
        .expect(201);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.totalAmount).toBe(8.0);
    });

    it('should deny unauthenticated user', async () => {
      await request(app)
        .post('/api/orders')
        .send({
          items: [{ sweetId: sweet1Id, quantity: 1 }],
        })
        .expect(401);
    });

    it('should return 400 for empty items', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [] })
        .expect(400);
    });

    it('should return 400 for insufficient stock', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweetId: sweet1Id, quantity: 20 }],
        })
        .expect(400);

      expect(response.body.error).toContain('Insufficient stock');
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            { sweetId: new mongoose.Types.ObjectId().toString(), quantity: 1 },
          ],
        })
        .expect(404);

      expect(response.body.error).toContain('Sweet not found');
    });
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweetId: sweet1Id, quantity: 1 }],
        });

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it('should deny unauthenticated user', async () => {
      await request(app).get('/api/orders').expect(401);
    });

    it('should return empty array for user with no orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order by id', async () => {
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweetId: sweet1Id, quantity: 1 }],
        });

      const orderId = createResponse.body._id;

      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body._id).toBe(orderId);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app)
        .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should deny unauthenticated user', async () => {
      await request(app)
        .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
        .expect(401);
    });
  });

  describe('GET /api/orders/all/admin', () => {
    it('should allow admin to get all orders', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweetId: sweet1Id, quantity: 1 }],
        });

      const response = await request(app)
        .get('/api/orders/all/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should deny regular user', async () => {
      await request(app)
        .get('/api/orders/all/admin')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny unauthenticated user', async () => {
      await request(app).get('/api/orders/all/admin').expect(401);
    });
  });
});
