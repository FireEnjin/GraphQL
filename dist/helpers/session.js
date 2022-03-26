"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getTokenFromHeader_1 = __importDefault(require("./getTokenFromHeader"));
async function session({ req, res, db, }) {
    const headers = (req === null || req === void 0 ? void 0 : req.headers) || (req === null || req === void 0 ? void 0 : req.Headers) || null;
    return {
        res,
        headers,
        db,
        referrer: (headers === null || headers === void 0 ? void 0 : headers.referer) || null,
        token: ((headers === null || headers === void 0 ? void 0 : headers.authorization) || (headers === null || headers === void 0 ? void 0 : headers.Authorization)) &&
            (await (0, getTokenFromHeader_1.default)((headers === null || headers === void 0 ? void 0 : headers.authorization) || (headers === null || headers === void 0 ? void 0 : headers.Authorization))),
    };
}
exports.default = session;
