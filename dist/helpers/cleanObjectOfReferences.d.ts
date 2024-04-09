/**
 * Cleans all JavaScript referneces and prototypes from Object
 * so it can be stored in Firestore.
 * @param input The JS Object to clean
 * @param keepDocumentReferenceId Should we keep reference ids for relationships
 */
export default function cleanObjectOfReferences(input: any, keepDocumentReferenceId?: boolean): any;
