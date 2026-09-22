import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSalesListings } from '../src/screens/account/salesListings.ts';

const park = 'prototype-user-park';
const posts = [
  { id: 'park-post', format: 'current', title: '박경덕 게시글', author: { id: park }, items: [{ price: 1000 }], directBuy: true },
  { id: 'yoo-post', format: 'current', title: '유주연 게시글', author: { id: 'prototype-user-yoo' }, items: [{ price: 2000 }], directBuy: true },
];
const products = [
  { id: 'backbone', ownerId: park, title: '백본원', price: '50,000원', directBuy: false },
  { id: 'other', ownerId: 'prototype-user-yoo', title: '다른 판매자', price: '1,000원', directBuy: true },
];
const listings = createSalesListings(posts, products, park);
assert.deepEqual(listings.map(item => item.key), ['post:park-post', 'current:backbone']);
assert.equal(listings.some(item => item.key === 'post:yoo-post'), false);
assert.equal(listings.some(item => item.key === 'current:backbone'), true);
console.log('sales ownership: detail seller matches management');

const defaultPosts = JSON.parse(await readFile(new URL('../src/data/defaultPosts.json', import.meta.url), 'utf8'))
  .filter(post => post.format === 'current');
const staticDetails = ['backbone', 'mimikyu', 'macbook-bundle'].map(id => ({
  id, ownerId: park, title: id, price: '0원', directBuy: true,
}));
const parkInventory = createSalesListings(defaultPosts, staticDetails, park);
assert.equal(parkInventory.length, 7);
assert.deepEqual(new Set(parkInventory.map(item => item.key)), new Set([
  'post:default-it-books-current',
  'post:default-mixed-books-current',
  'post:default-switch-games-current',
  'post:default-sns-books-current',
  'current:backbone',
  'current:mimikyu',
  'current:macbook-bundle',
]));
console.log('park sales inventory: 7 listings');
