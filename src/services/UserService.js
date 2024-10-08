import { verify } from 'argon2';
import { prisma } from '../app.js';
import { ApiError } from '../error/ApiError.js';
import { AwsService } from './AwsService.js';
import { SignJWT } from 'jose';
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  getRefreshSecretKey,
  getSecretKey,
  HASH_ALG,
  REFRESH_TOKEN_EXPIRATION_TIME,
} from '../helpers/auth.js';

export class UserService {
  async getAll() {
    return await prisma.users.findMany();
  }
  async getProfile(userId) {
    return await prisma.users.findFirst({
      where: { id: { equals: parseInt(userId || '') } },
      select: {
        id: true,
        bio: true,
        email: true,
        first_name: true,
        last_name: true,
        location: true,
        phone_number: true,
        profile_image: true,
        posts: {
          select: {
            id: true,
            cover_image: true,
            summary: true,
            title: true,
            post_categories: {
              select: {
                categories: true,
                categories_id: true,
                posts_id: true,
              },
            },
          },
        },
      },
    });
  }
  async update(userId, user) {
    return await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        ...user,
      },
    });
  }
  async updateProfileImage(userId, image, contentType) {
    const awsService = new AwsService();
    const res = await awsService.uploadImage(image, contentType);
    if (!res?.imageUrl) throw ApiError.badRequest('Image upload failed');
    return await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        profile_image: res?.imageUrl,
      },
    });
  }
  async createUser(user) {
    return await prisma.users.create({ data: { ...user } });
  }
  async authenticateUser(email, password) {
    const user = await prisma.users.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (!user) throw ApiError.authentication('User not found!');

    if (!user.confirmed_at) throw ApiError.authorization('User not verified');

    const isValidSignIn = await verify(user.password, password);

    if (!isValidSignIn) throw ApiError.authentication('Invalid credentials!');

    const accessToken = await new SignJWT({
      jti: user.email,
    })
      .setProtectedHeader({ alg: HASH_ALG })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRATION_TIME)
      .sign(getSecretKey());
    const refreshToken = await new SignJWT({
      jti: user.email,
    })
      .setProtectedHeader({ alg: HASH_ALG })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRATION_TIME)
      .sign(getRefreshSecretKey());
    return { accessToken, refreshToken, id: user.id };
  }
  async confirmEmail(userId) {
    return await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        confirmed_at: new Date(),
      },
    });
  }
}
