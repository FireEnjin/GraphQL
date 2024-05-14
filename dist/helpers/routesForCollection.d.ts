import type { APIRoute } from "astro";
export default function routesForCollection(model: any, options?: any): {
    GET: APIRoute;
    POST: APIRoute;
};
