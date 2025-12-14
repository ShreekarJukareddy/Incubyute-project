import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import sweetsRouter from './routes/sweets';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/sweets', sweetsRouter);

// Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = res.statusCode >= 400 ? res.statusCode : 500;
  // In production, we'd log this error
  res.status(status).json({ message: err.message || 'Internal server error' });
});

export default app;
