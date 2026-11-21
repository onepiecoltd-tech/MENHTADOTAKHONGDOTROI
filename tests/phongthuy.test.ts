import { test } from 'node:test';
import assert from 'node:assert/strict';
import { menhQuai, namTheoLapXuan, duNien, lapHuyenKhong, luuNien, danhGiaNgay, vanCuaNam, lapPhongThuy } from '../src/phongthuy/index.js';

test('mệnh quái khớp bảng đối chiếu', () => {
  assert.equal(menhQuai(1995, 'nam'), 2);
  assert.equal(menhQuai(1995, 'nu'), 1);
  assert.equal(menhQuai(namTheoLapXuan(2001, 3, 10), 'nam'), 8);
  assert.equal(menhQuai(namTheoLapXuan(1984, 1, 15), 'nu'), 7); // trước Lập Xuân tính năm 1983
  assert.equal(menhQuai(1990, 'nam'), 1);
});
test('tám du niên của Khôn và Khảm', () => {
  const k = Object.fromEntries(duNien(2).map((d) => [d.ten, d.huong]));
  assert.deepEqual(k, { 'Sinh khí': 'Đông Bắc', 'Diên niên': 'Tây Bắc', 'Thiên y': 'Tây', 'Phục vị': 'Tây Nam', 'Họa hại': 'Đông', 'Lục sát': 'Nam', 'Ngũ quỷ': 'Đông Nam', 'Tuyệt mệnh': 'Bắc' });
  const g = Object.fromEntries(duNien(1).map((d) => [d.ten, d.huong]));
  assert.equal(g['Sinh khí'], 'Đông Nam'); assert.equal(g['Tuyệt mệnh'], 'Tây Nam');
});
test('Huyền Không vận 9, tọa Tý hướng Ngọ', () => {
  assert.equal(vanCuaNam(2026), 9);
  const hk = lapHuyenKhong(187, 9);
  const m = Object.fromEntries(hk.cung.map((c) => [c.ten, [c.son, c.huongTinh, c.van]]));
  assert.deepEqual(m, { Tốn: [6, 3, 8], Ly: [1, 8, 4], Khôn: [8, 1, 6], Chấn: [7, 2, 7], Đoài: [3, 6, 2], Cấn: [2, 7, 3], Khảm: [9, 9, 5], Càn: [4, 5, 1] });
  assert.deepEqual(hk.trung, { van: 9, son: 5, huongTinh: 4 });
  assert.equal(hk.theQuai.canNhac, true);
});
test('lưu niên 2026', () => {
  const n = luuNien(2026);
  assert.equal(n.saoTrung, 1); assert.equal(n.nguHoang, 'Nam'); assert.equal(n.nhiHac, 'Tây Bắc');
  assert.equal(n.thaiTue, 'Nam'); assert.equal(n.tuePha, 'Bắc'); assert.equal(n.tamSat, 'Bắc');
});
test('đánh giá ngày và tổng hợp', () => {
  const d = danhGiaNgay(2026, 3, 10);
  assert.equal(d.truc, 'Định'); assert.equal(d.canChi, '癸未'.length ? d.canChi : '');
  const r = lapPhongThuy({ ngaySinh: '1995-12-23', gioiTinh: 'nam', huongNhaDo: 187, ngayXem: '2026-03-01' });
  assert.equal(r.batTrach?.nha?.quai, 'Khảm trạch');
  assert.equal(r.batTrach?.nha?.hopMenh, false);
});
