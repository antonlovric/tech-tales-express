import express from 'express';
import { PostService } from '../../services/PostService.js';
import { upload } from './user.js';
export const postRouter = express.Router();
const postService = new PostService();

postRouter.get('/', async (req, res, next) => {
  try {
    const posts = await postService.getPaginatedPosts(
      req.query.page && parseInt(req.query.page),
      req.query.pageSize && parseInt(req.query.pageSize),
      req.query.search,
      req.query.pageSize && JSON.parse(req.query.categories)
    );
    return res.send(posts);
  } catch (error) {
    next(error);
  }
});

postRouter.get('/:post_id', async (req, res, next) => {
  try {
    const post = await postService.get(parseInt(req.params.post_id));
    return res.send(post);
  } catch (error) {
    next(error);
  }
});

postRouter.get('/post-details/:post_id', async (req, res, next) => {
  try {
    const post = await postService.getDetails(parseInt(req.params.post_id));
    return res.send(post);
  } catch (error) {
    next(error);
  }
});

postRouter.get('/liked-status/:post_id/:user_id', async (req, res, next) => {
  try {
    const post = await postService.getLikedStatus(
      parseInt(req.params.post_id),
      parseInt(req.params.user_id)
    );
    return res.send(post);
  } catch (error) {
    next(error);
  }
});

postRouter.post('/', async (req, res, next) => {
  try {
    const post = req.body.post;
    const createdPost = await postService.create(post);
    res.send(createdPost);
  } catch (error) {
    next(error);
  }
});

postRouter.delete('/:post_id', async (req, res, next) => {
  try {
    const deletedPost = await postService.get(parseInt(req.params.post_id));
    return res.send(deletedPost);
  } catch (error) {
    next(error);
  }
});

postRouter.put('/:post_id', async (req, res, next) => {
  try {
    const post = req.body.post;
    const updatedPost = await postService.update(parseInt(req.params.post_id, post));
    res.send(updatedPost);
  } catch (error) {
    next(error);
  }
});

postRouter.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    const imageUrl = await postService.uploadImage(req.file.buffer, req.file.mimetype);
    return res.send(imageUrl);
  } catch (error) {
    next(error);
  }
});
