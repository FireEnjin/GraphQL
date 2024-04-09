/**
 * Cleans all JavaScript referneces and prototypes from Object
 * so it can be stored in Firestore.
 * @param input The JS Object to clean
 * @param keepDocumentReferenceId Should we keep reference ids for relationships
 */
export default function cleanObjectOfReferences(
  input: any,
  keepDocumentReferenceId = false
) {
  if (typeof input !== "object") return input;
  const data = { ...input };
  for (const key of Object.keys(input)) {
    const value = input[key];
    if (!value) continue;
    try {
      if (value?.constructor?.name === "Object") {
        data[key] = cleanObjectOfReferences(value, keepDocumentReferenceId);
      } else if (value?.constructor?.name === "DocumentReference") {
        keepDocumentReferenceId
          ? (data[key] = { id: value.id, path: data?.[key]?.path })
          : delete data[key];
      } else if (value?.constructor?.name === "Timestamp") {
        data[key] = value.toDate();
      } else if (value?.constructor?.name === "Array") {
        const cleanArray: any[] = [];
        for (const item of data[key]) {
          cleanArray.push(
            cleanObjectOfReferences(item, keepDocumentReferenceId)
          );
        }
        data[key] = cleanArray;
      } else if (
        typeof value === "object" &&
        value?.constructor?.name !== "Date"
      ) {
        data[key] = cleanObjectOfReferences(
          JSON.parse(JSON.stringify(value)),
          keepDocumentReferenceId
        );
      }
    } catch (err) {
      delete data[key];
    }
  }

  return (data && JSON.parse(JSON.stringify(data))) || null;
}
