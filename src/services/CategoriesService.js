import { prisma } from '../app.js';

export class CategoriesService {
  getAll() {
    return prisma.categories.findMany();
  }
}
