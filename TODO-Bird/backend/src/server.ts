import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/db';
import { authRouter } from './auth/routes/auth.routes';
import { swaggerSpec } from './config/swagger';
import { globalErrorHandler } from './middleware/errorHandler.middleware';
import { AppError } from './utils/AppError';
import { taskRouter } from './task/router/task.router';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Swagger Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth Routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running smoothly' });
});

// 404 Unhandled Route Handler (Express v5 / path-to-regexp v8 syntax)
app.use('/*path', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

// Global Exception Handler Middleware
app.use(globalErrorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Swagger] Docs live at http://localhost:${PORT}/api-docs`);
  });
});