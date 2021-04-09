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
exports.RedisTemplate = exports.TTL_default = void 0;
const febs = require("febs");
const IORedis = require("ioredis");
const transaction_1 = require("./transaction");
const batch_1 = require("./batch");
const lock_1 = require("./lock");
const logger_1 = require("../logger");
const config_1 = require("../config");
const TTL_tolerance = 10;
exports.TTL_default = 60 * 5;
class RedisTemplate {
    constructor(...args) {
        RedisTemplate.instances.push(this);
        let cfg;
        if (args.length == 0 || typeof args[0] === 'string') {
            let configMapPrefix = args[0] ? args[0] : 'spring.redis';
            cfg = this.readCfgFromConfig(configMapPrefix);
            this.configMapPrefix = configMapPrefix;
        }
        else {
            cfg = args[0];
        }
        let cfgg = { db: cfg.db, password: cfg.password, ttl: cfg.ttl || exports.TTL_default };
        cfgg.connectTimeout = cfg.conn_timeout || 0;
        this.ttl_tolerance = febs.utils.isNull(cfg.ttl_tolerance) ? TTL_tolerance : cfg.ttl_tolerance;
        cfgg.reconnectOnError = () => 1;
        this.cfg = cfgg;
    }
    static reconnectAll() {
        for (let i = 0; i < this.instances.length; i++) {
            this.instances[i].reconnect().then();
        }
    }
    readCfgFromConfig(configMapPrefix) {
        let cfg;
        let configs = config_1.getConfig();
        let config = configs[configMapPrefix];
        if (!config) {
            throw new febs.exception(`config '${configMapPrefix}' miss`, febs.exception.ERROR, __filename, __line, __column);
        }
        cfg = {};
        cfg.db = config.database || 0;
        cfg.password = config.password;
        cfg.conn_timeout = config.timeout || 0;
        cfg.ttl = config.defaultTtl || exports.TTL_default;
        cfg.ttl_tolerance = config.defaultTtlTolerance || TTL_tolerance;
        if (!Array.isArray(config.nodes)) {
            throw new febs.exception(`config '${configMapPrefix}.nodes' miss`, febs.exception.ERROR, __filename, __line, __column);
        }
        cfg.clusterServers = [];
        for (let i = 0; i < config.nodes.length; i++) {
            let host = {
                host: config.nodes[i].host,
                port: config.nodes[i].port,
            };
            if (typeof host.host !== 'string' || !Number.isInteger(host.port)) {
                throw new febs.exception(`config '${configMapPrefix}.nodes' error`, febs.exception.ERROR, __filename, __line, __column);
            }
            cfg.clusterServers.push(host);
        }
        return cfg;
    }
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.configMapPrefix)
                return;
            let cfg = this.readCfgFromConfig(this.configMapPrefix);
            let cfgg = { db: cfg.db, password: cfg.password, ttl: cfg.ttl || exports.TTL_default };
            cfgg.connectTimeout = cfg.conn_timeout || 0;
            this.ttl_tolerance = febs.utils.isNull(cfg.ttl_tolerance) ? TTL_tolerance : cfg.ttl_tolerance;
            cfgg.reconnectOnError = () => 1;
            if (this.cfg.host == cfgg.host
                && this.cfg.port == cfgg.port
                && this.cfg.db == cfgg.db
                && this.cfg.password == cfgg.password
                && this.cfg.ttl == cfgg.ttl
                && this.cfg.connectTimeout == cfgg.connectTimeout) {
                if ((!!this.cfg.clusterServers) == (!!cfgg.clusterServers)) {
                    if (!this.cfg.clusterServers) {
                        return;
                    }
                    if (this.cfg.clusterServers.length == cfgg.clusterServers.length) {
                        let i = 0;
                        for (; i < cfgg.clusterServers.length; i++) {
                            if (cfgg.clusterServers[i].host != this.cfg.clusterServers[i].host
                                || cfgg.clusterServers[i].port != this.cfg.clusterServers[i].port) {
                                break;
                            }
                        }
                        if (i >= cfgg.clusterServers.length) {
                            return;
                        }
                    }
                }
            }
            this.cfg = cfgg;
            yield this.connect();
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            let useCluster = false;
            let connectInfo = '';
            if (this.cfg.host) {
                connectInfo = this.cfg.host + ':' + this.cfg.port;
            }
            else {
                useCluster = true;
                this.cfg.clusterServers.forEach((element) => {
                    connectInfo += `${element.host}:${element.port},`;
                });
            }
            return new Promise((resolve, reject) => {
                this.dispose()
                    .then((res) => {
                    this.redis_ttl = this.cfg.ttl;
                    if (useCluster) {
                        this.redis = new IORedis.Cluster(this.cfg.clusterServers, Object.assign({ scaleReads: 'slave' }, this.cfg));
                    }
                    else {
                        this.redis = new IORedis(this.cfg);
                    }
                    this.redis.on('error', (e) => {
                        logger_1.getLogger().error('[Redis error]: ', e);
                    });
                    let on_connect = () => {
                        logger_1.getLogger().info('[Redis connected]: ' + `${connectInfo}`);
                    };
                    this.redis.once('connect', () => {
                        on_connect();
                        resolve();
                        this.redis.on('connect', on_connect);
                    });
                    this.redis.on('reconnecting', () => {
                        logger_1.getLogger().warn('[Redis reconnect]: ' + `${connectInfo}`);
                    });
                });
            });
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.redis) {
                return this.redis.quit();
            }
            else {
                return new Promise((resolve, reject) => { resolve(null); });
            }
        });
    }
    expire(key, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            let tolerance = Math.floor(Math.random() * this.ttl_tolerance);
            return this.masterNode.expire(key, ttl ? ttl : (this.redis_ttl + tolerance))
                .then((res) => {
                return !!res;
            });
        });
    }
    persist(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.masterNode.persist(key)
                .then((res) => {
                return true;
            })
                .catch((e) => {
                return false;
            });
        });
    }
    ttl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.masterNode.ttl(key);
        });
    }
    keys(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.masterNode.keys(pattern);
        });
    }
    hset(key, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.masterNode.hset(key, field, value)
                .then((res) => {
                return true;
            })
                .catch((e) => {
                return false;
            });
        });
    }
    hget(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.slaveNode.hget(key, field);
        });
    }
    ;
    hkeys(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.slaveNode.hkeys(key);
        });
    }
    hdel(key, ...fields) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.masterNode.hdel(key, ...fields);
        });
    }
    ;
    hexists(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.slaveNode.hexists(key, field).then((res) => !!res);
        });
    }
    sadd(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.masterNode.sadd(key, value);
        });
    }
    sremove(key, ...values) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.masterNode.srem(key, ...values);
        });
    }
    scard(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.slaveNode.scard(key);
        });
    }
    sismember(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.slaveNode.sismember(key, value).then((res) => !!res);
        });
    }
    smembers(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.slaveNode.smembers(key);
        });
    }
    set(key, value, ttl = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            ttl = ttl || this.redis_ttl + Math.floor(Math.random() * this.ttl_tolerance);
            if (ttl == -1) {
                return this.masterNode.set(key, value).then((res) => !!res);
            }
            else {
                return this.masterNode.set(key, value, 'EX', ttl).then((res) => !!res);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.slaveNode.get(key);
        });
    }
    ;
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.masterNode.del(key);
        });
    }
    ;
    exists(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.slaveNode.exists(key).then((res) => !!res);
        });
    }
    multi() {
        return new transaction_1.CacheTransaction(this.masterNode.multi(), this.redis_ttl, this.ttl_tolerance);
    }
    lock(resource, maxTTL2Lock) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.redis instanceof IORedis.Cluster) {
                return yield (new lock_1.CacheLock(this.redis.nodes('master')))._lock(resource, maxTTL2Lock);
            }
            else {
                return yield (new lock_1.CacheLock(this.masterNode))._lock(resource, maxTTL2Lock);
            }
        });
    }
    batch() {
        return new batch_1.CacheBatch(this.masterNode.pipeline(), this.redis_ttl, this.ttl_tolerance);
    }
    get masterNode() {
        if (this.redis instanceof IORedis.Cluster) {
            let nodes = this.redis.nodes('master');
            return nodes[(Math.floor(Math.random() * nodes.length)) % nodes.length];
        }
        else {
            return this.redis;
        }
    }
    get slaveNode() {
        if (this.redis instanceof IORedis.Cluster) {
            let nodes = this.redis.nodes('slave');
            return nodes[(Math.floor(Math.random() * nodes.length)) % nodes.length];
        }
        else {
            return this.redis;
        }
    }
}
exports.RedisTemplate = RedisTemplate;
RedisTemplate.instances = [];
//# sourceMappingURL=redisTemplate.js.map