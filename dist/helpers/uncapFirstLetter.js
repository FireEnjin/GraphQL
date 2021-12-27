"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Remove capitalization of the first letter of a string
 * @param str The string being uncapped
 */
function uncapFirstLetter(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
exports.default = uncapFirstLetter;
