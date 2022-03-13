"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const path = __importStar(require("path"));
function env(key, fallback) {
    let config = {};
    try {
        config = require(path.join(process.cwd(), "environment.json"));
    }
    catch (error) {
        console.log("No environment.json file found in the root.");
    }
    const functionsConfig = functions.config();
    if (Object.keys(functionsConfig).length > 0) {
        config = { ...config, ...functionsConfig };
    }
    const value = !key
        ? config
        : key && key.indexOf(".") >= 0
            ? key.split(".").reduce((p, c) => p && p[c], config)
            : key && typeof config[key] !== "undefined"
                ? config[key]
                : null;
    return fallback &&
        ((!value && value !== false && value !== 0) ||
            typeof value === "undefined" ||
            value === null)
        ? fallback
        : value;
}
exports.default = env;
