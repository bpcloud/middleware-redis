'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfigApp = exports.getConfig = exports.isUseCloudConfig = exports.setFinishCloudConfig = exports.isFinishCloudConfig = void 0;
const SYM_APP = Symbol('SYM_APP');
const SYM_FINISH_CLOUDCONFIG = Symbol('SYM_FINISH_CLOUDCONFIG');
function isFinishCloudConfig() {
    return !!global[SYM_FINISH_CLOUDCONFIG];
}
exports.isFinishCloudConfig = isFinishCloudConfig;
function setFinishCloudConfig(finish) {
    global[SYM_FINISH_CLOUDCONFIG] = finish;
}
exports.setFinishCloudConfig = setFinishCloudConfig;
function isUseCloudConfig() {
    let l = global[SYM_APP];
    if (l) {
        return l.isCloudConfig();
    }
    else {
        return undefined;
    }
}
exports.isUseCloudConfig = isUseCloudConfig;
function getConfig() {
    let l = global[SYM_APP];
    if (l) {
        return l.getConfig();
    }
    else {
        return {};
    }
}
exports.getConfig = getConfig;
function setConfigApp(app) {
    global[SYM_APP] = app;
}
exports.setConfigApp = setConfigApp;
//# sourceMappingURL=config.js.map