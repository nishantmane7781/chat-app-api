const bcrypt = require('bcrypt');
const { User, RefreshToken } = require('../models');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/token.util');

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed });
    return res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return res.status(400).json({ message: 'User creation failed', error: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = signAccessToken({ id: user.id, email: user.email });
  const refreshToken = signRefreshToken({ id: user.id, email: user.email });

  // store refresh token in DB
  await RefreshToken.create({ token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000) });

  return res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const dbTok = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!dbTok) return res.status(401).json({ message: 'Refresh token not recognized' });
    const newAccess = signAccessToken({ id: payload.id, email: payload.email });
    return res.json({ accessToken: newAccess });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  if (refreshToken) await RefreshToken.destroy({ where: { token: refreshToken } });
  return res.json({ message: 'Logged out' });
}

module.exports = { register, login, refresh, logout };
