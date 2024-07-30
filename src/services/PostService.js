import { prisma } from '../app.js';

export class PostService {
  async getAll() {
    return await prisma.posts.findMany();
  }
  async getPaginatedPosts(page = 1, pageSize = 5, searchQuery = '', categories = []) {
    const whereClause = {};
    if (searchQuery) {
      whereClause['OR'] = [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (categories.length > 0) {
      whereClause['OR'] = whereClause['OR'] || [];
      whereClause['OR'].push({
        post_categories: {
          some: {
            categories_id: {
              in: categories,
            },
          },
        },
      });
    }

    const postCount = await this.getPostCount(whereClause);

    function getSkipValue() {
      if (page > Math.ceil(postCount / pageSize)) {
        return 0;
      }
      return pageSize * (page - 1);
    }

    return await prisma.posts.findMany({
      include: {
        author: true,
        post_categories: {
          include: {
            categories: true,
          },
        },
      },
      where: whereClause,
      take: pageSize,
      skip: getSkipValue(),
    });
  }
  async getPostCount(whereClause) {
    return await prisma.posts.count({
      where: whereClause,
    });
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
