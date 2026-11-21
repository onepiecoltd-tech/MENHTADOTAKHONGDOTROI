import test from 'node:test';
import assert from 'node:assert/strict';
import { phanTichNhanh } from '../app/web-src/live.js';

test('bình luận đủ: tên, giới tính, ngày, giờ, chủ đề', () => {
  const n = phanTichNhanh('Lan nữ 12/03/1995 7h sáng tình duyên');
  assert.deepEqual(n.ngay, { d: 12, m: 3, y: 1995 });
  assert.deepEqual(n.gio, { h: 7, p: 0 });
  assert.equal(n.gioiTinh, 'nu'); assert.equal(n.chuDe, 'Tình duyên'); assert.equal(n.ten, 'Lan');
});
test('giờ chiều + công việc, câu nói tự nhiên', () => {
  const n = phanTichNhanh('Xem giúp mình Minh nam sinh ngày 5 tháng 8 năm 1988 lúc 5h30 chiều về công việc nhé');
  assert.deepEqual(n.ngay, { d: 5, m: 8, y: 1988 });
  assert.deepEqual(n.gio, { h: 17, p: 30 });
  assert.equal(n.gioiTinh, 'nam'); assert.equal(n.chuDe, 'Công việc'); assert.equal(n.ten, 'Minh');
});
test('tên trùng từ khóa không bị nuốt: Duyên, Tiền', () => {
  assert.equal(phanTichNhanh('Duyên nữ 1/1/2000 8h').ten, 'Duyên');
  assert.equal(phanTichNhanh('Tiền nam 1/1/2000 8h').ten, 'Tiền');
});
test('ngày kiểu ISO, không giờ, chủ đề tài lộc', () => {
  const n = phanTichNhanh('Hoa nữ 1990-05-15 tài lộc');
  assert.deepEqual(n.ngay, { d: 15, m: 5, y: 1990 });
  assert.equal(n.gio, undefined); assert.equal(n.chuDe, 'Tài lộc'); assert.equal(n.ten, 'Hoa');
});
test('không có ngày thì không nhận', () => {
  assert.equal(phanTichNhanh('chào ad ơi').ngay, undefined);
});

import { chiaCau } from '../app/web-src/live.js';
test('chia lời luận thành từng câu ngắn để đọc ngắt quãng', () => {
  const ds = chiaCau('Chào Lan, lá số cho thấy bạn sống nội tâm. Năm nay công việc mở ra, nhưng cần chủ động nói ra mong muốn của mình với người quyết định, đừng chờ người khác đoán ý bạn, vì cơ hội sẽ qua rất nhanh. Đây là luận giải tham khảo.');
  assert.ok(ds.length >= 3);
  assert.ok(ds.every((c) => c.length <= 150));
  assert.equal(ds[0], 'Chào Lan, lá số cho thấy bạn sống nội tâm.');
});
