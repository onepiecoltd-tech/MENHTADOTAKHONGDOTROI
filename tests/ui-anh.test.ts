import test from 'node:test';
import assert from 'node:assert/strict';
import { tamHopTheoChi, tamGiacTamHop, cotNguHanh, demNguHanh, saoIconVi } from '../app/web-src/ui-anh.js';
import { lapBatTu } from '../src/index.js';

test('tam hợp / xung chiếu đổi theo cung được bấm (chi cách 4 và 6)', () => {
  assert.deepEqual(tamHopTheoChi('Ngọ'), { tamHop: ['Ngọ', 'Tuất', 'Dần'], xung: 'Tý' });
  assert.deepEqual(tamHopTheoChi('Thân'), { tamHop: ['Thân', 'Tý', 'Thìn'], xung: 'Dần' });
  const cung = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'].map((chi, i) => ({ ten: `C${i}`, chi }));
  assert.notEqual(tamGiacTamHop(cung, 'Ngọ'), tamGiacTamHop(cung, 'Thân'));
  assert.ok(!tamGiacTamHop(cung, null).includes('<polygon'));
});

test('cột Ngũ Hành đổi theo người xem và theo đúng số liệu bát tự', () => {
  const a = lapBatTu({ nam: 1990, thang: 5, ngay: 15, gio: 14, phut: 30, gioiTinh: 'nam' } as any);
  const b = lapBatTu({ nam: 1985, thang: 11, ngay: 2, gio: 6, phut: 0, gioiTinh: 'nu' } as any);
  const ha = cotNguHanh(demNguHanh(a.nguHanh)), hb = cotNguHanh(demNguHanh(b.nguHanh));
  assert.notEqual(ha, hb);
  assert.equal(demNguHanh(a.nguHanh).moc, a.nguHanh['Mộc']);
  assert.ok(cotNguHanh({ moc: 0, hoa: 2, tho: 1, kim: 5, thuy: 0 }).includes('thiếu'));
});

test('icon sao Tử Vi map đúng tên tiếng Việt của engine, tên lạ thì không vẽ', () => {
  assert.ok(saoIconVi('Thiên Phủ').includes('thien-phu.png'));
  assert.equal(saoIconVi('Sao không tồn tại'), '');
});
