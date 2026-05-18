import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json({ success: true, data: users });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const user = await userService.findByEmail(req.query.email);
  res.json({ success: true, data: user });
});
