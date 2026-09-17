import assert from 'node:assert/strict';
import { restoreSaleItems, validQuantity } from '../src/screens/write/saleItems.ts';

// Old single-price drafts migrate without losing their existing price.
assert.deepEqual(restoreSaleItems(undefined, '8,000'), [{ id: 'item-1', name: '', price: '8000', quantity: null }]);
const restored = restoreSaleItems([null, { id: 'same', name: '패드', price: '5000', quantity: 3 }, { id: 'same', name: '케이스', price: '8000', quantity: null }]);
assert.equal(restored.length, 2);
assert.notEqual(restored[0].id, restored[1].id);
assert.equal(restored[0].quantity, 3);
assert.equal(restored[1].quantity, null);
assert.equal(restoreSaleItems([]).length, 1);
for (const quantity of [0, -2, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '3']) assert.equal(validQuantity(quantity), 1);
assert.equal(restoreSaleItems([{ quantity: -3 }])[0].quantity, 1);
assert.equal(validQuantity(12), 12);
console.log('PASS: old draft migration, independent rows, optional quantity, invalid quantity recovery.');
