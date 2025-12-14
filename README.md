# Sweet Shop Management System (MERN)

Full-stack kata implementing a Sweet Shop management system with Express/TypeScript backend and React frontend, following TDD.

## Status

- Backend: scaffolded with TypeScript/Jest, MongoDB connection.
- Frontend: Vite (React + TS) scaffolded; pending feature implementation.

## Setup (local)

Prerequisites: Node.js 18+, npm, and MongoDB running locally.

### Backend

```bash
cd backend
cp .env.example .env
# update MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## My AI Usage

- Will document tools and prompts used during development here.
- AI tools planned: GitHub Copilot / ChatGPT for scaffolding, tests, and refactors.

## Roadmap

- [ ] Auth (register/login) with JWT
- [ ] Sweets CRUD & inventory endpoints
- [ ] Frontend auth flow & dashboard
- [ ] Search/filter/purchase UI
- [ ] Admin actions (add/update/delete/restock)
- [ ] Tests and deployment
