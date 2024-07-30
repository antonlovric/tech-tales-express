import { prisma } from '../app.js';

export class UserService {
  async getAll() {
    return await prisma.users.findMany();
  }
  async getProfile(userId) {
    return await prisma.users.findFirst({
      where: { id: { equals: parseInt(userId || '') } },
      include: {
        posts: {
          include: { post_categories: { include: { categories: true } } },
        },
      },
    });
  }
  async update(userId, user) {
    return await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        ...user,
      },
    });
  }
}
