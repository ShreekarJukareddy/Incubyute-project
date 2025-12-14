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
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?https://palatesdesire.com/wp-content/uploads/2022/09/rasgulla-recipe@palates-desire.jpg=400',
  },
  {
    name: 'Gulab Jamun',
    category: 'Milk-Based Sweets',
    price: 350,
    quantity: 45,
    unit: 'kg',
    description: 'Deep-fried milk solid balls soaked in rose-flavored sugar syrup',
    imageUrl: 'https://images.unsplash.com/photo-15https://www.cadburydessertscorner.com/hubfs/dc-website-2022/articles/soft-gulab-jamun-recipe-for-raksha-bandhan-from-dough-to-syrup-all-you-need-to-know/soft-gulab-jamun-recipe-for-raksha-bandhan-from-dough-to-syrup-all-you-need-to-know.webp89301773859-34e3758c5a97?w=400',
  },
  {
    name: 'Sandesh',
    category: 'Milk-Based Sweets',
    price: 399,
    quantity: 30,
    unit: 'kg',
    description: 'Bengali delicacy made from fine cottage cheese and sugar',
    imageUrl: 'https://images.unhttps://www.chefkunalkapur.com/wp-content/uploads/2021/03/Sandesh-scaled.jpg?v=1619103410splash.com/photo-1599599810769-bcde5a160d32?w=400',
  },
  {
    name: 'Ras Malai',
    category: 'Milk-Based Sweets',
    price: 450,
    quantity: 25,
    unit: 'kg',
    description: 'Soft paneer patties soaked in sweet, thickened milk with cardamom',
    imageUrl: 'https://images.https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_960,w_960//InstamartAssets/rasmalai%20(1).webp?updatedAt=1727156174218unsplash.com/photo-1606491956689-2ea866880c84?w=400',
  },
  {
    name: 'Kalakand',
    category: 'Milk-Based Sweets',
    price: 380,
    quantity: 35,
    unit: 'kg',
    description: 'Milk cake made from solidified, sweetened milk and cottage cheese',
    imageUrl: 'https://images.https://pothgaal.com/cdn/shop/files/Kalakand1.jpg?crop=center&height=600&v=1748859965&width=600unsplash.com/photo-1626074353765-517a65ece1c5?w=400',
  },

  // Sugar Syrup-Based Sweets
  {
    name: 'Jalebi',
    category: 'Sugar Syrup-Based Sweets',
    price: 250,
    quantity: 40,
    unit: 'kg',
    description: 'Crispy, deep-fried spirals soaked in sugar syrup with saffron',
    imageUrl: 'https://images.unshttps://media.istockphoto.com/id/1159362325/photo/bread-pakora.jpg?s=612x612&w=0&k=20&c=93uILcInCMXroXgjEJYXNeUzWh5NASSrEnylAgW7hcs=plash.com/photo-1586190848861-99aa4a171e90?w=400',
  },
  {
    name: 'Imarti',
    category: 'Sugar Syrup-Based Sweets',
    price: 280,
    quantity: 35,
    unit: 'kg',
    description: 'Flower-shaped sweet made from urad dal batter and sugar syrup',
    imageUrl: 'https://images.unsplhttps://vaya.in/recipes/wp-content/uploads/2018/03/Crispy-Imarti.jpgash.com/photo-1628520235116-7db2f9a5f606?w=400',
  },
  {
    name: 'Balushahi',
    category: 'Sugar Syrup-Based Sweets',
    price: 320,
    quantity: 30,
    unit: 'kg',
    description: 'Flaky, glazed doughnut-like sweet soaked in sugar syrup',
    imageUrl: 'https://images.uhttps://i.ytimg.com/vi/AjOsi6AKXJ0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB_iHiLBvhHLr8DfGPdQ1jEqeMoZgnsplash.com/photo-1601050690597-df0568f70950?w=400',
  },
  {
    name: 'Gulab Jamun Dry',
    category: 'Sugar Syrup-Based Sweets',
    price: 380,
    quantity: 25,
    unit: 'kg',
    description: 'Dry variant of gulab jamun with a firmer texture',
    imageUrl: 'https://img-global.cpcdn.com/recipes/c096f02c7b440353/680x781cq80/dry-gulab-jamun-recipe-main-photo.jpg',
  },

  // Dry Fruit & Nut-Based Sweets
  {
    name: 'Kaju Katli',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 899,
    quantity: 20,
    unit: 'kg',
    description: 'Premium cashew fudge in diamond shapes, garnished with silver leaf',
    imageUrl: 'https://static.toiimg.com/thumb/55048826.cms?width=1200&height=900',
  },
  {
    name: 'Badam Barfi',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 799,
    quantity: 22,
    unit: 'kg',
    description: 'Rich almond fudge with aromatic cardamom flavor',
    imageUrl: 'https://bhagathalwai.com/cdn/shop/files/badam-barfi.jpg?v=1684792516',
  },
  {
    name: 'Pista Barfi',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 999,
    quantity: 18,
    unit: 'kg',
    description: 'Delicious pistachio fudge with natural green color',
    imageUrl: 'https://sinfullyspicy.com/wp-content/uploads/2024/10/Pistachio-Burfi-featured-image.jpg',
  },
  {
    name: 'Anjeer Barfi',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 850,
    quantity: 15,
    unit: 'kg',
    description: 'Fig-based sweet with mixed dry fruits and nuts',
    imageUrl: 'https://indiasweethouse.in/cdn/shop/files/SFAnjeerBurfi.jpg?v=1685450544',
  },
  {
    name: 'Dry Fruit Ladoo',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 750,
    quantity: 25,
    unit: 'kg',
    description: 'Mixed dry fruit balls with dates, cashews, and almonds',
    imageUrl: 'https://laddubox.in/cdn/shop/products/DryfruitLaddu_1024x1024.png?v=1603865657',
  },

  // Chocolate-Based Sweets
  {
    name: 'Chocolate Barfi',
    category: 'Chocolate-Based Sweets',
    price: 450,
    quantity: 30,
    unit: 'kg',
    description: 'Fusion sweet combining traditional barfi with rich chocolate',
    imageUrl: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2024/05/chocolate-burfi-recipe.jpg',
  },
  {
    name: 'Chocolate Sandesh',
    category: 'Chocolate-Based Sweets',
    price: 420,
    quantity: 28,
    unit: 'kg',
    description: 'Bengali sandesh infused with premium chocolate',
    imageUrl: 'https://www.family.abbott/content/dam/an/familyabbott/in-en/ensure/guides-to-healthy-living/recipes/ensure/Chocolate-Sandesh.jpg',
  },
  {
    name: 'Chocolate Peda',
    category: 'Chocolate-Based Sweets',
    price: 399,
    quantity: 35,
    unit: 'kg',
    description: 'Soft milk-based sweet flavored with cocoa and chocolate chips',
    imageUrl: 'https://www.blendwithspices.com/wp-content/uploads/2014/12/chocolatepedarecipe.jpg',
  },

  // Bakery & Dessert Sweets
  {
    name: 'Mawa Cake',
    category: 'Bakery & Dessert Sweets',
    price: 599,
    quantity: 20,
    unit: 'kg',
    description: 'Soft and moist cake made with khoya (reduced milk)',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbcB3X8MLYvtfmGQQrIcKisPh2_FQD8EHUuA&s',
  },
  {
    name: 'Nan Khatai',
    category: 'Bakery & Dessert Sweets',
    price: 280,
    quantity: 40,
    unit: 'kg',
    description: 'Traditional Indian shortbread cookies with cardamom',
    imageUrl: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2018/08/nankhatai-recipe.jpg',
  },
  {
    name: 'Milk Cake',
    category: 'Bakery & Dessert Sweets',
    price: 520,
    quantity: 25,
    unit: 'kg',
    description: 'Dense, crumbly cake made from condensed milk',
    imageUrl: 'https://www.munipendawala.com/cdn/shop/files/Milk-Cake_ef138ba2-cc25-4f28-9b55-ed66773cc000.jpg?v=1683115440',
  },
  {
    name: 'Kulfi',
    category: 'Bakery & Dessert Sweets',
    price: 50,
    quantity: 100,
    unit: 'units',
    description: 'Traditional Indian ice cream on a stick with cardamom and nuts',
    imageUrl: 'https://www.thespruceeats.com/thmb/-iTdGVh8AN5qXBY_rWTFSETS27Q=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/kulfi-4800100-hero-01-0ee27599d74141d985914c2a38947c9b.jpg',
  },
  {
    name: 'Gajar Halwa',
    category: 'Bakery & Dessert Sweets',
    price: 380,
    quantity: 30,
    unit: 'kg',
    description: 'Sweet carrot pudding with milk, ghee, and dry fruits',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRORElkD1xT_zUZoPXyB2YFsSzVgdC7NhHUTQ&s',
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
