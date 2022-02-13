"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const admin = __importStar(require("firebase-admin"));
const fireorm = __importStar(require("fireorm"));
function connect(options) {
    var _a;
    const appConfig = {};
    if (!!(options === null || options === void 0 ? void 0 : options.emulate) ||
        (options === null || options === void 0 ? void 0 : options.projectId) ||
        ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.GCLOUD_PROJECT)) {
        appConfig.projectId = (options === null || options === void 0 ? void 0 : options.projectId) || process.env.GCLOUD_PROJECT;
        appConfig.storageBucket =
            (options === null || options === void 0 ? void 0 : options.storageBucket) || `${appConfig.projectId}.appspot.com`;
    }
    if (options === null || options === void 0 ? void 0 : options.serviceAccount) {
        const serviceAccount = require(typeof (options === null || options === void 0 ? void 0 : options.serviceAccount) === "string"
            ? options.serviceAccount
            : `${process.cwd()}/service-account.json`);
        appConfig.credential = admin.credential.cert(serviceAccount);
        appConfig.databaseURL = `https://${serviceAccount.project_id}.firebaseio.com`;
        appConfig.storageBucket =
            (options === null || options === void 0 ? void 0 : options.storageBucket) || `${serviceAccount.project_id}.appspot.com`;
    }
    admin.initializeApp(appConfig);
    const firestore = admin.firestore();
    const firebaseConfig = {
        ignoreUndefinedProperties: (options === null || options === void 0 ? void 0 : options.ignoreUndefinedProperties) === false ? false : true,
    };
    if (options === null || options === void 0 ? void 0 : options.emulate) {
        firebaseConfig.host = (options === null || options === void 0 ? void 0 : options.host) || "localhost:8080";
        firebaseConfig.ssl = !!(options === null || options === void 0 ? void 0 : options.ssl);
    }
    firestore.settings(firebaseConfig);
    fireorm.initialize(firestore);
    return firestore;
}
exports.default = connect;
