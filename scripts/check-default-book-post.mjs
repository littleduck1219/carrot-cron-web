import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const posts = JSON.parse(await readFile(new URL('../src/data/defaultPosts.json', import.meta.url), 'utf8'));
const current = posts.find(post => post.id === 'default-it-books-current');
const planned = posts.find(post => post.id === 'default-it-books-planned');

assert.equal(current?.format, 'current');
assert.equal(planned?.format, 'planned');
assert.equal(current?.title, 'IT기술서, 자기계발서 등 30권');
assert.equal(planned?.title, current.title);
assert.equal(current?.items.length, 1);
assert.equal(current?.items[0].price, 2700);
assert.equal(planned?.items.length, 30);
assert.equal(planned.items.filter(item => item.soldOut).length, 3);
assert.equal(planned.items.find(item => item.name === '조국의 시간')?.price, 0);
assert.equal(current?.directBuy, false);
assert.equal(planned?.directBuy, false);
assert.equal(current?.photos.length, 3);
assert.equal(planned?.photos.length, 3);
console.log('default book posts: ok');
