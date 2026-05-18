import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 400);

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'Admin' ? 'Admin' : 'Member',
  });
  return user;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  return user;
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};
