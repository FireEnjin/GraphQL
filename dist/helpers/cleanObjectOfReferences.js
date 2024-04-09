"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Cleans all JavaScript referneces and prototypes from Object
 * so it can be stored in Firestore.
 * @param input The JS Object to clean
 * @param keepDocumentReferenceId Should we keep reference ids for relationships
 */
function cleanObjectOfReferences(input, keepDocumentReferenceId = false) {
    var _a, _b, _c, _d, _e, _f;
    if (typeof input !== "object")
        return input;
    const data = { ...input };
    for (const key of Object.keys(input)) {
        const value = input[key];
        if (!value)
            continue;
        try {
            if (((_a = value === null || value === void 0 ? void 0 : value.constructor) === null || _a === void 0 ? void 0 : _a.name) === "Object") {
                data[key] = cleanObjectOfReferences(value, keepDocumentReferenceId);
            }
            else if (((_b = value === null || value === void 0 ? void 0 : value.constructor) === null || _b === void 0 ? void 0 : _b.name) === "DocumentReference") {
                keepDocumentReferenceId
                    ? (data[key] = { id: value.id, path: (_c = data === null || data === void 0 ? void 0 : data[key]) === null || _c === void 0 ? void 0 : _c.path })
                    : delete data[key];
            }
            else if (((_d = value === null || value === void 0 ? void 0 : value.constructor) === null || _d === void 0 ? void 0 : _d.name) === "Timestamp") {
                data[key] = value.toDate();
            }
            else if (((_e = value === null || value === void 0 ? void 0 : value.constructor) === null || _e === void 0 ? void 0 : _e.name) === "Array") {
                const cleanArray = [];
                for (const item of data[key]) {
                    cleanArray.push(cleanObjectOfReferences(item, keepDocumentReferenceId));
                }
                data[key] = cleanArray;
            }
            else if (typeof value === "object" &&
                ((_f = value === null || value === void 0 ? void 0 : value.constructor) === null || _f === void 0 ? void 0 : _f.name) !== "Date") {
                data[key] = cleanObjectOfReferences(JSON.parse(JSON.stringify(value)), keepDocumentReferenceId);
            }
        }
        catch (err) {
            delete data[key];
        }
    }
    return (data && JSON.parse(JSON.stringify(data))) || null;
}
exports.default = cleanObjectOfReferences;
