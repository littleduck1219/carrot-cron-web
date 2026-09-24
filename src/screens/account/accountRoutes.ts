export type AccountScreen = 'my' | 'sales' | 'purchases';
export const accountHash = (routePrefix: string, screen: AccountScreen) => routePrefix + '/' + screen;
export const historyHash = (routePrefix: string, postKey: string) => `${routePrefix}/sales/history/${encodeURIComponent(postKey)}`;
export const historyKeyFromRoute = (screenRoute: string) => screenRoute.startsWith('#/sales/history/') ? decodeURIComponent(screenRoute.slice('#/sales/history/'.length)) : null;
export const isAccountScreen = (screenRoute: string) => screenRoute === '#/my' || screenRoute === '#/sales' || screenRoute === '#/purchases' || historyKeyFromRoute(screenRoute) !== null;
