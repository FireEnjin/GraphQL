"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getTokenFromHeader_1 = __importDefault(require("./getTokenFromHeader"));
async function session({ req, res, db, }) {
    var _a, _b, _c, _d;
    const headers = (req === null || req === void 0 ? void 0 : req.headers) || (req === null || req === void 0 ? void 0 : req.Headers) || null;
    return {
        res,
        headers,
        db,
        referrer: (headers === null || headers === void 0 ? void 0 : headers.referer) || null,
        token: (((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization) || ((_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b.Authorization)) &&
            (await (0, getTokenFromHeader_1.default)(((_c = req === null || req === void 0 ? void 0 : req.headers) === null || _c === void 0 ? void 0 : _c.authorization) || ((_d = req === null || req === void 0 ? void 0 : req.headers) === null || _d === void 0 ? void 0 : _d.Authorization))),
    };
}
exports.default = session;
