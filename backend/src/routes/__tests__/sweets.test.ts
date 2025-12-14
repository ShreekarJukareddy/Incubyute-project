import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../../server';
import { Sweet } from '../../models/Sweet';
import { User } from '../../models/User';

describe('Sweet API Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;

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
    adminId = admin._id.toString();
    adminToken = jwt.sign(
      { id: adminId, email: admin.email, role: admin.role },
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
    userId = user._id.toString();
    userToken = jwt.sign(
      { id: userId, email: user.email, role: user.role },
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

  describe('POST /api/sweets', () => {
    it('should allow admin to create a sweet', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
        description: 'Delicious chocolate',
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(sweetData.name);
      expect(response.body.category).toBe(sweetData.category);
      expect(response.body.price).toBe(sweetData.price);
    });

    it('should deny regular user from creating a sweet', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData)
        .expect(403);

      expect(response.body.error).toBe('Admin access required');
    });

    it('should deny unauthenticated user from creating a sweet', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Test',
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should validate category enum', async () => {
      const invalidData = {
        name: 'Test Sweet',
        category: 'InvalidCategory',
        price: 2.99,
        quantity: 50,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/sweets', () => {
    it('should return all sweets without authentication', async () => {
      await Sweet.create({ name: 'Sweet 1', category: 'Chocolate', price: 1.99, quantity: 50 });
      await Sweet.create({ name: 'Sweet 2', category: 'Candy', price: 0.99, quantity: 100 });
      await Sweet.create({ name: 'Sweet 3', category: 'Gummy', price: 2.49, quantity: 75 });

      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return sweets sorted by creation date (newest first)', async () => {
      await Sweet.create({ name: 'Sweet 1', category: 'Chocolate', price: 1.99, quantity: 50 });
      await Sweet.create({ name: 'Sweet 2', category: 'Candy', price: 0.99, quantity: 100 });
      await Sweet.create({ name: 'Sweet 3', category: 'Gummy', price: 2.49, quantity: 75 });

      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      // Verify sorted by createdAt desc (newest first)
      expect(response.body[0].createdAt >= response.body[1].createdAt).toBe(true);
    });
  });

  describe('GET /api/sweets/:id', () => {
    it('should return a sweet by id', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 50,
      });

      const response = await request(app)
        .get(`/api/sweets/${sweet._id}`)
        .expect(200);

      expect(response.body.name).toBe('Test Sweet');
      expect(response.body._id).toBe(sweet._id.toString());
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/sweets/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Sweet not found');
    });
  });

  describe('GET /api/sweets/search', () => {
    it('should search by name', async () => {
      await Sweet.create([
        { name: 'Dark Chocolate', category: 'Chocolate', price: 3.99, quantity: 50 },
        { name: 'Milk Chocolate', category: 'Chocolate', price: 2.99, quantity: 100 },
        { name: 'Gummy Bears', category: 'Gummy', price: 1.99, quantity: 75 },
      ]);

      const response = await request(app)
        .get('/api/sweets/search?name=chocolate')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should search by category', async () => {
      await Sweet.create([
        { name: 'Dark Chocolate', category: 'Chocolate', price: 3.99, quantity: 50 },
        { name: 'Milk Chocolate', category: 'Chocolate', price: 2.99, quantity: 100 },
        { name: 'Gummy Bears', category: 'Gummy', price: 1.99, quantity: 75 },
      ]);

      const response = await request(app)
        .get('/api/sweets/search?category=Chocolate')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should search by price range', async () => {
      await Sweet.create([
        { name: 'Dark Chocolate', category: 'Chocolate', price: 3.99, quantity: 50 },
        { name: 'Milk Chocolate', category: 'Chocolate', price: 2.99, quantity: 100 },
        { name: 'Gummy Bears', category: 'Gummy', price: 1.99, quantity: 75 },
      ]);

      const response = await request(app)
        .get('/api/sweets/search?minPrice=2&maxPrice=3.5')
        .expect(200);

      expect(response.body).toHaveLength(1);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    it('should allow admin to update a sweet', async () => {
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

      const response = await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('New Name');
      expect(response.body.price).toBe(2.99);
    });

    it('should deny regular user from updating a sweet', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 1.99,
        quantity: 50,
      });

      const response = await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated' })
        .expect(403);

      expect(response.body.error).toBe('Admin access required');
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Sweet not found');
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    it('should allow admin to delete a sweet', async () => {
      const sweet = await Sweet.create({
        name: 'To Delete',
        category: 'Chocolate',
        price: 1.99,
        quantity: 50,
      });

      const response = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Sweet deleted successfully');
      expect(response.body.sweet.name).toBe('To Delete');

      const deletedSweet = await Sweet.findById(sweet._id);
      expect(deletedSweet).toBeNull();
    });

    it('should deny regular user from deleting a sweet', async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 1.99,
        quantity: 50,
      });

      const response = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.error).toBe('Admin access required');
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.error).toBe('Sweet not found');
    });
  });
});
