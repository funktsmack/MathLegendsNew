// Resolves a public/-relative path against the app's base URL, so
// hardcoded image paths still work when deployed under a subpath
// (e.g. GitHub Pages project sites).
export const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
