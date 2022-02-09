import getTokenFromHeader from "./getTokenFromHeader";

export default async function session(options?: {
  req?: any;
  res?: any;
  db?: FirebaseFirestore.Firestore;
}) {
  const req = options?.req || null;
  const res = options?.res || null;
  const db = options?.db || null;

  return {
    res,
    headers: req?.headers || null,
    db,
    referrer: req?.headers?.referer || null,
    token:
      req?.headers?.authorization &&
      (await getTokenFromHeader(req?.headers?.authorization)),
  };
}
