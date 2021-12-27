export default class ListQueryInput {
    query?: string;
    tags?: string[];
    limit?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    whereEqual?: any;
    whereLessThan?: any;
    whereLessThanOrEqual?: any;
    whereGreaterThan?: any;
    whereGreaterThanOrEqual?: any;
    whereArrayContains?: any;
    whereArrayContainsAny?: any;
    whereIn?: any;
    next?: string;
    back?: string;
    page?: number;
}
