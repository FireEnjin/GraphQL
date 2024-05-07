import type { APIRoute } from "astro";

export default function routesForCollection(
  model: any,
  options: { role?: string; [key: string]: any } = {}
) {
  const hookOptions = { type: "rest", ...options };

  const GET: APIRoute = async ({ request }) => {
    const resource = new model();
    const url = new URL(request.url);
    const params = {};
    for (const [key, value] of new URLSearchParams(url.search).entries()) {
      params[key] = value;
    }
    if (
      (typeof resource.onAuth === "function" &&
        !(await resource.onAuth("list", params, hookOptions))) ||
      (model?.auth?.list && !model?.auth?.list?.includes?.(options?.role))
    )
      return new Response("Permission Denied!", {
        status: 400,
      });
    let results =
      typeof resource?.onBeforeList === "function"
        ? await resource.onBeforeList(params, {})
        : await resource.paginate(params);
    if (typeof resource?.onAfterList === "function")
      results = await resource.onAfterList(results, hookOptions);
    return new Response(
      JSON.stringify({
        results,
      })
    );
  };

  const POST: APIRoute = async ({ request }) => {
    const resource = new model();
    const requestInput = await request.json();
    if (
      (typeof resource?.onAuth === "function" &&
        !(await resource.onAuth("create", requestInput, hookOptions))) ||
      (model?.auth?.create && !model?.auth?.create?.includes?.(options?.role))
    )
      return new Response("Permission Denied!", {
        status: 400,
      });
    const docData =
      typeof resource?.onBeforeAdd === "function"
        ? await resource.onBeforeAdd(requestInput, hookOptions)
        : typeof resource?.onBeforeWrite === "function"
        ? await resource.onBeforeWrite(requestInput, hookOptions)
        : requestInput;
    if (docData === false) {
      return new Response("No data for doc!", {
        status: 400,
      });
    }

    const newDoc = await resource.create(docData);

    return new Response(
      JSON.stringify(
        typeof resource?.onAfterAdd === "function"
          ? await resource.onAfterAdd(newDoc, hookOptions)
          : typeof resource?.onAfterWrite === "function"
          ? await resource.onAfterWrite(newDoc, hookOptions)
          : newDoc
      )
    );
  };

  return {
    GET,
    POST,
  };
}
