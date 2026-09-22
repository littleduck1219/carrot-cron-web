// Session-only record of paid direct purchases (item id → buyer id), so the buyer's detail switches 질문하기 → 채팅하기 after payment.
const KEY = 're-carrot.purchases.session.v2';
const read = (): Record<string, string> => { try { return JSON.parse(sessionStorage.getItem(KEY) ?? '{}'); } catch { return {}; } };
const write = (value: Record<string, string>) => { try { sessionStorage.setItem(KEY, JSON.stringify(value)); } catch { /* The in-memory state still drives this session. */ } };
export const isPurchased = (id: string, buyerId: string) => read()[id] === buyerId;
export const markPurchased = (id: string, buyerId: string) => write({ ...read(), [id]: buyerId });
export const clearPurchase = (id: string) => { const value = read(); delete value[id]; write(value); };

// Session-only record of completed deals: item id → buyer id. Set from the chat's hidden partner-name control.
const DONE = 're-carrot.completed.session.v1';
const readDone = (): Record<string, string> => { try { return JSON.parse(sessionStorage.getItem(DONE) ?? '{}'); } catch { return {}; } };
const writeDone = (value: Record<string, string>) => { try { sessionStorage.setItem(DONE, JSON.stringify(value)); } catch { /* Storage can be unavailable in private browsing. */ } };
export const getCompletedBuyer = (id: string): string | null => readDone()[id] ?? null;
export const markCompleted = (id: string, buyerId: string) => writeDone({ ...readDone(), [id]: buyerId });

// Session-only per-item sales for planned posts: post key → { itemId: sold quantity }, plus the current (cancellable) order.
const SALES = 're-carrot.item-sales.session.v1';
const ORDER = 're-carrot.item-order.session.v1';
type Quantities = Record<string, number>;
const readMap = (key: string): Record<string, Quantities> => { try { return JSON.parse(sessionStorage.getItem(key) ?? '{}'); } catch { return {}; } };
const writeMap = (key: string, value: Record<string, Quantities>) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* in-memory state still drives this session */ } };
export const getSoldItems = (id: string): Quantities => readMap(SALES)[id] ?? {};
/** Records a paid order: adds to the sold counts and remembers it so a cancellation can restore the items. */
export const addOrder = (id: string, order: Quantities) => {
    const sales = readMap(SALES); const sold = { ...(sales[id] ?? {}) };
    for (const [item, qty] of Object.entries(order)) sold[item] = (sold[item] ?? 0) + qty;
    writeMap(SALES, { ...sales, [id]: sold }); writeMap(ORDER, { ...readMap(ORDER), [id]: order });
};
export const cancelOrder = (id: string) => {
    const orders = readMap(ORDER); const order = orders[id]; if (!order) return;
    const sales = readMap(SALES); const sold = { ...(sales[id] ?? {}) };
    for (const [item, qty] of Object.entries(order)) sold[item] = Math.max(0, (sold[item] ?? 0) - qty);
    delete orders[id]; writeMap(SALES, { ...sales, [id]: sold }); writeMap(ORDER, orders);
};
export const isSoldOut = (id: string, items: { id: string; quantity: number }[]) => { const sold = getSoldItems(id); return items.length > 0 && items.every(item => item.quantity - (sold[item.id] ?? 0) < 1); };

/** Restores a deal to its initial state so the purchase and completion flow can be run again. */
export const resetDeal = (id: string) => {
    clearPurchase(id);
    const completed = readDone(); delete completed[id]; writeDone(completed);
    const sales = readMap(SALES); delete sales[id]; writeMap(SALES, sales);
    const orders = readMap(ORDER); delete orders[id]; writeMap(ORDER, orders);
};
