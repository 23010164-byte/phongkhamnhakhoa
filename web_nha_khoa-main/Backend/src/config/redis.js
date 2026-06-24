const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

// Client chính (cache, session, blacklist token)
const redis = new Redis(redisConfig);

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error('❌ Redis error:', err.message));
redis.on('reconnecting', () => logger.warn('⚠️  Redis reconnecting...'));

// Client riêng cho BullMQ (không dùng chung với client thường)
const createBullMQConnection = () => new Redis({ ...redisConfig, maxRetriesPerRequest: null });

// Helper methods
const cache = {
  async get(key) {
    const val = await redis.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  },

  async set(key, value, ttlSeconds = 3600) {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      return redis.setex(key, ttlSeconds, serialized);
    }
    return redis.set(key, serialized);
  },

  async del(...keys) {
    return redis.del(...keys);
  },

  async exists(key) {
    return redis.exists(key);
  },

  async ttl(key) {
    return redis.ttl(key);
  },

  // Blacklist token (logout)
  async blacklistToken(token, expiresInSeconds) {
    return redis.setex(`blacklist:${token}`, expiresInSeconds, '1');
  },

  async isBlacklisted(token) {
    return redis.exists(`blacklist:${token}`);
  },
};

module.exports = { redis, cache, createBullMQConnection };
