const RefreshToken = require('./auth.model');
const User = require('../user/user.model');
const { Op } = require('sequelize');

const authRepository = {
  async createRefreshToken({ userId, token, expiresAt, ipAddress, userAgent }) {
    return RefreshToken.create({
      user_id: userId,
      token,
      expires_at: expiresAt,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  },

  async findRefreshToken(token) {
    return RefreshToken.findOne({
      where: { token, is_revoked: false },
      include: [{ model: User, as: 'user' }],
    });
  },

  async revokeRefreshToken(token) {
    return RefreshToken.update({ is_revoked: true }, { where: { token } });
  },

  async revokeAllUserTokens(userId) {
    return RefreshToken.update(
      { is_revoked: true },
      { where: { user_id: userId, is_revoked: false } }
    );
  },

  async deleteExpiredTokens() {
    return RefreshToken.destroy({
      where: { expires_at: { [Op.lt]: new Date() } },
    });
  },

  async findUserByEmail(email) {
    return User.scope('withPassword').findOne({ where: { email: email.toLowerCase() } });
  },

  async findUserByPhone(phone) {
    return User.findOne({ where: { phone } });
  },

  async findUserById(id) {
    return User.findByPk(id);
  },

  async savePasswordResetToken(userId, token, expiresAt) {
    return User.update(
      { password_reset_token: token, password_reset_expires: expiresAt },
      { where: { id: userId } }
    );
  },

  async findUserByResetToken(token) {
    return User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: { [Op.gt]: new Date() },
      },
    });
  },

  async clearPasswordResetToken(userId) {
    return User.update(
      { password_reset_token: null, password_reset_expires: null },
      { where: { id: userId } }
    );
  },
};

module.exports = authRepository;
