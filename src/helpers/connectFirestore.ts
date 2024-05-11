import { AppOptions } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import * as fireorm from "fireorm";
import { initializeApp, getApps, cert } from "firebase-admin/app";

export default function connect(options?: {
  app?: any;
  serviceAccount?: string | boolean;
  emulate?: boolean;
  host?: string;
  ssl?: string;
  ignoreUndefinedProperties?: boolean;
  projectId?: string;
  storageBucket?: string;
}) {
  const appConfig: AppOptions = {};
  let app = options?.app || getApps()?.[0];
  if (
    !!options?.emulate ||
    options?.projectId ||
    process?.env?.GCLOUD_PROJECT
  ) {
    appConfig.projectId = options?.projectId || process.env.GCLOUD_PROJECT;
    appConfig.storageBucket =
      options?.storageBucket || `${appConfig.projectId}.appspot.com`;
  }
  if (options?.serviceAccount && !app) {
    const serviceAccount = require(typeof options?.serviceAccount === "string"
      ? options.serviceAccount
      : `${process.cwd()}/service-account.json`);
    appConfig.credential = cert(serviceAccount);
    appConfig.databaseURL = `https://${serviceAccount.project_id}.firebaseio.com`;
    appConfig.storageBucket =
      options?.storageBucket || `${serviceAccount.project_id}.appspot.com`;
    process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
  }

  if (!app) app = initializeApp(appConfig);

  const firestore = getFirestore(app);
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
