import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import {authRouter} from './auth/routes/auth.routes';
import { globalErrorHandler } from './middleware/errorHandler.middleware';
import { AppError } from './utils/AppError';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running smoothly' });
});

// 404 Unhandled Route Handler
app.use('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

// Global Exception Handler Middleware (MUST be registered last)
app.use(globalErrorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
});