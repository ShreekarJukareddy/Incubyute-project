import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../../server';
import { Sweet } from '../../models/Sweet';
import { User } from '../../models/User';

describe('Inventory Management API', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/sweet-shop-test');

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash('adminpass', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedAdminPassword,
      role: 'admin',
    });
    adminToken = jwt.sign(
      { id: admin._id.toString(), email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );

    // Create regular user
    const hashedUserPassword = await bcrypt.hash('userpass', 10);
    const user = await User.create({
      name: 'User',
      email: 'user@test.com',
      password: hashedUserPassword,
      role: 'user',
    });
    userToken = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Sweet.deleteMany({});
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('should allow authenticated user to purchase a sweet', async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 2 })
        .expect(200);

      expect(response.body.quantity).toBe(8);
      expect(response.body.message).toContain('purchased successfully');
    });

    it('should allow admin to purchase a sweet', async () => {
      const sweet = await Sweet.create({
        name: 'Gummy Bears',
        category: 'Gummy',
        price: 1.99,
        quantity: 50,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.quantity).toBe(45);
    });

    it('should default to quantity 1 if not specified', async () => {
      const sweet = await Sweet.create({
        name: 'Lollipop',
        category: 'Lollipop',
        price: 0.99,
        quantity: 20,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(200);

      expect(response.body.quantity).toBe(19);
    });

    it('should deny unauthenticated user from purchasing', async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .send({ quantity: 1 })
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/sweets/${fakeId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 })
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should return error for insufficient quantity', async () => {
      const sweet = await Sweet.create({
        name: 'Limited Edition',
        category: 'Chocolate',
        price: 5.99,
        quantity: 2,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 })
        .expect(400);

      expect(response.body.error).toContain('Insufficient quantity');
    });

    it('should return error for out of stock sweet', async () => {
      const sweet = await Sweet.create({
        name: 'Sold Out',
        category: 'Candy',
        price: 1.99,
        quantity: 0,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 })
        .expect(400);

      expect(response.body.error).toContain('out of stock');
    });

    it('should validate quantity is positive', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: -1 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    it('should allow admin to restock a sweet', async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 5,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 })
        .expect(200);

      expect(response.body.quantity).toBe(25);
      expect(response.body.message).toContain('restocked successfully');
    });

    it('should deny regular user from restocking', async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 5,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 20 })
        .expect(403);

      expect(response.body.error).toBe('Admin access required');
    });

    it('should deny unauthenticated user from restocking', async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 5,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .send({ quantity: 20 })
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/sweets/${fakeId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 })
        .expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should validate quantity is positive', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -5 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should require quantity field', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 10,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });
});
