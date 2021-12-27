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
class default_1 {
    constructor(options) {
        this.options = options;
        this.timestamps = true;
        if (options) {
            this.collectionName = options.collectionName
                ? options.collectionName
                : pluralize_1.default(options.docSchema.name);
        }
        if (options && options.docSchema) {
            this.Resolver = createResolver_1.default({
                ...options,
                returnType: options.docSchema,
                modelName: capFirstLetter_1.default(options.docSchema.name),
                collectionName: this.collectionName,
                model: this,
            });
        }
    }
    /**
     * Paginate a collection to page results
     */
    async paginate(options = {}, onPaginate, hookOptions) {
        var _a;
        let query = this.ref();
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
        if (options.orderBy) {
            for (const order of options.orderBy ? options.orderBy.split(",") : []) {
                const [orderBy, direction] = order.split(":");
                query = query.orderBy(orderBy, direction ? direction : "asc");
            }
        }
        else if (this.timestamps) {
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
                    query = query.where(whereKey, operatorMap[where], date_fns_1.isValid(date_fns_1.parseISO(options[where][whereKey]))
                        ? new Date(Date.parse(options[where][whereKey]))
                        : options[where][whereKey]);
                }
            }
        }
        if (onPaginate && typeof onPaginate === "function") {
            query = await onPaginate(query, options, hookOptions);
        }
        if (options.next || options.back) {
            const lastDoc = await this.ref()
                .doc(options.next ? options.next : options.back)
                .get();
            if (lastDoc.exists) {
                const docData = lastDoc.data();
                query = query[options.next ? "startAfter" : "endBefore"](options.orderBy
                    ? docData[options.orderBy.split(":")[0]]
                    : docData.createdAt);
            }
        }
        if (options.limit && !((_a = options === null || options === void 0 ? void 0 : options.query) === null || _a === void 0 ? void 0 : _a.length)) {
            query = query.limit(+options.limit);
        }
        const output = [];
        const res = await query.get();
        for (const doc of res.docs) {
            const entity = { ...doc.data(), id: doc.id };
            if (entity.createdAt && this.timestamps) {
                entity.createdAt = entity.createdAt.toDate().toISOString();
            }
            if (entity.updatedAt && this.timestamps) {
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
            ? { createdAt: new Date(), ...modelObject }
            : modelObject);
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
     * Get a specific document's data
     * @param id The id of the document
     */
    async find(id) {
        return this.repo().findById(id);
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
    repo() {
        return fireorm_1.GetRepository(this.options.docSchema);
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
        return this.repo().update(this.timestamps ? { ...data, updatedAt: new Date() } : data);
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
     * Get a list of documents where property is equal to one of a list of values
     * @param prop The property to search for values
     * @param value The values to check for
     */
    whereArrayContains(prop, value) {
        return this.repo().whereArrayContains(prop, value);
    }
}
exports.default = default_1;
