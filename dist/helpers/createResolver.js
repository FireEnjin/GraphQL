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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var _q, _r, _s, _t, _u, _v, _w;
    const hookOptions = { type: "graphql" };
    if (options.inputType) {
        let CrudResolver = class CrudResolver {
            async [_q = options.findQueryName
                ? options.findQueryName
                : `${(0, uncapFirstLetter_1.default)(options.modelName)}`](id, context) {
                var _a, _b;
                const roles = ((_a = options === null || options === void 0 ? void 0 : options.auth) === null || _a === void 0 ? void 0 : _a.find) || ((_b = options === null || options === void 0 ? void 0 : options.auth) === null || _b === void 0 ? void 0 : _b.read) || null;
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("find", {
                        id,
                    }, {
                        ...hookOptions,
                        context,
                        roles,
                    })))
                    return null;
                const doc = options.model.onBeforeFind &&
                    typeof options.model.onBeforeFind === "function"
                    ? await options.model.onBeforeFind(id, {
                        ...hookOptions,
                        context,
                        roles,
                    })
                    : await options.model.find(id);
                return options.model.onAfterFind &&
                    typeof options.model.onAfterFind === "function"
                    ? await options.model.onAfterFind(doc, {
                        ...hookOptions,
                        context,
                        roles,
                    })
                    : doc;
            }
            async [_r = options.listQueryName
                ? options.listQueryName
                : `${(0, uncapFirstLetter_1.default)(options.collectionName)}`](data, context) {
                var _a, _b;
                const roles = ((_a = options === null || options === void 0 ? void 0 : options.auth) === null || _a === void 0 ? void 0 : _a.list) || ((_b = options === null || options === void 0 ? void 0 : options.auth) === null || _b === void 0 ? void 0 : _b.read) || null;
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("list", data, {
                        ...hookOptions,
                        context,
                        roles,
                    })))
                    return null;
                const docs = options.model.onBeforeList &&
                    typeof options.model.onBeforeList === "function"
                    ? await options.model.onBeforeList(data, {
                        ...hookOptions,
                        context,
                        roles,
                    })
                    : await options.model.paginate(data, options.model.onPaginate, {
                        ...hookOptions,
                        context,
                        roles,
                    });
                return options.model.onAfterList &&
                    typeof options.model.onAfterList === "function"
                    ? await options.model.onAfterList(docs, {
                        ...hookOptions,
                        context,
                        requestData: data,
                        roles,
                    })
                    : docs;
            }
            async [_s = options.addMutationName
                ? options.addMutationName
                : `add${options.modelName}`](data, context) {
                var _a, _b;
                const roles = ((_a = options === null || options === void 0 ? void 0 : options.auth) === null || _a === void 0 ? void 0 : _a.create) || ((_b = options === null || options === void 0 ? void 0 : options.auth) === null || _b === void 0 ? void 0 : _b.write) || null;
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("add", data, {
                        ...hookOptions,
                        context,
                        roles,
                    })))
                    return null;
                const docData = options.model.onBeforeAdd &&
                    typeof options.model.onBeforeAdd === "function"
                    ? await options.model.onBeforeAdd(data, {
                        ...hookOptions,
                        context,
                        roles,
                    })
                    : options.model.onBeforeWrite &&
                        typeof options.model.onBeforeWrite === "function"
                        ? await options.model.onBeforeWrite(data, {
                            ...hookOptions,
                            context,
                            roles,
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
                        roles,
                    })
                    : options.model.onAfterWrite &&
                        typeof options.model.onAfterWrite === "function"
                        ? await options.model.onAfterWrite(newDoc, {
                            ...hookOptions,
                            requestData: data,
                            roles,
                        })
                        : newDoc;
            }
            async [_t = options.editMutationName
                ? options.editMutationName
                : `edit${options.modelName}`](id, data, context) {
                var _a, _b;
                const roles = ((_a = options === null || options === void 0 ? void 0 : options.auth) === null || _a === void 0 ? void 0 : _a.update) || ((_b = options === null || options === void 0 ? void 0 : options.auth) === null || _b === void 0 ? void 0 : _b.write) || null;
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("edit", { ...data, id }, {
                        ...hookOptions,
                        context,
                        roles,
                    })))
                    return null;
                const docData = options.model.onBeforeEdit &&
                    typeof options.model.onBeforeEdit === "function"
                    ? await options.model.onBeforeEdit({ id, ...data }, {
                        ...hookOptions,
                        context,
                        roles,
                    })
                    : options.model.onBeforeWrite &&
                        typeof options.model.onBeforeWrite === "function"
                        ? await options.model.onBeforeWrite({ id, ...data }, {
                            ...hookOptions,
                            context,
                            roles,
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
                        roles,
                    })
                    : options.model.onAfterWrite &&
                        typeof options.model.onAfterWrite === "function"
                        ? await options.model.onAfterWrite(doc, {
                            ...hookOptions,
                            requestData: data,
                            roles,
                        })
                        : doc;
            }
            async [_u = options.deleteMutationName
                ? options.deleteMutationName
                : `delete${options.modelName}`](id, context) {
                var _a, _b;
                const roles = ((_a = options === null || options === void 0 ? void 0 : options.auth) === null || _a === void 0 ? void 0 : _a.delete) || ((_b = options === null || options === void 0 ? void 0 : options.auth) === null || _b === void 0 ? void 0 : _b.write) || null;
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("list", { id }, {
                        ...hookOptions,
                        context,
                        roles,
                    })))
                    return null;
                const modelBefore = await options.model.find(id);
                if (options.model.onBeforeDelete &&
                    typeof options.model.onBeforeDelete === "function") {
                    const res = await options.model.onBeforeDelete({
                        id,
                        ...modelBefore,
                    }, { ...hookOptions, roles });
                    if (res === false) {
                        return null;
                    }
                }
                await options.model.delete(id);
                return options.model.onAfterDelete &&
                    typeof options.model.onAfterDelete === "function"
                    ? await options.model.onAfterDelete({ id, ...modelBefore }, { ...hookOptions, roles })
                    : { id, ...modelBefore };
            }
        };
        __decorate([
            (0, type_graphql_1.Authorized)(((_a = options === null || options === void 0 ? void 0 : options.auth) === null || _a === void 0 ? void 0 : _a.find) || ((_b = options === null || options === void 0 ? void 0 : options.auth) === null || _b === void 0 ? void 0 : _b.read) || null),
            (0, type_graphql_1.Query)(() => options.returnType, {
                nullable: true,
                description: `Get a specific ${options.modelName} document from the ${options.collectionName} collection.`,
            }),
            __param(0, (0, type_graphql_1.Arg)("id")),
            __param(1, (0, type_graphql_1.Ctx)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [String, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _q, null);
        __decorate([
            (0, type_graphql_1.Authorized)(((_c = options === null || options === void 0 ? void 0 : options.auth) === null || _c === void 0 ? void 0 : _c.list) || ((_d = options === null || options === void 0 ? void 0 : options.auth) === null || _d === void 0 ? void 0 : _d.read) || null),
            (0, type_graphql_1.Query)(() => options.listReturnType
                ? options.listReturnType
                : [options.returnType], {
                nullable: true,
                description: `Get a list of ${options.modelName} documents from the ${options.collectionName} collection.`,
            }),
            __param(0, (0, type_graphql_1.Arg)("data", () => options.listQueryInputType
                ? options.listQueryInputType
                : ListQuery_1.default, { nullable: true })),
            __param(1, (0, type_graphql_1.Ctx)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _r, null);
        __decorate([
            (0, type_graphql_1.Authorized)(((_e = options === null || options === void 0 ? void 0 : options.auth) === null || _e === void 0 ? void 0 : _e.create) || ((_f = options === null || options === void 0 ? void 0 : options.auth) === null || _f === void 0 ? void 0 : _f.write) || null),
            (0, type_graphql_1.Mutation)(() => options.returnType),
            __param(0, (0, type_graphql_1.Arg)("data", () => options.inputType, {
                description: `Add a new ${options.modelName} document to the ${options.collectionName} collection.`,
            })),
            __param(1, (0, type_graphql_1.Ctx)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _s, null);
        __decorate([
            (0, type_graphql_1.Authorized)(((_g = options === null || options === void 0 ? void 0 : options.auth) === null || _g === void 0 ? void 0 : _g.update) || ((_h = options === null || options === void 0 ? void 0 : options.auth) === null || _h === void 0 ? void 0 : _h.write) || null),
            (0, type_graphql_1.Mutation)(() => options.returnType),
            __param(0, (0, type_graphql_1.Arg)("id", () => String, {
                description: `The ID of the ${options.modelName} document in the ${options.collectionName} collection`,
            })),
            __param(1, (0, type_graphql_1.Arg)("data", () => (options.editType ? options.editType : options.inputType), {
                description: `Update a ${options.modelName} document in the ${options.collectionName} collection.`,
            })),
            __param(2, (0, type_graphql_1.Ctx)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [String, Object, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _t, null);
        __decorate([
            (0, type_graphql_1.Authorized)(((_j = options === null || options === void 0 ? void 0 : options.auth) === null || _j === void 0 ? void 0 : _j.delete) || ((_k = options === null || options === void 0 ? void 0 : options.auth) === null || _k === void 0 ? void 0 : _k.write) || null),
            (0, type_graphql_1.Mutation)(() => options.returnType),
            __param(0, (0, type_graphql_1.Arg)("id", () => String, {
                description: `The ID of the ${options.modelName} document being deleted in the ${options.collectionName} collection`,
            })),
            __param(1, (0, type_graphql_1.Ctx)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [String, Object]),
            __metadata("design:returntype", Promise)
        ], CrudResolver.prototype, _u, null);
        CrudResolver = __decorate([
            (0, type_graphql_1.Resolver)(() => options.returnType)
        ], CrudResolver);
        return CrudResolver;
    }
    else {
        let BaseResolver = class BaseResolver {
            async [_v = options.findQueryName
                ? options.findQueryName
                : `${(0, uncapFirstLetter_1.default)(options.modelName)}`](id, context) {
                var _a, _b;
                const roles = ((_a = options === null || options === void 0 ? void 0 : options.auth) === null || _a === void 0 ? void 0 : _a.find) || ((_b = options === null || options === void 0 ? void 0 : options.auth) === null || _b === void 0 ? void 0 : _b.read) || null;
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("find", {
                        id,
                    }, {
                        ...hookOptions,
                        context,
                        roles,
                    })))
                    return null;
                const doc = options.model.onBeforeFind &&
                    typeof options.model.onBeforeFind === "function"
                    ? await options.model.onBeforeFind(id, {
                        ...hookOptions,
                        context,
                        roles,
                    })
                    : await options.model.find(id);
                return options.model.onAfterFind &&
                    typeof options.model.onAfterFind === "function"
                    ? await options.model.onAfterFind(doc, {
                        ...hookOptions,
                        context,
                        roles,
                    })
                    : doc;
            }
            async [_w = options.listQueryName
                ? options.listQueryName
                : `${(0, uncapFirstLetter_1.default)(options.collectionName)}`](data, context) {
                var _a, _b;
                const roles = ((_a = options === null || options === void 0 ? void 0 : options.auth) === null || _a === void 0 ? void 0 : _a.list) || ((_b = options === null || options === void 0 ? void 0 : options.auth) === null || _b === void 0 ? void 0 : _b.read) || null;
                if (options.model.onAuth &&
                    typeof options.model.onAuth === "function" &&
                    !(await options.model.onAuth("list", data, {
                        ...hookOptions,
                        context,
                        roles,
                    })))
                    return null;
                const docs = options.model.onBeforeList &&
                    typeof options.model.onBeforeList === "function"
                    ? await options.model.onBeforeList(data, {
                        ...hookOptions,
                        context,
                        roles,
                    })
                    : await options.model.paginate(data, options.model.onPaginate, {
                        context,
                        roles,
                    });
                return options.model.onAfterList &&
                    typeof options.model.onAfterList === "function"
                    ? await options.model.onAfterList(docs, {
                        ...hookOptions,
                        context,
                        roles,
                    })
                    : docs;
            }
        };
        __decorate([
            (0, type_graphql_1.Authorized)(((_l = options === null || options === void 0 ? void 0 : options.auth) === null || _l === void 0 ? void 0 : _l.find) || ((_m = options === null || options === void 0 ? void 0 : options.auth) === null || _m === void 0 ? void 0 : _m.read) || null),
            (0, type_graphql_1.Query)(() => options.returnType, {
                nullable: true,
                description: `Get a specific ${options.modelName} document from the ${options.collectionName} collection.`,
            }),
            __param(0, (0, type_graphql_1.Arg)("id")),
            __param(1, (0, type_graphql_1.Ctx)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [String, Object]),
            __metadata("design:returntype", Promise)
        ], BaseResolver.prototype, _v, null);
        __decorate([
            (0, type_graphql_1.Authorized)(((_o = options === null || options === void 0 ? void 0 : options.auth) === null || _o === void 0 ? void 0 : _o.list) || ((_p = options === null || options === void 0 ? void 0 : options.auth) === null || _p === void 0 ? void 0 : _p.read) || null),
            (0, type_graphql_1.Query)(() => options.listReturnType
                ? options.listReturnType
                : [options.returnType], {
                nullable: true,
                description: `Get a list of ${options.modelName} documents from the ${options.collectionName} collection.`,
            }),
            __param(0, (0, type_graphql_1.Arg)("data", () => options.listQueryInputType
                ? options.listQueryInputType
                : ListQuery_1.default, { nullable: true })),
            __param(1, (0, type_graphql_1.Ctx)()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object, Object]),
            __metadata("design:returntype", Promise)
        ], BaseResolver.prototype, _w, null);
        BaseResolver = __decorate([
            (0, type_graphql_1.Resolver)(() => options.returnType)
        ], BaseResolver);
        return BaseResolver;
    }
}
exports.default = createResolver;
