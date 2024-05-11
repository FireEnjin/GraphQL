import * as admin from "firebase-admin";
export default function connect(options?: {
    app?: any;
    serviceAccount?: string | boolean;
    emulate?: boolean;
    host?: string;
    ssl?: string;
    ignoreUndefinedProperties?: boolean;
    projectId?: string;
    storageBucket?: string;
}): admin.firestore.Firestore;
