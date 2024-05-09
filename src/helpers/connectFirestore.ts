import * as admin from "firebase-admin";
import * as fireorm from "fireorm";
import { getApps } from "firebase-admin/app";

export default function connect(options?: {
  serviceAccount?: string | boolean;
  emulate?: boolean;
  host?: string;
  ssl?: string;
  ignoreUndefinedProperties?: boolean;
  projectId?: string;
  storageBucket?: string;
}) {
  const appConfig: admin.AppOptions = {};
  const activeApps = getApps();
  if (
    !!options?.emulate ||
    options?.projectId ||
    process?.env?.GCLOUD_PROJECT
  ) {
    appConfig.projectId = options?.projectId || process.env.GCLOUD_PROJECT;
    appConfig.storageBucket =
      options?.storageBucket || `${appConfig.projectId}.appspot.com`;
  }
  if (options?.serviceAccount && !activeApps.length) {
    const serviceAccount = require(typeof options?.serviceAccount === "string"
      ? options.serviceAccount
      : `${process.cwd()}/service-account.json`);
    appConfig.credential = admin.credential.cert(serviceAccount);
    appConfig.databaseURL = `https://${serviceAccount.project_id}.firebaseio.com`;
    appConfig.storageBucket =
      options?.storageBucket || `${serviceAccount.project_id}.appspot.com`;
    process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
  }
  const app =
    activeApps.length === 0 ? admin.initializeApp(appConfig) : activeApps[0];
  const firestore = admin.firestore(app);
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
