/** Rút gọn dữ liệu thành văn bản ngắn cho prompt: giữ đủ thông tin luận giải, bỏ cấu trúc JSON thừa. */
import type { LaSoBatTu } from '../batu/index.js';
import type { LaSoTuVi } from '../tuvi/index.js';
import type { KetQuaTarot } from '../tarot/index.js';
import type { ganLoiQue } from '../kinhdich/loi-que.js';
import type { LaSoChiemTinh } from '../chiemtinh/index.js';
import { danhGiaVan, canChiNamDuong } from '../batu/phan-tich.js';
import type { KetQuaPhongThuy } from '../phongthuy/index.js';
import { GRAHA, tenRashi, type LaSoVeDa } from '../chiemtinh/veda.js';
import { duongSangAm } from '../lich/amlich-viet.js';
import { CAN, CHI } from '../lich/canchi.js';

/** Năm âm lịch (theo Tết Việt Nam) của một ngày dương lịch. */
export function namAmLich(ngay: Date = new Date()) {
  const vn = new Date(ngay.getTime() + 7 * 3600_000);
  const am = duongSangAm(vn.getUTCDate(), vn.getUTCMonth() + 1, vn.getUTCFullYear(), 7);
  return { nam: am.nam, canChi: `${CAN[(am.nam + 6) % 10]} ${CHI[(am.nam + 8) % 12]}`, chi: CHI[(am.nam + 8) % 12] };
}

/** Sao hạn dân gian (cửu diệu) theo tuổi âm và giới tính. Chỉ là phụ, ý nghĩa mang tính tham khảo. */
const CUU_DIEU: Record<'nam' | 'nu', string[]> = {
  nam: ['La Hầu', 'Thổ Tú', 'Thủy Diệu', 'Thái Bạch', 'Thái Dương', 'Vân Hớn', 'Kế Đô', 'Thái Âm', 'Mộc Đức'],
  nu: ['Kế Đô', 'Vân Hớn', 'Mộc Đức', 'Thái Âm', 'Thổ Tú', 'La Hầu', 'Thái Dương', 'Thái Bạch', 'Thủy Diệu'],
};
const Y_NGHIA_CUU_DIEU: Record<string, string> = {
  'La Hầu': 'xấu: khẩu thiệt, kiện tụng, tai tiếng', 'Thổ Tú': 'xấu nhẹ: trở ngại, tiểu nhân, hao hụt nhỏ', 'Thủy Diệu': 'tốt: tài lộc, phúc, kỵ sông nước',
  'Thái Bạch': 'xấu: hao tài, dễ mất của', 'Thái Dương': 'tốt: thuận lợi, tài lộc, hợp nam hơn nữ', 'Vân Hớn': 'xấu: sức khỏe, thị phi, tai nạn nhẹ',
  'Kế Đô': 'xấu: buồn phiền, thị phi, tình cảm trắc trở', 'Thái Âm': 'tốt: thuận lợi, quý nhân, hợp nữ hơn nam', 'Mộc Đức': 'tốt: hỷ sự, hôn nhân, làm ăn',
};
export function saoHanDanGian(tuoiAm: number, gioiTinh: 'nam' | 'nu'): { sao: string; yNghia: string } {
  const sao = CUU_DIEU[gioiTinh][(((tuoiAm - 10) % 9) + 9) % 9];
  return { sao, yNghia: Y_NGHIA_CUU_DIEU[sao] };
}

export function rutGonBatTu(b: LaSoBatTu, ngayXem: Date = new Date()): string {
  const t = b.tuTru;
  const tru = (ten: string, x: typeof t.nam) =>
    `- Trụ ${ten}: ${x.ten} (${x.hanhCan}/${x.hanhChi}), ${x.thapThan}, nạp âm ${x.napAm}; tàng can: ${x.tangCan.map((c) => `${c.can} ${c.thapThan}`).join(', ')}`;
  const namDuong = new Date(ngayXem.getTime() + 7 * 3600_000).getUTCFullYear();
  const hienTai = [...b.daiVan.danhSach].reverse().find((d) => d.namBatDau <= namDuong);
  const dong = [
    'BÁT TỰ (TỨ TRỤ)',
    tru('năm', t.nam), tru('tháng', t.thang), tru('ngày', t.ngay), tru('giờ', t.gio),
    `- Nhật chủ: ${b.nhatChu.can} (${b.nhatChu.amDuong} ${b.nhatChu.hanh}), sinh sau tiết ${b.tietKhi}`,
    `- Ngũ hành 8 chữ: ${Object.entries(b.nguHanh).map(([h, n]) => `${h} ${n}`).join(', ')}${b.hanhThieu.length ? `; thiếu: ${b.hanhThieu.join(', ')}` : ''}`,
    `- Ngũ hành tính cả tàng can: ${Object.entries(b.nguHanhCoTangCan).map(([h, n]) => `${h} ${n}`).join(', ')}`,
    `- Đại vận (${b.daiVan.thuan ? 'thuận' : 'nghịch'}, khởi vận sau sinh ${b.daiVan.khoiVanSau}): ${b.daiVan.danhSach.map((d) => `${d.tuoiBatDau}t ${d.canChi} (${d.thapThan})`).join('; ')}`,
    hienTai ? `- Đại vận đang hành (${namDuong}): ${hienTai.canChi}, ${hienTai.thapThan}, từ ${hienTai.namBatDau}` : '',
    ...b.ghiChu.map((g) => `- Ghi chú: ${g}`),
    ...phanTichBatTuChu(b, namDuong),
  ];
  return dong.filter(Boolean).join('\n');
}

const namDuongCua = (ngay: Date) => new Date(ngay.getTime() + 7 * 3600_000).getUTCFullYear();

export function rutGonTuVi(l: LaSoTuVi, ngayXem: Date = new Date()): string {
  const nay = namAmLich(ngayXem);
  const tuoiAm = nay.nam - l.amLich.nam + 1;
  const cung = (ten: string) => l.cung.find((c) => c.ten === ten)!;
  const dongCung = l.cung.map((c) => {
    const chinh = c.chinhTinh.length ? c.chinhTinh.map((s) => `${s.ten} (${s.doSang}${s.tuHoa ? ', ' + s.tuHoa : ''})`).join(', ') : 'vô chính diệu';
    const nhom = (n: string) => c.phuTinh.filter((s) => s.nhom === n && !s.ten.startsWith('Hóa ')).map((s) => s.ten + (s.tuHoa ? ` (${s.tuHoa})` : '')).join(', ');
    const phan = [`cát: ${nhom('cát tinh') || '-'}`, `sát: ${nhom('sát tinh') || '-'}`, `khác: ${nhom('phụ tinh') || '-'}`,
      `vòng: ${c.vongThaiTue}, ${c.vongLocTon}, ${c.vongTrangSinh}`];
    const co = [c.tuan && 'TUẦN', c.triet && 'TRIỆT', c.laCungThan && 'THÂN CƯ'].filter(Boolean).join(', ');
    return `- ${c.ten} [${c.can} ${c.chi}]${co ? ' {' + co + '}' : ''}: ${chinh} | ${phan.join(' | ')} | đại hạn ${c.daiHan[0]}-${c.daiHan[1]} | tiểu hạn năm ${c.tieuHan}`;
  });
  const daiHan = l.cung.find((c) => tuoiAm >= c.daiHan[0] && tuoiAm <= c.daiHan[1]);
  const tieuHan = l.cung.find((c) => c.tieuHan === nay.chi);
  const gt = l.amDuong.includes('Nữ') ? 'nu' : 'nam';
  const saoHan = [0, 1, 2, 3, 4].map((k) => `${tuoiAm + k}t ${nay.nam + k - nay.nam + namDuongCua(ngayXem)}: ${saoHanDanGian(tuoiAm + k, gt).sao}`);
  const nghiaNay = saoHanDanGian(tuoiAm, gt);
  return [
    'LÁ SỐ TỬ VI (kiểu Việt Nam)',
    `- ${l.amDuong}, ${l.thuanNghich}; sinh ${l.gioSinh}, ngày ${l.amLich.ngay} tháng ${l.amLich.thang}${l.amLich.nhuan ? ' nhuận' : ''} năm ${l.amLich.canChiNam} (âm lịch)`,
    `- Bản mệnh ${l.banMenh}; ${l.cuc}; Mệnh tại ${l.cungMenhTai}; Thân cư ${l.thanCu}; Mệnh chủ ${l.menhChu}; Thân chủ ${l.thanChu}`,
    `- Tam phương tứ chính của Mệnh: Mệnh (${cung('Mệnh').chi}), Quan Lộc (${cung('Quan Lộc').chi}), Tài Bạch (${cung('Tài Bạch').chi}), Thiên Di (${cung('Thiên Di').chi})`,
    `- Năm xem: ${nay.canChi}, ${tuoiAm} tuổi âm. Đại hạn hiện tại: cung ${daiHan?.ten ?? '?'} (${daiHan?.daiHan.join('-')}). Tiểu hạn năm nay: cung ${tieuHan?.ten ?? '?'}`,
    `- Sao hạn dân gian (cửu diệu, chỉ tham khảo thêm): ${saoHan.join('; ')}. Năm xem là ${nghiaNay.sao}, ${nghiaNay.yNghia}`,
    ...cachCucTuVi(l),
    '12 cung:',
    ...dongCung,
    ...l.ghiChu.map((g) => `- Ghi chú: ${g}`),
  ].join('\n');
}

export function rutGonQue(k: ReturnType<typeof ganLoiQue>): string {
  const q = (ten: string, x: { ten: string; so: number; thuongQuai: string; haQuai: string }) => `${ten}: ${x.so}. ${x.ten} (${x.thuongQuai} trên, ${x.haQuai} dưới)`;
  const l = k.loiQue;
  const loi = (x: NonNullable<typeof l.queBien>) => [x.loiQue && `  Lời quẻ: ${x.loiQue}`, x.thoan && `  Thoán: ${x.thoan}`, x.daiTuong && `  Đại Tượng: ${x.daiTuong}`].filter(Boolean).join('\n');
  return [
    `QUẺ KINH DỊCH (${k.phuongPhap === 'ba-dong-xu' ? 'gieo 3 đồng xu' : 'Mai Hoa theo thời gian'})`,
    k.cauHoi ? `Câu hỏi: ${k.cauHoi}` : '',
    q('Quẻ chủ', k.queChu), loi(l.queChu),
    k.haoDong.length ? `Hào động: ${l.haoDong.map((h) => `${h.ten} (hào ${h.viTri})`).join(', ')}` : 'Không có hào động (quẻ tĩnh): luận theo lời quẻ chủ.',
    ...l.haoDong.map((h) => `  ${h.ten}: ${h.loi || '(chưa có nguyên văn)'}${h.tieuTuong ? ` — Tiểu Tượng: ${h.tieuTuong}` : ''}`),
    'dung' in l && l.dung ? `  Sáu hào đều động: ${l.dung}` : '',
    q('Quẻ hỗ', k.queHo),
    k.queBien && l.queBien ? q('Quẻ biến', k.queBien) + '\n' + loi(l.queBien) : '',
    `Nguồn lời quẻ: ${l.daCoNguyenVan ? l.nguon : 'CHƯA CÓ NGUYÊN VĂN, phải nói rõ với người hỏi'}`,
  ].filter(Boolean).join('\n');
}

export function rutGonTarot(k: KetQuaTarot): string {
  return [
    `TRẢI BÀI TAROT (${k.kieuTrai}, bộ Rider–Waite)`,
    k.cauHoi ? `Câu hỏi: ${k.cauHoi}` : '',
    ...k.cacLa.map((c, i) => `${i + 1}. ${c.viTri}: ${c.la.ten} / ${c.la.tenAnh}${c.nguoc ? ' (NGƯỢC)' : ' (xuôi)'}${c.la.bo ? `, bộ ${c.la.bo}, nguyên tố ${c.la.nguyenTo}` : ', Ẩn chính'}`),
  ].filter(Boolean).join('\n');
}

export function rutGonChiemTinh(c: LaSoChiemTinh): string {
  const vt = (x: { cung: string; doTrongCung: number }) => `${Math.floor(x.doTrongCung)}°${String(Math.round((x.doTrongCung % 1) * 60)).padStart(2, '0')}' ${x.cung}`;
  return [
    `BẢN ĐỒ SAO (chiêm tinh phương Tây, hoàng đạo nhiệt đới, hệ nhà ${c.heNha})`,
    `- Sinh tại ${c.noiSinh.ten} (${c.noiSinh.viDo}°, ${c.noiSinh.kinhDo}°), giờ quốc tế ${c.gioUTC}`,
    `- Cung Mọc: ${vt(c.cungMoc)}; Thiên Đỉnh (MC): ${vt(c.thienDinh)}`,
    'Hành tinh:',
    ...c.hanhTinh.map((h) => `- ${h.ten}: ${vt(h)}, nhà ${h.nha}${h.nghichHanh ? ', nghịch hành' : ''}`),
    `Nguyên tố: ${Object.entries(c.nguyenTo).map(([k, v]) => `${k} ${v}`).join(', ')}. Tính chất: ${Object.entries(c.tinhChat).map(([k, v]) => `${k} ${v}`).join(', ')}`,
    'Góc chiếu (độ lệch tăng dần):',
    ...c.gocChieu.slice(0, 18).map((g) => `- ${g.a} ${g.ten.toLowerCase()} ${g.b} (lệch ${g.lech}°)`),
    ...c.ghiChu.map((g) => `- Ghi chú: ${g}`),
  ].join('\n');
}

export function rutGonVeDa(v: LaSoVeDa): string {
  const d = (x: number) => `${Math.floor(x)}°${String(Math.floor((x % 1) * 60)).padStart(2, '0')}'`;
  const ten = (m: keyof typeof GRAHA) => `${GRAHA[m].ten} (${GRAHA[m].phan})`;
  const ds = v.dasha;
  const chieuDen = (m: string) => v.chieu.filter((c) => c.den === m).map((c) => GRAHA[c.tu].phan).join(', ');
  return [
    `LÁ SỐ CHIÊM TINH VỆ ĐÀ (Jyotish; sidereal, ayanamsa Lahiri ${v.ayanamsa.toFixed(2)}°, nhà cung trọn)`,
    `- Sinh tại ${v.noiSinh.ten}, giờ quốc tế ${v.gioUTC}`,
    `- Lagna (cung Mọc): ${d(v.lagna.doTrongRashi)} ${tenRashi(v.lagna.rashi)}, nakshatra ${v.lagna.nakshatra} pada ${v.lagna.pada}; Navamsa Lagna ${tenRashi(v.lagna.navamsa)}`,
    'Graha:',
    ...v.graha.map((g) => `- ${ten(g.ma)}: ${d(g.doTrongRashi)} ${tenRashi(g.rashi)}, nhà ${g.nha}, ${g.nakshatra} pada ${g.pada} (chủ ${GRAHA[g.chuNakshatra].phan}), D9 ${tenRashi(g.navamsa)}${g.phamChat ? ', ' + g.phamChat : ''}${g.nghichHanh && g.ma !== 'Rahu' && g.ma !== 'Ketu' ? ', nghịch hành' : ''}${g.biDot ? ', bị đốt (combust)' : ''}${chieuDen(g.ma) ? `; được chiếu bởi ${chieuDen(g.ma)}` : ''}`),
    'Chủ nhà (nhà: rashi, chủ tinh → đang ngồi nhà):',
    `- ${v.chuNha.map((c) => `${c.nha}: ${tenRashi(c.rashi).split(' ')[0]}, ${GRAHA[c.chu].phan} → ${c.ngoiNha}`).join('; ')}`,
    `Yoga và dosha phát hiện được: ${v.yoga.length ? '' : 'không có trong danh sách hệ thống kiểm tra'}`,
    ...v.yoga.map((y) => `- ${y}`),
    `Vimshottari dasha (theo nakshatra Mặt Trăng; ${ds.duDauDoi}):`,
    `- Mahadasha: ${ds.maha.map((m) => `${GRAHA[m.graha].phan} ${m.batDau}→${m.ketThuc}`).join('; ')}`,
    ds.hienTai ? `- Đang chạy: mahadasha ${ten(ds.hienTai.graha)} (${ds.hienTai.batDau}→${ds.hienTai.ketThuc}), antardasha ${ds.antarHienTai ? `${ten(ds.antarHienTai.graha)} (${ds.antarHienTai.batDau}→${ds.antarHienTai.ketThuc})` : '?'}` : '',
    ds.antar.length ? `- Các antardasha của mahadasha hiện tại: ${ds.antar.map((a) => `${GRAHA[a.graha].phan} ${a.batDau}→${a.ketThuc}`).join('; ')}` : '',
    `Quá cảnh ngày ${v.quaCanh.ngayXem}: ${v.quaCanh.graha.map((q) => `${GRAHA[q.ma].phan} ở ${tenRashi(q.rashi).split(' ')[0]} (nhà ${q.tuLagna} từ Lagna, nhà ${q.tuMatTrang} từ Mặt Trăng${q.nghichHanh && q.ma !== 'Rahu' && q.ma !== 'Ketu' ? ', nghịch' : ''})`).join('; ')}. ${v.quaCanh.ghiChu.join('. ')}`,
    ...v.ghiChu.map((g) => `- Ghi chú: ${g}`),
  ].filter(Boolean).join('\n');
}

export function rutGonPhongThuy(r: KetQuaPhongThuy): string {
  const dn = (l: { ten: string; huong: string }[]) => l.map((x) => `${x.ten} ${x.huong}`).join('; ');
  const dong: string[] = [`PHONG THỦY (ngày xem ${r.ngayXem}, năm Lập Xuân ${r.namXem}, vận ${r.van})`];
  const b = r.batTrach;
  if (b) {
    dong.push(`- Mệnh quái: ${b.menhQuai.ten} (${b.menhQuai.hanh}, ${b.menhQuai.nhom}), tuổi ${r.tuoi}`);
    dong.push(`- Du niên của người: ${dn(b.duNienNguoi)}`);
    if (b.nha) dong.push(`- Nhà: tọa ${b.nha.toa} hướng ${b.nha.huong}, ${b.nha.quai} (${b.nha.nhom}). ${b.nha.nhan}`, `- Du niên của nhà: ${dn(b.nha.duNien)}`);
  }
  const h = r.huyenKhong;
  if (h) {
    dong.push(`- Huyền Không vận ${h.van}: tọa ${h.toaSon}, hướng ${h.huongSon}; trung cung sơn ${h.trung.son} hướng ${h.trung.huongTinh}`);
    dong.push(`  Cung (sơn/hướng/vận): ${h.cung.map((c) => `${c.huong} ${c.son}/${c.huongTinh}/${c.van}`).join('; ')}`);
    dong.push(`  ${h.theQuai.ghiChu}${h.khongVong ? ' ' + h.khongVong : ''}`);
    for (const c of h.cachCuc) dong.push(`  ${c}`);
  }
  const n = r.luuNien;
  dong.push(`- Lưu niên ${n.nam} (${n.chiNam}): sao trung cung ${n.saoTrung}; Ngũ Hoàng ${n.nguHoang}; Nhị Hắc ${n.nhiHac}; Thái Tuế ${n.thaiTue}; Tuế Phá ${n.tuePha}; Tam Sát ${n.tamSat}`);
  dong.push(`- Lưu nguyệt (tháng ${r.luuNguyet.chiThang}): sao trung cung ${r.luuNguyet.saoTrung}`);
  const c = r.chonNgay;
  dong.push(`- Ngày tốt (${c.loai}, ${c.soNgay} ngày từ ${c.tuNgay}): ` + (c.ngayTot.map((x) => `${x.ngay} ${x.thu} ${x.canChi} trực ${x.truc} (${x.diem}đ: ${x.lyDo.join(' ')})`).join(' | ') || 'không có'));
  dong.push(`- Ngày nên tránh: ` + (c.ngayTranh.map((x) => `${x.ngay} ${x.canChi} trực ${x.truc}`).join('; ') || 'không có'));
  dong.push('Ghi chú nguồn: Bát Trạch, Huyền Không, kiến trừ là quy tắc cổ truyền tính bằng công thức; mục ⚖ là quan niệm dân gian.');
  return dong.join('\n');
}

/** Phần phân tích chuyên sâu của bát tự: vượng suy, cách cục, dụng thần, tương tác, thần sát, đếm thập thần, đánh giá vận. */
function phanTichBatTuChu(b: LaSoBatTu, namXem: number): string[] {
  const p = b.phanTich, d = p.dungThan, v = p.vuongSuy;
  const dong: string[] = ['', 'PHÂN TÍCH CHUYÊN SÂU (do hệ thống tính theo cổ pháp, dùng nguyên như vậy)'];
  dong.push(`- Vượng suy: ${v.muc} (sức đỡ ${(v.diem * 100).toFixed(0)}%). ${v.giaiThich}`);
  dong.push(`- Tỷ lệ ngũ hành có tàng can theo trọng số vị trí: ${Object.entries(v.chiaHanh).map(([h, n]) => `${h} ${n}%`).join(', ')}`);
  dong.push(`- Cách cục: ${p.cachCuc.tenViet} (${p.cachCuc.ten})${p.cachCuc.geThan ? `, lấy ${p.cachCuc.geThan}` : ''}. ${p.cachCuc.ghiChu}`);
  dong.push(`- Dụng thần: ${d.dung}${d.phu ? ` (phụ ${d.phu})` : ''}; hỷ ${d.hy}; kỵ ${d.ky}; cừu ${d.cuu}; nhàn ${d.nhan.join(', ') || '—'}. Phương pháp: ${d.phuongPhap.join(', ')}`);
  for (const l of d.lyDo) dong.push(`  · ${l}`);
  dong.push(`- Đếm thập thần kể tàng can: ${p.demThan.filter((x) => x.so > 0).map((x) => `${x.ten} ${x.so}`).join(', ')}`);
  dong.push(`- Hình xung hợp hội: ${p.tuongTac.length ? p.tuongTac.map((t) => `${t.loai} ${t.chiTiet} (${t.viTri})`).join('; ') : 'không có đáng kể'}`);
  dong.push(`- Thần sát: ${p.thanSat.length ? p.thanSat.map((t) => `${t.ten} ở ${t.viTri.join(', ')}`).join('; ') : 'không có'}; không vong (theo trụ ngày): ${p.khongVong.join(', ')}`);
  const dv = b.daiVan.danhSach.map((x) => { const g = danhGiaVan(p, x.chiSo, b.tuTruChi); return `${x.tuoiBatDau}-${x.tuoiKetThuc}t (${x.namBatDau}) ${g.canChi}: ${g.nhan}${g.tuongTac.length ? ' [' + g.tuongTac.join('; ') + ']' : ''}`; });
  dong.push(`- Đánh giá đại vận theo dụng–kỵ: ${dv.join(' | ')}`);
  const ln: string[] = [];
  for (let y = namXem - 1; y <= namXem + 6; y++) { const g = danhGiaVan(p, canChiNamDuong(y), b.tuTruChi); ln.push(`${y} ${g.canChi} (${g.thapThanCan}/${g.thapThanChi}): ${g.nhan}${g.tuongTac.length ? ' [' + g.tuongTac.join('; ') + ']' : ''}`); }
  dong.push(`- Lưu niên (tính theo năm dương lịch, gần đúng quanh Lập Xuân): ${ln.join(' | ')}`);
  dong.push('- Chú ý: nhãn Thuận/Nghịch chỉ là xu hướng theo dụng–kỵ, không phải phán quyết; vận nghịch vẫn có thể bình ổn nếu chủ động.');
  return dong;
}

/** Cách cục tử vi do máy nhận (bộ 51 của TuViMCP): chỉ đưa tên, loại, mô tả và căn cứ ngắn, không đưa nguyên cổ ca. */
function cachCucTuVi(l: LaSoTuVi): string[] {
  if (!l.cachCuc.length) return ['- Cách cục nhận được (51 cách cục): không có cách nào thỏa điều kiện.'];
  return ['- Cách cục nhận được (51 cách cục, đã kiểm điều kiện bằng máy):', ...l.cachCuc.map((c) => `  · ${c.ten} [${c.loai}]: ${c.moTa} Căn cứ: ${c.lyDo}${c.uuKhuyetDiem ? ' Lưu ý: ' + c.uuKhuyetDiem : ''}`)];
}
