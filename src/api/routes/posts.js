import express from 'express';
import { PostService } from '../../services/PostService.js';
export const postRouter = express.Router();
const postService = new PostService();

postRouter.get('/', async (req, res, next) => {
  const posts = await postService.getAll();
  return res.send(posts);
});

postRouter.get('/:post_id', async (req, res, next) => {
  const post = await postService.get(parseInt(req.params.post_id));
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
