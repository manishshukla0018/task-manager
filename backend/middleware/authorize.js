import { AppError } from '../utils/AppError.js';

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(`Role '${req.user.role}' is not authorized for this action.`, 403));
  }
  next();
};
