import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../../models/User';
import { createAdminUser } from '../seedAdmin';

describe('Admin Seeding', () => {
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

  describe('createAdminUser', () => {
    it('should create admin user if it does not exist', async () => {
      const adminEmail = 'admin@sweetshop.com';
      const adminPassword = 'Admin@123';

      await createAdminUser(adminEmail, adminPassword);

      const admin = await User.findOne({ email: adminEmail });
      expect(admin).toBeDefined();
      expect(admin?.name).toBe('Admin');
      expect(admin?.email).toBe(adminEmail);
      expect(admin?.role).toBe('admin');
    });

    it('should hash the admin password', async () => {
      const adminEmail = 'admin@sweetshop.com';
      const adminPassword = 'Admin@123';

      await createAdminUser(adminEmail, adminPassword);

      const admin = await User.findOne({ email: adminEmail });
      expect(admin?.password).not.toBe(adminPassword);

      const isPasswordValid = await bcrypt.compare(adminPassword, admin!.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should not create duplicate admin if already exists', async () => {
      const adminEmail = 'admin@sweetshop.com';
      const adminPassword = 'Admin@123';

      await createAdminUser(adminEmail, adminPassword);
      await createAdminUser(adminEmail, adminPassword);

      const adminCount = await User.countDocuments({ email: adminEmail });
      expect(adminCount).toBe(1);
    });

    it('should not overwrite existing admin password', async () => {
      const adminEmail = 'admin@sweetshop.com';
      const originalPassword = 'Admin@123';
      const newPassword = 'NewPassword@456';

      await createAdminUser(adminEmail, originalPassword);
      const admin = await User.findOne({ email: adminEmail });
      const originalHash = admin?.password;

      await createAdminUser(adminEmail, newPassword);
      const adminAfter = await User.findOne({ email: adminEmail });

      expect(adminAfter?.password).toBe(originalHash);
    });

    it('should use default credentials if none provided', async () => {
      await createAdminUser();

      const admin = await User.findOne({ role: 'admin' });
      expect(admin).toBeDefined();
      expect(admin?.email).toBe('admin@sweetshop.com');
    });

    it('should log success message when admin is created', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const adminEmail = 'admin@sweetshop.com';
      const adminPassword = 'Admin@123';

      await createAdminUser(adminEmail, adminPassword);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Admin user created')
      );

      consoleSpy.mockRestore();
    });

    it('should log message when admin already exists', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const adminEmail = 'admin@sweetshop.com';
      const adminPassword = 'Admin@123';

      await createAdminUser(adminEmail, adminPassword);
      consoleSpy.mockClear();

      await createAdminUser(adminEmail, adminPassword);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Admin user already exists')
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');

      // Close connection to force an error
      await mongoose.connection.close();

      await createAdminUser('admin@test.com', 'password');

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      // Reconnect for other tests
      await mongoose.connect('mongodb://localhost:27017/sweet-shop-test');
    });
  });
});
