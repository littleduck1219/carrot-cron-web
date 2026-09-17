/**
 * The published static app is read-only by default. Local authoring must opt
 * in with VITE_PUBLIC_DEMO=false so an unconfigured Vercel deployment cannot
 * accidentally expose post persistence.
 */
export const isPublicDemo = import.meta.env.VITE_PUBLIC_DEMO !== "false";
