import express from 'express';
import { CategoriesService } from '../../services/CategoriesService.js';
export const categoriesRouter = express.Router();
const categoriesService = new CategoriesService();

categoriesRouter.get('/', async (req, res, next) => {
  try {
    const categories = await categoriesService.getAll();
    return res.send(categories);
  } catch (error) {
    next(error);
  }
});
