import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lapBatTu, lapTuVi, gieoQueMaiHoa, ganLoiQue, rutBai } from '../src/index.js';
import { rutGonBatTu, rutGonTuVi, rutGonQue, rutGonTarot, taoYeuCau, luanGiai, troChuyen, dinhTuyen, tinhChiPhi, namAmLich, saoHanDanGian, CONG_CU, type MayKhach } from '../src/ai/index.js';

const SINH = { nam: 1990, thang: 5, ngay: 15, gio: 14, phut: 30, gioiTinh: 'nam' as const };
const NGAY = new Date(Date.UTC(2026, 10, 11, 3, 0)); // 11/11/2026 10:00 giờ Việt Nam

test('rút gọn: giữ đủ ý chính và nhỏ hơn JSON nhiều lần', () => {
  const laSo = lapTuVi(SINH);
  const tv = rutGonTuVi(laSo, NGAY);
  assert.ok(tv.length < JSON.stringify(laSo).length / 2, `tử vi ${tv.length} so với JSON ${JSON.stringify(laSo).length}`);
  for (const s of ['Thổ Ngũ Cục', 'Mệnh [Bính Tuất]', 'Tử Vi (', 'TUẦN', 'TRIỆT', 'Năm xem: Bính Ngọ, 37 tuổi âm', 'Đại hạn hiện tại: cung Điền Trạch (35-44)', 'Tiểu hạn năm nay: cung Thiên Di'])
    assert.ok(tv.includes(s), `thiếu "${s}"`);
  assert.equal(tv.split('\n').filter((d) => d.includes('đại hạn')).length, 12);
  for (const c of laSo.cung) for (const s of [...c.chinhTinh, ...c.phuTinh]) assert.ok(tv.includes(s.ten.startsWith('Hóa ') ? s.ten : s.ten), s.ten);

  const bt = rutGonBatTu(lapBatTu(SINH), NGAY);
  for (const s of ['Trụ năm: Canh Ngọ', 'Nhật chủ:', 'Đại vận đang hành (2026)']) assert.ok(bt.includes(s), `thiếu "${s}"`);

  const que = rutGonQue(ganLoiQue(gieoQueMaiHoa('Có nên đổi việc?', new Date(Date.UTC(2026, 1, 17, 3, 0)))));
  for (const s of ['Quẻ chủ: 33. Thiên Sơn Độn', 'Hào động: Cửu Tam (hào 3)', 'Quẻ biến: 12. Thiên Địa Bĩ', 'Lời quẻ:', 'Ngô Tất Tố']) assert.ok(que.includes(s), `thiếu "${s}"`);

  const tr = rutGonTarot(rutBai('ba-la', 'Công việc', { seed: 5 }));
  assert.equal(tr.split('\n').filter((d) => /^\d\./.test(d)).length, 3);
  assert.deepEqual(namAmLich(NGAY), { nam: 2026, canChi: 'Bính Ngọ', chi: 'Ngọ' });
});

test('định tuyến model và tính chi phí', () => {
  assert.equal(dinhTuyen('tu-vi-ngay').model, 'claude-haiku-5-5');
  assert.equal(dinhTuyen('tarot', { soLaBai: 1 }).model, 'claude-haiku-5-5');
  assert.equal(dinhTuyen('tarot', { soLaBai: 10 }).model, 'claude-sonnet-5-5');
  assert.equal(dinhTuyen('tu-vi').model, 'claude-sonnet-5-5');
  assert.ok(dinhTuyen('tarot', { soLaBai: 10 }).maxTokens > dinhTuyen('tarot', { soLaBai: 3 }).maxTokens);
  // 6.000 token vào + 2.500 token ra trên Sonnet = 0,012 + 0,025
  assert.ok(Math.abs(tinhChiPhi('claude-sonnet-5-5', { input_tokens: 6000, output_tokens: 2500 }) - 0.037) < 1e-9);
  assert.ok(Math.abs(tinhChiPhi('claude-sonnet-5-5', { input_tokens: 100, cache_read_input_tokens: 5000, output_tokens: 500 }) - 0.0057) < 1e-9);
});

test('tạo yêu cầu: cấu trúc prompt, điểm cache, hỏi đáp tiếp', () => {
  const p = taoYeuCau({ loai: 'tu-vi', duLieu: [rutGonTuVi(lapTuVi(SINH), NGAY)], cauHoi: 'Năm nay công việc thế nào?', hoSo: 'Tên: An', hoiDap: [{ vai: 'assistant', noiDung: 'x' }, { vai: 'user', noiDung: 'Còn tình cảm?' }] });
  const sys = p.system as any[];
  assert.equal(sys.length, 2);
  assert.ok(sys[0].text.includes('Không tự tính lại can chi') && sys[1].text.includes('LUẬN LÁ SỐ TỬ VI'));
  assert.ok(sys[1].cache_control && !sys[0].cache_control);
  const c = p.messages[0].content as any[];
  assert.ok(c[0].cache_control && c[0].text.includes('HỒ SƠ NGƯỜI XEM') && c[0].text.includes('LÁ SỐ TỬ VI'));
  assert.equal(c[1].text, 'YÊU CẦU: Năm nay công việc thế nào?');
  assert.equal(p.messages.length, 3);
  assert.throws(() => taoYeuCau({ loai: 'tu-vi', duLieu: [] }));
});

test('luận giải: gọi máy khách và trả về văn bản, chi phí', async () => {
  let nhan: any;
  const gia: MayKhach = { messages: { create: async (p) => { nhan = p; return { content: [{ type: 'text', text: 'Bài luận.' }], stop_reason: 'end_turn', usage: { input_tokens: 3000, output_tokens: 1000 } }; } } };
  const kq = await luanGiai(gia, { loai: 'kinh-dich', duLieu: ['QUẺ ...'], cauHoi: 'Có nên đổi việc?' });
  assert.equal(kq.vanBan, 'Bài luận.');
  assert.equal(nhan.model, 'claude-sonnet-5-5');
  assert.ok(Math.abs(kq.chiPhiUSD - 0.016) < 1e-9);
});

test('agent: model gọi công cụ, hệ thống chạy công cụ thật rồi trả kết quả về model', async () => {
  const goi: any[] = [];
  const kichBan = [
    { content: [{ type: 'text', text: 'Để tôi xem lá số và gieo quẻ.' }, { type: 'tool_use', id: 't1', name: 'xem_tu_vi', input: {} }, { type: 'tool_use', id: 't2', name: 'gieo_que', input: { cau_hoi: 'Có nên đổi việc?', phuong_phap: 'xu' } }], stop_reason: 'tool_use', usage: { input_tokens: 2000, output_tokens: 80 } },
    { content: [{ type: 'text', text: 'Luận chéo: ...' }], stop_reason: 'end_turn', usage: { input_tokens: 500, cache_read_input_tokens: 4000, output_tokens: 900 } },
  ];
  const gia: MayKhach = { messages: { create: async (p) => { goi.push(JSON.parse(JSON.stringify(p))); return kichBan[goi.length - 1]; } } };
  const kq = await troChuyen(gia, { hoSo: { ten: 'An', sinh: SINH }, tinNhan: [{ role: 'user', content: 'Năm nay tôi có nên đổi việc không?' }], ngayXem: NGAY, seed: 3 });
  assert.equal(kq.traLoi, 'Luận chéo: ...');
  assert.deepEqual(kq.congCuDaGoi, ['xem_tu_vi', 'gieo_que']);
  assert.equal(goi.length, 2);
  assert.deepEqual(goi[0].tools.map((t: any) => t.name), CONG_CU.map((t) => t.name));
  assert.ok(goi[0].system[1].text.includes('15/5/1990'));
  const tr = goi[1].messages[2].content;
  assert.equal(tr.length, 2);
  assert.ok(tr[0].tool_use_id === 't1' && tr[0].content.includes('LÁ SỐ TỬ VI') && tr[0].content.includes('Thổ Ngũ Cục'));
  assert.ok(tr[1].tool_use_id === 't2' && tr[1].content.includes('QUẺ KINH DỊCH') && tr[1].content.includes('Quẻ chủ:'));
  assert.equal(kq.suDung.output_tokens, 980);
  assert.equal(kq.tinNhan.length, 4);
});

test('agent: thiếu ngày sinh thì công cụ báo lỗi cho model thay vì làm sập phiên', async () => {
  const goi: any[] = [];
  const kichBan = [
    { content: [{ type: 'tool_use', id: 't1', name: 'xem_bat_tu', input: {} }], stop_reason: 'tool_use', usage: {} },
    { content: [{ type: 'text', text: 'Bạn cho tôi xin ngày giờ sinh nhé.' }], stop_reason: 'end_turn', usage: {} },
  ];
  const gia: MayKhach = { messages: { create: async (p) => { goi.push(JSON.parse(JSON.stringify(p))); return kichBan[goi.length - 1]; } } };
  const kq = await troChuyen(gia, { hoSo: {}, tinNhan: [{ role: 'user', content: 'Xem bát tự giúp tôi' }] });
  assert.ok(goi[1].messages[2].content[0].is_error);
  assert.ok(kq.traLoi.includes('ngày giờ sinh'));
});

test('sao hạn dân gian (cửu diệu): khớp bảng theo tuổi âm và giới tính, lặp chín năm', () => {
  const nam = [[31, 'Thái Bạch'], [34, 'Kế Đô'], [35, 'Thái Âm'], [10, 'La Hầu'], [19, 'La Hầu'], [18, 'Mộc Đức'], [29, 'Thổ Tú']] as const;
  for (const [tuoi, sao] of nam) assert.equal(saoHanDanGian(tuoi, 'nam').sao, sao, `nam ${tuoi}`);
  const nu = [[10, 'Kế Đô'], [13, 'Thái Âm'], [15, 'La Hầu'], [33, 'La Hầu'], [18, 'Thủy Diệu'], [25, 'Thái Dương']] as const;
  for (const [tuoi, sao] of nu) assert.equal(saoHanDanGian(tuoi, 'nu').sao, sao, `nữ ${tuoi}`);
  assert.ok(rutGonTuVi(lapTuVi(SINH), NGAY).includes('Sao hạn dân gian'));
});

test('prompt tử vi có hướng dẫn luận cụ thể và vẫn giữ giới hạn an toàn', () => {
  const p = taoYeuCau({ loai: 'tu-vi', duLieu: [rutGonTuVi(lapTuVi(SINH), NGAY)] });
  const sys = (p.system as any[]).map((x) => x.text).join('\n');
  for (const s of ['chốt đường đời', 'BỘ SAO', 'Vũ Tham', 'mốc tuổi', 'Không phán bệnh cụ thể, tuổi thọ']) assert.ok(sys.includes(s), `thiếu "${s}"`);
});
