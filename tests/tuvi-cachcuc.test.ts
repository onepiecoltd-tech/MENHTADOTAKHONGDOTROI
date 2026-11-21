import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lapTuVi } from '../src/tuvi/index.js';
import { soLuatCachCuc } from '../src/tuvi/cach-cuc.js';

test('đủ 51 luật cách cục', () => assert.equal(soLuatCachCuc(), 51));
test('lá số 1990-05-15 14:30 nam: Phủ Tướng Triều Viên và Thiên Ất Củng Mệnh', () => {
  const t = lapTuVi({ nam: 1990, thang: 5, ngay: 15, gio: 14, phut: 30, gioiTinh: 'nam' });
  assert.deepEqual(t.cachCuc.map((c) => c.id), [8, 28]);
});
test('cách cục không làm đổi cách an sao', () => {
  const t = lapTuVi({ nam: 1990, thang: 5, ngay: 15, gio: 14, phut: 30, gioiTinh: 'nam' });
  assert.equal(t.cung[0].chi, 'Tuất');
  assert.deepEqual(t.cung[0].chinhTinh.map((s) => s.ten), ['Tử Vi', 'Thiên Tướng']);
});
