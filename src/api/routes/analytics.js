import express from 'express';
import { AnalyticsService } from '../../services/AnalyticsService';
export const analyticsRouter = express.Router();
const analyticsService = new AnalyticsService();

analyticsRouter.get('/post-visit/:post_id', (req, res, next) => {
  try {
    return analyticsService.incrementPostVisitCount(req.params.post_id);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/post-like/:post_id', (req, res, next) => {
  try {
    return analyticsService.incrementPostLikeCount(req.params.post_id);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/post-comment/:post_id', (req, res, next) => {
  try {
    return analyticsService.incrementPostCommentCount(req.params.post_id);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/post-share/:post_id', (req, res, next) => {
  try {
    return analyticsService.incrementPostShareCount(req.params.post_id);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/relevant_post', (req, res, next) => {
  try {
    return analyticsService.getRelevantPostId();
  } catch (error) {
    next(error);
  }
});
