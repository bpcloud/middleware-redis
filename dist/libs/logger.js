'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogger = exports.getLogger = void 0;
const SYM_LOGGER = Symbol('SYM_LOGGER');
function getLogger() {
    let l = global[SYM_LOGGER];
    if (l) {
        return l();
    }
    else {
        return {
            error: console.error,
            info: console.log,
            warn: console.warn,
            debug: console.debug,
        };
    }
}
exports.getLogger = getLogger;
function setLogger(logger) {
    global[SYM_LOGGER] = logger;
}
exports.setLogger = setLogger;
//# sourceMappingURL=logger.js.map