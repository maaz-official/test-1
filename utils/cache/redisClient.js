const Redis = require('ioredis');
const { getConfig } = require('../helpers/config');

const redisConfig = {
    host: getConfig('REDIS_HOST'),
    port: getConfig('REDIS_PORT'),
    password: getConfig('REDIS_PASSWORD'),
    db: getConfig('REDIS_DB', 0), 
    retryStrategy: (times) => {
        // retry after 2 seconds
        return Math.min(times * 50, 2000);
    },
};

// Initialize Redis client
const redis = new Redis(redisConfig);

// Handle Redis connection events
redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
