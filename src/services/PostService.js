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
  async getDetails(postId) {
    return await prisma.posts.findFirst({
      where: { id: { equals: parseInt(postId) } },
      include: {
        author: true,
        post_categories: { include: { categories: true } },
        post_votes: true,
        comments: {
          orderBy: { created_at: 'asc' },
          include: {
            users: {
              select: { first_name: true, last_name: true, profile_image: true },
            },
          },
        },
      },
    });
  }
  async getLikedStatus(postId, userId) {
    const post = await prisma.post_votes.findFirst({
      where: {
        AND: [
          {
            post_id: {
              equals: postId,
            },
          },
          {
            user_id: {
              equals: userId,
            },
          },
        ],
      },
    });
    return post;
  }
}
