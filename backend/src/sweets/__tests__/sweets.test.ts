import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { config } from '../../config';
import User from '../../models/User';
import Sweet from '../../models/Sweet';
import bcrypt from 'bcryptjs';

let mongo: MongoMemoryServer;
let userToken: string;
let adminToken: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }

  const password = await bcrypt.hash('Password123', 10);
  const user = await User.create({ email: 'user@example.com', password });
  const admin = await User.create({ email: 'admin@example.com', password, role: 'admin' });

  userToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, config.jwtSecret);
  adminToken = jwt.sign({ id: admin.id, role: admin.role, email: admin.email }, config.jwtSecret);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

describe('Sweets API', () => {
  const base = '/api/sweets';

  it('requires auth for protected endpoints', async () => {
    await request(app).post(base).send({ name: 'Candy', category: 'Chocolate', price: 2, quantity: 10 }).expect(401);
  });

  it('creates a sweet (admin or user allowed for POST)', async () => {
    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Candy', category: 'Chocolate', price: 2.5, quantity: 15 })
      .expect(201);

    expect(res.body.name).toBe('Candy');
    const sweetInDb = await Sweet.findOne({ name: 'Candy' });
    expect(sweetInDb).toBeTruthy();
  });

  it('lists sweets', async () => {
    await Sweet.create([
      { name: 'Candy', category: 'Chocolate', price: 2, quantity: 5 },
      { name: 'Gummy', category: 'Gummy', price: 1.5, quantity: 10 }
    ]);

    const res = await request(app).get(base).set('Authorization', `Bearer ${userToken}`).expect(200);
    expect(res.body).toHaveLength(2);
  });

  it('searches sweets by name and price range', async () => {
    await Sweet.create([
      { name: 'Dark Chocolate', category: 'Chocolate', price: 5, quantity: 5 },
      { name: 'Milk Chocolate', category: 'Chocolate', price: 3, quantity: 5 },
      { name: 'Gummy Bear', category: 'Gummy', price: 1, quantity: 10 }
    ]);

    const res = await request(app)
      .get(`${base}/search`)
      .query({ name: 'chocolate', minPrice: 3, maxPrice: 5 })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.map((s: any) => s.name).sort()).toEqual(['Dark Chocolate', 'Milk Chocolate']);
  });

  it('updates a sweet', async () => {
    const sweet = await Sweet.create({ name: 'Lollipop', category: 'Candy', price: 1, quantity: 5 });

    const res = await request(app)
      .put(`${base}/${sweet.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 2 })
      .expect(200);

    expect(res.body.price).toBe(2);
  });

  it('deletes a sweet (admin only)', async () => {
    const sweet = await Sweet.create({ name: 'Temp', category: 'Candy', price: 1, quantity: 5 });

    await request(app)
      .delete(`${base}/${sweet.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app)
      .delete(`${base}/${sweet.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  it('purchases a sweet and decrements quantity', async () => {
    const sweet = await Sweet.create({ name: 'Purchase', category: 'Candy', price: 2, quantity: 2 });

    const res = await request(app)
      .post(`${base}/${sweet.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 })
      .expect(200);

    expect(res.body.quantity).toBe(1);
  });

  it('prevents purchase when out of stock', async () => {
    const sweet = await Sweet.create({ name: 'Empty', category: 'Candy', price: 2, quantity: 0 });

    await request(app)
      .post(`${base}/${sweet.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 })
      .expect(400);
  });

  it('restocks a sweet (admin only)', async () => {
    const sweet = await Sweet.create({ name: 'Restock', category: 'Candy', price: 2, quantity: 1 });

    await request(app)
      .post(`${base}/${sweet.id}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 3 })
      .expect(403);

    const res = await request(app)
      .post(`${base}/${sweet.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 3 })
      .expect(200);

    expect(res.body.quantity).toBe(4);
  });
});
