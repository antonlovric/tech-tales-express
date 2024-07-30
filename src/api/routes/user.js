import express from 'express';
import { UserService } from '../../services/UserService.js';
export const userRouter = express.Router();
const userService = new UserService();

userRouter.get('/', async (req, res, next) => {
  try {
    const users = await userService.getAll();
    return res.send(users);
  } catch (error) {
    next(error);
  }
});

userRouter.get('/:user_id', async (req, res, next) => {
  try {
    const profile = await userService.getProfile(parseInt(req.params.user_id));
    return res.send(profile);
  } catch (error) {
    next(error);
  }
});

userRouter.put('/:user_id', async (req, res, next) => {
  try {
    const profile = await userService.update(parseInt(req.params.user_id), req.body.user);
    return res.send(profile);
  } catch (error) {
    next(error);
  }
});
