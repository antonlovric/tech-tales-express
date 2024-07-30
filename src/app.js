import { PrismaClient } from '@prisma/client';
import express from 'express';
const app = express();
const port = 3001;

const prisma = new PrismaClient();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
