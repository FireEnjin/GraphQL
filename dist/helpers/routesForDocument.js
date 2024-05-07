"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function routesForDocument(model, options = {}) {
    const hookOptions = { type: "rest", ...options };
    const DELETE = async ({ params, request }) => {
        var _a, _b, _c, _d;
        const resource = new model();
        if ((typeof resource.onAuth === "function" &&
            !(await resource.onAuth("delete", params, hookOptions))) || (((_a = model === null || model === void 0 ? void 0 : model.auth) === null || _a === void 0 ? void 0 : _a.delete) && !((_d = (_c = (_b = model === null || model === void 0 ? void 0 : model.auth) === null || _b === void 0 ? void 0 : _b.delete) === null || _c === void 0 ? void 0 : _c.includes) === null || _d === void 0 ? void 0 : _d.call(_c, options === null || options === void 0 ? void 0 : options.role))))
            return new Response("Permission Denied!", {
                status: 400,
            });
        let result = await resource.find(params === null || params === void 0 ? void 0 : params.id);
        if (typeof (resource === null || resource === void 0 ? void 0 : resource.onBeforeDelete) === "function")
            result = await resource.onBeforeDelete(result, {});
        if (!result)
            return new Response("Document not deleted because of onBeforeDelete hook", {
                status: 400,
            });
        try {
            await resource.delete(params === null || params === void 0 ? void 0 : params.id);
        }
        catch (e) {
            return new Response(e.message, { status: 400 });
        }
        if (typeof (resource === null || resource === void 0 ? void 0 : resource.onAfterDelete) === "function")
            result = await resource.onAfterDelete(result, hookOptions);
        return new Response(JSON.stringify(result));
    };
    const GET = async ({ params, request }) => {
        var _a, _b, _c, _d;
        const resource = new model();
        const url = new URL(request.url);
        for (const [key, value] of new URLSearchParams(url.search).entries()) {
            params[key] = value;
        }
        if ((typeof resource.onAuth === "function" &&
            !(await resource.onAuth("find", params, hookOptions))) || (((_a = model === null || model === void 0 ? void 0 : model.auth) === null || _a === void 0 ? void 0 : _a.find) && !((_d = (_c = (_b = model === null || model === void 0 ? void 0 : model.auth) === null || _b === void 0 ? void 0 : _b.find) === null || _c === void 0 ? void 0 : _c.includes) === null || _d === void 0 ? void 0 : _d.call(_c, options === null || options === void 0 ? void 0 : options.role))))
            return new Response("Permission Denied!", {
                status: 400,
            });
        let result = typeof (resource === null || resource === void 0 ? void 0 : resource.onBeforeFind) === "function"
            ? await resource.onBeforeFind(params === null || params === void 0 ? void 0 : params.id, hookOptions)
            : await resource.find(params === null || params === void 0 ? void 0 : params.id, params === null || params === void 0 ? void 0 : params.relationships);
        if (typeof (resource === null || resource === void 0 ? void 0 : resource.onAfterFind) === "function")
            result = await resource.onAfterFind(params === null || params === void 0 ? void 0 : params.id, hookOptions);
        return new Response(JSON.stringify(result));
    };
    const POST = async ({ params, request }) => {
        var _a, _b, _c, _d;
        const resource = new model();
        const requestInput = { ...await request.json(), ...params };
        if ((typeof (resource === null || resource === void 0 ? void 0 : resource.onAuth) === "function" &&
            !(await resource.onAuth("update", requestInput, hookOptions))) || (((_a = model === null || model === void 0 ? void 0 : model.auth) === null || _a === void 0 ? void 0 : _a.update) && !((_d = (_c = (_b = model === null || model === void 0 ? void 0 : model.auth) === null || _b === void 0 ? void 0 : _b.update) === null || _c === void 0 ? void 0 : _c.includes) === null || _d === void 0 ? void 0 : _d.call(_c, options === null || options === void 0 ? void 0 : options.role))))
            return new Response("Permission Denied!", {
                status: 400,
            });
        const docData = typeof (resource === null || resource === void 0 ? void 0 : resource.onBeforeEdit) === "function"
            ? await resource.onBeforeEdit(requestInput, hookOptions)
            : typeof (resource === null || resource === void 0 ? void 0 : resource.onBeforeWrite) === "function"
                ? await resource.onBeforeWrite(requestInput, hookOptions)
                : requestInput;
        if (docData === false) {
            return new Response("No data for doc!", {
                status: 400,
            });
        }
        const data = await resource.update(docData);
        return new Response(JSON.stringify(typeof (resource === null || resource === void 0 ? void 0 : resource.onAfterEdit) === "function"
            ? await resource.onAfterEdit(data, hookOptions)
            : typeof (resource === null || resource === void 0 ? void 0 : resource.onAfterWrite) === "function"
                ? await resource.onAfterWrite(data, hookOptions)
                : data));
    };
    return {
        DELETE,
        GET,
        POST,
    };
}
exports.default = routesForDocument;
