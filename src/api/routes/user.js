import express from 'express';
import { UserService } from '../../services/UserService.js';
import multer from 'multer';
import { jwtVerify, SignJWT } from 'jose';
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  getRefreshSecretKey,
  getSecretKey,
  HASH_ALG,
  REFRESH_TOKEN_EXPIRATION_TIME,
} from '../../helpers/auth.js';
import { ApiError } from '../../error/ApiError.js';
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

userRouter.patch('/:user_id', async (req, res, next) => {
  try {
    const profile = await userService.update(parseInt(req.params.user_id), req.body.user);
    return res.send(profile);
  } catch (error) {
    next(error);
  }
});

userRouter.post('/confirm/:user_id', async (req, res, next) => {
  try {
    const profile = await userService.confirmEmail(parseInt(req.params.user_id));
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

userRouter.post('/sign-in', async (req, res, next) => {
  try {
    const authenticatedUser = await userService.authenticateUser(req.body.email, req.body.password);
    res.send({
      ...authenticatedUser,
      accessToken: authenticatedUser.accessToken,
      refreshToken: authenticatedUser.refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

userRouter.post('/sign-up', async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body.user);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.post('/refresh-token', async (req, res, next) => {
  try {
    const secretRefreshKey = getRefreshSecretKey();
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) throw ApiError.badRequest('No refresh token provided!');
    const token = await jwtVerify(refreshToken, secretRefreshKey);
    if (!refreshToken) throw ApiError.authentication('Invalid refresh token!');
    if (token.payload.jti) {
      const accessToken = await new SignJWT({
        jti: token.payload.jti,
      })
        .setProtectedHeader({ alg: HASH_ALG })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRATION_TIME)
        .sign(getSecretKey());

      const refreshToken = await new SignJWT({
        jti: token.payload.jti,
      })
        .setProtectedHeader({ alg: HASH_ALG })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRATION_TIME)
        .sign(getRefreshSecretKey());
      res.send({
        accessToken,
        refreshToken,
      });
    } else throw ApiError.authentication;
  } catch (error) {
    next(error);
  }
});
