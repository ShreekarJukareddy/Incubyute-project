import mongoose from 'mongoose';
import { User, IUser } from '../User';

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/sweet-shop-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create a valid user with all required fields', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user' as const,
      };

      const user = await User.create(userData);

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.role).toBe(userData.role);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should create a user with default role as "user"', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.role).toBe('user');
    });

    it('should create an admin user when role is specified', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpass123',
        role: 'admin' as const,
      };

      const user = await User.create(userData);

      expect(user.role).toBe('admin');
    });
  });

  describe('User Validation', () => {
    it('should fail to create user without name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user without email', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user without password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user with invalid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user with name less than 2 characters', async () => {
      const userData = {
        name: 'J',
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user with password less than 6 characters', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should convert email to lowercase', async () => {
      const userData = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
    });

    it('should trim whitespace from name and email', async () => {
      const userData = {
        name: '  Test User  ',
        email: '  test@example.com  ',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
    });

    it('should not allow duplicate email addresses', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });
  });
});
