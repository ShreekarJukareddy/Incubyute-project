import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const DEFAULT_ADMIN_EMAIL = 'admin@sweetshop.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123';

export const createAdminUser = async (
  email: string = DEFAULT_ADMIN_EMAIL,
  password: string = DEFAULT_ADMIN_PASSWORD
): Promise<void> => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await User.create({
      name: 'Admin',
      email,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin user created successfully');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};
