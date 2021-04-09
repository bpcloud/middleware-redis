'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = exports.name = exports.RedisTemplate = void 0;
const initiator_1 = require("./libs/initiator");
var redisTemplate_1 = require("./libs/redis/redisTemplate");
Object.defineProperty(exports, "RedisTemplate", { enumerable: true, get: function () { return redisTemplate_1.RedisTemplate; } });
exports.name = "middleware-redis";
exports.middleware = {
    type: 'koa',
    name: exports.name,
    initiator: initiator_1.default,
};
//# sourceMappingURL=index.js.map