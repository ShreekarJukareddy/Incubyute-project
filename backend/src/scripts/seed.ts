import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sweetshop.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

interface Sweet {
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: 'kg' | 'units';
  description: string;
  imageUrl?: string;
}

const sweets: Sweet[] = [
  // Milk-Based Sweets
  {
    name: 'Rasgulla',
    category: 'Milk-Based Sweets',
    price: 299,
    quantity: 50,
    unit: 'kg',
    description: 'Soft and spongy cottage cheese balls soaked in light sugar syrup',
  },
  {
    name: 'Gulab Jamun',
    category: 'Milk-Based Sweets',
    price: 350,
    quantity: 45,
    unit: 'kg',
    description: 'Deep-fried milk solid balls soaked in rose-flavored sugar syrup',
  },
  {
    name: 'Sandesh',
    category: 'Milk-Based Sweets',
    price: 399,
    quantity: 30,
    unit: 'kg',
    description: 'Bengali delicacy made from fine cottage cheese and sugar',
  },
  {
    name: 'Ras Malai',
    category: 'Milk-Based Sweets',
    price: 450,
    quantity: 25,
    unit: 'kg',
    description: 'Soft paneer patties soaked in sweet, thickened milk with cardamom',
  },
  {
    name: 'Kalakand',
    category: 'Milk-Based Sweets',
    price: 380,
    quantity: 35,
    unit: 'kg',
    description: 'Milk cake made from solidified, sweetened milk and cottage cheese',
  },

  // Sugar Syrup-Based Sweets
  {
    name: 'Jalebi',
    category: 'Sugar Syrup-Based Sweets',
    price: 250,
    quantity: 40,
    unit: 'kg',
    description: 'Crispy, deep-fried spirals soaked in sugar syrup with saffron',
  },
  {
    name: 'Imarti',
    category: 'Sugar Syrup-Based Sweets',
    price: 280,
    quantity: 35,
    unit: 'kg',
    description: 'Flower-shaped sweet made from urad dal batter and sugar syrup',
  },
  {
    name: 'Balushahi',
    category: 'Sugar Syrup-Based Sweets',
    price: 320,
    quantity: 30,
    unit: 'kg',
    description: 'Flaky, glazed doughnut-like sweet soaked in sugar syrup',
  },
  {
    name: 'Gulab Jamun Dry',
    category: 'Sugar Syrup-Based Sweets',
    price: 380,
    quantity: 25,
    unit: 'kg',
    description: 'Dry variant of gulab jamun with a firmer texture',
  },

  // Dry Fruit & Nut-Based Sweets
  {
    name: 'Kaju Katli',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 899,
    quantity: 20,
    unit: 'kg',
    description: 'Premium cashew fudge in diamond shapes, garnished with silver leaf',
  },
  {
    name: 'Badam Barfi',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 799,
    quantity: 22,
    unit: 'kg',
    description: 'Rich almond fudge with aromatic cardamom flavor',
  },
  {
    name: 'Pista Barfi',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 999,
    quantity: 18,
    unit: 'kg',
    description: 'Delicious pistachio fudge with natural green color',
  },
  {
    name: 'Anjeer Barfi',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 850,
    quantity: 15,
    unit: 'kg',
    description: 'Fig-based sweet with mixed dry fruits and nuts',
  },
  {
    name: 'Dry Fruit Ladoo',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 750,
    quantity: 25,
    unit: 'kg',
    description: 'Mixed dry fruit balls with dates, cashews, and almonds',
  },

  // Chocolate-Based Sweets
  {
    name: 'Chocolate Barfi',
    category: 'Chocolate-Based Sweets',
    price: 450,
    quantity: 30,
    unit: 'kg',
    description: 'Fusion sweet combining traditional barfi with rich chocolate',
  },
  {
    name: 'Chocolate Sandesh',
    category: 'Chocolate-Based Sweets',
    price: 420,
    quantity: 28,
    unit: 'kg',
    description: 'Bengali sandesh infused with premium chocolate',
  },
  {
    name: 'Chocolate Peda',
    category: 'Chocolate-Based Sweets',
    price: 399,
    quantity: 35,
    unit: 'kg',
    description: 'Soft milk-based sweet flavored with cocoa and chocolate chips',
  },

  // Bakery & Dessert Sweets
  {
    name: 'Mawa Cake',
    category: 'Bakery & Dessert Sweets',
    price: 599,
    quantity: 20,
    unit: 'kg',
    description: 'Soft and moist cake made with khoya (reduced milk)',
  },
  {
    name: 'Nan Khatai',
    category: 'Bakery & Dessert Sweets',
    price: 280,
    quantity: 40,
    unit: 'kg',
    description: 'Traditional Indian shortbread cookies with cardamom',
  },
  {
    name: 'Milk Cake',
    category: 'Bakery & Dessert Sweets',
    price: 520,
    quantity: 25,
    unit: 'kg',
    description: 'Dense, crumbly cake made from condensed milk',
  },
  {
    name: 'Kulfi',
    category: 'Bakery & Dessert Sweets',
    price: 50,
    quantity: 100,
    unit: 'units',
    description: 'Traditional Indian ice cream on a stick with cardamom and nuts',
  },
  {
    name: 'Gajar Halwa',
    category: 'Bakery & Dessert Sweets',
    price: 380,
    quantity: 30,
    unit: 'kg',
    description: 'Sweet carrot pudding with milk, ghee, and dry fruits',
  },
];

async function seedSweets() {
  try {
    console.log('🌱 Starting seed process...\n');

    // Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful\n');

    // Create axios instance with auth token
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Get existing sweets to avoid duplicates
    console.log('📋 Checking existing sweets...');
    const existingSweets = await api.get('/sweets');
    const existingSweetNames = existingSweets.data.map((s: any) => s.name.toLowerCase());
    console.log(`Found ${existingSweets.data.length} existing sweets\n`);

    // Add sweets
    let addedCount = 0;
    let skippedCount = 0;

    for (const sweet of sweets) {
      try {
        // Skip if sweet already exists
        if (existingSweetNames.includes(sweet.name.toLowerCase())) {
          console.log(`⏭️  Skipping "${sweet.name}" (already exists)`);
          skippedCount++;
          continue;
        }

        await api.post('/sweets', sweet);
        console.log(`✅ Added: ${sweet.name} - ₹${sweet.price}/${sweet.unit} (${sweet.category})`);
        addedCount++;
      } catch (err: any) {
        console.error(`❌ Failed to add "${sweet.name}":`, err.response?.data?.message || err.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Seed process completed!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully added: ${addedCount} sweets`);
    console.log(`⏭️  Skipped (duplicates): ${skippedCount} sweets`);
    console.log(`📊 Total in database: ${existingSweets.data.length + addedCount} sweets`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Seed process failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run seed
seedSweets();
