'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinishCloudConfig = isFinishCloudConfig;
exports.setFinishCloudConfig = setFinishCloudConfig;
exports.isUseCloudConfig = isUseCloudConfig;
exports.getConfig = getConfig;
exports.setConfigApp = setConfigApp;
const SYM_APP = Symbol('SYM_APP');
const SYM_FINISH_CLOUDCONFIG = Symbol('SYM_FINISH_CLOUDCONFIG');
function isFinishCloudConfig() {
    return !!global[SYM_FINISH_CLOUDCONFIG];
}
function setFinishCloudConfig(finish) {
    global[SYM_FINISH_CLOUDCONFIG] = finish;
}
function isUseCloudConfig() {
    let l = global[SYM_APP];
    if (l) {
        return l.isCloudConfig();
    }
    else {
        return undefined;
    }
}
function getConfig() {
    let l = global[SYM_APP];
    if (l) {
        return l.getConfig();
    }
    else {
        return {};
    }
}
function setConfigApp(app) {
    global[SYM_APP] = app;
}
//# sourceMappingURL=config.js.map