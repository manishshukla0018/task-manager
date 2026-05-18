import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const getAllUsers = () =>
  User.find().select('name email role').sort({ name: 1 });

export const findByEmail = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('name email role');
  if (!user) throw new AppError('User not found', 404);
  return user;
};
