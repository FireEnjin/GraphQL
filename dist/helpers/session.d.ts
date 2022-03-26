export default function session({ req, res, db, }: {
    req?: any;
    res?: any;
    db?: FirebaseFirestore.Firestore;
}): Promise<{
    res: any;
    headers: any;
    db: FirebaseFirestore.Firestore;
    referrer: any;
    token: any;
}>;
