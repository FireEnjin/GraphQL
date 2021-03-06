import {
  ClassType,
  Authorized,
  Query,
  Arg,
  Ctx,
  Mutation,
  Resolver,
} from "type-graphql";
import ListQueryInput from "../inputs/ListQuery";
import uncapFirstLetter from "./uncapFirstLetter";

/**
 * Create basic CRUD functionality with resolvers
 * @param suffix The name of the model
 * @param returnType The model types
 * @param model The actual model class
 * @param inputType The input types
 */
export default function createResolver<T extends ClassType>(options: {
  modelName: string;
  collectionName: string;
  returnType: T;
  model: any;
  inputType: any;
  editType: any;
  listQueryInputType: any;
  listReturnType: any;
  findQueryName: string;
  listQueryName: string;
  addMutationName: string;
  editMutationName: string;
  deleteMutationName: string;
  auth?: {
    find?: string[];
    list?: string[];
    read?: string[];
    write?: string[];
    update?: string[];
    create?: string[];
    delete?: string[];
  };
}): any {
  const hookOptions = { type: "graphql" };
  if (options.inputType) {
    @Resolver(() => options.returnType)
    class CrudResolver {
      @Authorized(options?.auth?.find || options?.auth?.read || null)
      @Query(() => options.returnType, {
        nullable: true,
        description: `Get a specific ${options.modelName} document from the ${options.collectionName} collection.`,
      })
      async [options.findQueryName
        ? options.findQueryName
        : `${uncapFirstLetter(options.modelName)}`](
        @Arg("id") id: string,
        @Ctx() context?: any
      ): Promise<T> {
        const roles = options?.auth?.find || options?.auth?.read || null;
        if (
          options.model.onAuth &&
          typeof options.model.onAuth === "function" &&
          !(await options.model.onAuth(
            "find",
            {
              id,
            },
            {
              ...hookOptions,
              context,
              roles,
            }
          ))
        )
          return null;
        const doc =
          options.model.onBeforeFind &&
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

      @Authorized(options?.auth?.list || options?.auth?.read || null)
      @Query(
        () =>
          options.listReturnType
            ? options.listReturnType
            : [options.returnType],
        {
          nullable: true,
          description: `Get a list of ${options.modelName} documents from the ${options.collectionName} collection.`,
        }
      )
      async [options.listQueryName
        ? options.listQueryName
        : `${uncapFirstLetter(options.collectionName)}`](
        @Arg(
          "data",
          () =>
            options.listQueryInputType
              ? options.listQueryInputType
              : ListQueryInput,
          { nullable: true }
        )
        data?: any,
        @Ctx() context?: any
      ): Promise<any> {
        const roles = options?.auth?.list || options?.auth?.read || null;
        if (
          options.model.onAuth &&
          typeof options.model.onAuth === "function" &&
          !(await options.model.onAuth("list", data, {
            ...hookOptions,
            context,
            roles,
          }))
        )
          return null;
        const docs =
          options.model.onBeforeList &&
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

      @Authorized(options?.auth?.create || options?.auth?.write || null)
      @Mutation(() => options.returnType)
      async [options.addMutationName
        ? options.addMutationName
        : `add${options.modelName}`](
        @Arg("data", () => options.inputType, {
          description: `Add a new ${options.modelName} document to the ${options.collectionName} collection.`,
        })
        data: any,
        @Ctx() context?: any
      ) {
        const roles = options?.auth?.create || options?.auth?.write || null;
        if (
          options.model.onAuth &&
          typeof options.model.onAuth === "function" &&
          !(await options.model.onAuth("add", data, {
            ...hookOptions,
            context,
            roles,
          }))
        )
          return null;
        const docData =
          options.model.onBeforeAdd &&
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

      @Authorized(options?.auth?.update || options?.auth?.write || null)
      @Mutation(() => options.returnType)
      async [options.editMutationName
        ? options.editMutationName
        : `edit${options.modelName}`](
        @Arg("id", () => String, {
          description: `The ID of the ${options.modelName} document in the ${options.collectionName} collection`,
        })
        id: string,
        @Arg(
          "data",
          () => (options.editType ? options.editType : options.inputType),
          {
            description: `Update a ${options.modelName} document in the ${options.collectionName} collection.`,
          }
        )
        data: any,
        @Ctx() context?: any
      ) {
        const roles = options?.auth?.update || options?.auth?.write || null;
        if (
          options.model.onAuth &&
          typeof options.model.onAuth === "function" &&
          !(await options.model.onAuth(
            "edit",
            { ...data, id },
            {
              ...hookOptions,
              context,
              roles,
            }
          ))
        )
          return null;
        const docData =
          options.model.onBeforeEdit &&
          typeof options.model.onBeforeEdit === "function"
            ? await options.model.onBeforeEdit(
                { id, ...data },
                {
                  ...hookOptions,
                  context,
                  roles,
                }
              )
            : options.model.onBeforeWrite &&
              typeof options.model.onBeforeWrite === "function"
            ? await options.model.onBeforeWrite(
                { id, ...data },
                {
                  ...hookOptions,
                  context,
                  roles,
                }
              )
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

      @Authorized(options?.auth?.delete || options?.auth?.write || null)
      @Mutation(() => options.returnType)
      async [options.deleteMutationName
        ? options.deleteMutationName
        : `delete${options.modelName}`](
        @Arg("id", () => String, {
          description: `The ID of the ${options.modelName} document being deleted in the ${options.collectionName} collection`,
        })
        id: string,
        @Ctx() context?: any
      ) {
        const roles = options?.auth?.delete || options?.auth?.write || null;
        if (
          options.model.onAuth &&
          typeof options.model.onAuth === "function" &&
          !(await options.model.onAuth(
            "list",
            { id },
            {
              ...hookOptions,
              context,
              roles,
            }
          ))
        )
          return null;
        const modelBefore = await options.model.find(id);
        if (
          options.model.onBeforeDelete &&
          typeof options.model.onBeforeDelete === "function"
        ) {
          const res = await options.model.onBeforeDelete(
            {
              id,
              ...modelBefore,
            },
            { ...hookOptions, roles }
          );
          if (res === false) {
            return null;
          }
        }
        await options.model.delete(id);

        return options.model.onAfterDelete &&
          typeof options.model.onAfterDelete === "function"
          ? await options.model.onAfterDelete(
              { id, ...modelBefore },
              { ...hookOptions, roles }
            )
          : { id, ...modelBefore };
      }
    }

    return CrudResolver;
  } else {
    @Resolver(() => options.returnType)
    class BaseResolver {
      @Authorized(options?.auth?.find || options?.auth?.read || null)
      @Query(() => options.returnType, {
        nullable: true,
        description: `Get a specific ${options.modelName} document from the ${options.collectionName} collection.`,
      })
      async [options.findQueryName
        ? options.findQueryName
        : `${uncapFirstLetter(options.modelName)}`](
        @Arg("id") id: string,
        @Ctx() context?: any
      ): Promise<T> {
        const roles = options?.auth?.find || options?.auth?.read || null;
        if (
          options.model.onAuth &&
          typeof options.model.onAuth === "function" &&
          !(await options.model.onAuth(
            "find",
            {
              id,
            },
            {
              ...hookOptions,
              context,
              roles,
            }
          ))
        )
          return null;
        const doc =
          options.model.onBeforeFind &&
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

      @Authorized(options?.auth?.list || options?.auth?.read || null)
      @Query(
        () =>
          options.listReturnType
            ? options.listReturnType
            : [options.returnType],
        {
          nullable: true,
          description: `Get a list of ${options.modelName} documents from the ${options.collectionName} collection.`,
        }
      )
      async [options.listQueryName
        ? options.listQueryName
        : `${uncapFirstLetter(options.collectionName)}`](
        @Arg(
          "data",
          () =>
            options.listQueryInputType
              ? options.listQueryInputType
              : ListQueryInput,
          { nullable: true }
        )
        data?: any,
        @Ctx() context?: any
      ): Promise<any> {
        const roles = options?.auth?.list || options?.auth?.read || null;
        if (
          options.model.onAuth &&
          typeof options.model.onAuth === "function" &&
          !(await options.model.onAuth("list", data, {
            ...hookOptions,
            context,
            roles,
          }))
        )
          return null;

        const docs =
          options.model.onBeforeList &&
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
    }

    return BaseResolver;
  }
}
