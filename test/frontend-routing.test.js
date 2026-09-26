import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('the Workflows sidebar link and list/detail routes remain registered',()=>{
 const source=fs.readFileSync('src/main.jsx','utf8');
 assert.match(source,/\['Workflows','\/workflows',Workflow\]/);
 assert.match(source,/<Route path="\/workflows" element={<Workflows\/>}\/>/);
 assert.match(source,/<Route path="\/workflows\/:id" element={<Detail\/>}\/>/);
 assert.match(source,/<Outlet\/>/);
});

test('the frontend API helper uses the shared API base and reports non-JSON responses',()=>{
 const source=fs.readFileSync('src/main.jsx','utf8');
 assert.match(source,/const API_BASE=import\.meta\.env\.VITE_API_BASE\|\|'\/api'/);
 assert.match(source,/let text=await r\.text\(\),d;try\{d=text\?JSON\.parse\(text\):null\}catch/);
 assert.match(source,/API \$\{method\} \$\{endpoint\} returned HTTP \$\{r\.status\}: expected JSON/);
});
