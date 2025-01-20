'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const logger_1 = require("./logger");
const config_1 = require("./config");
const redisTemplate_1 = require("./redis/redisTemplate");
function refreshRemoteEventlistener(ev) {
    (0, config_1.setFinishCloudConfig)(true);
    redisTemplate_1.RedisTemplate.reconnectAll();
}
function default_1(app, bpApp) {
    bpApp._addRefreshRemoteEventListener(refreshRemoteEventlistener);
    (0, logger_1.setLogger)(() => bpApp.getLogger());
    (0, config_1.setConfigApp)(bpApp);
    return false;
}
//# sourceMappingURL=initiator.js.map