import { GraphQLJSONObject } from "graphql-type-json";
import { Field, InputType } from "type-graphql";

@InputType({ description: "The default input to use for all list queries" })
export default class ListQueryInput {
  @Field({
    description: "The search query",
  })
  query?: string;
  @Field(() => [String], {
    description: "A list of tags to search for",
  })
  tags?: string[];
  @Field({
    description: "The number of results to return",
  })
  limit?: number;
  @Field({
    description: "Order the list of results by this field",
  })
  orderBy?: string;
  @Field(() => String!, {
    description: "The directions to order the results",
  })
  orderDirection?: "asc" | "desc";
  @Field(() => GraphQLJSONObject, {
    description: "Where a column matches a value",
  })
  whereEqual?: any;
  @Field(() => GraphQLJSONObject, {
    description: "Where a column is less than a value",
  })
  whereLessThan?: any;
  @Field(() => GraphQLJSONObject, {
    description: "Where a column is less than or equal to a value",
  })
  whereLessThanOrEqual?: any;
  @Field(() => GraphQLJSONObject, {
    description: "Where a column is greater than a value",
  })
  whereGreaterThan?: any;
  @Field(() => GraphQLJSONObject, {
    description: "Where a column is greater than or equal to a value",
  })
  whereGreaterThanOrEqual?: any;
  @Field(() => GraphQLJSONObject, {
    description: "Where a list of values for a column contains a value",
  })
  whereArrayContains?: any;
  @Field(() => GraphQLJSONObject, {
    description: "Where a column value is any of array of values",
  })
  whereArrayContainsAny?: any;
  @Field(() => GraphQLJSONObject, {
    description: "Where a column value is in an array of values",
  })
  whereIn?: any;
  @Field({
    description: "The ID of the last result from the current page",
  })
  next?: string;
  @Field({
    description: "The ID of the first result from the current",
  })
  back?: string;
  @Field({
    description: "The page of results to get",
  })
  page?: number;
}
