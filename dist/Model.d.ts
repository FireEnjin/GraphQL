import { IFireOrmQueryLine, IFirestoreVal, IOrderByParams, IEntity, IQueryBuilder } from "fireorm";
import { firestore } from "firebase-admin";
export default class<T extends IEntity> {
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
    };
    Resolver: any;
    collectionName: string;
    timestamps: boolean;
    constructor(options: {
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
    });
    /**
     * Paginate a collection to page results
     */
    paginate(options: {
        query?: string;
        orderBy?: string;
        limit?: number;
        next?: string;
        back?: string;
        whereEqual?: {
            [key: string]: any;
        };
        whereLessThan?: {
            [key: string]: any;
        };
        whereLessThanOrEqual?: {
            [key: string]: any;
        };
        whereGreaterThan?: {
            [key: string]: any;
        };
        whereGreaterThanOrEqual?: {
            [key: string]: any;
        };
        whereArrayContains?: {
            [key: string]: any;
        };
        whereArrayContainsAny?: {
            [key: string]: any;
        };
        whereIn?: {
            [key: string]: any;
        };
    }, onPaginate: (query: any, queryOptions: {
        orderBy?: string;
        limit?: number;
        next?: string;
        back?: string;
        whereEqual?: {
            [key: string]: any;
        };
        whereLessThan?: {
            [key: string]: any;
        };
        whereLessThanOrEqual?: {
            [key: string]: any;
        };
        whereGreaterThan?: {
            [key: string]: any;
        };
        whereGreaterThanOrEqual?: {
            [key: string]: any;
        };
        whereArrayContains?: {
            [key: string]: any;
        };
        whereArrayContainsAny?: {
            [key: string]: any;
        };
        whereIn?: {
            [key: string]: any;
        };
    }, hookOptions: {
        context: any;
        type: string;
    }) => any, hookOptions: {
        context: any;
        type: string;
    }): Promise<T[]>;
    /**
     * Create a new document and add it to the collection
     * @param modelObject The data to add to the document
     */
    create(modelObject: Partial<T>): Promise<T>;
    /**
     * Delete a document from a collection
     * @param id The id of the document to delete
     */
    delete(id: any): Promise<void>;
    /**
     * Execute a query on a collection
     * @param queries A list of queries
     * @param limitVal The limit of records to return
     * @param orderByObj The order of the records
     */
    execute(queries: IFireOrmQueryLine[], limitVal?: number, orderByObj?: IOrderByParams): Promise<T[]>;
    /**
     * Get a specific document's data
     * @param id The id of the document
     */
    find(id: string): Promise<T>;
    /**
     * Get the name of the collection the model is attached to
     */
    getCollectionName(): string;
    /**
     * Get the Firestore reference to the collection
     */
    ref(): firestore.CollectionReference<Partial<T>>;
    /**
     * Get the FireORM repo reference for the collection
     * @see https://fireorm.js.org/#/classes/basefirestorerepository
     */
    repo(): import("fireorm").BaseFirestoreRepository<T>;
    /**
     * Run a transaction on the collection
     * @param executor The transaction executor function
     */
    runTransaction(executor: any): Promise<unknown>;
    /**
     * Limit the number of records returned
     * @param limitTo The limit of data to return
     */
    limit(limitTo: number): IQueryBuilder<T>;
    /**
     * Order a list of documents by a specific property in ascending order
     * @param prop The property to order ascending by
     */
    orderByAscending(prop: any): IQueryBuilder<T>;
    /**
     * Order a list of documents by a specific property in descending order
     * @param prop The property to order descending by
     */
    orderByDescending(prop: any): IQueryBuilder<T>;
    /**
     * Update the data on a document from the collection
     * @param data The data to update on the document
     */
    update(data: Partial<T>): Promise<T>;
    /**
     * Get a list of documents where property equals value
     * @param prop The property to check eqaulity of
     * @param value The value to be equal to
     */
    whereEqualTo(prop: any, value: IFirestoreVal): IQueryBuilder<T>;
    /**
     * Get a list of documents where property greater than value
     * @param prop The property to check eqaulity of
     * @param value The value to be greater than to
     */
    whereGreaterThan(prop: any, value: IFirestoreVal): IQueryBuilder<T>;
    /**
     * Get a list of documents where property less than value
     * @param prop The property to check eqaulity of
     * @param value The value to be less than to
     */
    whereLessThan(prop: any, value: IFirestoreVal): IQueryBuilder<T>;
    /**
     * Get a list of documents where property less than or equal to value
     * @param prop The property to check eqaulity of
     * @param value The value to be less than or equal to
     */
    whereLessOrEqualThan(prop: any, value: IFirestoreVal): IQueryBuilder<T>;
    /**
     * Get a list of documents where property is equal to one of a list of values
     * @param prop The property to search for values
     * @param value The values to check for
     */
    whereArrayContains(prop: any, value: IFirestoreVal): IQueryBuilder<T>;
    /**
     * Hook that runs before a document is added. If it returns a falsey value it will stop the creation return null.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The content to be merged with the existing document
     */
    onBeforeAdd?(data?: any, options?: {
        type?: "graphql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
    /**
     * Hook that runs after a document is added.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The document data to be returned
     */
    onAfterAdd?(data?: Partial<T>, options?: {
        type?: "graphdql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
    /**
     * Hook that runs before a document is edited. If it returns a falsey value it will stop the edit return null.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The content to be merged with the existing document
     */
    onBeforeEdit?(data?: any, options?: {
        type?: "graphql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
    /**
     * Hook that runs after a document is edited.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The document data to be returned
     */
    onAfterEdit?(data?: Partial<T>, options?: {
        type?: "graphdql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
    /**
     * Hook that runs before a document is written. If it returns a falsey value it will stop the write return null.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The content to be merged with the existing document
     */
    onBeforeWrite?(data?: any, options?: {
        type?: "graphql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
    /**
     * Hook that runs after a document is written.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The document data to be returned
     */
    onAfterWrite?(data?: Partial<T>, options?: {
        type?: "graphdql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
    /**
     * Hook that runs before a document is deleted. If it returns a falsey value it will stop the delete return null.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The document that was deleted
     */
    onBeforeDelete?(data?: Partial<T>, options?: {
        type?: "graphql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
    /**
     * Hook that runs after a document is deleted.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The document data to be returned
     */
    onAfterDelete?(data?: Partial<T>, options?: {
        type?: "graphdql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
    /**
     * Hook that runs before retrieving a list of documents.
     * @param data The list query data
     * @param options Extra options for the request
     *
     * @returns The list of documents
     */
    onBeforeList?(data?: any, options?: {
        type?: "graphql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any[]>;
    /**
     * Hook that runs after returning a list of documents
     * @param data The list query data for the request
     * @param options Extra options for the request
     *
     * @returns The list of documents
     */
    onAfterList?(data?: Partial<T>[], options?: {
        type?: "graphdql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any[]>;
    /**
     * Hook that runs before a document is retrieved.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The document data to be returned
     */
    onBeforeFind?(id?: string, options?: {
        type?: "graphql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
    /**
     * Hook that runs after a document is retrieved.
     * @param data The input data for the request
     * @param options Extra options for the request
     *
     * @returns The document data to be returned
     */
    onAfterFind?(id?: string, options?: {
        type?: "graphdql" | "rest";
        requestData?: any;
        context?: any;
        roles?: string[];
    }): Promise<any>;
}
