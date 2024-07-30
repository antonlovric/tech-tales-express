import { prisma } from '../app.js';

export class PostService {
  async getAll() {
    return await prisma.posts.findMany();
  }
  async get(postId) {
    return await prisma.posts.findFirst({
      where: {
        id: {
          equals: postId,
        },
      },
    });
  }
  async create(post) {
    return await prisma.posts.create({
      data: {
        ...post,
      },
    });
  }
  async delete(postId) {
    return await prisma.posts.delete({
      where: {
        id: {
          equals: postId,
        },
      },
    });
  }
  async update(postId, post) {
    return await prisma.posts.update({
      where: {
        id: {
          equals: postId,
        },
      },
      data: {
        ...post,
      },
    });
  }
}
