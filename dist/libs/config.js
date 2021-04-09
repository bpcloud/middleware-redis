'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfigApp = exports.getConfig = void 0;
const SYM_APP = Symbol('SYM_APP');
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