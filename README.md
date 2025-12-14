# 🍬 Sweet Shop Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing an Indian sweet shop with complete inventory management, user authentication, shopping cart, and order history features.

## 🎯 Project Overview

This application provides a comprehensive sweet shop management system featuring:
- **User Authentication** - Register, login with JWT-based authentication
- **Admin Dashboard** - Full CRUD operations for sweet inventory management
- **Product Catalog** - Browse 27+ Indian sweets across 5 categories
- **Shopping Cart** - Add items, adjust quantities, and checkout
- **Order History** - Track all purchases with timestamps
- **Role-Based Access** - Different features for admins vs regular users
- **Real-time Stock Management** - Automatic inventory updates on purchases
- **Indian Sweet Categories** - Milk-Based, Sugar Syrup-Based, Dry Fruit & Nut-Based, Chocolate-Based, Bakery & Dessert
- **Flexible Units** - Supports both kg and units pricing
- **Currency** - Indian Rupee (₹) pricing
- **Orange Theme** - Consistent, vibrant UI design

## ✨ Features

### For Users
- Browse sweets by category with beautiful product cards
- Add sweets to cart with quantity selection
- View and modify cart items
- Purchase confirmation with stock validation
- Complete order history with purchase details
- Profile management

### For Admins
- Add new sweets with images, categories, pricing, and units
- Edit existing sweet details
- Delete sweets from inventory
- View all sweets in a comprehensive table
- Smooth scroll to edit form when editing items
- No cart/order access (admin-focused interface)

## 🛠️ Technology Stack

### Backend
- **Node.js v18+** with **TypeScript**
- **Express.js** - RESTful API framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **Jest** & **Supertest** - Testing framework (165 tests, 91% coverage)
- **Axios** - HTTP client for seed script

### Frontend
- **React 18** with **TypeScript**
- **React Router v6** - Client-side routing
- **React Context API** - State management (Auth & Cart)
- **Axios** - API communication
- **CSS3** - Custom styling with CSS variables
- **LocalStorage** - Cart persistence

## 🎨 Design
- **Orange Theme** - Primary color: #ff7a00
- **Solid Colors** - No gradients for clean, professional look
- **Responsive** - Mobile-friendly design
- **Smooth Animations** - Scroll behavior and transitions
- **Consistent UI** - Unified design across all pages

## 📋 Prerequisites

Before running this project, make sure you have:
- Node.js (v18 or higher)
- MongoDB (v6 or higher) running locally or a MongoDB Atlas account
- npm or yarn package manager

## 🚀 Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
https://docs.google.com/document/d/1tIjXFdz7Q_36JlxYTLrPoAbZYbsXPyO4K_X0Gig_gJ8/edit?usp=sharing
use this link to copy the content of the env file and paste in the .env file

4. Update the `.env` file with above configuration:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sweet-shop
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@sweetshop.com
ADMIN_PASSWORD=Admin@123
```

5. Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or connect to MongoDB Atlas by updating MONGODB_URI in .env
```

6. **Seed the database** with sample sweets (27 Indian sweets across 5 categories):
```bash
npm run seed
```

This will:
- Login as admin using credentials from `.env`
- Add 27 authentic Indian sweets with images, prices, and descriptions
- Check for duplicates (safe to run multiple times)
- Display progress and summary

7. Run tests (165 tests, 91% coverage):
```bash
npm test

# Run with coverage
npm run test:coverage
```

8. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
REACT_APP_API_URL=http://localhost:5001/api
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
sweet-shop/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & environment configuration
│   │   ├── models/          # Mongoose schemas (Sweet, User, Order)
│   │   ├── controllers/     # Business logic handlers
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Auth, error handling middleware
│   │   ├── scripts/         # Seed script for database population
│   │   └── server.ts        # Express server entry point
│   ├── tests/               # Jest test suites (165 tests)
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components (Navbar, ConfirmModal)
    │   ├── pages/           # Page components (Home, Cart, AdminDashboard, etc.)
    │   ├── context/         # React Context (AuthContext, CartContext)
    │   ├── services/        # API service calls
    │   ├── types/           # TypeScript interfaces
    │   ├── App.tsx          # Main app component
    │   └── App.css          # Global styles & CSS variables
    ├── package.json
    └── tsconfig.json
```

## 🧪 Testing

This project follows Test-Driven Development (TDD) practices with comprehensive test coverage.

### Backend Tests
- **165 tests** passing across all modules
- **91.07% code coverage**
- Test suites for: Authentication, Sweet CRUD, Inventory, Orders, Cart, Profile

Run tests:
```bash
cd backend
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Coverage
```
Statements   : 91.07%
Branches     : 87.5%
Functions    : 89.47%
Lines        : 91.07%
```

## 🔐 Authentication

### Default Admin Credentials
- **Email:** `admin@sweetshop.com`
- **Password:** `Admin@123`

Use these credentials to:
- Access the admin dashboard
- Add/edit/delete sweets
- Run the seed script

*(Important: Change these credentials in production)*

### User Registration
- Any user can register with email and password
- Regular users can browse, add to cart, and purchase
- Regular users cannot access admin features

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user/admin
- `GET /api/auth/profile` - Get current user profile (Protected)

### Sweets
- `GET /api/sweets` - Get all sweets (with optional category filter)
- `GET /api/sweets/:id` - Get single sweet by ID
- `POST /api/sweets` - Add new sweet (Admin only)
- `PUT /api/sweets/:id` - Update sweet (Admin only)
- `DELETE /api/sweets/:id` - Delete sweet (Admin only)

### Cart & Orders
- `POST /api/orders/purchase` - Purchase items from cart
- `GET /api/orders/history` - Get user's order history (Protected)

## 🗂️ Sweet Categories

The system supports 5 authentic Indian sweet categories:

1. **Milk-Based Sweets** - Rasgulla, Gulab Jamun, Sandesh, Ras Malai, Kalakand
2. **Sugar Syrup-Based Sweets** - Jalebi, Imarti, Balushahi, Gulab Jamun Dry
3. **Dry Fruit & Nut-Based Sweets** - Kaju Katli, Badam Barfi, Pista Barfi, Anjeer Barfi, Dry Fruit Ladoo
4. **Chocolate-Based Sweets** - Chocolate Barfi, Chocolate Sandesh, Chocolate Peda
5. **Bakery & Dessert Sweets** - Mawa Cake, Nan Khatai, Milk Cake, Kulfi, Gajar Halwa

## 💾 Database Seeding

The project includes a comprehensive seed script to populate the database with 27 authentic Indian sweets.

### Features
- ✅ Adds 27 sweets with images, descriptions, and pricing
- ✅ Authenticates as admin automatically
- ✅ Checks for duplicates (safe to run multiple times)
- ✅ Includes realistic Indian pricing in rupees
- ✅ Supports both kg and units measurements
- ✅ Progress logging with detailed output

### Usage
```bash
cd backend
npm run seed
```

### Sample Output
```
🌱 Starting database seeding...
🔐 Logging in as admin...
✅ Admin authentication successful!
📦 Processing 27 sweets...
✅ Added: Rasgulla
✅ Added: Gulab Jamun
⏭️  Skipped: Kaju Katli (already exists)
...
🎉 Seeding complete!
📊 Summary: Added 25, Skipped 2
```

## 🤖 AI Usage & Development Approach

### Tools Used
I used **GitHub Copilot** as my primary AI assistant throughout the development of this project.

### How I Used AI

#### 1. **Test-Driven Development (TDD)**
   - **RED Phase:** Used Copilot to generate comprehensive test cases before writing implementation
   - **GREEN Phase:** Got code suggestions to make tests pass quickly
   - **REFACTOR Phase:** Received recommendations for code optimization and cleanup
   - Generated 165 test cases with edge cases and validation scenarios

#### 2. **Project Architecture & Setup**
   - Generated initial project structure and folder organization
   - Created `package.json`, `tsconfig.json`, and Jest configuration
   - Set up TypeScript interfaces and type definitions
   - Designed Express middleware patterns

#### 3. **Database Design**
   - Copilot helped design Mongoose schemas with proper validations
   - Suggested field types, constraints, and indexes
   - Generated seed data for 27 authentic Indian sweets
   - Created relationship patterns between User, Sweet, and Order models

#### 4. **API Development**
   - Generated RESTful API endpoints following best practices
   - Received suggestions for authentication middleware using JWT
   - Created error handling patterns and HTTP status codes
   - Implemented role-based access control (admin vs user)

#### 5. **Frontend Development**
   - Generated React components with TypeScript
   - Created Context API patterns for state management (Auth, Cart)
   - Designed responsive CSS with CSS variables for theming
   - Implemented form validation and error handling

#### 6. **Code Quality & Optimization**
   - Got suggestions for TypeScript strict mode compliance
   - Received recommendations for async/await error handling
   - Assistance with React hooks optimization (useCallback, useMemo)
   - Generated comprehensive JSDoc comments

### Specific Examples

**Example 1: Sweet Model with Validation**
```typescript
// Copilot helped design this schema with Indian sweet categories
const sweetSchema = new Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['Milk-Based Sweets', 'Sugar Syrup-Based Sweets', ...],
    required: true 
  },
  unit: { type: String, enum: ['kg', 'units'], required: true },
  price: { type: Number, required: true, min: 0 },
});
```

**Example 2: Seed Script Generation**
```typescript
// Copilot generated 27 authentic sweets with realistic data
const sweets = [
  {
    name: 'Kaju Katli',
    category: 'Dry Fruit & Nut-Based Sweets',
    price: 899,
    imageUrl: 'https://images.unsplash.com/...',
  },
  // ... 26 more sweets
];
```

**Example 3: Cart Context Pattern**
```typescript
// Copilot suggested localStorage persistence pattern
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
};
```

### Reflection on AI Usage

#### What Worked Well
✅ **Rapid Prototyping:** Copilot accelerated initial setup and boilerplate code generation  
✅ **Test Coverage:** AI suggestions helped achieve 91% test coverage with comprehensive edge cases  
✅ **Pattern Recognition:** Excellent at suggesting common patterns (middleware, context, hooks)  
✅ **TypeScript Support:** Strong type inference and interface generation  
✅ **Documentation:** Quick generation of comments and README sections  

#### Challenges & Limitations
⚠️ **Context Understanding:** Sometimes suggested outdated patterns or didn't understand project-specific requirements  
⚠️ **Over-reliance Risk:** Had to review all suggestions carefully to ensure correctness  
⚠️ **Complex Logic:** Struggled with complex business logic; required manual intervention  
⚠️ **Consistency:** Needed manual adjustments to maintain consistent coding style  

#### Key Learnings
- **Always Review AI Code:** Never blindly accept suggestions; understand every line
- **Use as a Tool, Not a Crutch:** AI accelerates development but doesn't replace thinking
- **Iterative Refinement:** Best results came from multiple iterations and refinements
- **Domain Knowledge Still Required:** Understanding Indian sweets, pricing, and user needs was essential
- **Testing First (TDD):** Writing tests first helped catch AI-generated bugs early

### Productivity Impact
- **Estimated Time Saved:** ~40% faster development compared to writing from scratch
- **Test Coverage:** 91% achieved with AI-assisted test generation
- **Code Quality:** Maintained high quality through careful review and refactoring
- **Learning Curve:** AI helped explore new patterns and best practices

### Conclusion
GitHub Copilot was invaluable for this project, especially for:
- Boilerplate reduction
- Test case generation
- Design pattern suggestions
- Documentation creation

However, the success of this project still relied on:
- Strong understanding of full-stack development principles
- Careful code review and testing
- Domain knowledge of the sweet shop business
- Architectural decision-making

AI is a powerful accelerator, but human expertise, critical thinking, and testing remain essential for building quality software.

AI tools significantly accelerated the initial setup and boilerplate generation, allowing me to focus on business logic and architecture decisions. However, I reviewed and modified all AI-generated code to ensure it met the specific requirements and followed best practices. The TDD approach helped validate that AI suggestions worked correctly.

## 📝 Development Features Completed

- [x] Project initialization with TypeScript
## ✅ Project Status & Features Implemented

### Backend (Complete ✅)
- [x] MongoDB database configuration with Mongoose
- [x] User model with email validation and password hashing
- [x] Sweet model with categories, units (kg/units), and pricing
- [x] Order model for tracking purchases
- [x] JWT-based authentication system
- [x] User registration and login endpoints
- [x] Admin role-based access control
- [x] Sweet CRUD operations (Admin only)
- [x] Purchase endpoint with stock validation
- [x] Order history endpoint
- [x] Profile management endpoint
- [x] Cart purchase with multiple items
- [x] Comprehensive test suite (165 tests, 91% coverage)
- [x] Seed script with 27 Indian sweets
- [x] Image URL support for sweets

### Frontend (Complete ✅)
- [x] React 18 with TypeScript setup
- [x] React Router v6 for navigation
- [x] Authentication pages (Login/Register)
- [x] Home page with sweet catalog
- [x] Category filtering (5 Indian sweet categories)
- [x] Search functionality
- [x] Shopping cart with quantity management
- [x] Cart persistence (localStorage)
- [x] Purchase confirmation modal
- [x] Order history page
- [x] Profile page
- [x] Admin dashboard with CRUD operations
- [x] Smooth scroll to edit form
- [x] Orange theme design (solid colors)
- [x] Role-based UI (admin vs user views)
- [x] Responsive design
- [x] Context API for state management (Auth & Cart)

### Testing
- **Total Tests:** 165 passing ✅
- **Coverage:** 91.07% statements, 87.5% branches
- **Test Suites:** Auth, Sweets, Orders, Cart, Profile
- **Approach:** Test-Driven Development (TDD)
- **Pattern:** RED-GREEN-REFACTOR commits

### Future Enhancements (Optional)
- [ ] Payment gateway integration
- [ ] Image upload for sweets
- [ ] Reviews and ratings
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Deployment (Vercel/Heroku/AWS)

## 🎨 UI/UX Features

### Theme
- **Primary Color:** Orange (#ff7a00)
- **Design:** Clean, solid colors (no gradients)
- **Typography:** Modern, readable fonts
- **Layout:** Responsive grid system

### User Experience
- **Smooth Animations:** Scroll behavior and transitions
- **Loading States:** Feedback for async operations
- **Error Handling:** User-friendly error messages
- **Confirmation Modals:** Prevent accidental actions
- **Persistent Cart:** Cart saved to localStorage
- **Category Badges:** Visual category identification

## � Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run seed         # Populate database with sample data
npm run build        # Compile TypeScript
npm start            # Run production server
```

### Frontend Scripts
```bash
npm start            # Start development server
npm test             # Run tests
npm run build        # Create production build
npm run eject        # Eject from Create React App
```

## 🌐 Environment Variables

### Backend `.env`
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sweet-shop
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@sweetshop.com
ADMIN_PASSWORD=Admin@123
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5001/api
```

## 📝 Git Commit History

This project follows TDD practices with clear commit messages:
- `test:` Test cases (RED phase)
- `feat:` Feature implementation (GREEN phase)
- `refactor:` Code improvements (REFACTOR phase)
- `docs:` Documentation updates
- `fix:` Bug fixes

## 👨‍💻 Author

**Shreekar Jukareddy**
- GitHub: [@ShreekarJukareddy](https://github.com/ShreekarJukareddy)
- Repository: [Incubyute-project](https://github.com/ShreekarJukareddy/Incubyute-project)

## 📄 License

ISC

---

## 🙏 Acknowledgments

- **GitHub Copilot** - AI pair programming assistant
- **MongoDB** - Database platform
- **React** - Frontend framework
- **TypeScript** - Type safety
- **Jest** - Testing framework
- **Unsplash** - Sweet images

---

**Note**: This project was developed following strict Test-Driven Development (TDD) principles with comprehensive test coverage and RED-GREEN-REFACTOR commit patterns. The development journey is documented through 165 tests and meaningful git commits.
