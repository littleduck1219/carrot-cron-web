/**
 * Public hosts compile with this flag. The authoring prototype remains
 * available locally, while the deployed sample never reads or mutates posts.
 */
export const isPublicDemo = import.meta.env.VITE_PUBLIC_DEMO === "true";
