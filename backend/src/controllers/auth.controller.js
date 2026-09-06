const authService = require('../services/auth.service');
const { success, created, error } = require('../utils/response');

const register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const result = await authService.register({ name, email, phone, password });
  return created(res, result, 'Account created successfully');
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return success(res, result, 'Login successful');
};

const ownerLogin = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password, requiredRole: 'OWNER' });
  return success(res, result, 'Owner login successful');
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  if (!user) return error(res, 'User not found', 404);
  return success(res, user);
};

module.exports = { register, login, ownerLogin, getMe };
