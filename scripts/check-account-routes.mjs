import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { accountHash, isAccountScreen } from '../src/screens/account/accountRoutes.ts';

assert.equal(accountHash('', 'my'), '/my');
assert.equal(accountHash('/planned', 'my'), '/planned/my');
assert.equal(accountHash('', 'sales'), '/sales');
assert.equal(accountHash('/planned', 'sales'), '/planned/sales');
assert.equal(isAccountScreen('#/my'), true);
assert.equal(isAccountScreen('#/sales'), true);
console.log('account routes: current and planned');

const appSource = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
const homeSource = await readFile(new URL('../src/screens/HomeScreen.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(appSource, /const myCarrot = !planned/);
assert.doesNotMatch(appSource, /const salesManagement = !planned/);
assert.match(appSource, /productVersion=\{version\}/);
assert.doesNotMatch(homeSource, /index !== 4 \|\| routePrefix !==/);
console.log('account navigation: enabled in both versions');
