"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Add capitalization on the first letter of a string
 * @param str The string being capped
 */
function capFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.default = capFirstLetter;
