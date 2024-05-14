import {
  getRepository,
  IFireOrmQueryLine,
  IFirestoreVal,
  IOrderByParams,
  IEntity,
  IWherePropParam,
  ITransactionRepository,
} from "fireorm";
import { firestore } from "firebase-admin";
import pluralize from "pluralize";
import { isValid, parseISO } from "date-fns";
import capFirstLetter from "./helpers/capFirstLetter";
import createResolver from "./helpers/createResolver";
import { FirestoreBatch } from "fireorm/lib/src/Batch/FirestoreBatch";
import { FirestoreBatchSingleRepository } from "fireorm/lib/src/Batch/FirestoreBatchSingleRepository";
import cleanObjectOfReferences from "./helpers/cleanObjectOfReferences";

export interface QueryOptions {
  findOne?: boolean;
  collectionPath?: string;
  query?: string;
  orderBy?: string;
  limit?: number;
  next?: string;
  back?: string;
  whereEqual?: { [key: string]: any };
  whereLessThan?: { [key: string]: any };
  whereLessThanOrEqual?: { [key: string]: any };
  whereGreaterThan?: { [key: string]: any };
  whereGreaterThanOrEqual?: { [key: string]: any };
  whereArrayContains?: { [key: string]: any };
  whereArrayContainsAny?: { [key: string]: any };
  whereIn?: { [key: string]: any };
  relationships?: {
    [key: string]: { _?: QueryOptions; [subkey: string]: any } | boolean;
  };
}

export interface RelationshipQuery {
  [fieldPath: string]:
    | (RelationshipQuery & {
        _?: QueryOptions;
      })
    | boolean;
}

export default class<T extends IEntity> {
  /**
   * The auth permissions object for the model
   */
  public auth: {
    find?: string[];
    list?: string[];
    read?: string[];
    write?: string[];
    update?: string[];
    create?: string[];
    delete?: string[];
  };
  /**
   * The TypeGraphQL resolver for the model
   */
  Resolver: any;
  /**
   * The name of the collection in Firestore
   */
  collectionName: string;
  /**
   * Do you want to keep createdAt and updatedAt timestamps automatically?
   * @default true
   */
  timestamps = true;
  /**
   * The default order to use for this collection
   * @default null;
   */
  order: string;
  /**
   * The batches saved for this commit
   */
  batch?: FirestoreBatch | FirestoreBatchSingleRepository<IEntity>;

  constructor(
    protected options: {
      docSchema: any;
      inputType?: any;
      editType?: any;
      listQueryInputType?: any;
      listReturnType?: any;
      collectionName?: string;
      findQueryName?: string;
      listQueryName?: string;
      addMutationName?: string;
      editMutationName?: string;
      deleteMutationName?: string;
      auth?: {
        find?: string[];
        list?: string[];
        read?: string[];
        write?: string[];
        update?: string[];
        create?: string[];
        delete?: string[];
      };
      disableResolvers?: boolean;
    }
  ) {
    if (options) {
      this.collectionName = options.collectionName
        ? options.collectionName
        : pluralize(options.docSchema.name);
      if (options?.auth) this.auth = options.auth;
    }
    if (options && !options.disableResolvers && options.docSchema) {
      this.Resolver = createResolver({
        ...options,
        returnType: options.docSchema,
        modelName: capFirstLetter(options.docSchema.name),
        collectionName: this.collectionName,
        model: this,
      } as any);
    }
  }

  private buildQuery(
    options: QueryOptions = {},
    ref?: any,
    relation?: boolean
  ) {
    let query = ref || (this.ref() as any);
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
    const orderBy = options?.orderBy || this.order;
    if (orderBy) {
      for (const order of orderBy.split(",")) {
        const [orderBy, direction] = order.split(":");
        query = query.orderBy(orderBy, direction ? direction : "asc");
      }
    } else if (this.timestamps && !this.order && !relation) {
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
          if (value?.startsWith?.("~/")) {
            value = this.ref().firestore.doc(value.replace("~/", ""));
            console.log("doc ref", value);
          }
          query = query.where(
            whereKey,
            operatorMap[where],
            isValid(parseISO(value)) ? new Date(Date.parse(value)) : value
          );
        }
      }
    }

    if (options.limit && !options?.query?.length) {
      query = query.limit(+options.limit);
    }
    return query;
  }

  /**
   * Paginate a collection to page results
   */
  async paginate<I = T>(
    options: QueryOptions = {},
    onPaginate?: (
      query,
      queryOptions: QueryOptions,
      hookOptions?: {
        context: any;
        type: string;
      }
    ) => any,
    hookOptions?: {
      context: any;
      type: string;
    }
  ): Promise<T[]> {
    const output = [];
    const relationships = options?.relationships;
    const orderBy = options?.orderBy || this.order;
    let query = this.buildQuery(options);
    if (onPaginate && typeof onPaginate === "function") {
      query = await onPaginate(query, options, hookOptions);
    }

    if (options.next || options.back) {
      const lastDoc = await this.ref()
        .doc(options.next ? options.next : options.back)
        .get();
      if (lastDoc.exists) {
        const docData: any = lastDoc.data();
        query = query[options.next ? "startAfter" : "endBefore"](
          orderBy ? docData[orderBy.split(":")[0]] : docData.createdAt
        );
      }
    }
    const res = await query.get();
    for (const doc of res.docs) {
      const entity = { ...doc.data(), id: doc.id };
      if (entity?.createdAt?.toDate && this.timestamps) {
        entity.createdAt = (entity.createdAt.toDate() as Date).toISOString();
      }
      if (entity?.updatedAt?.toDate && this.timestamps) {
        entity.updatedAt = (entity.updatedAt.toDate() as Date).toISOString();
      }
      if (relationships) {
        const rootDocPath = `${this.ref().path}/${doc.id}`;
        const queryCache: { [path: string]: any } = {
          [rootDocPath]: { ...entity, _path: rootDocPath },
        };
        const firestore = this.ref().firestore;
        const getPathFromDoc = (doc: any) =>
          doc?.path ||
          doc?.ref?.path ||
          doc?._ref?._path?.segments?.join?.("/") ||
          doc?._path?.segments?.join?.("/");
        const getDoc = async (path: string) => {
          if (!path) return;
          const docData = { ...(queryCache?.[path] || {}) };
          const id = docData?.id;
          const query = queryCache?.[path]
            ? new Promise((res) =>
                res({
                  id,
                  data: () => docData,
                  ref: {
                    id,
                    path,
                  },
                })
              )
            : firestore.doc(path).get();

          return query as Promise<firestore.DocumentSnapshot<I>>;
        };

        const listDocs = async (
          collectionPath: string,
          options: QueryOptions
        ) => {
          const query = this.buildQuery(
            options,
            firestore.collection(collectionPath),
            true
          );
          const { docs } = await query.get();
          const documents = await Promise.all(
            docs.map((doc) => getDoc(getPathFromDoc(doc)))
          );
          return documents.map(cleanDocData) as firestore.DocumentSnapshot<I>[];
        };

        const resolveLevel = async (
          fieldMap: any,
          contextData: any,
          callback: (
            key: string,
            contextData: any,
            fieldMap: any
          ) => Promise<any>
        ) => {
          for (const key of Object.keys(fieldMap).filter((k) => k !== "_")) {
            const nextFieldMap = fieldMap?.[key];
            if (!nextFieldMap) continue;
            if (
              Array.isArray(contextData) &&
              typeof nextFieldMap === "object"
            ) {
              await Promise.all(
                contextData.map((d) => resolveLevel(fieldMap, d, callback))
              );
              continue;
            }
            if (typeof callback === "function") {
              contextData[key] = await callback(key, contextData, nextFieldMap);
            }
            if (typeof nextFieldMap === "object")
              await resolveLevel(nextFieldMap, contextData[key], callback);
          }
        };
        const cleanDocData = (doc: firestore.DocumentSnapshot<I>) => {
          const path = getPathFromDoc(doc);
          const data = (queryCache[path] && { ...queryCache[path] }) || {
            id: doc?.id || null,
            ...cleanObjectOfReferences(doc.data(), true),
            _path: path,
          };
          if (!queryCache[path]) queryCache[path] = data;
          return data;
        };
        await resolveLevel(
          relationships,
          entity,
          async (fieldPath, contextData, { _: relation }) => {
            const fieldValue = contextData?.[fieldPath];
            const valueIsArray = Array.isArray(fieldValue);
            if (!fieldValue && !relation?.collectionPath) return null;
            const fieldData = valueIsArray
              ? (
                  await Promise.all(
                    fieldValue.map((doc) => getDoc(getPathFromDoc(doc)))
                  )
                ).map(cleanDocData)
              : fieldValue?.id
              ? cleanDocData(
                  await getDoc(fieldValue?._path || fieldValue?.path)
                )
              : typeof fieldValue === "string" && relation?.collectionPath
              ? cleanDocData(
                  await getDoc(
                    `${
                      relation?.collectionPath
                        ? `${relation.collectionPath}/`
                        : ""
                    }${fieldValue}`
                  )
                )
              : !fieldValue && relation?.collectionPath
              ? await listDocs(relation?.collectionPath, relation)
              : null;
            return fieldData;
          }
        );
      }
      output.push(entity);
    }

    return output;
  }

  /**
   * Create a new document and add it to the collection
   * @param modelObject The data to add to the document
   */
  create(modelObject: Partial<T>) {
    return this.repo().create(
      this.timestamps
        ? { ...modelObject, createdAt: new Date() }
        : (modelObject as any)
    );
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
  execute(
    queries: IFireOrmQueryLine[],
    limitVal?: number,
    orderByObj?: IOrderByParams
  ) {
    return this.repo().execute(queries, limitVal, orderByObj);
  }

  /**
   * Get a specific document's data or resolve query
   * @param id The id of the document
   * @param reslationships The map for relationships to get with the query
   */
  async find<I = T>(
    id?: string,
    relationships: {
      [key: string]: { _?: QueryOptions; [subkey: string]: any } | boolean;
    } = {}
  ) {
    const data = (await (id
      ? this.repo().findById(id)
      : this.repo().find())) as I;
    if (relationships) {
      const rootDocPath = `${this.ref().path}/${id}`;
      const queryCache: { [path: string]: any } = {
        [rootDocPath]: { ...data, _path: rootDocPath },
      };
      const firestore = this.ref().firestore;
      const getPathFromDoc = (doc: any) =>
        doc?.path ||
        doc?.ref?.path ||
        doc?._ref?._path?.segments?.join?.("/") ||
        doc?._path?.segments?.join?.("/");
      const getDoc = async (path: string) => {
        if (!path) return;
        const docData = { ...(queryCache?.[path] || {}) };
        const id = docData?.id;
        const query = queryCache?.[path]
          ? new Promise((res) =>
              res({
                id,
                data: () => docData,
                ref: {
                  id,
                  path,
                },
              })
            )
          : firestore.doc(path).get();

        return query as Promise<firestore.DocumentSnapshot<I>>;
      };

      const listDocs = async (
        collectionPath: string,
        options: QueryOptions
      ) => {
        const query = this.buildQuery(
          options,
          firestore.collection(collectionPath),
          true
        );
        const { docs } = await query.get();
        const documents = await Promise.all(
          docs.map((doc) => getDoc(getPathFromDoc(doc)))
        );
        return documents.map(cleanDocData) as firestore.DocumentSnapshot<I>[];
      };

      const resolveLevel = async (
        fieldMap: any,
        contextData: any,
        callback: (key: string, contextData: any, fieldMap: any) => Promise<any>
      ) => {
        for (const key of Object.keys(fieldMap).filter((k) => k !== "_")) {
          const nextFieldMap = fieldMap?.[key];
          if (!nextFieldMap) continue;
          if (Array.isArray(contextData) && typeof nextFieldMap === "object") {
            await Promise.all(
              contextData.map((d) => resolveLevel(fieldMap, d, callback))
            );
            continue;
          }
          if (typeof callback === "function") {
            contextData[key] = await callback(key, contextData, nextFieldMap);
          }
          if (typeof nextFieldMap === "object")
            await resolveLevel(nextFieldMap, contextData[key], callback);
        }
      };
      const cleanDocData = (doc: firestore.DocumentSnapshot<I>) => {
        const path = getPathFromDoc(doc);
        const data = (queryCache[path] && { ...queryCache[path] }) || {
          id: doc?.id || null,
          ...cleanObjectOfReferences(doc.data(), true),
          _path: path,
        };
        if (!queryCache[path]) queryCache[path] = data;
        return data;
      };
      await resolveLevel(
        relationships,
        data,
        async (fieldPath, contextData, { _: relation }) => {
          const fieldValue = contextData?.[fieldPath];
          const valueIsArray = Array.isArray(fieldValue);
          if (!fieldValue && !relation?.collectionPath) return null;
          const fieldData = valueIsArray
            ? (
                await Promise.all(
                  fieldValue.map((doc) => getDoc(getPathFromDoc(doc)))
                )
              ).map(cleanDocData)
            : fieldValue?.id
            ? cleanDocData(await getDoc(fieldValue?._path || fieldValue?.path))
            : typeof fieldValue === "string" && relation?.collectionPath
            ? cleanDocData(
                await getDoc(
                  `${
                    relation?.collectionPath
                      ? `${relation.collectionPath}/`
                      : ""
                  }${fieldValue}`
                )
              )
            : !fieldValue && relation?.collectionPath
            ? await listDocs(relation?.collectionPath, relation)
            : null;
          return fieldData;
        }
      );
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
  ref(): firestore.CollectionReference<Partial<T>> {
    return (this.repo() as any).firestoreColRef;
  }

  /**
   * Get the FireORM repo reference for the collection
   * @see https://fireorm.js.org/#/classes/basefirestorerepository
   */
  repo<R extends IEntity = T>(schema?: any) {
    return getRepository<R>(schema || this.options.docSchema);
  }

  /**
   * Run a transaction on the collection
   * @param executor The transaction executor function
   */
  runTransaction(executor: (tran: ITransactionRepository<T>) => Promise<any>) {
    return this.repo().runTransaction(executor);
  }

  /**
   * Limit the number of records returned
   * @param limitTo The limit of data to return
   */
  limit(limitTo: number) {
    return this.repo().limit(limitTo);
  }

  /**
   * Order a list of documents by a specific property in ascending order
   * @param prop The property to order ascending by
   */
  orderByAscending(prop: IWherePropParam<T>) {
    return this.repo().orderByAscending(prop);
  }

  /**
   * Order a list of documents by a specific property in descending order
   * @param prop The property to order descending by
   */
  orderByDescending(prop: IWherePropParam<T>) {
    return this.repo().orderByDescending(prop);
  }

  /**
   * Update the data on a document from the collection
   * @param data The data to update on the document
   */
  update(data: Partial<T>) {
    return this.repo().update(
      (this.timestamps ? { ...data, updatedAt: new Date() } : data) as T
    );
  }

  /**
   * Validate a document's content against the model
   * @see https://fireorm.js.org/#/Validation
   * @param data The data from the document
   * @returns An array of class-validator errors
   */
  async validate(data: Partial<T>) {
    return this.repo().validate(data as T);
  }

  /**
   * Get a list of documents where property equals value
   * @param prop The property to check eqaulity of
   * @param value The value to be equal to
   */
  whereEqualTo(prop: IWherePropParam<T>, value: IFirestoreVal) {
    return this.repo().whereEqualTo(prop, value);
  }

  /**
   * Get a list of documents where property doesn't equal a value
   * @param prop The property to check eqaulity of
   * @param value The value to be equal to
   */
  whereNotEqualTo(prop: IWherePropParam<T>, value: IFirestoreVal) {
    return this.repo().whereNotEqualTo(prop, value);
  }

  /**
   * Get a list of documents where property greater than value
   * @param prop The property to check eqaulity of
   * @param value The value to be greater than to
   */
  whereGreaterThan(prop: IWherePropParam<T>, value: IFirestoreVal) {
    return this.repo().whereGreaterThan(prop, value);
  }

  /**
   * Get a list of documents where property less than value
   * @param prop The property to check eqaulity of
   * @param value The value to be less than to
   */
  whereLessThan(prop: IWherePropParam<T>, value: IFirestoreVal) {
    return this.repo().whereLessThan(prop, value);
  }

  /**
   * Get a list of documents where property less than or equal to value
   * @param prop The property to check eqaulity of
   * @param value The value to be less than or equal to
   */
  whereLessOrEqualThan(prop: IWherePropParam<T>, value: IFirestoreVal) {
    return this.repo().whereLessOrEqualThan(prop, value);
  }

  /**
   * Get a list of documents where property's list of values includes a given value
   * @param prop The property to search for values
   * @param value The values to check for
   */
  whereArrayContains(prop: IWherePropParam<T>, value: IFirestoreVal) {
    return this.repo().whereArrayContains(prop, value);
  }

  /**
   * Get a list of documents where property's list of values exists in another list of values
   * @param prop The property to search for values
   * @param value The values to check for
   */
  whereArrayContainsAny(prop: IWherePropParam<T>, value: IFirestoreVal[]) {
    return this.repo().whereArrayContainsAny(prop, value);
  }

  /**
   * Get a list of documents where property matches any in a list of values
   * @param prop The property to search for valuese
   * @param val The values to check for
   */
  whereIn(prop: IWherePropParam<T>, val: IFirestoreVal[]) {
    return this.repo().whereIn(prop, val);
  }

  /**
   * Get a list of documents where property doesn't match any in a list of values
   * @param prop The property to search for valuese
   * @param val The values to check for
   */
  whereNotIn(prop: IWherePropParam<T>, val: IFirestoreVal[]) {
    return this.repo().whereNotIn(prop, val);
  }

  /**
   * Hook that runs on auth
   * @param method The method being ran
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The document data to be returned
   */
  async onAuth?(
    method?:
      | "find"
      | "list"
      | "read"
      | "write"
      | "update"
      | "create"
      | "delete",
    data?: any,
    options?: {
      type?: "graphdql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<boolean>;

  /**
   * Hook that runs before a document is added. If it returns a falsey value it will stop the creation return null.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The content to be merged with the existing document
   */
  async onBeforeAdd?(
    data?: any,
    options?: {
      type?: "graphql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;

  /**
   * Hook that runs after a document is added.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The document data to be returned
   */
  async onAfterAdd?(
    data?: Partial<T>,
    options?: {
      type?: "graphdql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;

  /**
   * Hook that runs before a document is edited. If it returns a falsey value it will stop the edit return null.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The content to be merged with the existing document
   */
  async onBeforeEdit?(
    data?: any,
    options?: {
      type?: "graphql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;

  /**
   * Hook that runs after a document is edited.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The document data to be returned
   */
  async onAfterEdit?(
    data?: Partial<T>,
    options?: {
      type?: "graphdql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;

  /**
   * Hook that runs before a document is written. If it returns a falsey value it will stop the write return null.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The content to be merged with the existing document
   */
  async onBeforeWrite?(
    data?: any,
    options?: {
      type?: "graphql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;

  /**
   * Hook that runs after a document is written.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The document data to be returned
   */
  async onAfterWrite?(
    data?: Partial<T>,
    options?: {
      type?: "graphdql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;

  /**
   * Hook that runs before a document is deleted. If it returns a falsey value it will stop the delete return null.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The document that was deleted
   */
  async onBeforeDelete?(
    data?: Partial<T>,
    options?: {
      type?: "graphql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;

  /**
   * Hook that runs after a document is deleted.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The document data to be returned
   */
  async onAfterDelete?(
    data?: Partial<T>,
    options?: {
      type?: "graphdql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;

  /**
   * Hook that runs before retrieving a list of documents.
   * @param data The list query data
   * @param options Extra options for the request
   *
   * @returns The list of documents
   */
  async onBeforeList?(
    data?: any,
    options?: {
      type?: "graphql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any[]>;

  /**
   * Hook that runs after returning a list of documents
   * @param data The list query data for the request
   * @param options Extra options for the request
   *
   * @returns The list of documents
   */
  async onAfterList?(
    data?: Partial<T>[],
    options?: {
      type?: "graphdql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any[]>;

  /**
   * Hook that runs before a document is retrieved.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The document data to be returned
   */
  onBeforeFind?(
    id?: string,
    options?: {
      type?: "graphql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;

  /**
   * Hook that runs after a document is retrieved.
   * @param data The input data for the request
   * @param options Extra options for the request
   *
   * @returns The document data to be returned
   */
  async onAfterFind?(
    data: any,
    options?: {
      type?: "graphdql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;
}
