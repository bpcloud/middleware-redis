'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = getLogger;
exports.setLogger = setLogger;
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
function setLogger(logger) {
    global[SYM_LOGGER] = logger;
}
//# sourceMappingURL=logger.js.map