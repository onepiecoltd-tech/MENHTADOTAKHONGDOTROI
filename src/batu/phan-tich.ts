/**
 * Phân tích bát tự chuyên sâu: vượng suy, cách cục (Tử Bình chân thuyên), dụng–hỷ–kỵ–cừu–nhàn, điều hậu,
 * thần sát, hình xung hợp hội, đếm thập thần kể tàng can, đánh giá đại vận và lưu niên.
 * Viết theo quy tắc cổ pháp công khai (Uyên Hải Tử Bình, Tử Bình Chân Thuyên, Cùng Thông Bảo Giám, Trích Thiên Tủy);
 * app bat-tu-dung-than chỉ dùng làm đối chiếu, không sao chép mã. Chỉ số: can 0=Giáp…9=Quý, chi 0=Tý…11=Hợi, hành 0=Mộc,1=Hỏa,2=Thổ,3=Kim,4=Thủy.
 */
import { CAN, CHI, NGU_HANH, hanhCuaCan, hanhCuaChi, tangCan, thapThan, type CanChi, type NguHanh } from '../lich/canchi.js';

export interface TuTruChi { nam: CanChi; thang: CanChi; ngay: CanChi; gio: CanChi }
const VT = ['nam', 'thang', 'ngay', 'gio'] as const;
const TEN_VT = { nam: 'năm', thang: 'tháng', ngay: 'ngày', gio: 'giờ' } as const;
type Vt = (typeof VT)[number];
const hanhIdx = (can: number) => Math.floor(can / 2);
const chiHanhIdx = (chi: number) => NGU_HANH.indexOf(hanhCuaChi(chi));
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Loại quan hệ của một hành so với nhật chủ: 0 tỷ kiếp, 1 thực thương, 2 tài, 3 quan sát, 4 ấn. */
const quanHe = (dmHanh: number, h: number) => mod(h - dmHanh, 5);
export const TEN_QUAN_HE = ['Tỷ Kiếp (cùng hành)', 'Thực Thương (hành mình sinh)', 'Tài (hành mình khắc)', 'Quan Sát (hành khắc mình)', 'Ấn (hành sinh mình)'] as const;

// ------------------------------------------------------------------ tư lệnh và vượng suy
/** Nhân nguyên tư lệnh phân dã: [can, số ngày] theo từng tháng chi, tính từ lúc giao tiết. */
const TU_LENH: [number, number][][] = [
  [[8, 10], [9, 20]], [[9, 9], [7, 3], [5, 18]], [[4, 7], [2, 7], [0, 16]], [[0, 10], [1, 20]], [[1, 9], [9, 3], [4, 18]], [[4, 5], [6, 9], [2, 16]],
  [[2, 10], [5, 9], [3, 11]], [[3, 9], [1, 3], [5, 18]], [[4, 7], [8, 7], [6, 16]], [[6, 10], [7, 20]], [[7, 9], [3, 3], [4, 18]], [[4, 7], [0, 5], [8, 18]],
];
const W_TANG = [[1], [0.7, 0.3], [0.6, 0.3, 0.1]];
const W_CAN: Record<Vt, number> = { nam: 8, thang: 12, ngay: 0, gio: 12 };
const W_CHI: Record<Vt, number> = { nam: 8, thang: 40, ngay: 15, gio: 10 };

export interface TuLenh { can: string; hanh: NguHanh; ngayTuTiet: number | null }
export interface VuongSuy {
  diem: number; /** 0–1: phần sức đỡ của nhật chủ (tỷ kiếp và ấn) trong toàn cục */
  muc: string; vuong: boolean; deLenh: boolean; deDia: boolean; deThe: boolean;
  tuLenh: TuLenh; chiaHanh: Record<NguHanh, number>; giaiThich: string;
}
function trongSoTang(chi: number, laThang: boolean, tu: TuLenh | null, ngayTuTiet: number | null): { can: number; w: number }[] {
  const t = tangCan(chi);
  if (laThang && ngayTuTiet != null) {
    let acc = 0, dang = TU_LENH[chi][TU_LENH[chi].length - 1][0];
    for (const [c, d] of TU_LENH[chi]) { acc += d; if (ngayTuTiet < acc) { dang = c; break; } }
    const khac = t.filter((c) => c !== dang);
    return t.map((c) => ({ can: c, w: c === dang ? 0.6 : 0.4 / Math.max(1, khac.length) }));
  }
  void tu;
  return t.map((c, i) => ({ can: c, w: W_TANG[t.length - 1][i] }));
}
export function phanVuongSuy(tt: TuTruChi, ngayTuTiet: number | null): VuongSuy {
  const dm = hanhIdx(tt.ngay.can);
  const chia = [0, 0, 0, 0, 0];
  let tong = 0;
  for (const v of VT) {
    if (v !== 'ngay') { chia[hanhIdx(tt[v].can)] += W_CAN[v]; tong += W_CAN[v]; }
    for (const { can, w } of trongSoTang(tt[v].chi, v === 'thang', null, ngayTuTiet)) { chia[hanhIdx(can)] += W_CHI[v] * w; }
    tong += W_CHI[v];
  }
  const ts = chia.map((x) => x / tong);
  const diem = ts[dm] + ts[mod(dm + 4, 5)];
  // tư lệnh
  const tl = trongSoTang(tt.thang.chi, true, null, ngayTuTiet).sort((a, b) => b.w - a.w)[0].can;
  const tuLenh: TuLenh = { can: CAN[tl], hanh: hanhCuaCan(tl), ngayTuTiet };
  const qhLenh = quanHe(dm, hanhIdx(tl));
  const deLenh = qhLenh === 0 || qhLenh === 4;
  const coGoc = VT.some((v) => tangCan(tt[v].chi).some((c) => hanhIdx(c) === dm) || chiHanhIdx(tt[v].chi) === dm && tangCan(tt[v].chi)[0] !== undefined && hanhIdx(tangCan(tt[v].chi)[0]) === dm);
  const deDia = coGoc;
  const canKhac = (['nam', 'thang', 'gio'] as const).filter((v) => { const q = quanHe(dm, hanhIdx(tt[v].can)); return q === 0 || q === 4; }).length;
  const deThe = canKhac >= 2;
  const muc = diem < 0.15 ? 'Cực nhược' : diem < 0.33 ? 'Nhược' : diem < 0.44 ? 'Hơi nhược' : diem < 0.56 ? 'Trung hòa' : diem < 0.67 ? 'Hơi vượng' : diem < 0.82 ? 'Vượng' : 'Cực vượng';
  const chiaHanh = Object.fromEntries(NGU_HANH.map((h, i) => [h, Math.round(ts[i] * 1000) / 10])) as Record<NguHanh, number>;
  const giaiThich = `Nhật chủ ${CAN[tt.ngay.can]} (${NGU_HANH[dm]}): ${deLenh ? 'đắc lệnh' : 'thất lệnh'} (tháng ${CHI[tt.thang.chi]}, tư lệnh ${CAN[tl]}${ngayTuTiet != null ? `, sau tiết ${ngayTuTiet.toFixed(1)} ngày` : ''}), ${deDia ? 'có gốc (thông căn) ở địa chi' : 'không có gốc ở địa chi'}, ${deThe ? 'được thế (nhiều can cùng đảng)' : 'không được thế'}; sức đỡ ${(diem * 100).toFixed(0)}%.`;
  const vuong = diem >= 0.5 || (deLenh && deDia && diem >= 0.42 && ts[dm] >= 0.25);
  return { diem: Math.round(diem * 1000) / 1000, muc: vuong && diem < 0.56 ? 'Hơi vượng' : muc, vuong, deLenh, deDia, deThe, tuLenh, chiaHanh, giaiThich };
}

// ------------------------------------------------------------------ cách cục
const LOC = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
const DUONG_NHAN = [3, -1, 6, -1, 6, -1, 9, -1, 0, -1];
const DE_VUONG_AM = [-1, 2, -1, 5, -1, 5, -1, 8, -1, 11];
const TEN_CACH: Record<string, string> = {
  'Chính Quan': '正官格', 'Thất Sát': '七殺格', 'Chính Tài': '正財格', 'Thiên Tài': '偏財格', 'Chính Ấn': '正印格', 'Thiên Ấn': '偏印格', 'Thực Thần': '食神格', 'Thương Quan': '傷官格',
};
const TEN_CACH_VI: Record<string, string> = {
  '正官格': 'Chính Quan cách', '七殺格': 'Thất Sát cách', '正財格': 'Chính Tài cách', '偏財格': 'Thiên Tài cách', '正印格': 'Chính Ấn cách', '偏印格': 'Thiên Ấn cách', '食神格': 'Thực Thần cách', '傷官格': 'Thương Quan cách',
  '建祿格': 'Kiến Lộc cách', '羊刃格': 'Dương Nhẫn cách', '月劫格': 'Nguyệt Kiếp cách', '從財格': 'Tòng Tài cách', '從殺格': 'Tòng Sát cách', '從兒格': 'Tòng Nhi cách', '曲直格': 'Khúc Trực cách (Mộc chuyên vượng)',
  '炎上格': 'Viêm Thượng cách (Hỏa chuyên vượng)', '稼穡格': 'Giá Sắc cách (Thổ chuyên vượng)', '從革格': 'Tòng Cách cách (Kim chuyên vượng)', '潤下格': 'Nhuận Hạ cách (Thủy chuyên vượng)',
};
const NOTE_CACH: Record<string, string> = {
  '正官格': 'Chính Quan: cần Tài Ấn hộ vệ, kỵ Thương Quan phá, kỵ Quan Sát hỗn tạp.',
  '七殺格': 'Thất Sát: cần Thực Thần chế hoặc Ấn hóa sát; kỵ Tài sinh Sát mà thân nhược.',
  '正財格': 'Chính Tài: cần thân vượng đủ gánh tài, có Thực Thương sinh tài; kỵ Tỷ Kiếp đoạt tài.',
  '偏財格': 'Thiên Tài: thích thân vượng, Thực Thương sinh tài; kỵ Tỷ Kiếp tranh tài.',
  '正印格': 'Chính Ấn: thích Quan Sát sinh Ấn; kỵ Tài phá Ấn khi thân nhược.',
  '偏印格': 'Thiên Ấn (Kiêu): kỵ Kiêu đoạt Thực; cần Tài chế Kiêu hoặc dùng Kiêu hóa Sát.',
  '食神格': 'Thực Thần: sinh Tài là đẹp, kỵ Kiêu đoạt Thực.',
  '傷官格': 'Thương Quan: Thương Quan sinh Tài hoặc Thương Quan phối Ấn là tốt; kỵ Thương Quan thấy Quan.',
  '建祿格': 'Kiến Lộc: thân vượng tự nhiên, cần Quan Sát, Tài, Thực Thương làm dụng.',
  '羊刃格': 'Dương Nhẫn: thân rất vượng, cần Quan Sát chế nhẫn.',
  '月劫格': 'Nguyệt Kiếp: thân vượng, cần Quan Sát hoặc Thực Thương tiết khí.',
};
export interface CachCuc {
  ten: string; tenViet: string; loai: 'chinh' | 'dac-biet'; geThan: string | null; ghiChu: string;
}
function phanCachCuc(tt: TuTruChi, vs: VuongSuy, tongKhac: { vuongHanh: number; hanhNhieu: number }): CachCuc {
  const dm = tt.ngay.can, dmH = hanhIdx(dm), thang = tt.thang.chi;
  const mk = (ten: string, loai: 'chinh' | 'dac-biet', geThan: string | null, ghiChu?: string): CachCuc => ({ ten, tenViet: TEN_CACH_VI[ten] ?? ten, loai, geThan, ghiChu: ghiChu ?? NOTE_CACH[ten] ?? '' });
  const cc = vs.chiaHanh;
  const sh = NGU_HANH.map((h) => cc[h] / 100);
  const goc = VT.some((v) => tangCan(tt[v].chi).some((c) => hanhIdx(c) === dmH));
  const yinShare = sh[mod(dmH + 4, 5)];
  const sameShare = sh[dmH];
  // tòng cách: thân rất nhược, thất lệnh, ấn ít (giả tòng nếu còn chút gốc)
  if (vs.diem < 0.26 && !vs.deLenh && yinShare < 0.2) {
    const caiS = sh[mod(dmH + 2, 5)], quanS0 = sh[mod(dmH + 3, 5)];
    const ten = quanS0 >= 0.25 ? '從殺格' : caiS >= 0.25 ? '從財格' : '從兒格';
    const chuHanh = ten === '從殺格' ? 'Quan Sát' : ten === '從財格' ? 'Tài' : 'Thực Thương';
    return mk(ten, 'dac-biet', null, `Thân rất nhược, thất lệnh, ấn ít${goc ? ' (còn chút gốc nên là giả tòng)' : ''}: theo thế ${chuHanh}; vận trợ thân (Tỷ Kiếp, Ấn) là xấu, vận thuận thế là tốt.`);
  }
  // chuyên vượng
  const mua: number[][] = [[2, 3, 4], [5, 6, 7], [4, 7, 10, 1], [8, 9, 10], [11, 0, 1]];
  const tenCV = ['曲直格', '炎上格', '稼穡格', '從革格', '潤下格'];
  const quanS = sh[mod(dmH + 3, 5)];
  if (vs.diem >= 0.64 && quanS < 0.08 && mua[dmH].includes(thang) && sameShare >= 0.45 && !(DUONG_NHAN[dm] === thang && vs.diem < 0.85 && sh[mod(dmH + 2, 5)] + quanS >= 0.05)) {
    return mk(tenCV[dmH], 'dac-biet', null, 'Một hành áp đảo, không có Quan Sát phá: thuận theo thế vượng, dùng Tỷ Kiếp, Ấn và Thực Thương tiết tú; kỵ Quan Sát.');
  }
  // chính cách
  if (LOC[dm] === thang) return mk('建祿格', 'chinh', null);
  if (DUONG_NHAN[dm] === thang) return mk('羊刃格', 'chinh', null);
  if (DE_VUONG_AM[dm] === thang) return mk('月劫格', 'chinh', null);
  const lo = (['nam', 'thang', 'gio'] as const).map((v) => tt[v].can);
  const hs = tangCan(thang);
  let chon: number | null = null;
  for (const c of hs) { if (quanHe(dmH, hanhIdx(c)) !== 0 && lo.includes(c)) { chon = c; break; } }
  if (chon == null) chon = hs.find((c) => quanHe(dmH, hanhIdx(c)) !== 0) ?? hs[0];
  const than = thapThan(dm, chon);
  const ten = TEN_CACH[than] ?? '建祿格';
  const thau = lo.includes(chon);
  void tongKhac;
  return mk(ten, 'chinh', `${CAN[chon]} (${than})`, `${NOTE_CACH[ten] ?? ''} Cách lấy từ ${CAN[chon]} trong tháng ${CHI[thang]}${thau ? ', đã thấu can' : ', chưa thấu can nên lấy theo bản khí'}.`);
}

// ------------------------------------------------------------------ dụng thần
export interface DungThan {
  dung: NguHanh; phu: NguHanh | null; hy: NguHanh; ky: NguHanh; cuu: NguHanh; nhan: NguHanh[];
  phuongPhap: string[]; lyDo: string[]; dieuHau: { can: string; hanh: NguHanh[]; ghiChu: string } | null;
}
function tinhDungThan(tt: TuTruChi, vs: VuongSuy, cach: CachCuc): DungThan {
  const dmH = hanhIdx(tt.ngay.can);
  const sh = NGU_HANH.map((h) => vs.chiaHanh[h] / 100);
  const H = (q: number) => mod(dmH + q, 5);
  const lyDo: string[] = [], pp: string[] = [];
  let dung: number, phu: number | null = null;
  if (cach.loai === 'dac-biet') {
    pp.push('Theo cách cục đặc biệt');
    if (cach.ten === '從財格') { dung = H(2); phu = H(1); }
    else if (cach.ten === '從殺格') { dung = H(3); phu = H(2); }
    else if (cach.ten === '從兒格') { dung = H(1); phu = H(2); }
    else { dung = dmH; phu = H(4); }
    lyDo.push(`${cach.tenViet}: dụng theo thế của cục (${NGU_HANH[dung]}), không dùng phép phù ức thông thường.`);
  } else if (!vs.vuong) {
    pp.push('Phù ức (thân nhược: phù trợ)');
    const tai = sh[H(2)], quan = sh[H(3)], thuc = sh[H(1)];
    const m = Math.max(tai, quan, thuc);
    if (m === tai) { dung = dmH; phu = H(4); lyDo.push(`Thân nhược, Tài nặng (${(tai * 100).toFixed(0)}%): lấy Tỷ Kiếp ${NGU_HANH[dmH]} bang thân gánh tài, Ấn ${NGU_HANH[H(4)]} làm phụ.`); }
    else if (m === quan) { dung = H(4); phu = dmH; lyDo.push(`Thân nhược, Quan Sát nặng (${(quan * 100).toFixed(0)}%): lấy Ấn ${NGU_HANH[H(4)]} hóa sát sinh thân, Tỷ Kiếp làm phụ.`); }
    else { dung = H(4); phu = dmH; lyDo.push(`Thân nhược, Thực Thương tiết nhiều (${(thuc * 100).toFixed(0)}%): lấy Ấn ${NGU_HANH[H(4)]} chế Thực Thương và sinh thân, Tỷ Kiếp làm phụ.`); }
  } else {
    pp.push('Phù ức (thân vượng: khắc, tiết, hao)');
    const yin = sh[H(4)], ty = sh[dmH], quan = sh[H(3)];
    if (vs.diem >= 0.7) { dung = H(1); phu = H(2); lyDo.push(`Thân vượng cực (${(vs.diem * 100).toFixed(0)}%): theo Trích Thiên Tủy, vượng cực không nên khắc mà nên tiết, lấy Thực Thương ${NGU_HANH[H(1)]} tiết tú, Tài làm phụ.`); }
    else if (yin > ty) { dung = H(2); phu = H(3); lyDo.push(`Thân vượng do Ấn nhiều (${(yin * 100).toFixed(0)}%): lấy Tài ${NGU_HANH[H(2)]} chế Ấn, Quan Sát làm phụ.`); }
    else if (quan >= 0.06) { dung = H(3); phu = H(1); lyDo.push(`Thân vượng do Tỷ Kiếp nhiều (${(ty * 100).toFixed(0)}%): lấy Quan Sát ${NGU_HANH[H(3)]} chế thân, Thực Thương tiết tú làm phụ.`); }
    else { dung = H(1); phu = H(2); lyDo.push(`Thân vượng do Tỷ Kiếp nhiều, không có Quan Sát: lấy Thực Thương ${NGU_HANH[H(1)]} tiết tú, Tài làm phụ.`); }
  }
  // điều hậu (Cùng Thông Bảo Giám): chỉ lấn khi khí hậu thiên lệch nặng
  const thang = tt.thang.chi;
  const nong = [5, 6, 7].includes(thang), lanh = [11, 0, 1].includes(thang);
  let dieuHau: DungThan['dieuHau'] = null;
  if (nong || lanh) {
    const hanhHoa = 1, hanhThuy = 4;
    const kk = nong ? sh[1] + sh[0] * 0.3 : sh[4] + sh[3] * 0.3;
    const dieu = nong ? [hanhThuy, 3] : [hanhHoa, 0];
    const co = nong ? sh[4] : sh[1];
    dieuHau = { can: nong ? 'Sinh tháng nóng, cần Thủy hạ nhiệt' : 'Sinh tháng lạnh, cần Hỏa sưởi ấm', hanh: dieu.map((i) => NGU_HANH[i]), ghiChu: `${nong ? 'Hỏa Mộc' : 'Thủy Kim'} chiếm khoảng ${(kk * 100).toFixed(0)}%, ${nong ? 'Thủy' : 'Hỏa'} chỉ ${(co * 100).toFixed(0)}%.` };
    if (cach.loai !== 'dac-biet' && kk >= 0.5 && co <= 0.1) {
      pp.push('Điều hậu (khí hậu lệch nặng, lấn phù ức)');
      phu = dung !== dieu[0] ? dung : phu;
      dung = dieu[0];
      lyDo.push(`Điều hậu: ${dieuHau.can}; ${dieuHau.ghiChu} Lấy ${NGU_HANH[dieu[0]]} làm dụng.`);
    } else lyDo.push(`Điều hậu (tham khảo): ${dieuHau.can}, ${dieuHau.ghiChu}`);
  }
  const sinhD = mod(dung - 1, 5), khacD = mod(dung - 2, 5), cuu = mod(khacD - 1, 5);
  const nhan = [0, 1, 2, 3, 4].filter((i) => ![dung, sinhD, khacD, cuu].includes(i));
  return { dung: NGU_HANH[dung], phu: phu != null && phu !== dung ? NGU_HANH[phu] : null, hy: NGU_HANH[sinhD], ky: NGU_HANH[khacD], cuu: NGU_HANH[cuu], nhan: nhan.map((i) => NGU_HANH[i]), phuongPhap: pp, lyDo, dieuHau };
}
export type VaiTro = 'dụng' | 'hỷ' | 'kỵ' | 'cừu' | 'nhàn';
function vaiTroCuaHanh(d: DungThan, h: NguHanh): VaiTro { return h === d.dung ? 'dụng' : h === d.hy ? 'hỷ' : h === d.ky ? 'kỵ' : h === d.cuu ? 'cừu' : 'nhàn'; }

// ------------------------------------------------------------------ hình xung hợp hội
export interface TuongTac { loai: string; chiTiet: string; viTri: string }
const HOP_CAN: [number, number, NguHanh][] = [[0, 5, 'Thổ'], [1, 6, 'Kim'], [2, 7, 'Thủy'], [3, 8, 'Mộc'], [4, 9, 'Hỏa']];
const XUNG_CAN: [number, number][] = [[0, 6], [1, 7], [2, 8], [3, 9]];
const LUC_HOP: [number, number, NguHanh][] = [[0, 1, 'Thổ'], [2, 11, 'Mộc'], [3, 10, 'Hỏa'], [4, 9, 'Kim'], [5, 8, 'Thủy'], [6, 7, 'Hỏa']];
const TAM_HOP: [number[], NguHanh][] = [[[8, 0, 4], 'Thủy'], [[11, 3, 7], 'Mộc'], [[2, 6, 10], 'Hỏa'], [[5, 9, 1], 'Kim']];
const TAM_HOI: [number[], NguHanh][] = [[[2, 3, 4], 'Mộc'], [[5, 6, 7], 'Hỏa'], [[8, 9, 10], 'Kim'], [[11, 0, 1], 'Thủy']];
const HAI: [number, number][] = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
const TAM_HINH: number[][] = [[2, 5, 8], [1, 10, 7]];
const TU_HINH = [4, 6, 9, 11];
export function tuongTacTuTru(tt: TuTruChi): TuongTac[] {
  const kq: TuongTac[] = [];
  const ten = (v: Vt) => TEN_VT[v];
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const a = VT[i], b = VT[j];
    const ca = tt[a].can, cb = tt[b].can, za = tt[a].chi, zb = tt[b].chi;
    for (const [x, y, h] of HOP_CAN) if ((ca === x && cb === y) || (ca === y && cb === x)) kq.push({ loai: 'Can hợp', chiTiet: `${CAN[ca]} hợp ${CAN[cb]} (hóa ${h} nếu đủ điều kiện)`, viTri: `${ten(a)}–${ten(b)}` });
    for (const [x, y] of XUNG_CAN) if ((ca === x && cb === y) || (ca === y && cb === x)) kq.push({ loai: 'Can xung', chiTiet: `${CAN[ca]} xung ${CAN[cb]}`, viTri: `${ten(a)}–${ten(b)}` });
    for (const [x, y, h] of LUC_HOP) if ((za === x && zb === y) || (za === y && zb === x)) kq.push({ loai: 'Chi lục hợp', chiTiet: `${CHI[za]} hợp ${CHI[zb]} (${h})`, viTri: `${ten(a)}–${ten(b)}` });
    if (mod(za - zb, 12) === 6) kq.push({ loai: 'Chi lục xung', chiTiet: `${CHI[za]} xung ${CHI[zb]}`, viTri: `${ten(a)}–${ten(b)}` });
    for (const [x, y] of HAI) if ((za === x && zb === y) || (za === y && zb === x)) kq.push({ loai: 'Chi lục hại', chiTiet: `${CHI[za]} hại ${CHI[zb]}`, viTri: `${ten(a)}–${ten(b)}` });
    if ((za === 0 && zb === 3) || (za === 3 && zb === 0)) kq.push({ loai: 'Chi hình', chiTiet: 'Tý hình Mão (vô lễ chi hình)', viTri: `${ten(a)}–${ten(b)}` });
    if (za === zb && TU_HINH.includes(za)) kq.push({ loai: 'Chi tự hình', chiTiet: `${CHI[za]} gặp ${CHI[zb]} (tự hình)`, viTri: `${ten(a)}–${ten(b)}` });
  }
  const chiCo = new Set(VT.map((v) => tt[v].chi));
  for (const [g, h] of TAM_HOP) { const c = g.filter((z) => chiCo.has(z)); if (c.length === 3) kq.push({ loai: 'Tam hợp', chiTiet: `${g.map((z) => CHI[z]).join(' ')} hợp cục ${h}`, viTri: 'toàn cục' }); else if (c.length === 2 && c.includes(g[0]) && c.includes(g[1]) || c.length === 2 && c.includes(g[1]) && c.includes(g[2])) kq.push({ loai: 'Bán tam hợp', chiTiet: `${c.map((z) => CHI[z]).join(' ')} thuộc cục ${h}`, viTri: 'toàn cục' }); }
  for (const [g, h] of TAM_HOI) if (g.every((z) => chiCo.has(z))) kq.push({ loai: 'Tam hội', chiTiet: `${g.map((z) => CHI[z]).join(' ')} hội phương ${h}`, viTri: 'toàn cục' });
  for (const g of TAM_HINH) if (g.every((z) => chiCo.has(z))) kq.push({ loai: 'Tam hình', chiTiet: `${g.map((z) => CHI[z]).join(' ')} tam hình`, viTri: 'toàn cục' }); else if (g.filter((z) => chiCo.has(z)).length === 2) kq.push({ loai: 'Bán hình', chiTiet: `${g.filter((z) => chiCo.has(z)).map((z) => CHI[z]).join(' ')} (thiếu một chi để thành tam hình)`, viTri: 'toàn cục' });
  return kq;
}

// ------------------------------------------------------------------ thần sát
const QUY_NHAN: Record<number, number[]> = { 0: [1, 7], 4: [1, 7], 6: [1, 7], 1: [0, 8], 5: [0, 8], 2: [11, 9], 3: [11, 9], 8: [5, 3], 9: [5, 3], 7: [2, 6] };
const VAN_XUONG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
const NHOM_TAM_HOP = (chi: number) => [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]].findIndex((g) => g.includes(chi));
const DICH_MA = [2, 8, 11, 5], DAO_HOA = [9, 3, 6, 0], HOA_CAI = [4, 10, 1, 7], TUONG_TINH = [0, 6, 9, 3];
// thiên đức theo chi tháng (0=Tý)
const THIEN_DUC_BANG: Record<number, { loai: 'can' | 'chi'; v: number }> = {
  2: { loai: 'can', v: 3 }, 3: { loai: 'chi', v: 8 }, 4: { loai: 'can', v: 8 }, 5: { loai: 'can', v: 7 }, 6: { loai: 'chi', v: 11 }, 7: { loai: 'can', v: 0 },
  8: { loai: 'can', v: 9 }, 9: { loai: 'chi', v: 2 }, 10: { loai: 'can', v: 2 }, 11: { loai: 'can', v: 1 }, 0: { loai: 'chi', v: 5 }, 1: { loai: 'can', v: 6 },
};
const NGUYET_DUC = (chi: number) => [8, 0, 4].includes(chi) ? 8 : [2, 6, 10].includes(chi) ? 2 : [11, 3, 7].includes(chi) ? 0 : 6;
export interface ThanSat { ten: string; viTri: string[]; y: string }
export function thanSat(tt: TuTruChi): ThanSat[] {
  const kq: ThanSat[] = [];
  const dm = tt.ngay.can;
  const them = (ten: string, y: string, kiem: (v: Vt) => boolean | string) => {
    const vt = VT.filter((v) => kiem(v)).map((v) => TEN_VT[v]);
    if (vt.length) kq.push({ ten, viTri: vt, y });
  };
  const chiCuaV = (v: Vt) => tt[v].chi;
  them('Thiên Ất quý nhân', 'Gặp việc có người giúp, dễ hóa hung thành cát (tính từ can ngày và can năm).', (v) => [tt.ngay.can, tt.nam.can].some((c) => QUY_NHAN[c].includes(chiCuaV(v))));
  them('Văn Xương', 'Thông minh, học hành, thi cử, nghề văn chữ.', (v) => chiCuaV(v) === VAN_XUONG[dm]);
  them('Lộc thần', 'Nguồn lộc cơ bản, tự có phần ăn.', (v) => chiCuaV(v) === LOC[dm]);
  if (DUONG_NHAN[dm] >= 0) them('Dương nhẫn', 'Tính cương liệt, quyết đoán, hay xung đột; cần chế bằng Quan Sát.', (v) => chiCuaV(v) === DUONG_NHAN[dm]);
  const nhom = (c: number) => NHOM_TAM_HOP(c);
  const goc = [tt.ngay.chi, tt.nam.chi];
  them('Dịch mã', 'Hay đi lại, đổi chỗ, thay đổi môi trường sống hoặc việc làm.', (v) => goc.some((g) => g !== chiCuaV(v) && DICH_MA[nhom(g)] === chiCuaV(v)));
  them('Đào hoa', 'Duyên dáng, được người khác giới để ý; cần giữ chừng mực.', (v) => goc.some((g) => g !== chiCuaV(v) && DAO_HOA[nhom(g)] === chiCuaV(v)));
  them('Hoa cái', 'Thiên về nghệ thuật, tôn giáo, tâm linh, hay cô độc, thích suy tư.', (v) => goc.some((g) => g !== chiCuaV(v) && HOA_CAI[nhom(g)] === chiCuaV(v)));
  them('Tướng tinh', 'Có tài lãnh đạo, quản lý.', (v) => goc.some((g) => g !== chiCuaV(v) && TUONG_TINH[nhom(g)] === chiCuaV(v)));
  const td = THIEN_DUC_BANG[tt.thang.chi];
  them('Thiên đức', 'Phúc đức che chở, gặp hung dễ giải.', (v) => (v === 'thang' && td.loai === 'can' ? false : td.loai === 'can' ? tt[v].can === td.v : chiCuaV(v) === td.v));
  const nd = NGUYET_DUC(tt.thang.chi);
  them('Nguyệt đức', 'Phúc đức theo tháng sinh, tính nhân hậu, được người giúp.', (v) => v !== 'thang' && tt[v].can === nd);
  const khongV = (() => { const xs = mod(tt.ngay.chi - tt.ngay.can, 12); return [mod(xs + 10, 12), mod(xs + 11, 12)]; })();
  them('Không vong', 'Cung bị trống rỗng, việc thuộc cung đó dễ thiếu bền hoặc đến muộn (tính theo trụ ngày).', (v) => v !== 'ngay' && khongV.includes(chiCuaV(v)));
  const ngayTru = `${tt.ngay.can}-${tt.ngay.chi}`;
  if (['6-4', '6-10', '8-4', '4-10'].includes(ngayTru)) kq.push({ ten: 'Khôi cương', viTri: ['ngày'], y: 'Tính cách cứng rắn, quyết liệt, thích hợp vị trí quyền lực; sợ gặp xung phá.' });
  const coDon = (chi: number) => [[11, 0, 1, 2, 10], [2, 3, 4, 5, 1], [5, 6, 7, 8, 4], [8, 9, 10, 11, 7]].find((g) => g.slice(0, 3).includes(chi))!;
  const g = coDon(tt.nam.chi);
  them('Cô thần', 'Dễ thấy lẻ loi, ít gắn bó, cần chủ động kết nối.', (v) => v !== 'nam' && chiCuaV(v) === g[3]);
  them('Quả tú', 'Duyên bạn đời đến trễ hoặc hay xa cách; cần chủ động vun đắp.', (v) => v !== 'nam' && chiCuaV(v) === g[4]);
  return kq;
}

// ------------------------------------------------------------------ đếm thập thần kể tàng can
export interface DemThan { ten: string; so: number; chiTiet: string[] }
export function demThapThan(tt: TuTruChi): DemThan[] {
  const dm = tt.ngay.can;
  const map = new Map<string, string[]>();
  const add = (g: string, s: string) => map.set(g, [...(map.get(g) ?? []), s]);
  for (const v of VT) {
    if (v !== 'ngay') add(thapThan(dm, tt[v].can), `${CAN[tt[v].can]} lộ ở ${TEN_VT[v]}`);
    const tg = tangCan(tt[v].chi);
    tg.forEach((c, i) => add(thapThan(dm, c), `${CAN[c]} tàng trong ${CHI[tt[v].chi]} (${TEN_VT[v]})${i === 0 ? ', bản khí' : ''}`));
  }
  const thuTu = ['Tỷ Kiên', 'Kiếp Tài', 'Thực Thần', 'Thương Quan', 'Thiên Tài', 'Chính Tài', 'Thất Sát', 'Chính Quan', 'Thiên Ấn', 'Chính Ấn'];
  return thuTu.map((ten) => ({ ten, so: (map.get(ten) ?? []).length, chiTiet: map.get(ten) ?? [] }));
}

// ------------------------------------------------------------------ đại vận, lưu niên
export interface DanhGiaVan {
  canChi: string; thapThanCan: string; thapThanChi: string; vaiTroCan: VaiTro; vaiTroChi: VaiTro;
  diem: number; nhan: 'Thuận' | 'Hơi thuận' | 'Bình' | 'Hơi nghịch' | 'Nghịch'; tuongTac: string[];
}
const DIEM_VT: Record<VaiTro, number> = { 'dụng': 2, 'hỷ': 1, 'nhàn': 0, 'cừu': -1, 'kỵ': -2 };
export function danhGiaVan(pt: PhanTichBatTu, cc: CanChi, tt: TuTruChi): DanhGiaVan {
  const d = pt.dungThan, dm = tt.ngay.can;
  const vtCan = vaiTroCuaHanh(d, hanhCuaCan(cc.can));
  const chiBan = tangCan(cc.chi)[0];
  const vtChi = vaiTroCuaHanh(d, hanhCuaCan(chiBan));
  let diem = DIEM_VT[vtCan] + DIEM_VT[vtChi] * 1.5;
  const tu: string[] = [];
  const xung = (a: number, b: number) => mod(a - b, 12) === 6;
  const dayChi = tt.ngay.chi, monthChi = tt.thang.chi;
  if (xung(cc.chi, dayChi)) { diem -= 2; tu.push(`${CHI[cc.chi]} xung ${CHI[dayChi]} ở trụ ngày (động đến bản thân, hôn nhân, nơi ở)`); }
  if (xung(cc.chi, monthChi)) { diem -= 1.5; tu.push(`${CHI[cc.chi]} xung ${CHI[monthChi]} ở trụ tháng (động đến công việc, gia đạo, lệnh tháng)`); }
  if (xung(cc.chi, tt.nam.chi)) { diem -= 0.5; tu.push(`${CHI[cc.chi]} xung trụ năm`); }
  if (xung(cc.chi, tt.gio.chi)) { diem -= 0.5; tu.push(`${CHI[cc.chi]} xung trụ giờ`); }
  for (const [x, y] of LUC_HOP) if ((cc.chi === x && dayChi === y) || (cc.chi === y && dayChi === x)) { diem += 1; tu.push(`${CHI[cc.chi]} hợp ${CHI[dayChi]} ở trụ ngày (dễ có duyên, hợp tác, việc hôn nhân)`); }
  for (const [x, y] of HAI) if ((cc.chi === x && dayChi === y) || (cc.chi === y && dayChi === x)) { diem -= 0.5; tu.push(`${CHI[cc.chi]} hại ${CHI[dayChi]}`); }
  for (const [x, y] of XUNG_CAN) if ((cc.can === x && dm === y) || (cc.can === y && dm === x)) { diem -= 1; tu.push(`${CAN[cc.can]} xung nhật chủ ${CAN[dm]}`); }
  for (const [x, y] of HOP_CAN) if ((cc.can === x && dm === y) || (cc.can === y && dm === x)) tu.push(`${CAN[cc.can]} hợp nhật chủ ${CAN[dm]}`);
  diem = Math.round(diem * 10) / 10;
  const nhan = diem >= 4 ? 'Thuận' : diem >= 2 ? 'Hơi thuận' : diem > -2 ? 'Bình' : diem > -4 ? 'Hơi nghịch' : 'Nghịch';
  return { canChi: `${CAN[cc.can]} ${CHI[cc.chi]}`, thapThanCan: thapThan(dm, cc.can), thapThanChi: thapThan(dm, chiBan), vaiTroCan: vtCan, vaiTroChi: vtChi, diem, nhan, tuongTac: tu };
}
/** Can chi của năm dương lịch (tính theo năm Lập Xuân xấp xỉ năm dương). */
export const canChiNamDuong = (y: number): CanChi => ({ can: mod(y - 4, 10), chi: mod(y - 4, 12) });

// ------------------------------------------------------------------ tổng hợp
export interface PhanTichBatTu {
  vuongSuy: VuongSuy; cachCuc: CachCuc; dungThan: DungThan; tuongTac: TuongTac[]; thanSat: ThanSat[]; demThan: DemThan[];
  vaiTroHanh: Record<NguHanh, VaiTro>; khongVong: string[]; tomTat: string;
}
export function phanTichTuTru(tt: TuTruChi, ngayTuTiet: number | null = null): PhanTichBatTu {
  const vuongSuy = phanVuongSuy(tt, ngayTuTiet);
  const cachCuc = phanCachCuc(tt, vuongSuy, { vuongHanh: 0, hanhNhieu: 0 });
  const dungThan = tinhDungThan(tt, vuongSuy, cachCuc);
  const vaiTroHanh = Object.fromEntries(NGU_HANH.map((h) => [h, vaiTroCuaHanh(dungThan, h)])) as Record<NguHanh, VaiTro>;
  const xs = mod(tt.ngay.chi - tt.ngay.can, 12);
  const khongVong = [CHI[mod(xs + 10, 12)], CHI[mod(xs + 11, 12)]];
  const tomTat = `${vuongSuy.muc} (${(vuongSuy.diem * 100).toFixed(0)}%), ${cachCuc.tenViet}; dụng ${dungThan.dung}, hỷ ${dungThan.hy}, kỵ ${dungThan.ky}, cừu ${dungThan.cuu}`;
  return { vuongSuy, cachCuc, dungThan, tuongTac: tuongTacTuTru(tt), thanSat: thanSat(tt), demThan: demThapThan(tt), vaiTroHanh, khongVong, tomTat };
}
void hanhCuaChi;
