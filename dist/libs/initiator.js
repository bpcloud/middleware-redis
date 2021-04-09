'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const config_1 = require("./config");
const redisTemplate_1 = require("./redis/redisTemplate");
function refreshRemoteEventlistener(ev) {
    redisTemplate_1.RedisTemplate.reconnectAll();
}
function default_1(app) {
    app._addRefreshRemoteEventListener(refreshRemoteEventlistener);
    logger_1.setLogger(() => app.getLogger());
    config_1.setConfigApp(app);
}
exports.default = default_1;
//# sourceMappingURL=initiator.js.map