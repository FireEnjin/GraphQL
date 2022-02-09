import * as admin from "firebase-admin";

/**
 * Gets a firebase auth token from header
 */
export default async function getTokenFromHeader(
  authHeader: string
): Promise<any> {
  let output = null;
  const token =
    authHeader && authHeader !== "null" && !authHeader.includes("undefined")
      ? authHeader.replace("Bearer ", "")
      : null;

  try {
    output = token ? admin.auth().verifyIdToken(token) : null;
  } catch (e) {
    console.log("Error getting id token");
  }

  return output;
}
