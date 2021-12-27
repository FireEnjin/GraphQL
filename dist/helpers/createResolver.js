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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const ListQuery_1 = __importDefault(require("../inputs/ListQuery"));
const uncapFirstLetter_1 = __importDefault(require("./uncapFirstLetter"));
/**
 * Create basic CRUD functionality with resolvers
 * @param suffix The name of the model
 * @param returnType The model types
 * @param model The actual model class
 * @param inputType The input types
 */
function createResolver(options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const hookOptions = { type: "graphql" };
    if (options.inputType) {
        let CrudResolver = class CrudResolver {
            async [_a = options.findQueryName
                ? options.findQueryName
                : `${uncapFirstLetter_1.default(options.modelName)}`](id, context) {
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("find", {
                        id,
                    }, {
                        ...hookOptions,
                        context,
                    })))
                    return null;
                const doc = options.model.onBeforeFind &&
                    typeof options.model.onBeforeFind === "function"
                    ? await options.model.onBeforeFind(id, { ...hookOptions, context })
                    : await options.model.find(id);
                return options.model.onAfterFind &&
                    typeof options.model.onAfterFind === "function"
                    ? await options.model.onAfterFind(doc, { ...hookOptions, context })
                    : doc;
            }
            async [_b = options.listQueryName
                ? options.listQueryName
                : `${uncapFirstLetter_1.default(options.collectionName)}`](data, context) {
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("list", data, {
                        ...hookOptions,
                        context,
                    })))
                    return null;
                const docs = options.model.onBeforeList &&
                    typeof options.model.onBeforeList === "function"
                    ? await options.model.onBeforeList(data, {
                        ...hookOptions,
                        context,
                    })
                    : await options.model.paginate(data, options.model.onPaginate, {
                        ...hookOptions,
                        context,
                    });
                return options.model.onAfterList &&
                    typeof options.model.onAfterList === "function"
                    ? await options.model.onAfterList(docs, {
                        ...hookOptions,
                        context,
                        requestData: data,
                    })
                    : docs;
            }
            async [_c = options.addMutationName
                ? options.addMutationName
                : `add${options.modelName}`](data, context) {
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("add", data, {
                        ...hookOptions,
                        context,
                    })))
                    return null;
                const docData = options.model.onBeforeAdd &&
                    typeof options.model.onBeforeAdd === "function"
                    ? await options.model.onBeforeAdd(data, {
                        ...hookOptions,
                        context,
                    })
                    : options.model.onBeforeWrite &&
                        typeof options.model.onBeforeWrite === "function"
                        ? await options.model.onBeforeWrite(data, {
                            ...hookOptions,
                            context,
                        })
                        : data;
                if (docData === false) {
                    return null;
                }
                const newDoc = await options.model.create(docData);
                return options.model.onAfterAdd &&
                    typeof options.model.onAfterAdd === "function"
                    ? await options.model.onAfterAdd(newDoc, {
                        ...hookOptions,
                        requestData: data,
                    })
                    : options.model.onAfterWrite &&
                        typeof options.model.onAfterWrite === "function"
                        ? await options.model.onAfterWrite(newDoc, {
                            ...hookOptions,
                            requestData: data,
                        })
                        : newDoc;
            }
            async [_d = options.editMutationName
                ? options.editMutationName
                : `edit${options.modelName}`](id, data, context) {
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("edit", { ...data, id }, {
                        ...hookOptions,
                        context,
                    })))
                    return null;
                const docData = options.model.onBeforeEdit &&
                    typeof options.model.onBeforeEdit === "function"
                    ? await options.model.onBeforeEdit({ id, ...data }, {
                        ...hookOptions,
                        context,
                    })
                    : options.model.onBeforeWrite &&
                        typeof options.model.onBeforeWrite === "function"
                        ? await options.model.onBeforeWrite({ id, ...data }, {
                            ...hookOptions,
                            context,
                        })
                        : data;
                if (docData === false) {
                    return null;
                }
                const doc = await options.model.update({ id, ...docData });
                return options.model.onAfterEdit &&
                    typeof options.model.onAfterEdit === "function"
                    ? await options.model.onAfterEdit(doc, {
                        ...hookOptions,
                        requestData: data,
                    })
                    : options.model.onAfterWrite &&
                        typeof options.model.onAfterWrite === "function"
                        ? await options.model.onAfterWrite(doc, {
                            ...hookOptions,
                            requestData: data,
                        })
                        : doc;
            }
            async [_e = options.deleteMutationName
                ? options.deleteMutationName
                : `delete${options.modelName}`](id, context) {
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("list", { id }, {
                        ...hookOptions,
                        context,
                    })))
                    return null;
                const modelBefore = await options.model.find(id);
                if (options.model.onBeforeDelete &&
                    typeof options.model.onBeforeDelete === "function") {
                    const res = await options.model.onBeforeDelete({
                        id,
                        ...modelBefore,
                    }, hookOptions);
                    if (res === false) {
                        return null;
                    }
                }
                await options.model.delete(id);
                return options.model.onAfterDelete &&
                    typeof options.model.onAfterDelete === "function"
                    ? await options.model.onAfterDelete({ id, ...modelBefore }, hookOptions)
                    : { id, ...modelBefore };
            }
        };
        __decorate([
            type_graphql_1.Authorized(options.authFind
                ? options.authFind
                : options.authRead
                    ? options.authRead
                    : []),
            type_graphql_1.Query((returns) => options.returnType, {
                nullable: true,
                description: `Get a specific ${options.modelName} document from the ${options.collectionName} collection.`,
            }),
            __param(0, type_graphql_1.Arg("id")),
            __param(1, type_graphql_1.Ctx()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [String, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _a, null);
        __decorate([
            type_graphql_1.Authorized(options.authList
                ? options.authList
                : options.authRead
                    ? options.authRead
                    : []),
            type_graphql_1.Query((returns) => options.listReturnType
                ? options.listReturnType
                : [options.returnType], {
                nullable: true,
                description: `Get a list of ${options.modelName} documents from the ${options.collectionName} collection.`,
            }),
            __param(0, type_graphql_1.Arg("data", () => options.listQueryInputType
                ? options.listQueryInputType
                : ListQuery_1.default, { nullable: true })),
            __param(1, type_graphql_1.Ctx()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _b, null);
        __decorate([
            type_graphql_1.Authorized(options.authCreate
                ? options.authCreate
                : options.authWrite
                    ? options.authWrite
                    : []),
            type_graphql_1.Mutation((returns) => options.returnType),
            __param(0, type_graphql_1.Arg("data", () => options.inputType, {
                description: `Add a new ${options.modelName} document to the ${options.collectionName} collection.`,
            })),
            __param(1, type_graphql_1.Ctx()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _c, null);
        __decorate([
            type_graphql_1.Authorized(options.authUpdate
                ? options.authUpdate
                : options.authWrite
                    ? options.authWrite
                    : []),
            type_graphql_1.Mutation((returns) => options.returnType),
            __param(0, type_graphql_1.Arg("id", () => String, {
                description: `The ID of the ${options.modelName} document in the ${options.collectionName} collection`,
            })),
            __param(1, type_graphql_1.Arg("data", () => (options.editType ? options.editType : options.inputType), {
                description: `Update a ${options.modelName} document in the ${options.collectionName} collection.`,
            })),
            __param(2, type_graphql_1.Ctx()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [String, Object, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _d, null);
        __decorate([
            type_graphql_1.Authorized(options.authDelete
                ? options.authDelete
                : options.authWrite
                    ? options.authWrite
                    : []),
            type_graphql_1.Mutation((returns) => options.returnType),
            __param(0, type_graphql_1.Arg("id", () => String, {
                description: `The ID of the ${options.modelName} document being deleted in the ${options.collectionName} collection`,
            })),
            __param(1, type_graphql_1.Ctx()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [String, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _e, null);
        CrudResolver = __decorate([
            type_graphql_1.Resolver((of) => options.returnType)
        ], CrudResolver);
        return CrudResolver;
    }
    else {
        let BaseResolver = class BaseResolver {
            async [_f = options.findQueryName
                ? options.findQueryName
                : `${uncapFirstLetter_1.default(options.modelName)}`](id, context) {
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("find", {
                        id,
                    }, {
                        ...hookOptions,
                        context,
                    })))
                    return null;
                const doc = options.model.onBeforeFind &&
                    typeof options.model.onBeforeFind === "function"
                    ? await options.model.onBeforeFind(id, { ...hookOptions, context })
                    : await options.model.find(id);
                return options.model.onAfterFind &&
                    typeof options.model.onAfterFind === "function"
                    ? await options.model.onAfterFind(doc, { ...hookOptions, context })
                    : doc;
            }
            async [_g = options.listQueryName
                ? options.listQueryName
                : `${uncapFirstLetter_1.default(options.collectionName)}`](data, context) {
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("list", data, {
                        ...hookOptions,
                        context,
                    })))
                    return null;
                const docs = options.model.onBeforeList &&
                    typeof options.model.onBeforeList === "function"
                    ? await options.model.onBeforeList(data, {
                        ...hookOptions,
                        context,
                    })
                    : await options.model.paginate(data, options.model.onPaginate, {
                        context,
                        roles: options.authList
                            ? options.authList
                            : options.authRead
                                ? options.authRead
                                : [],
                    });
                return options.model.onAfterList &&
                    typeof options.model.onAfterList === "function"
                    ? await options.model.onAfterList(docs, { ...hookOptions, context })
                    : docs;
            }
        };
        __decorate([
            type_graphql_1.Authorized(options.authFind
                ? options.authFind
                : options.authRead
                    ? options.authRead
                    : []),
            type_graphql_1.Query((returns) => options.returnType, {
                nullable: true,
                description: `Get a specific ${options.modelName} document from the ${options.collectionName} collection.`,
            }),
            __param(0, type_graphql_1.Arg("id")),
            __param(1, type_graphql_1.Ctx()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [String, Object]),
            __metadata("design:returntype", Promise)
        ], BaseResolver.prototype, _f, null);
        __decorate([
            type_graphql_1.Authorized(options.authList
                ? options.authList
                : options.authRead
                    ? options.authRead
                    : []),
            type_graphql_1.Query((returns) => options.listReturnType
                ? options.listReturnType
                : [options.returnType], {
                nullable: true,
                description: `Get a list of ${options.modelName} documents from the ${options.collectionName} collection.`,
            }),
            __param(0, type_graphql_1.Arg("data", () => options.listQueryInputType
                ? options.listQueryInputType
                : ListQuery_1.default, { nullable: true })),
            __param(1, type_graphql_1.Ctx()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object, Object]),
            __metadata("design:returntype", Promise)
        ], BaseResolver.prototype, _g, null);
        BaseResolver = __decorate([
            type_graphql_1.Resolver((of) => options.returnType)
        ], BaseResolver);
        return BaseResolver;
    }
}
exports.default = createResolver;
