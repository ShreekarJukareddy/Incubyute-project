# Sweet Shop Management System (MERN)

Full-stack Sweet Shop management system built with Express + TypeScript + MongoDB backend and React + Vite frontend, following TDD.

## Features

- User registration/login with JWT
- Sweets CRUD (create/list/search/update/delete)
- Purchase and restock flows with stock validation
- Role-based access (admin can delete/restock/edit; users can purchase)
- Responsive SPA dashboard with search/filter, purchase, and admin controls

## Tech Stack

- Backend: Node.js, Express, TypeScript, MongoDB (Mongoose), Jest + Supertest
- Frontend: React (Vite, TypeScript)

## Local Setup

Prerequisites: Node.js 18+, npm, and MongoDB running locally.

### Backend

```bash
cd backend
cp .env.example .env
# update MONGO_URI and JWT_SECRET
npm install
npm run dev
```

Run tests:

```bash
npm test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Build:

```bash
npm run build
```

## API Endpoints (summary)

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/sweets`
- GET `/api/sweets/search`
- POST `/api/sweets`
- PUT `/api/sweets/:id`
- DELETE `/api/sweets/:id` (admin)
- POST `/api/sweets/:id/purchase`
- POST `/api/sweets/:id/restock` (admin)

## Screenshots

_(Add your screenshots of the app UI here.)_

## My AI Usage

- Tools: GitHub Copilot and ChatGPT.
- How: Used AI for scaffolding boilerplate (Express/TypeScript setup, Vite React layout), drafting tests (auth & sweets flows), and refining UI structure and copy.
- Impact: Accelerated setup, caught edge cases (duplicate users, stock checks), and sped up styling iterations.

## Test Report

Backend: `npm test` (Jest) — passing.
Frontend: `npm run build` (type-check + Vite build) — passing.

## Roadmap / Next Steps

- Add e2e tests (Playwright/Cypress)
- Add persistent sessions/refresh tokens
- Add deployment config (e.g., Render/Heroku backend, Vercel/Netlify frontend)
- Add CI (lint/test)
