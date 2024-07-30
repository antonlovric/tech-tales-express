import { ApiError } from '../../error/ApiError.js';

export function apiErrorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.code).json(err.message);
  }
  res.status(500).json('Something went wrong!');
}
