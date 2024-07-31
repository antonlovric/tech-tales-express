import { jwtVerify } from 'jose';
import { getSecretKey } from '../../helpers/auth.js';

export const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication error' });
  }

  try {
    const verified = await jwtVerify(token, getSecretKey());
    req.session.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
