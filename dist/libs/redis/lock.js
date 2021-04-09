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
exports.CacheLock = void 0;
const redlock_1 = require("redlock");
const febs = require("febs");
class CacheLock {
    constructor(redis) {
        if (redis instanceof redlock_1.default.Lock) {
            this.redlock = redis;
        }
        else {
            let rr = Array.isArray(redis) ? redis : [redis];
            this.redlock = new redlock_1.default(rr, {
                driftFactor: 0.01,
                retryCount: 10,
                retryDelay: 200,
                retryJitter: 200
            });
        }
    }
    unlock() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.redlock instanceof redlock_1.default.Lock) {
                return yield this.redlock.unlock();
            }
            else {
                throw new febs.exception('error call redis unlock', febs.exception.ERROR, __filename, __line, __column);
            }
        });
    }
    extendTTL(ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.redlock instanceof redlock_1.default.Lock) {
                return yield this.redlock.extend(ttl).then((res) => {
                    return new CacheLock(res);
                });
            }
            else {
                throw new febs.exception('error call redis extendTTL', febs.exception.ERROR, __filename, __line, __column);
            }
        });
    }
    _lock(resource, maxTTL2Lock) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.redlock instanceof redlock_1.default) {
                return yield this.redlock.lock(resource, maxTTL2Lock).then((res) => {
                    return new CacheLock(res);
                });
            }
            else {
                throw new febs.exception('error call redis lock', febs.exception.ERROR, __filename, __line, __column);
            }
        });
    }
}
exports.CacheLock = CacheLock;
//# sourceMappingURL=lock.js.map