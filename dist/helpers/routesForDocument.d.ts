import type { APIRoute } from "astro";
export default function routesForDocument(model: any, options?: {
    role?: string;
    [key: string]: any;
}): {
    DELETE: APIRoute;
    GET: APIRoute;
    POST: APIRoute;
};
