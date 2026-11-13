import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { BO_BAI } from '../src/tarot/index.js';
import { fileBai } from '../app/web-src/anh-bai.js';

const goc = new URL('../app/web/assets/menh-ly-3d/tarot/', import.meta.url);

test('78 lá bài của bộ máy đều có ảnh tồn tại', () => {
  const thieu = BO_BAI.filter((l) => { const f = fileBai(l.tenAnh); return !f || !existsSync(new URL(f, goc)); });
  assert.deepEqual(thieu.map((l) => l.tenAnh), []);
  assert.equal(new Set(BO_BAI.map((l) => fileBai(l.tenAnh))).size, 78, 'mỗi lá một ảnh riêng');
});
