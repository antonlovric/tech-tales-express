import { PrismaClient } from '@prisma/client';
import express from 'express';
import cron from 'node-cron';
import { postRouter } from './api/routes/posts.js';
import { apiErrorHandler } from './api/middleware/error.js';
import { categoriesRouter } from './api/routes/categories.js';
import { userRouter } from './api/routes/user.js';
import { AnalyticsService } from './services/AnalyticsService.js';
import session from 'express-session';
import { analyticsRouter } from './api/routes/analytics.js';

const app = express();
app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    cookie: { maxAge: 86400000, secure: true, httpOnly: true },
    resave: false,
    saveUninitialized: true,
  })
);

const port = process.env.PORT;
const analyticsService = new AnalyticsService();

export const prisma = new PrismaClient();

app.get('/health-check', (req, res) => {
  res.send('Health check response');
});

app.use('/posts', postRouter);
app.use('/categories', categoriesRouter);
app.use('/users', userRouter);
app.use('/analytics', analyticsRouter);

app.use(apiErrorHandler);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

cron.schedule('0 0 * * *', analyticsService.calculateRelevanceScore);
