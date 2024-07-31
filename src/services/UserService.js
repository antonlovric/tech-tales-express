import { prisma } from '../app.js';
import { ApiError } from '../error/ApiError.js';
import { AwsService } from './AwsService.js';

export class UserService {
  async getAll() {
    return await prisma.users.findMany();
  }
  async getProfile(userId) {
    return await prisma.users.findFirst({
      where: { id: { equals: parseInt(userId || '') } },
      include: {
        posts: {
          include: { post_categories: { include: { categories: true } } },
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
}
