const Redis = require('ioredis');
const { getConfig } = require('../helpers/config');
const logger = require('../logging/logger');

const redisConfig = {
    host: getConfig('REDIS_HOST'),
    port: getConfig('REDIS_PORT'),
    password: getConfig('REDIS_PASSWORD'),
    db: getConfig('REDIS_DB', 0), 
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    },
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
    logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
