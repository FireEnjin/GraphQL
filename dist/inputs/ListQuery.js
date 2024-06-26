"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_type_json_1 = require("graphql-type-json");
const type_graphql_1 = require("type-graphql");
let ListQueryInput = class ListQueryInput {
};
__decorate([
    (0, type_graphql_1.Field)(() => String, {
        description: "The search query",
    }),
    __metadata("design:type", String)
], ListQueryInput.prototype, "query", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String], {
        description: "A list of tags to search for",
    }),
    __metadata("design:type", Array)
], ListQueryInput.prototype, "tags", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, {
        description: "The number of results to return",
    }),
    __metadata("design:type", Number)
], ListQueryInput.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)({
        description: "Order the list of results by this field",
    }),
    __metadata("design:type", String)
], ListQueryInput.prototype, "orderBy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, {
        description: "The directions to order the results",
    }),
    __metadata("design:type", String)
], ListQueryInput.prototype, "orderDirection", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, {
        description: "Where a column matches a value",
    }),
    __metadata("design:type", Object)
], ListQueryInput.prototype, "whereEqual", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, {
        description: "Where a column is less than a value",
    }),
    __metadata("design:type", Object)
], ListQueryInput.prototype, "whereLessThan", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, {
        description: "Where a column is less than or equal to a value",
    }),
    __metadata("design:type", Object)
], ListQueryInput.prototype, "whereLessThanOrEqual", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, {
        description: "Where a column is greater than a value",
    }),
    __metadata("design:type", Object)
], ListQueryInput.prototype, "whereGreaterThan", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, {
        description: "Where a column is greater than or equal to a value",
    }),
    __metadata("design:type", Object)
], ListQueryInput.prototype, "whereGreaterThanOrEqual", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, {
        description: "Where a list of values for a column contains a value",
    }),
    __metadata("design:type", Object)
], ListQueryInput.prototype, "whereArrayContains", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, {
        description: "Where a column value is any of array of values",
    }),
    __metadata("design:type", Object)
], ListQueryInput.prototype, "whereArrayContainsAny", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, {
        description: "Where a column value is in an array of values",
    }),
    __metadata("design:type", Object)
], ListQueryInput.prototype, "whereIn", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, {
        description: "The ID of the last result from the current page",
    }),
    __metadata("design:type", String)
], ListQueryInput.prototype, "next", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, {
        description: "The ID of the first result from the current",
    }),
    __metadata("design:type", String)
], ListQueryInput.prototype, "back", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Number, {
        description: "The page of results to get",
    }),
    __metadata("design:type", Number)
], ListQueryInput.prototype, "page", void 0);
ListQueryInput = __decorate([
    (0, type_graphql_1.InputType)({ description: "The default input to use for all list queries" })
], ListQueryInput);
exports.default = ListQueryInput;
