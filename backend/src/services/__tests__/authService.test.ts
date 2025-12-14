import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AuthService } from '../authService';
import { User } from '../../models/User';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/sweet-shop-test');
    authService = new AuthService();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
      expect(result.user.role).toBe('user');
      expect(result.token).toBeTruthy();
    });

    it('should hash the password before storing', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await authService.register(userData);

      const user = await User.findOne({ email: userData.email });
      expect(user?.password).not.toBe(userData.password);
      
      const isPasswordValid = await bcrypt.compare(userData.password, user!.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should fail to register with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await authService.register(userData);

      await expect(authService.register(userData)).rejects.toThrow(
        'User already exists with this email'
      );
    });

    it('should create user with role "user" by default', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await authService.register(userData);

      expect(result.user.role).toBe('user');
    });

    it('should return a valid JWT token', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await authService.register(userData);

      expect(result.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });
  });

  describe('login', () => {
    it('should successfully login with correct credentials', async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginData.email);
      expect(result.user.name).toBe('Test User');
      expect(result.token).toBeTruthy();
    });

    it('should fail to login with incorrect email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should fail to login with incorrect password', async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User 2',
        email: 'test2@example.com',
        password: hashedPassword,
        role: 'user',
      });

      const loginData = {
        email: 'test2@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should return a valid JWT token on login', async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User 3',
        email: 'test3@example.com',
        password: hashedPassword,
        role: 'user',
      });

      const loginData = {
        email: 'test3@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(result.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });

    it('should login admin user with admin role', async () => {
      const hashedPassword = await bcrypt.hash('adminpass', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      const loginData = {
        email: 'admin@example.com',
        password: 'adminpass',
      };

      const result = await authService.login(loginData);

      expect(result.user.role).toBe('admin');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const { token, user } = await authService.register(userData);
      const decoded = await authService.verifyToken(token);

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    it('should fail to verify an invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(authService.verifyToken(invalidToken)).rejects.toThrow(
        'Invalid or expired token'
      );
    });

    it('should fail to verify a malformed token', async () => {
      const malformedToken = 'not-a-jwt-token';

      await expect(authService.verifyToken(malformedToken)).rejects.toThrow(
        'Invalid or expired token'
      );
    });
  });
});
