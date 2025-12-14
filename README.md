# Sweet Shop Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing a sweet shop inventory with user authentication, admin controls, and e-commerce features.

## 🎯 Project Overview

This application provides a comprehensive sweet shop management system with:
- User registration and authentication
- Admin panel for inventory management
- Product browsing and filtering
- Purchase functionality
- Real-time stock management

## 🛠️ Technology Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Jest** & **Supertest** - Testing

### Frontend
- **React** with **TypeScript**
- **React Router** - Navigation
- **Axios** - API calls
- **CSS Modules** / **Tailwind CSS** - Styling

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
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
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

6. Run tests:
```bash
npm test
```

7. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

*(Coming soon after backend completion)*

## 📁 Project Structure

```
sweet-shop/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Database models
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
└── frontend/
    └── (Coming soon)
```

## 🧪 Testing

This project follows Test-Driven Development (TDD) practices.

Run tests:
```bash
cd backend
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm test -- --coverage
```

## 🔐 Authentication

### Default Admin Credentials
- Email: `admin@sweetshop.com`
- Password: `Admin@123`

*(Change these in production)*

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user/admin

### Sweets (Protected)
- `GET /api/sweets` - Get all sweets
- `GET /api/sweets/:id` - Get single sweet
- `GET /api/sweets/search` - Search sweets
- `POST /api/sweets` - Add new sweet (Admin only)
- `PUT /api/sweets/:id` - Update sweet (Admin only)
- `DELETE /api/sweets/:id` - Delete sweet (Admin only)

### Inventory (Protected)
- `POST /api/sweets/:id/purchase` - Purchase sweet
- `POST /api/sweets/:id/restock` - Restock sweet (Admin only)

## 🤖 My AI Usage

### Tools Used
I used **GitHub Copilot** extensively throughout the development of this project.

### How I Used AI

1. **Project Setup & Boilerplate**
   - Used Copilot to generate initial `package.json` configuration
   - Generated TypeScript and Jest configuration files
   - Created folder structure recommendations

2. **Database Models**
   - Copilot helped design Mongoose schemas with validation
   - Generated comprehensive test cases for models
   - Suggested field validations and constraints

3. **Test Writing (TDD)**
   - Used Copilot to generate test cases for each model
   - Got suggestions for edge cases and validation scenarios
   - Helped structure tests following Jest best practices

4. **Code Organization**
   - Received suggestions for file structure
   - Got recommendations for TypeScript types and interfaces
   - Assistance with error handling patterns

### Reflection

AI tools significantly accelerated the initial setup and boilerplate generation, allowing me to focus on business logic and architecture decisions. However, I reviewed and modified all AI-generated code to ensure it met the specific requirements and followed best practices. The TDD approach helped validate that AI suggestions worked correctly.

## 📝 Development Features Completed

- [x] Project initialization with TypeScript
- [x] Database configuration
- [x] User model with validation
- [x] Sweet model with validation
- [x] Comprehensive test suite for models
- [x] User authentication (Register/Login)
- [x] JWT token generation and verification
- [x] Password hashing with bcrypt
- [x] Authentication middleware
- [x] Input validation with express-validator
- [x] Admin predefined account creation on startup
- [ ] Sweet management endpoints (Admin CRUD)
- [ ] Sweet inventory management
- [ ] Frontend application
- [ ] Deployment

## 👤 Author

*Your Name*

## 📄 License

ISC

---

**Note**: This project is developed following TDD principles with frequent commits documenting the development journey.
