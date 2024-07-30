import { PrismaClient } from '@prisma/client';
import express from 'express';
import { postRouter } from './api/routes/posts.js';
import { apiErrorHandler } from './api/middleware/error.js';
import { categoriesRouter } from './api/routes/categories.js';
const app = express();
const port = process.env.PORT;

export const prisma = new PrismaClient();

app.get('/health-check', (req, res) => {
  res.send('Health check response');
});

app.use(express.json());

app.use('/posts', postRouter);
app.use('/categories', categoriesRouter);

app.use(apiErrorHandler);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
