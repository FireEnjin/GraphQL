"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function routesForCollection(model, options = {}) {
    const hookOptions = { type: "rest", ...options };
    const GET = async ({ request }) => {
        var _a, _b, _c, _d;
        const resource = new model();
        const url = new URL(request.url);
        const params = {};
        for (const [key, value] of new URLSearchParams(url.search).entries()) {
            params[key] = value;
        }
        if ((typeof resource.onAuth === "function" &&
            !(await resource.onAuth("list", params, hookOptions))) ||
            (((_a = model === null || model === void 0 ? void 0 : model.auth) === null || _a === void 0 ? void 0 : _a.list) && !((_d = (_c = (_b = model === null || model === void 0 ? void 0 : model.auth) === null || _b === void 0 ? void 0 : _b.list) === null || _c === void 0 ? void 0 : _c.includes) === null || _d === void 0 ? void 0 : _d.call(_c, options === null || options === void 0 ? void 0 : options.role))))
            return new Response("Permission Denied!", {
                status: 400,
            });
        let results = typeof (resource === null || resource === void 0 ? void 0 : resource.onBeforeList) === "function"
            ? await resource.onBeforeList(params, {})
            : await resource.paginate(params);
        if (typeof (resource === null || resource === void 0 ? void 0 : resource.onAfterList) === "function")
            results = await resource.onAfterList(results, hookOptions);
        return new Response(JSON.stringify({
            results,
        }));
    };
    const POST = async ({ request }) => {
        var _a, _b, _c, _d;
        const resource = new model();
        const requestInput = await request.json();
        if ((typeof (resource === null || resource === void 0 ? void 0 : resource.onAuth) === "function" &&
            !(await resource.onAuth("create", requestInput, hookOptions))) ||
            (((_a = model === null || model === void 0 ? void 0 : model.auth) === null || _a === void 0 ? void 0 : _a.create) && !((_d = (_c = (_b = model === null || model === void 0 ? void 0 : model.auth) === null || _b === void 0 ? void 0 : _b.create) === null || _c === void 0 ? void 0 : _c.includes) === null || _d === void 0 ? void 0 : _d.call(_c, options === null || options === void 0 ? void 0 : options.role))))
            return new Response("Permission Denied!", {
                status: 400,
            });
        const docData = typeof (resource === null || resource === void 0 ? void 0 : resource.onBeforeAdd) === "function"
            ? await resource.onBeforeAdd(requestInput, hookOptions)
            : typeof (resource === null || resource === void 0 ? void 0 : resource.onBeforeWrite) === "function"
                ? await resource.onBeforeWrite(requestInput, hookOptions)
                : requestInput;
        if (docData === false) {
            return new Response("No data for doc!", {
                status: 400,
            });
        }
        const newDoc = await resource.create(docData);
        return new Response(JSON.stringify(typeof (resource === null || resource === void 0 ? void 0 : resource.onAfterAdd) === "function"
            ? await resource.onAfterAdd(newDoc, hookOptions)
            : typeof (resource === null || resource === void 0 ? void 0 : resource.onAfterWrite) === "function"
                ? await resource.onAfterWrite(newDoc, hookOptions)
                : newDoc));
    };
    return {
        GET,
        POST,
    };
}
exports.default = routesForCollection;
