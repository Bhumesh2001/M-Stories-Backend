const Redis = require("ioredis");

// Example: using Upstash
const redis = new Redis({
    url: process.env.REDIS_URL, // from provider
    token: process.env.REDIS_TOKEN, // if required
});

const cacheMiddleware = async (req, res, next) => {
    const key = `${req.originalUrl}`;

    try {
        const cacheValue = await redis.get(key);
        if (cacheValue) {
            return res.json(JSON.parse(cacheValue));
        }
    } catch (err) {
        console.error("Redis get error", err);
    }

    // override res.json to save data in cache
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
        try {
            await redis.set(key, JSON.stringify(data), "EX", 600); // 600 sec = 10 min
        } catch (err) {
            console.error("Redis set error", err);
        }
        return originalJson(data);
    };

    next();
};

// Dynamic clear function
async function clearCache(url) {
    const key = `${url}`;
    try {
        const result = await redis.del(key);
        if (result === 1) {
            console.log(`✅ Cache cleared for: ${key}`);
        } else {
            console.log(`⚠️ No cache found for: ${key}`);
        }
    } catch (err) {
        console.error("Redis clear error", err);
    }
};

module.exports = { cacheMiddleware, clearCache };
