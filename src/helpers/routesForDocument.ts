import type { APIRoute } from "astro";

export default function routesForDocument(
  model: any,
  options: { role?: string; [key: string]: any } = {}
) {
  const hookOptions = { type: "rest", ...options };

  const DELETE: APIRoute = async ({ params, locals }) => {
    const user = await locals.user();
    hookOptions.role = user?.customClaims?.role || null;
    const resource = new model();
    if (
      (typeof resource.onAuth === "function" &&
        !(await resource.onAuth("delete", params, hookOptions))) ||
      (model?.auth?.delete &&
        !model?.auth?.delete?.includes?.(hookOptions?.role))
    )
      return new Response("Permission Denied!", {
        status: 400,
      });
    let result = await resource.find(params?.id);
    if (typeof resource?.onBeforeDelete === "function")
      result = await resource.onBeforeDelete(result, {});

    if (!result)
      return new Response(
        "Document not deleted because of onBeforeDelete hook",
        {
          status: 400,
        }
      );

    try {
      await resource.delete(params?.id);
    } catch (e) {
      return new Response(e.message, { status: 400 });
    }

    if (typeof resource?.onAfterDelete === "function")
      result = await resource.onAfterDelete(result, hookOptions);
    return new Response(JSON.stringify(result));
  };

  const GET: APIRoute = async ({ params, request, locals }) => {
    const user = await locals.user();
    hookOptions.role = user?.customClaims?.role || null;
    const resource = new model();
    const url = new URL(request.url);
    for (const [key, value] of new URLSearchParams(url.search).entries()) {
      params[key] = value;
    }
    if (
      (typeof resource.onAuth === "function" &&
        !(await resource.onAuth("find", params, hookOptions))) ||
      (model?.auth?.find && !model?.auth?.find?.includes?.(hookOptions?.role))
    )
      return new Response("Permission Denied!", {
        status: 400,
      });
    let result =
      typeof resource?.onBeforeFind === "function"
        ? await resource.onBeforeFind(params?.id, hookOptions)
        : await resource.find(params?.id, params?.relationships);
    if (typeof resource?.onAfterFind === "function")
      result = await resource.onAfterFind(params?.id, hookOptions);
    return new Response(JSON.stringify(result));
  };

  const POST: APIRoute = async ({ params, request, locals }) => {
    const user = await locals.user();
    hookOptions.role = user?.customClaims?.role || null;
    const resource = new model();
    const requestInput = { ...(await request.json()), ...params };
    if (
      (typeof resource?.onAuth === "function" &&
        !(await resource.onAuth("update", requestInput, hookOptions))) ||
      (model?.auth?.update &&
        !model?.auth?.update?.includes?.(hookOptions?.role))
    )
      return new Response("Permission Denied!", {
        status: 400,
      });
    const docData =
      typeof resource?.onBeforeEdit === "function"
        ? await resource.onBeforeEdit(requestInput, hookOptions)
        : typeof resource?.onBeforeWrite === "function"
        ? await resource.onBeforeWrite(requestInput, hookOptions)
        : requestInput;
    if (docData === false) {
      return new Response("No data for doc!", {
        status: 400,
      });
    }

    const data = await resource.update(docData);

    return new Response(
      JSON.stringify(
        typeof resource?.onAfterEdit === "function"
          ? await resource.onAfterEdit(data, hookOptions)
          : typeof resource?.onAfterWrite === "function"
          ? await resource.onAfterWrite(data, hookOptions)
          : data
      )
    );
  };

  return {
    DELETE,
    GET,
    POST,
  };
}
