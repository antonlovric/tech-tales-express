import { PrismaClient } from '@prisma/client';
import express from 'express';
import { postRouter } from './api/routes/posts.js';
import { apiErrorHandler } from './api/middleware/error.js';
const app = express();
const port = 3001;

export const prisma = new PrismaClient();

app.get('/health-check', (req, res) => {
  res.send('Health check response');
});

app.use(express.json());
app.use('/posts', postRouter);
app.use(apiErrorHandler);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
