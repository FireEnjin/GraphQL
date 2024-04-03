"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isNumeric_1 = __importDefault(require("./isNumeric"));
function setByPath(obj, path, value) {
    const pList = path.split(".");
    const len = pList.length;
    for (let i = 0; i < len - 1; i++) {
        const nextElemIsArray = (0, isNumeric_1.default)(pList[i + 1]);
        const elem = pList[i];
        if (!obj[elem])
            obj[elem] = nextElemIsArray ? [] : {};
        obj = obj[elem];
    }
    obj[pList[len - 1]] = value;
    return obj;
}
exports.default = setByPath;
