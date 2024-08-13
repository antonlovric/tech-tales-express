import express from 'express';
import { AnalyticsService } from '../../services/AnalyticsService.js';
export const analyticsRouter = express.Router();
const analyticsService = new AnalyticsService();

analyticsRouter.get('/post-visit/:post_id', (req, res, next) => {
  try {
    res.send(analyticsService.incrementPostVisitCount(req.params.post_id));
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/post-like/:post_id', (req, res, next) => {
  try {
    res.send(analyticsService.incrementPostLikeCount(req.params.post_id));
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/post-comment/:post_id', (req, res, next) => {
  try {
    res.send(analyticsService.incrementPostCommentCount(req.params.post_id));
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/post-share/:post_id', (req, res, next) => {
  try {
    res.send(analyticsService.incrementPostShareCount(req.params.post_id));
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/relevant_post', async (req, res, next) => {
  try {
    const relevantPostId = await analyticsService.getRelevantPostId();
    if (!relevantPostId) throw Error('No relevant post available');
    const relevantPost = await analyticsService.getRelevantPost(relevantPostId);
    res.send(relevantPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
