import type { APIRoute } from "astro";
export default function routesForCollection(model: any, options?: {
    role?: string;
    [key: string]: any;
}): {
    GET: APIRoute;
    POST: APIRoute;
};
