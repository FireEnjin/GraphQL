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

export default class<T extends IEntity> {
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

  /**
   * Paginate a collection to page results
   */
  async paginate(
    options: {
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
    } = {},
    onPaginate?: (
      query,
      queryOptions: {
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
      },
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
    let query = this.ref() as any;
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
    } else if (this.timestamps && !this.order) {
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
          query = query.where(
            whereKey,
            operatorMap[where],
            isValid(parseISO(options[where][whereKey]))
              ? new Date(Date.parse(options[where][whereKey]))
              : options[where][whereKey]
          );
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
        const docData: any = lastDoc.data();
        query = query[options.next ? "startAfter" : "endBefore"](
          orderBy ? docData[orderBy.split(":")[0]] : docData.createdAt
        );
      }
    }

    if (options.limit && !options?.query?.length) {
      query = query.limit(+options.limit);
    }

    const output = [];
    const res = await query.get();
    for (const doc of res.docs) {
      const entity = { ...doc.data(), id: doc.id };
      if (entity.createdAt && this.timestamps) {
        entity.createdAt = (entity.createdAt.toDate() as Date).toISOString();
      }
      if (entity.updatedAt && this.timestamps) {
        entity.updatedAt = (entity.updatedAt.toDate() as Date).toISOString();
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
        ? { createdAt: new Date(), ...modelObject }
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
   */
  async find<I = T>(id?: string) {
    return (id ? this.repo().findById(id) : this.repo().find()) as I;
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
  repo() {
    return getRepository<T>(this.options.docSchema);
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
    id?: string,
    options?: {
      type?: "graphdql" | "rest";
      requestData?: any;
      context?: any;
      roles?: string[];
    }
  ): Promise<any>;
}
