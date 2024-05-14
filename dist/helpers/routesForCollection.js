"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function routesForCollection(model, options = {}) {
    const hookOptions = { type: "rest", ...options };
    const GET = async ({ request, locals }) => {
        var _a, _b, _c, _d, _e;
        const user = await locals.user();
        hookOptions.role = ((_a = user === null || user === void 0 ? void 0 : user.customClaims) === null || _a === void 0 ? void 0 : _a.role) || null;
        const resource = new model();
        const url = new URL(request.url);
        const params = {};
        for (const [key, value] of new URLSearchParams(url.search).entries()) {
            params[key] = value;
        }
        if ((typeof resource.onAuth === "function" &&
            !(await resource.onAuth("list", params, hookOptions))) ||
            (((_b = resource === null || resource === void 0 ? void 0 : resource.auth) === null || _b === void 0 ? void 0 : _b.list) &&
                !((_e = (_d = (_c = resource === null || resource === void 0 ? void 0 : resource.auth) === null || _c === void 0 ? void 0 : _c.list) === null || _d === void 0 ? void 0 : _d.includes) === null || _e === void 0 ? void 0 : _e.call(_d, hookOptions.role))))
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
    const POST = async ({ request, locals }) => {
        var _a, _b, _c, _d, _e;
        const user = await locals.user();
        hookOptions.role = ((_a = user === null || user === void 0 ? void 0 : user.customClaims) === null || _a === void 0 ? void 0 : _a.role) || null;
        const resource = new model();
        const requestInput = await request.json();
        if ((typeof (resource === null || resource === void 0 ? void 0 : resource.onAuth) === "function" &&
            !(await resource.onAuth("create", requestInput, hookOptions))) ||
            (((_b = resource === null || resource === void 0 ? void 0 : resource.auth) === null || _b === void 0 ? void 0 : _b.create) &&
                !((_e = (_d = (_c = resource === null || resource === void 0 ? void 0 : resource.auth) === null || _c === void 0 ? void 0 : _c.create) === null || _d === void 0 ? void 0 : _d.includes) === null || _e === void 0 ? void 0 : _e.call(_d, hookOptions === null || hookOptions === void 0 ? void 0 : hookOptions.role))))
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
