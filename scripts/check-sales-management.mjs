import assert from 'node:assert/strict';

class SessionStorage {
    #values = new Map();
    getItem(key) { return this.#values.get(key) ?? null; }
    setItem(key, value) { this.#values.set(key, String(value)); }
    removeItem(key) { this.#values.delete(key); }
    clear() { this.#values.clear(); }
}
globalThis.sessionStorage = new SessionStorage();

const purchases = await import('../src/screens/checkout/purchases.ts');
assert.equal(typeof purchases.resetDeal, 'function', '판매완료 되돌리기 API가 필요합니다.');

const key = 'post:test-sale';
purchases.markPurchased(key, 'buyer');
purchases.markCompleted(key, 'buyer');
purchases.addOrder(key, { item: 1 });
purchases.resetDeal(key);
assert.equal(purchases.isPurchased(key, 'buyer'), false);
assert.equal(purchases.getCompletedBuyer(key), null);
assert.deepEqual(purchases.getSoldItems(key), {});
console.log('sales management state: ok');
