"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getTokenFromHeader_1 = __importDefault(require("./getTokenFromHeader"));
async function session(options) {
    var _a, _b, _c;
    const req = (options === null || options === void 0 ? void 0 : options.req) || null;
    const res = (options === null || options === void 0 ? void 0 : options.res) || null;
    const db = (options === null || options === void 0 ? void 0 : options.db) || null;
    return {
        res,
        headers: (req === null || req === void 0 ? void 0 : req.headers) || null,
        db,
        referrer: ((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.referer) || null,
        token: ((_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b.authorization) &&
            (await (0, getTokenFromHeader_1.default)((_c = req === null || req === void 0 ? void 0 : req.headers) === null || _c === void 0 ? void 0 : _c.authorization)),
    };
}
exports.default = session;
