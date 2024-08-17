import { prisma } from '../app.js';
import { ApiError } from '../error/ApiError.js';
import { AwsService } from './AwsService.js';

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

    return {
      posts: await prisma.posts.findMany({
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
      }),
      count: postCount,
    };
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
  async getEditDetails(postId) {
    return await prisma.posts.findFirst({
      where: {
        id: {
          equals: postId,
        },
      },
      include: {
        post_categories: true,
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
    return await prisma.$transaction([
      prisma.post_categories.deleteMany({
        where: {
          posts_id: postId,
        },
      }),
      prisma.posts.update({
        where: {
          id: postId,
        },
        data: {
          id: postId,
          html_content: post.html_content,
          summary: post.summary,
          title: post.title,
          post_categories: {
            create: post.categoryIds.map((categoryId) => ({
              categories: {
                connect: {
                  id: categoryId,
                },
              },
            })),
          },
          cover_image: post.coverImagePath,
        },
      }),
    ]);
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
  async updateVote(vote, postId, userId) {
    const post = await prisma.post_votes.upsert({
      where: {
        user_id_post_id: { post_id: postId, user_id: userId },
      },
      create: { type: vote, post_id: postId, user_id: userId },
      update: { type: vote, post_id: postId, user_id: userId },
    });
    return post;
  }
  async remove(postId, userId) {
    const post = await prisma.post_votes.delete({
      where: {
        user_id_post_id: { post_id: postId, user_id: userId },
      },
    });
    return post;
  }
  async uploadImage(image, contentType) {
    const awsService = new AwsService();
    const res = await awsService.uploadImage(image, contentType);
    if (!res?.imageUrl) throw ApiError.badRequest('Image upload failed');
    return {
      imageUrl: res.imageUrl,
    };
  }
  async postCategories() {
    const postCategories = await prisma.categories.findMany({
      include: {
        post_categories: {
          include: {
            posts: true,
          },
          orderBy: {
            posts: {
              created_at: { sort: 'desc' },
            },
          },
        },
      },
    });
    // get 5 posts per category
    const POST_PER_CATEGORY_COUNT = 5;
    const trimmedPostCategories = postCategories
      .filter((category) => category.post_categories.length)
      .map((category) => ({
        ...category,
        post_categories: category.post_categories.slice(0, POST_PER_CATEGORY_COUNT),
      }));
    return trimmedPostCategories;
  }
  async addComment(comment, postId, userId) {
    return await prisma.comments.create({
      data: {
        comment: comment,
        posts_id: postId,
        users_id: userId,
      },
    });
  }
}
