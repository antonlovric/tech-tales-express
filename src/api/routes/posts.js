import express from 'express';
import { PostService } from '../../services/PostService.js';
export const postRouter = express.Router();
const postService = new PostService();

postRouter.get('/', async (req, res, next) => {
  const posts = await postService.getPaginatedPosts(
    req.query.page && parseInt(req.query.page),
    req.query.pageSize && parseInt(req.query.pageSize),
    req.query.search,
    req.query.pageSize && JSON.parse(req.query.categories)
  );
  return res.send(posts);
});

postRouter.get('/:post_id', async (req, res, next) => {
  const post = await postService.get(parseInt(req.params.post_id));
  return res.send(post);
});

postRouter.get('/post-details/:post_id', async (req, res, next) => {
  const post = await postService.getDetails(parseInt(req.params.post_id));
  return res.send(post);
});

postRouter.get('/liked-status/:post_id/:user_id', async (req, res, next) => {
  const post = await postService.getLikedStatus(
    parseInt(req.params.post_id),
    parseInt(req.params.user_id)
  );
  return res.send(post);
});

postRouter.post('/', async (req, res, next) => {
  const post = req.body.post;
  const createdPost = await postService.create(post);
  res.send(createdPost);
});

postRouter.delete('/:post_id', async (req, res, next) => {
  const deletedPost = await postService.get(parseInt(req.params.post_id));
  return res.send(deletedPost);
});

postRouter.put('/:post_id', async (req, res, next) => {
  const post = req.body.post;
  const updatedPost = await postService.update(parseInt(req.params.post_id, post));
  res.send(updatedPost);
});
