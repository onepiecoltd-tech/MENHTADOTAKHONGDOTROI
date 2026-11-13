import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lapTuVi } from '../src/index.js';
import { rutGonTuVi, luanGiai, taoMayKhachTaiKhoan, kiemTraDangNhap, thamSoClaude, gopHoiThoai, docKetQua, docLuaChon, troChuyenHaiBuoc, taoPhien, type MayKhach } from '../src/ai/index.js';

const SINH = { nam: 1990, thang: 5, ngay: 15, gio: 14, phut: 30, gioiTinh: 'nam' as const };
const LOG = join(tmpdir(), `menh-fake-${process.pid}.log`);
const boQua = process.platform === 'win32';
process.env.CLAUDE_BIN = fileURLToPath(new URL('./gia/claude', import.meta.url));
process.env.FAKE_LOG = LOG;
const docLog = () => readFileSync(LOG, 'utf8').trim().split('\n').map((d) => JSON.parse(d));

test('tham số claude -p: thay system prompt, tắt công cụ, không nạp cấu hình', () => {
  const a = thamSoClaude('claude-sonnet-5-5', '/tmp/s.txt');
  assert.deepEqual(a.slice(0, 7), ['-p', '--output-format', 'json', '--model', 'claude-sonnet-5-5', '--system-prompt-file', '/tmp/s.txt']);
  assert.equal(a[a.indexOf('--tools') + 1], '');
  assert.ok(a.includes('--safe-mode') && a.includes('--no-session-persistence') && !a.includes('--bare'));
});

test('đọc kết quả JSON và gộp hội thoại', () => {
  assert.equal(docKetQua('cảnh báo gì đó\n{"is_error":false,"result":"xin chào","usage":{"output_tokens":3},"total_cost_usd":0.01}').content[0].text, 'xin chào');
  assert.throws(() => docKetQua('{"is_error":true,"result":"Not logged in"}'), /Not logged in/);
  assert.throws(() => docKetQua('không phải json'));
  assert.equal(gopHoiThoai([{ role: 'user', content: 'a' }]), 'a');
  const g = gopHoiThoai([{ role: 'user', content: [{ type: 'text', text: 'DL' }, { type: 'text', text: 'hỏi 1' }] }, { role: 'assistant', content: 'đáp 1' }, { role: 'user', content: 'hỏi 2' }]);
  assert.ok(g.includes('### NGƯỜI XEM\nDL\n\nhỏi 1') && g.includes('### BẠN ĐÃ TRẢ LỜI\nđáp 1') && g.trim().endsWith('lượt cuối của người xem.'));
  assert.deepEqual(docLuaChon('x {"cong_cu":[{"ten":"rut_bai","kieu_trai":"mot-la"}]} y'), [{ ten: 'rut_bai', kieu_trai: 'mot-la' }]);
  assert.deepEqual(docLuaChon('không có json'), []);
  assert.deepEqual(docLuaChon('{"cong_cu": hỏng'), []);
});

test('luận giải qua lệnh claude (giả): gửi đúng prompt, bỏ khóa API, lấy chi phí do Claude Code báo', { skip: boQua }, async () => {
  if (existsSync(LOG)) rmSync(LOG);
  process.env.ANTHROPIC_API_KEY = 'sk-khong-duoc-dung';
  const kq = await luanGiai(taoMayKhachTaiKhoan(), { loai: 'tu-vi', duLieu: [rutGonTuVi(lapTuVi(SINH))], cauHoi: 'Năm nay công việc thế nào?' });
  delete process.env.ANTHROPIC_API_KEY;
  assert.equal(kq.vanBan, 'Bài luận từ tài khoản.');
  assert.equal(kq.chiPhiUSD, 0.02);
  const [g] = docLog();
  assert.equal(g.coKhoa, false);
  assert.ok(g.sys.includes('Không tự tính lại can chi') && g.sys.includes('LUẬN LÁ SỐ TỬ VI'));
  assert.ok(g.vao.includes('LÁ SỐ TỬ VI') && g.vao.includes('YÊU CẦU: Năm nay công việc thế nào?'));
  assert.equal(g.args[g.args.indexOf('--model') + 1], 'claude-sonnet-5-5');
  assert.ok(!g.cwd.includes('menh-engine'));
  assert.ok(kiemTraDangNhap().ok);
  process.env.FAKE_AUTH = 'api_key';
  assert.equal(kiemTraDangNhap().ok, false);
  delete process.env.FAKE_AUTH;
});

test('trò chuyện hai bước qua lệnh claude (giả): chọn công cụ, chạy công cụ thật, luận chéo', { skip: boQua }, async () => {
  if (existsSync(LOG)) rmSync(LOG);
  const phien = taoPhien({ ten: 'An', sinh: SINH });
  phien.seed = 3;
  const kq = await troChuyenHaiBuoc(taoMayKhachTaiKhoan(), phien, 'Năm nay tôi có nên đổi việc không?');
  assert.equal(kq.traLoi, 'Bài luận từ tài khoản.');
  assert.deepEqual(kq.congCuDaGoi, ['xem_tu_vi', 'gieo_que']);
  assert.ok(Math.abs(kq.chiPhiUSD - 0.021) < 1e-9);
  const [chon, luan] = docLog();
  assert.equal(chon.args[chon.args.indexOf('--model') + 1], 'claude-haiku-5-5');
  assert.ok(chon.vao.includes('15/5/1990') && chon.vao.includes('chưa có gì'));
  assert.ok(luan.vao.includes('LÁ SỐ TỬ VI') && luan.vao.includes('QUẺ KINH DỊCH') && luan.vao.includes('đổi việc'));
  assert.ok(luan.sys.includes('LUẬN CHÉO NHIỀU MÔN'));
  // Lượt 2: lá số đã có thì không lập lại, quẻ mới cộng dồn
  await troChuyenHaiBuoc(taoMayKhachTaiKhoan(), phien, 'Vậy nên đi lúc nào?');
  assert.equal(phien.queVaBai.length, 2);
  assert.equal(phien.luot.length, 4);
  assert.ok(docLog()[2].vao.includes('lá số tử vi'));
});

test('trò chuyện hai bước: thiếu ngày sinh thì nhắc model hỏi lại, không sập', async () => {
  const goi: any[] = [];
  const gia: MayKhach = { messages: { create: async (p) => { goi.push(p); return goi.length === 1 ? { content: [{ type: 'text', text: '{"cong_cu":[{"ten":"xem_bat_tu"}]}' }], usage: {} } : { content: [{ type: 'text', text: 'Bạn cho tôi xin ngày giờ sinh.' }], usage: {} }; } } };
  const kq = await troChuyenHaiBuoc(gia, taoPhien(), 'Xem bát tự giúp tôi');
  assert.deepEqual(kq.congCuDaGoi, []);
  assert.ok((goi[1].messages[0].content[0].text as string).includes('LƯU Ý: Hồ sơ chưa có ngày giờ sinh'));
});
