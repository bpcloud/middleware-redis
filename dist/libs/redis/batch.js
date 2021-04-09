'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheBatch = void 0;
class CacheBatch {
    constructor(redisPipeline, redis_ttl, TTL_tolerance) {
        this.redis = redisPipeline;
        this.redis_ttl = redis_ttl;
        this.TTL_tolerance = TTL_tolerance;
    }
    expire(key, ttl, callback) {
        this.redis.expire(key, ttl ? ttl : (this.redis_ttl + Math.floor(Math.random() * this.TTL_tolerance)), callback);
        return this;
    }
    persist(key, callback) {
        this.redis.persist(key, callback);
        return this;
    }
    hset(key, field, value, callback) {
        this.redis.hset(key, field, value, callback);
        return this;
    }
    hget(key, field, callback) {
        this.redis.hget(key, field, callback);
        return this;
    }
    hkeys(key, callback) {
        this.redis.hkeys(key, callback);
        return this;
    }
    hdel(key, ...fields) {
        this.redis.hdel(key, ...fields);
        return this;
    }
    ;
    sadd(key, value) {
        this.redis.sadd(key, value);
        return this;
    }
    sremove(key, ...values) {
        this.redis.srem(key, ...values);
        return this;
    }
    scard(key, callback) {
        this.redis.scard(key, callback);
        return this;
    }
    sismember(key, value, callback) {
        this.redis.sismember(key, value, callback);
        return this;
    }
    smembers(key, callback) {
        this.redis.smembers(key, callback);
        return this;
    }
    set(key, value, ttl, callback) {
        ttl = ttl || this.redis_ttl + Math.floor(Math.random() * this.TTL_tolerance);
        if (ttl == -1) {
            this.redis.set(key, value, callback);
        }
        else {
            this.redis.set(key, value, 'EX', ttl, callback);
        }
        return this;
    }
    get(key, callback) {
        this.redis.get(key, callback);
        return this;
    }
    ;
    del(key) {
        this.redis.del(key);
        return this;
    }
    ;
    exec(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redis.exec(callback);
        });
    }
}
exports.CacheBatch = CacheBatch;
//# sourceMappingURL=batch.js.map