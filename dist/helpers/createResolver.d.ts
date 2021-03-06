import { ClassType } from "type-graphql";
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
}): any;
