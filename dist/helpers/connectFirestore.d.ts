import * as admin from "firebase-admin";
export default function connectFirestore(options?: {
    serviceAccount?: string | boolean;
    emulate?: boolean;
    host?: string;
    ssl?: string;
    ignoreUndefinedProperties?: boolean;
    projectId?: string;
}): admin.firestore.Firestore;
