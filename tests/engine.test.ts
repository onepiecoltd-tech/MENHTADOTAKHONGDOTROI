import { test } from 'node:test';
import assert from 'node:assert/strict';
import { duongSangAm, lapBatTu, lapTuVi, lapTuViIztro, gieoQueDongXu, gieoQueMaiHoa, traQue, rutBai, BO_BAI, ganLoiQue, kiemLoiQue, docLoiQue, anSao } from '../src/index.js';
import { viTriTuVi } from '../src/tuvi/an-sao.js';
import { chayDoiChieu } from '../scripts/so-la-so.js';
import { taoNgauNhien } from '../src/random.js';
import { QUE, BAT_QUAI } from '../src/kinhdich/data.js';
import { napAm, thapThan } from '../src/lich/canchi.js';

const tru = (b: ReturnType<typeof lapBatTu>) => [b.tuTru.nam.ten, b.tuTru.thang.ten, b.tuTru.ngay.ten, b.tuTru.gio.ten];

test('âm lịch Việt Nam: các mốc Tết đã biết', () => {
  const tet = (d: number, m: number, y: number) => assert.deepEqual(duongSangAm(d, m, y), { ngay: 1, thang: 1, nam: y, nhuan: false });
  tet(21, 1, 1985); // Việt Nam ăn Tết trước Trung Quốc một tháng
  tet(17, 2, 2007); // Trung Quốc: 18/2
  tet(29, 1, 2025);
  tet(17, 2, 2026);
  tet(10, 2, 2024);
  tet(5, 2, 2000);
});

test('âm lịch: tháng nhuận 2025 (nhuận tháng 6)', () => {
  assert.deepEqual(duongSangAm(25, 7, 2025), { ngay: 1, thang: 6, nam: 2025, nhuan: true });
});

test('bát tự: mốc đã biết', () => {
  assert.deepEqual(tru(lapBatTu({ nam: 2000, thang: 1, ngay: 1, gio: 12, gioiTinh: 'nam' })), ['Kỷ Mão', 'Bính Tý', 'Mậu Ngọ', 'Mậu Ngọ']);
  const b = lapBatTu({ nam: 1949, thang: 10, ngay: 1, gio: 15, gioiTinh: 'nam' });
  assert.deepEqual(tru(b).slice(0, 3), ['Kỷ Sửu', 'Quý Dậu', 'Giáp Tý']);
});

test('bát tự: ranh Lập Xuân 2024 (16:27 giờ Bắc Kinh = 15:27 giờ Việt Nam)', () => {
  const truoc = lapBatTu({ nam: 2024, thang: 2, ngay: 4, gio: 15, phut: 0, gioiTinh: 'nu' });
  const sau = lapBatTu({ nam: 2024, thang: 2, ngay: 4, gio: 15, phut: 40, gioiTinh: 'nu' });
  assert.equal(truoc.tuTru.nam.ten, 'Quý Mão');
  assert.equal(sau.tuTru.nam.ten, 'Giáp Thìn');
  assert.equal(sau.tuTru.thang.ten, 'Bính Dần');
  assert.equal(truoc.tuTru.ngay.ten, sau.tuTru.ngay.ten);
});

test('bát tự: giờ Tý muộn', () => {
  const homSau = lapBatTu({ nam: 2000, thang: 1, ngay: 1, gio: 23, phut: 30, gioiTinh: 'nam' });
  const trongNgay = lapBatTu({ nam: 2000, thang: 1, ngay: 1, gio: 23, phut: 30, gioiTinh: 'nam', tyMuon: 'trongNgay' });
  assert.equal(homSau.tuTru.ngay.ten, 'Kỷ Mùi');
  assert.equal(trongNgay.tuTru.ngay.ten, 'Mậu Ngọ');
  assert.equal(homSau.tuTru.gio.chi, 'Tý');
});

test('bát tự: ngũ hành, thập thần, nạp âm, đại vận', () => {
  const b = lapBatTu({ nam: 2000, thang: 1, ngay: 1, gio: 12, gioiTinh: 'nam' });
  assert.equal(Object.values(b.nguHanh).reduce((x, y) => x + y, 0), 8);
  assert.equal(b.nhatChu.can, 'Mậu');
  assert.equal(b.tuTru.nam.thapThan, 'Kiếp Tài'); // Kỷ so với Mậu
  assert.equal(b.tuTru.thang.thapThan, 'Thiên Ấn'); // Bính so với Mậu
  assert.equal(b.tuTru.nam.napAm, 'Thành Đầu Thổ');
  assert.equal(napAm({ can: 0, chi: 0 }), 'Hải Trung Kim');
  assert.equal(napAm({ can: 9, chi: 11 }), 'Đại Hải Thủy');
  assert.equal(thapThan(0, 6), 'Thất Sát'); // Canh so với Giáp
  assert.equal(thapThan(0, 7), 'Chính Quan');
  assert.equal(b.daiVan.danhSach[0].canChi, 'Ất Hợi'); // nam, năm âm -> nghịch
  assert.equal(b.daiVan.thuan, false);
});

test('tử vi Nam phái: cấu trúc lá số', () => {
  const t = lapTuVi({ nam: 1990, thang: 5, ngay: 15, gio: 14, phut: 30, gioiTinh: 'nam' });
  assert.equal(t.cung.length, 12);
  assert.equal(t.cung.flatMap((c) => c.chinhTinh).length, 14);
  assert.equal(new Set(t.cung.map((c) => c.chi)).size, 12);
  assert.deepEqual([t.amLich.ngay, t.amLich.thang, t.amLich.nam, t.amLich.canChiNam], [21, 4, 1990, 'Canh Ngọ']);
  assert.deepEqual([t.amDuong, t.cuc, t.cungMenhTai, t.banMenh], ['Dương Nam', 'Thổ Ngũ Cục', 'Tuất', 'Lộ Bàng Thổ']);
  const cung = (ten: string) => t.cung.find((c) => c.ten === ten)!;
  assert.deepEqual(cung('Mệnh').chinhTinh.map((s) => s.ten), ['Tử Vi', 'Thiên Tướng']);
  assert.deepEqual(cung('Mệnh').daiHan, [5, 14]);
  assert.equal(cung('Phụ Mẫu').daiHan[0], 15); // dương nam: đại hạn đi thuận
  assert.deepEqual(t.cung.filter((c) => c.tuan).map((c) => c.chi), ['Tuất', 'Hợi']); // Canh Ngọ thuộc tuần Giáp Tý
  assert.deepEqual(t.cung.filter((c) => c.triet).map((c) => c.chi), ['Ngọ', 'Mùi']);
  assert.equal(t.cung.find((c) => c.vongThaiTue === 'Thái Tuế')!.chi, 'Ngọ');
  assert.equal(t.cung.find((c) => c.phuTinh.some((s) => s.ten === 'Lộc Tồn'))!.chi, 'Thân');
  assert.equal(t.cung.find((c) => c.phuTinh.some((s) => s.ten === 'Thiên Khôi'))!.chi, 'Ngọ'); // Khôi Việt lối Việt Nam cho can Canh
  for (const h of ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ']) assert.equal(t.cung.filter((c) => c.phuTinh.some((s) => s.ten === h)).length, 1);
});

test('tử vi: vị trí Tử Vi theo cục và ngày (mốc trong bảng an sao)', () => {
  assert.equal(viTriTuVi(2, 1), 1); // Thủy nhị cục, mồng 1: Sửu
  assert.equal(viTriTuVi(2, 2), 2); // mồng 2: Dần
  assert.equal(viTriTuVi(6, 1), 9); // Hỏa lục cục, mồng 1: Dậu
  assert.equal(viTriTuVi(5, 21), 10);
});

test('tử vi: ngày lệch lịch Việt–Trung (1/2/1985) an theo lịch Việt', () => {
  const t = lapTuVi({ nam: 1985, thang: 2, ngay: 1, gio: 12, gioiTinh: 'nu' });
  assert.deepEqual([t.amLich.ngay, t.amLich.thang, t.amLich.nam, t.amLich.canChiNam], [12, 1, 1985, 'Ất Sửu']);
  assert.equal(t.amDuong, 'Âm Nữ');
});

test('tử vi: giờ Tý muộn và tháng nhuận', () => {
  const a = lapTuVi({ nam: 2000, thang: 1, ngay: 1, gio: 23, phut: 30, gioiTinh: 'nam' });
  const b = lapTuVi({ nam: 2000, thang: 1, ngay: 1, gio: 23, phut: 30, gioiTinh: 'nam', tyMuon: 'trongNgay' });
  assert.equal(a.amLich.ngay, 26);
  assert.equal(b.amLich.ngay, 25);
  const n = lapTuVi({ nam: 2025, thang: 8, ngay: 15, gio: 10, gioiTinh: 'nu' }); // 22/6 nhuận -> tính tháng 7
  assert.ok(n.amLich.nhuan && n.ghiChu.some((g) => g.includes('tháng 7')));
});

test('tử vi: phần an giống hai phái phải khớp thư viện iztro (300 lá số ngẫu nhiên)', () => {
  const rnd = taoNgauNhien(99);
  const CHUNG = ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh', 'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân',
    'Tả Phù', 'Hữu Bật', 'Văn Xương', 'Văn Khúc', 'Địa Không', 'Địa Kiếp', 'Lộc Tồn', 'Kình Dương', 'Đà La', 'Thiên Mã', 'Hồng Loan', 'Thiên Hỷ', 'Thiên Hình', 'Tam Thai', 'Bát Tọa', 'Ân Quang',
    'Long Trì', 'Thiên Khốc', 'Thiên Hư', 'Cô Thần', 'Quả Tú', 'Hoa Cái', 'Phá Toái', 'Thiên Quan', 'Thiên Phúc', 'Thiên Tài', 'Thiên Thọ', 'Thiên Đức', 'Nguyệt Đức', 'Thiên Không', 'Phong Cáo', 'Thiên Thương', 'Thiên Sứ'];
  let n = 0;
  while (n < 300) {
    const s = { nam: 1930 + rnd(100), thang: 1 + rnd(12), ngay: 1 + rnd(28), gio: rnd(23), gioiTinh: rnd(2) ? ('nam' as const) : ('nu' as const) };
    const a = lapTuVi(s), b = lapTuViIztro(s);
    if (b.ghiChu.length || a.amLich.nhuan) continue; // bỏ ngày lệch lịch, tháng nhuận
    n++;
    const vi = (cung: { chi: string; sao: string[] }[]) => Object.fromEntries(CHUNG.map((t) => [t, cung.find((c) => c.sao.includes(t))?.chi]));
    const va = vi(a.cung.map((c) => ({ chi: c.chi, sao: [...c.chinhTinh, ...c.phuTinh].map((x) => x.ten) })));
    const vb = vi(b.cung.map((c) => ({ chi: c.chi, sao: [...c.chinhTinh, ...c.phuTinh, ...c.tapTinh].map((x) => x.ten) })));
    assert.deepEqual(va, vb, JSON.stringify(s));
    assert.equal(a.cungMenhTai, b.cungMenhTai);
    const dh = (cung: { chi: string; daiHan: [number, number] }[]) => Object.fromEntries(cung.map((c) => [c.chi, c.daiHan[0]]));
    assert.deepEqual(dh(a.cung), dh(b.cung));
  }
});

test('kinh dịch: tệp lời quẻ đủ 64 quẻ × 6 hào và gắn đúng vào kết quả gieo', () => {
  const k = kiemLoiQue();
  assert.equal(k.daDuLoiQueVaHao, 64);
  const t = docLoiQue();
  assert.ok(t.que.every((q) => q.thoan && q.loiTuong && q.tenHao.length === 6));
  assert.equal(t.que[0].tenHao[0], 'Sơ Cửu');
  assert.equal(t.que[1].tenHao[5], 'Thượng Lục');
  assert.ok(t.que[0].dung && t.que[1].dung);
  const kq = ganLoiQue(gieoQueMaiHoa('test', new Date(Date.UTC(2026, 1, 17, 3, 0))));
  assert.equal(kq.loiQue.queChu.ten, 'Thiên Sơn Độn');
  assert.equal(kq.loiQue.haoDong[0].ten, 'Cửu Tam');
  assert.equal(kq.loiQue.haoDong[0].loi, t.que[32].hao[2]);
  assert.ok(kq.loiQue.daCoNguyenVan && kq.loiQue.queBien!.loiQue.length > 10);
});

test('tử vi: lá số tham chiếu Ất Hợi, tháng 11, ngày 2, giờ Dần, âm nam (đối chiếu trang tử vi Việt Nam)', () => {
  const t = anSao({ canNam: 1, chiNam: 11, thang: 11, ngay: 2, chiGio: 2, nam: true });
  const o = (ten: string) => t.cung.find((c) => [...c.chinhTinh, ...c.phuTinh].some((s) => s.ten === ten))!.chi;
  assert.deepEqual([t.cuc, t.cungMenhTai, t.thanCu, t.menhChu, t.thanChu], ['Thổ Ngũ Cục', 'Tuất', 'Quan Lộc', 'Cự Môn', 'Thiên Cơ']);
  assert.deepEqual([o('Hỏa Tinh'), o('Linh Tinh')], ['Mùi', 'Tý']); // âm nam: Hỏa nghịch, Linh thuận
  assert.deepEqual([o('Thiên Khôi'), o('Thiên Việt'), o('Lưu Hà'), o('Thiên Trù'), o('Văn Tinh')], ['Tý', 'Thân', 'Tuất', 'Ngọ', 'Ngọ']);
  assert.deepEqual([o('Hóa Lộc'), o('Hóa Quyền'), o('Hóa Khoa'), o('Hóa Kỵ')], ['Tuất', 'Tuất', 'Hợi', 'Ngọ']);
  assert.deepEqual([o('Quốc Ấn'), o('Đường Phù'), o('Đẩu Quân'), o('Thiên Giải'), o('Địa Giải'), o('Kiếp Sát')], ['Hợi', 'Thân', 'Mão', 'Ngọ', 'Tỵ', 'Thân']);
  const ds = Object.fromEntries(t.cung.flatMap((c) => c.chinhTinh.map((s) => [s.ten, s.doSang])));
  assert.deepEqual(ds, { 'Thiên Cơ': 'Miếu', 'Thiên Lương': 'Miếu', 'Tử Vi': 'Bình', 'Thất Sát': 'Vượng', 'Liêm Trinh': 'Hãm', 'Phá Quân': 'Hãm', 'Thiên Phủ': 'Đắc',
    'Thiên Đồng': 'Hãm', 'Thái Âm': 'Hãm', 'Vũ Khúc': 'Miếu', 'Tham Lang': 'Miếu', 'Thái Dương': 'Hãm', 'Cự Môn': 'Đắc', 'Thiên Tướng': 'Hãm' });
  // Lá số 2 (Canh Thìn, tháng 7, ngày 10, giờ Sửu, dương nữ): các sao không phụ thuộc chế độ của trang
  const u = anSao({ canNam: 6, chiNam: 4, thang: 7, ngay: 10, chiGio: 1, nam: false });
  const p = (ten: string) => u.cung.find((c) => c.phuTinh.some((s) => s.ten === ten))!.chi;
  assert.deepEqual([p('Thiên Quý'), p('Ân Quang'), p('Thiên Khôi'), p('Thiên Việt'), p('Lưu Hà'), p('Thiên Trù')], ['Dậu', 'Tỵ', 'Ngọ', 'Dần', 'Thân', 'Dần']);
});

test('tử vi: 5 lá số tham chiếu kiểu Việt Nam phải khớp 100%', () => {
  const kq = chayDoiChieu().filter((r) => r.chuan);
  assert.equal(kq.length, 5);
  for (const r of kq) assert.deepEqual(r.lech, [], r.ten);
});

test('kinh dịch: bảng 64 quẻ nhất quán', () => {
  assert.equal(QUE.length, 64);
  assert.equal(new Set(QUE.map(([, t, h]) => `${t}/${h}`)).size, 64);
  assert.equal(new Set(QUE.map(([ten]) => ten)).size, 64);
  for (const [ten, thuong, ha] of QUE) {
    if (thuong === ha) assert.equal(ten, `Thuần ${thuong}`);
    else assert.ok(ten.startsWith(`${BAT_QUAI[thuong].tuong} ${BAT_QUAI[ha].tuong} `), ten);
  }
  assert.equal(traQue([1, 1, 1, 0, 0, 0]).ten, 'Địa Thiên Thái');
  assert.equal(traQue([1, 0, 1, 0, 1, 0]).so, 63);
});

test('kinh dịch: gieo xu và Mai Hoa', () => {
  for (let s = 1; s <= 200; s++) {
    const q = gieoQueDongXu('test', s);
    assert.ok(q.giaTriHao!.every((v) => v >= 6 && v <= 9));
    assert.equal(q.queBien === null, q.haoDong.length === 0);
    if (q.queBien) assert.equal(q.queBien.hao.filter((h, i) => h !== q.queChu.hao[i]).length, q.haoDong.length);
  }
  // 17/2/2026 (mùng 1 tháng Giêng Bính Ngọ) 10:00 VN: năm Ngọ=7, tháng 1, ngày 1, giờ Tỵ=6
  const m = gieoQueMaiHoa('test', new Date(Date.UTC(2026, 1, 17, 3, 0)));
  assert.equal(m.queChu.thuongQuai, 'Càn'); // 9 % 8 = 1
  assert.equal(m.queChu.haQuai, 'Cấn'); // 15 % 8 = 7
  assert.deepEqual(m.haoDong, [3]); // 15 % 6 = 3
  assert.equal(m.queChu.ten, 'Thiên Sơn Độn');
  assert.equal(m.queBien!.ten, 'Thiên Địa Bĩ');
  assert.equal(m.queHo.ten, 'Thiên Phong Cấu');
});

test('tarot: bộ bài và rút bài', () => {
  assert.equal(BO_BAI.length, 78);
  assert.equal(new Set(BO_BAI.map((l) => l.ten)).size, 78);
  assert.equal(BO_BAI.filter((l) => l.nhom === 'Ẩn chính').length, 22);
  const r = rutBai('celtic-cross', 'test', { seed: 42 });
  assert.equal(r.cacLa.length, 10);
  assert.equal(new Set(r.cacLa.map((c) => c.la.id)).size, 10);
  assert.deepEqual(rutBai('ba-la', '', { seed: 7 }), rutBai('ba-la', '', { seed: 7 }));
  const dem = new Map<number, number>();
  for (let s = 0; s < 7800; s++) { const id = rutBai('mot-la', '', { seed: s }).cacLa[0].la.id; dem.set(id, (dem.get(id) ?? 0) + 1); }
  assert.equal(dem.size, 78);
});
