import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { phanTichTuTru } from '../src/batu/phan-tich.js';
import { tuChuHan } from '../src/lich/canchi.js';
import { lapBatTu } from '../src/batu/index.js';

const HAN: Record<string, string> = { 木: 'Mộc', 火: 'Hỏa', 土: 'Thổ', 金: 'Kim', 水: 'Thủy' };
const ds = JSON.parse(readFileSync(new URL('./gia/co-an.json', import.meta.url), 'utf8'));
const tt = (c: any) => ({ nam: tuChuHan(c.pillars.year), thang: tuChuHan(c.pillars.month), ngay: tuChuHan(c.pillars.day), gio: tuChuHan(c.pillars.hour) });

test('bát tự: vượng suy khớp ≥ 29/31 lá số cổ', () => {
  let ok = 0, n = 0;
  for (const c of ds) if (c.strength && c.strength !== '中和') { n++; if ((phanTichTuTru(tt(c)).vuongSuy.vuong ? 'vượng' : 'nhược') === c.strength) ok++; }
  assert.ok(ok >= 29, `${ok}/${n}`);
});
test('bát tự: cách cục ≥ 16/22 và dụng thần ≥ 20/29', () => {
  let g = 0, y = 0;
  for (const c of ds) {
    const r = phanTichTuTru(tt(c));
    if (c.ge && (r.cachCuc.ten === c.ge || (c.ge === '從旺格' && ['曲直格', '炎上格', '稼穡格', '從革格', '潤下格'].includes(r.cachCuc.ten)))) g++;
    if (c.yong && (r.dungThan.dung === HAN[c.yong] || r.dungThan.phu === HAN[c.yong])) y++;
  }
  assert.ok(g >= 16, `cách ${g}`);
  assert.ok(y >= 20, `dụng ${y}`);
});
test('bát tự: lá số 1990-05-15 14:30 nam có phân tích đầy đủ', () => {
  const b = lapBatTu({ nam: 1990, thang: 5, ngay: 15, gio: 14, phut: 30, gioiTinh: 'nam' });
  assert.equal(b.phanTich.dungThan.dung, 'Hỏa');
  assert.equal(b.phanTich.cachCuc.ten, '七殺格');
  assert.ok(b.phanTich.tuongTac.length > 0 && b.phanTich.thanSat.length > 0);
  assert.ok(b.daiVan.danhSach[0].chiSo);
});
