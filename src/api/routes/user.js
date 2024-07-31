import express from 'express';
import { UserService } from '../../services/UserService.js';
import multer from 'multer';
export const userRouter = express.Router();
const userService = new UserService();

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

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

userRouter.post('/profile-image/:user_id', upload.single('image'), async (req, res, next) => {
  try {
    const profile = await userService.updateProfileImage(
      parseInt(req.params.user_id),
      req.file.buffer,
      req.file.mimetype
    );
    return res.send(profile);
  } catch (error) {
    next(error);
  }
});
