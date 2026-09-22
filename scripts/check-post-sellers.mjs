import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const posts = JSON.parse(await read('../src/data/defaultPosts.json'));
const park = {
  provinceId: 'seoul',
  id: 'prototype-user-park',
  nickname: '박경덕',
  neighborhood: '서울특별시',
  secondaryNeighborhood: '',
  tradePlace: '서울특별시',
  pickupAddress: '서울특별시',
};
assert.ok(posts.length > 0);
assert.ok(posts.every(post => assert.deepEqual(post.author, park) === undefined));

const productData = await read('../src/screens/detail/productData.ts');
const macbookData = await read('../src/screens/detail/macbookBundleData.ts');
const homeItems = await read('../src/screens/home/homeItems.ts');
assert.equal([...productData.matchAll(/sellerId:\s*"([^"]+)"/g)].every(([, id]) => id === 'park'), true);
assert.equal([...macbookData.matchAll(/sellerId:\s*"([^"]+)"/g)].every(([, id]) => id === 'park'), true);
for (const id of ['backbone', 'mimikyu', 'macbook-bundle']) {
  assert.match(homeItems, new RegExp('id: "' + id + '", sellerId: "park"'));
}
console.log('post sellers: 박경덕');
