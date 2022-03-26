import getTokenFromHeader from "./getTokenFromHeader";

export default async function session({
  req,
  res,
  db,
}: {
  req?: any;
  res?: any;
  db?: FirebaseFirestore.Firestore;
}) {
  const headers = req?.headers || req?.Headers || null;
  return {
    res,
    headers,
    db,
    referrer: headers?.referer || null,
    token:
      (headers?.authorization || headers?.Authorization) &&
      (await getTokenFromHeader(
        headers?.authorization || headers?.Authorization
      )),
  };
}
