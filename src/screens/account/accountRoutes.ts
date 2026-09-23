export type AccountScreen = 'my' | 'sales';
export const accountHash = (routePrefix: string, screen: AccountScreen) => routePrefix + '/' + screen;
export const isAccountScreen = (screenRoute: string) => screenRoute === '#/my' || screenRoute === '#/sales';
