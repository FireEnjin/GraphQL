import * as admin from "firebase-admin";
import * as fireorm from "fireorm";

export default function connectFirestore(options?: {
  serviceAccount?: string | boolean;
  emulate?: boolean;
  host?: string;
  ssl?: string;
  ignoreUndefinedProperties?: boolean;
  projectId?: string;
}) {
  const appConfig: admin.AppOptions = {};
  if (
    !!options?.emulate ||
    options?.projectId ||
    process?.env?.GCLOUD_PROJECT
  ) {
    appConfig.projectId = options?.projectId || process.env.GCLOUD_PROJECT;
  }
  if (options?.serviceAccount) {
    const serviceAccount = require(typeof options?.serviceAccount === "string"
      ? options.serviceAccount
      : `${process.cwd()}/service-account.json`);
    appConfig.credential = admin.credential.cert(serviceAccount);
    appConfig.databaseURL = `https://${serviceAccount.project_id}.firebaseio.com`;
    appConfig.storageBucket = `${serviceAccount.project_id}.appspot.com`;
  }
  admin.initializeApp(appConfig);

  const firestore = admin.firestore();
  const firebaseConfig: FirebaseFirestore.Settings = {
    ignoreUndefinedProperties:
      options?.ignoreUndefinedProperties === false ? false : true,
  };
  if (options?.emulate) {
    firebaseConfig.host = options?.host || "localhost:8080";
    firebaseConfig.ssl = !!options?.ssl;
  }

  firestore.settings(firebaseConfig);
  fireorm.initialize(firestore);

  return firestore;
}
