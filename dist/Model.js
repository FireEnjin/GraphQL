"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fireorm_1 = require("fireorm");
const pluralize_1 = __importDefault(require("pluralize"));
const date_fns_1 = require("date-fns");
const capFirstLetter_1 = __importDefault(require("./helpers/capFirstLetter"));
const createResolver_1 = __importDefault(require("./helpers/createResolver"));
const cleanObjectOfReferences_1 = __importDefault(require("./helpers/cleanObjectOfReferences"));
class default_1 {
    constructor(options) {
        this.options = options;
        /**
         * Do you want to keep createdAt and updatedAt timestamps automatically?
         * @default true
         */
        this.timestamps = true;
        if (options) {
            this.collectionName = options.collectionName
                ? options.collectionName
                : (0, pluralize_1.default)(options.docSchema.name);
        }
        if (options && !options.disableResolvers && options.docSchema) {
            this.Resolver = (0, createResolver_1.default)({
                ...options,
                returnType: options.docSchema,
                modelName: (0, capFirstLetter_1.default)(options.docSchema.name),
                collectionName: this.collectionName,
                model: this,
            });
        }
    }
    buildQuery(options = {}, ref, relation) {
        var _a, _b;
        let query = ref || this.ref();
        const operatorMap = {
            whereEqual: "==",
            whereLessThan: "<",
            whereLessThanOrEqual: "<=",
            whereGreaterThan: ">",
            whereGreaterThanOrEqual: ">=",
            whereArrayContains: "array-contains",
            whereArrayContainsAny: "array-contains-any",
            whereIn: "in",
        };
        const orderBy = (options === null || options === void 0 ? void 0 : options.orderBy) || this.order;
        if (orderBy) {
            for (const order of orderBy.split(",")) {
                const [orderBy, direction] = order.split(":");
                query = query.orderBy(orderBy, direction ? direction : "asc");
            }
        }
        else if (this.timestamps && !this.order && !relation) {
            query = query.orderBy("createdAt", "desc");
        }
        for (const where of [
            "whereEqual",
            "whereLessThan",
            "whereLessThanOrEqual",
            "whereGreaterThan",
            "whereGreaterThanOrEqual",
            "whereArrayContains",
            "whereArrayContainsAny",
            "whereIn",
        ]) {
            if (options[where]) {
                options[where] =
                    typeof options[where] === "string"
                        ? JSON.parse(options[where])
                        : options[where];
                for (const whereKey of Object.keys(options[where])) {
                    let value = options[where][whereKey];
                    if ((_a = value === null || value === void 0 ? void 0 : value.startsWith) === null || _a === void 0 ? void 0 : _a.call(value, "~/")) {
                        value = this.ref().firestore.doc(value.replace("~/", ""));
                        console.log("doc ref", value);
                    }
                    query = query.where(whereKey, operatorMap[where], (0, date_fns_1.isValid)((0, date_fns_1.parseISO)(value)) ? new Date(Date.parse(value)) : value);
                }
            }
        }
        if (options.limit && !((_b = options === null || options === void 0 ? void 0 : options.query) === null || _b === void 0 ? void 0 : _b.length)) {
            query = query.limit(+options.limit);
        }
        return query;
    }
    /**
     * Paginate a collection to page results
     */
    async paginate(options = {}, onPaginate, hookOptions) {
        var _a, _b;
        const output = [];
        const orderBy = (options === null || options === void 0 ? void 0 : options.orderBy) || this.order;
        let query = this.buildQuery(options);
        if (onPaginate && typeof onPaginate === "function") {
            query = await onPaginate(query, options, hookOptions);
        }
        if (options.next || options.back) {
            const lastDoc = await this.ref()
                .doc(options.next ? options.next : options.back)
                .get();
            if (lastDoc.exists) {
                const docData = lastDoc.data();
                query = query[options.next ? "startAfter" : "endBefore"](orderBy ? docData[orderBy.split(":")[0]] : docData.createdAt);
            }
        }
        const res = await query.get();
        for (const doc of res.docs) {
            const entity = { ...doc.data(), id: doc.id };
            if (((_a = entity === null || entity === void 0 ? void 0 : entity.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) && this.timestamps) {
                entity.createdAt = entity.createdAt.toDate().toISOString();
            }
            if (((_b = entity === null || entity === void 0 ? void 0 : entity.updatedAt) === null || _b === void 0 ? void 0 : _b.toDate) && this.timestamps) {
                entity.updatedAt = entity.updatedAt.toDate().toISOString();
            }
            output.push(entity);
        }
        return output;
    }
    /**
     * Create a new document and add it to the collection
     * @param modelObject The data to add to the document
     */
    create(modelObject) {
        return this.repo().create(this.timestamps
            ? { ...modelObject, createdAt: new Date() }
            : modelObject);
    }
    /**
     * Create a batch of requests for this collection.
     * @see https://fireorm.js.org/#/Batches
     * @returns FirestoreBatchSingleRepository<IEntity>
     */
    createBatch() {
        this.batch = this.repo().createBatch();
        return this.batch;
    }
    /**
     * Commit the current batch of requests
     */
    commit() {
        return this.batch.commit();
    }
    /**
     * Delete a document from a collection
     * @param id The id of the document to delete
     */
    delete(id) {
        return this.repo().delete(id);
    }
    /**
     * Execute a query on a collection
     * @param queries A list of queries
     * @param limitVal The limit of records to return
     * @param orderByObj The order of the records
     */
    execute(queries, limitVal, orderByObj) {
        return this.repo().execute(queries, limitVal, orderByObj);
    }
    /**
     * Get a specific document's data or resolve query
     * @param id The id of the document
     * @param reslationships The map for relationships to get with the query
     */
    async find(id, relationships = {}) {
        const data = (await (id
            ? this.repo().findById(id)
            : this.repo().find()));
        if (relationships) {
            const rootDocPath = `${this.ref().path}/${id}`;
            const queryCache = {
                [rootDocPath]: { ...data, _path: rootDocPath },
            };
            const firestore = this.ref().firestore;
            const getPathFromDoc = (doc) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return (doc === null || doc === void 0 ? void 0 : doc.path) ||
                    ((_a = doc === null || doc === void 0 ? void 0 : doc.ref) === null || _a === void 0 ? void 0 : _a.path) ||
                    ((_e = (_d = (_c = (_b = doc === null || doc === void 0 ? void 0 : doc._ref) === null || _b === void 0 ? void 0 : _b._path) === null || _c === void 0 ? void 0 : _c.segments) === null || _d === void 0 ? void 0 : _d.join) === null || _e === void 0 ? void 0 : _e.call(_d, "/")) ||
                    ((_h = (_g = (_f = doc === null || doc === void 0 ? void 0 : doc._path) === null || _f === void 0 ? void 0 : _f.segments) === null || _g === void 0 ? void 0 : _g.join) === null || _h === void 0 ? void 0 : _h.call(_g, "/"));
            };
            const getDoc = async (path) => {
                if (!path)
                    return;
                const docData = { ...((queryCache === null || queryCache === void 0 ? void 0 : queryCache[path]) || {}) };
                const id = docData === null || docData === void 0 ? void 0 : docData.id;
                const query = (queryCache === null || queryCache === void 0 ? void 0 : queryCache[path])
                    ? new Promise((res) => res({
                        id,
                        data: () => docData,
                        ref: {
                            id,
                            path,
                        },
                    }))
                    : firestore.doc(path).get();
                return query;
            };
            const listDocs = async (collectionPath, options) => {
                const query = this.buildQuery(options, firestore.collection(collectionPath), true);
                const { docs } = await query.get();
                const documents = await Promise.all(docs.map((doc) => getDoc(getPathFromDoc(doc))));
                return documents.map(cleanDocData);
            };
            const resolveLevel = async (fieldMap, contextData, callback) => {
                for (const key of Object.keys(fieldMap).filter((k) => k !== "_")) {
                    const nextFieldMap = fieldMap === null || fieldMap === void 0 ? void 0 : fieldMap[key];
                    if (!nextFieldMap)
                        continue;
                    if (Array.isArray(contextData) && typeof nextFieldMap === "object") {
                        await Promise.all(contextData.map((d) => resolveLevel(fieldMap, d, callback)));
                        continue;
                    }
                    if (typeof callback === "function") {
                        contextData[key] = await callback(key, contextData, nextFieldMap);
                    }
                    if (typeof nextFieldMap === "object")
                        await resolveLevel(nextFieldMap, contextData[key], callback);
                }
            };
            const cleanDocData = (doc) => {
                const path = getPathFromDoc(doc);
                const data = (queryCache[path] && { ...queryCache[path] }) || {
                    id: (doc === null || doc === void 0 ? void 0 : doc.id) || null,
                    ...(0, cleanObjectOfReferences_1.default)(doc.data(), true),
                    _path: path,
                };
                if (!queryCache[path])
                    queryCache[path] = data;
                return data;
            };
            await resolveLevel(relationships, data, async (fieldPath, contextData, { _: relation }) => {
                const fieldValue = contextData === null || contextData === void 0 ? void 0 : contextData[fieldPath];
                const valueIsArray = Array.isArray(fieldValue);
                if (!fieldValue && !(relation === null || relation === void 0 ? void 0 : relation.collectionPath))
                    return null;
                const fieldData = valueIsArray
                    ? (await Promise.all(fieldValue.map((doc) => getDoc(getPathFromDoc(doc))))).map(cleanDocData)
                    : (fieldValue === null || fieldValue === void 0 ? void 0 : fieldValue.id)
                        ? cleanDocData(await getDoc((fieldValue === null || fieldValue === void 0 ? void 0 : fieldValue._path) || (fieldValue === null || fieldValue === void 0 ? void 0 : fieldValue.path)))
                        : typeof fieldValue === "string" && (relation === null || relation === void 0 ? void 0 : relation.collectionPath)
                            ? cleanDocData(await getDoc(`${(relation === null || relation === void 0 ? void 0 : relation.collectionPath)
                                ? `${relation.collectionPath}/`
                                : ""}${fieldValue}`))
                            : !fieldValue && (relation === null || relation === void 0 ? void 0 : relation.collectionPath)
                                ? await listDocs(relation === null || relation === void 0 ? void 0 : relation.collectionPath, relation)
                                : null;
                return fieldData;
            });
        }
        return data;
    }
    /**
     * Get one document from a list of results
     */
    async findOne() {
        return this.repo().findOne();
    }
    /**
     * Get the name of the collection the model is attached to
     */
    getCollectionName() {
        return this.collectionName;
    }
    /**
     * Get the Firestore reference to the collection
     */
    ref() {
        return this.repo().firestoreColRef;
    }
    /**
     * Get the FireORM repo reference for the collection
     * @see https://fireorm.js.org/#/classes/basefirestorerepository
     */
    repo(schema) {
        return (0, fireorm_1.getRepository)(schema || this.options.docSchema);
    }
    /**
     * Run a transaction on the collection
     * @param executor The transaction executor function
     */
    runTransaction(executor) {
        return this.repo().runTransaction(executor);
    }
    /**
     * Limit the number of records returned
     * @param limitTo The limit of data to return
     */
    limit(limitTo) {
        return this.repo().limit(limitTo);
    }
    /**
     * Order a list of documents by a specific property in ascending order
     * @param prop The property to order ascending by
     */
    orderByAscending(prop) {
        return this.repo().orderByAscending(prop);
    }
    /**
     * Order a list of documents by a specific property in descending order
     * @param prop The property to order descending by
     */
    orderByDescending(prop) {
        return this.repo().orderByDescending(prop);
    }
    /**
     * Update the data on a document from the collection
     * @param data The data to update on the document
     */
    update(data) {
        return this.repo().update((this.timestamps ? { ...data, updatedAt: new Date() } : data));
    }
    /**
     * Validate a document's content against the model
     * @see https://fireorm.js.org/#/Validation
     * @param data The data from the document
     * @returns An array of class-validator errors
     */
    async validate(data) {
        return this.repo().validate(data);
    }
    /**
     * Get a list of documents where property equals value
     * @param prop The property to check eqaulity of
     * @param value The value to be equal to
     */
    whereEqualTo(prop, value) {
        return this.repo().whereEqualTo(prop, value);
    }
    /**
     * Get a list of documents where property doesn't equal a value
     * @param prop The property to check eqaulity of
     * @param value The value to be equal to
     */
    whereNotEqualTo(prop, value) {
        return this.repo().whereNotEqualTo(prop, value);
    }
    /**
     * Get a list of documents where property greater than value
     * @param prop The property to check eqaulity of
     * @param value The value to be greater than to
     */
    whereGreaterThan(prop, value) {
        return this.repo().whereGreaterThan(prop, value);
    }
    /**
     * Get a list of documents where property less than value
     * @param prop The property to check eqaulity of
     * @param value The value to be less than to
     */
    whereLessThan(prop, value) {
        return this.repo().whereLessThan(prop, value);
    }
    /**
     * Get a list of documents where property less than or equal to value
     * @param prop The property to check eqaulity of
     * @param value The value to be less than or equal to
     */
    whereLessOrEqualThan(prop, value) {
        return this.repo().whereLessOrEqualThan(prop, value);
    }
    /**
     * Get a list of documents where property's list of values includes a given value
     * @param prop The property to search for values
     * @param value The values to check for
     */
    whereArrayContains(prop, value) {
        return this.repo().whereArrayContains(prop, value);
    }
    /**
     * Get a list of documents where property's list of values exists in another list of values
     * @param prop The property to search for values
     * @param value The values to check for
     */
    whereArrayContainsAny(prop, value) {
        return this.repo().whereArrayContainsAny(prop, value);
    }
    /**
     * Get a list of documents where property matches any in a list of values
     * @param prop The property to search for valuese
     * @param val The values to check for
     */
    whereIn(prop, val) {
        return this.repo().whereIn(prop, val);
    }
    /**
     * Get a list of documents where property doesn't match any in a list of values
     * @param prop The property to search for valuese
     * @param val The values to check for
     */
    whereNotIn(prop, val) {
        return this.repo().whereNotIn(prop, val);
    }
}
exports.default = default_1;
