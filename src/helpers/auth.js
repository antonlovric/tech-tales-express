export const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT Secret key is not set');
  }
  return new TextEncoder().encode(secret);
};

export const getRefreshSecretKey = () => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error('JWT Refresh Secret key is not set');
  }
  return new TextEncoder().encode(secret);
};

export const HASH_ALG = 'HS256';

export const EXPIRATION_TIME = 60 * 60 * 2;

export const ACCESS_TOKEN_EXPIRATION_TIME = '2h';
export const REFRESH_TOKEN_EXPIRATION_TIME = '7d';
