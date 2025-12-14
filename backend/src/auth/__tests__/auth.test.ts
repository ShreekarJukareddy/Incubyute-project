import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../app';
import User from '../../models/User';
import bcrypt from 'bcryptjs';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

describe('Auth API', () => {
  const base = '/api/auth';

  it('registers a user and returns token + user info', async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ email: 'test@example.com', password: 'Password123', name: 'Test User' })
      .expect(201);

    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user).not.toHaveProperty('password');

    const userInDb = await User.findOne({ email: 'test@example.com' }).lean();
    expect(userInDb).toBeTruthy();
    const passwordMatch = await bcrypt.compare('Password123', userInDb!.password);
    expect(passwordMatch).toBe(true);
  });

  it('prevents duplicate registrations', async () => {
    await request(app)
      .post(`${base}/register`)
      .send({ email: 'dup@example.com', password: 'Password123' })
      .expect(201);

    const res = await request(app)
      .post(`${base}/register`)
      .send({ email: 'dup@example.com', password: 'Password123' })
      .expect(409);

    expect(res.body.message).toMatch(/already exists/i);
  });

  it('validates missing credentials on register', async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ email: '' })
      .expect(400);

    expect(res.body.message).toMatch(/email/i);
  });

  it('logs in an existing user and returns token', async () => {
    const password = 'Password123';
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email: 'login@example.com', password: hashed, name: 'Login' });

    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: 'login@example.com', password })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@example.com');
  });

  it('rejects invalid login', async () => {
    const password = 'Password123';
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email: 'badlogin@example.com', password: hashed });

    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: 'badlogin@example.com', password: 'WrongPass' })
      .expect(401);

    expect(res.body.message).toMatch(/invalid/i);
  });
});
