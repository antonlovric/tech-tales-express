import { redisClient } from '../lib/redis.js';
import { prisma } from '../app.js';

export const METRIC_WEIGHTS = {
  visits: 0.2,
  likes: 0.3,
  comments: 0.4,
  shares: 0.1,
};

export class AnalyticsService {
  incrementPostVisitCount(postId) {
    redisClient.sAdd('post_ids', postId);
    redisClient.incr(`post:${postId}:visit`);
  }
  incrementPostLikeCount(postId) {
    redisClient.sAdd('post_ids', postId);
    redisClient.incr(`post:${postId}:like`);
  }
  incrementPostCommentCount(postId) {
    redisClient.sAdd('post_ids', postId);
    redisClient.incr(`post:${postId}:comment`);
  }
  incrementPostShareCount(postId) {
    redisClient.sAdd('post_ids', postId);
    redisClient.incr(`post:${postId}:share`);
  }
  calculateRelevanceScore(metrics) {
    console.log('CALCULATING RELEVANCE');
    const { visits, likes, comments, shares } = metrics;
    return (
      visits * METRIC_WEIGHTS.visits +
      likes * METRIC_WEIGHTS.likes +
      comments * METRIC_WEIGHTS.comments +
      shares * METRIC_WEIGHTS.shares
    );
  }
  async updateRelevanceScores() {
    const postIds = await redisClient.sMembers('post_ids');

    for (const postId of postIds) {
      const metrics = {
        visits: parseInt((await redisClient.get(`post:${postId}:visit`)) || '0', 10) || 0,
        likes: parseInt((await redisClient.get(`post:${postId}:like`)) || '0', 10) || 0,
        comments: parseInt((await redisClient.get(`post:${postId}:comment`)) || '0', 10) || 0,
        shares: parseInt((await redisClient.get(`post:${postId}:share`)) || '0', 10) || 0,
      };
      const relevanceScore = this.calculateRelevanceScore(metrics);

      await redisClient.zAdd('post_relevance_scores', {
        score: relevanceScore,
        value: postId.toString(),
      });
    }
  }
  async getRelevantPostId() {
    const relevancePostIds = await redisClient.zRangeByScore('post_relevance_scores', 0, 1);
    return parseInt(relevancePostIds?.[0]);
  }
  async getRelevantPost(id) {
    return await prisma.posts.findFirst({
      where: {
        id: {
          equals: id,
        },
      },
      select: {
        id: true,
        cover_image: true,
        title: true,
        summary: true,
        created_at: true,
        author: {
          select: {
            first_name: true,
            last_name: true,
            id: true,
            profile_image: true,
          },
        },
        post_categories: {
          select: {
            categories: true,
            posts: {
              select: {
                cover_image: true,
                created_at: true,
                id: true,
                summary: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }
}
