"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isNumeric(value) {
    return /^-?\d+$/.test(value);
}
exports.default = isNumeric;
