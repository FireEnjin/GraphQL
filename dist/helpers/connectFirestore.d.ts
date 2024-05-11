export default function connect(options?: {
    app?: any;
    serviceAccount?: string | boolean;
    emulate?: boolean;
    host?: string;
    ssl?: string;
    ignoreUndefinedProperties?: boolean;
    projectId?: string;
    storageBucket?: string;
}): FirebaseFirestore.Firestore;
