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
const firestore_1 = require("firebase-admin/firestore");
const fireorm = __importStar(require("fireorm"));
const app_1 = require("firebase-admin/app");
function connect(options) {
    var _a, _b;
    const appConfig = {};
    let app = (options === null || options === void 0 ? void 0 : options.app) || ((_a = (0, app_1.getApps)()) === null || _a === void 0 ? void 0 : _a[0]);
    if (!!(options === null || options === void 0 ? void 0 : options.emulate) ||
        (options === null || options === void 0 ? void 0 : options.projectId) ||
        ((_b = process === null || process === void 0 ? void 0 : process.env) === null || _b === void 0 ? void 0 : _b.GCLOUD_PROJECT)) {
        appConfig.projectId = (options === null || options === void 0 ? void 0 : options.projectId) || process.env.GCLOUD_PROJECT;
        appConfig.storageBucket =
            (options === null || options === void 0 ? void 0 : options.storageBucket) || `${appConfig.projectId}.appspot.com`;
    }
    if ((options === null || options === void 0 ? void 0 : options.serviceAccount) && !app) {
        const serviceAccount = require(typeof (options === null || options === void 0 ? void 0 : options.serviceAccount) === "string"
            ? options.serviceAccount
            : `${process.cwd()}/service-account.json`);
        appConfig.credential = (0, app_1.cert)(serviceAccount);
        appConfig.databaseURL = `https://${serviceAccount.project_id}.firebaseio.com`;
        appConfig.storageBucket =
            (options === null || options === void 0 ? void 0 : options.storageBucket) || `${serviceAccount.project_id}.appspot.com`;
        process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
    }
    if (!app)
        app = (0, app_1.initializeApp)(appConfig);
    const firestore = (0, firestore_1.getFirestore)(app);
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
