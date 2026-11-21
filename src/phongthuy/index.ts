/**
 * Phong thủy: Bát Trạch (mệnh quái, nhà tọa hướng, du niên), Huyền Không phi tinh (sơn, hướng, vận, lưu niên, lưu nguyệt,
 * Thái Tuế, Tuế Phá, Tam Sát) và chọn ngày (kiến trừ thập nhị trực, nguyệt phá, chính tứ phế, xung tuổi).
 * Viết lại từ quy tắc cổ truyền công khai; lịch (tiết khí, can chi ngày) lấy từ thư viện lunar-typescript đã dùng cho bát tự.
 * Phong thủy ở đây chỉ là tham khảo bổ trợ: con người và hoàn cảnh thực tế quan trọng hơn.
 */
import { Solar } from 'lunar-typescript';

/** Tám cung: số Lạc Thư, tên, hướng, hành, nhóm. */
export const CUNG = {
  1: { ten: 'Khảm', huong: 'Bắc', hanh: 'Thủy', nhom: 'Đông tứ', do: 0 },
  2: { ten: 'Khôn', huong: 'Tây Nam', hanh: 'Thổ', nhom: 'Tây tứ', do: 225 },
  3: { ten: 'Chấn', huong: 'Đông', hanh: 'Mộc', nhom: 'Đông tứ', do: 90 },
  4: { ten: 'Tốn', huong: 'Đông Nam', hanh: 'Mộc', nhom: 'Đông tứ', do: 135 },
  6: { ten: 'Càn', huong: 'Tây Bắc', hanh: 'Kim', nhom: 'Tây tứ', do: 315 },
  7: { ten: 'Đoài', huong: 'Tây', hanh: 'Kim', nhom: 'Tây tứ', do: 270 },
  8: { ten: 'Cấn', huong: 'Đông Bắc', hanh: 'Thổ', nhom: 'Tây tứ', do: 45 },
  9: { ten: 'Ly', huong: 'Nam', hanh: 'Hỏa', nhom: 'Đông tứ', do: 180 },
} as const;
export type SoCung = keyof typeof CUNG;
const CUNG_SO = [1, 2, 3, 4, 6, 7, 8, 9] as SoCung[];

const m360 = (x: number) => ((x % 360) + 360) % 360;
/** Cung chứa một góc (độ, 0 = Bắc, theo chiều kim đồng hồ). */
export function cungTuGoc(do_: number): SoCung {
  const thuTu: SoCung[] = [1, 8, 3, 4, 9, 2, 7, 6]; // Bắc, ĐB, Đông, ĐN, Nam, TN, Tây, TB
  return thuTu[Math.floor(((m360(do_) + 22.5) % 360) / 45)];
}
const doiCung = (c: SoCung): SoCung => cungTuGoc(CUNG[c].do + 180);

// ---------------------------------------------------------------- năm theo Lập Xuân
const HOA_GIAP = (can: string, chi: string) => ['甲乙丙丁戊己庚辛壬癸'.indexOf(can), '子丑寅卯辰巳午未申酉戌亥'.indexOf(chi)];
/** Năm dương lịch tính theo Lập Xuân (trước Lập Xuân vẫn thuộc năm trước). */
export function namTheoLapXuan(y: number, m: number, d: number, gio = 12): number {
  const gz = Solar.fromYmdHms(y, m, d, gio, 0, 0).getLunar().getYearInGanZhiExact();
  const [can, chi] = HOA_GIAP(gz[0], gz[1]);
  for (const ung of [y, y - 1]) if (((ung - 4) % 10 + 10) % 10 === can && ((ung - 4) % 12 + 12) % 12 === chi) return ung;
  return y;
}
const chiCuaNam = (nam: number) => (((nam - 4) % 12) + 12) % 12;
export const TEN_CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;
const huongCuaChi = (chi: number) => CUNG[cungTuGoc(chi * 30)].huong;

// ---------------------------------------------------------------- Bát Trạch
export type GioiTinh = 'nam' | 'nu';
/** Mệnh quái (số 1–9 trừ 5) theo năm sinh Lập Xuân và giới tính. */
export function menhQuai(namSinh: number, gioi: GioiTinh): SoCung {
  let s = String(namSinh).split('').reduce((a, c) => a + Number(c), 0);
  while (s > 9) s = String(s).split('').reduce((a, c) => a + Number(c), 0);
  let q = gioi === 'nam' ? (11 - s) % 9 : (s + 4) % 9;
  if (q === 0) q = 9;
  if (q === 5) q = gioi === 'nam' ? 2 : 8;
  return q as SoCung;
}
/** Hào của quái từ dưới lên (1 = dương). */
const HAO: Record<number, [number, number, number]> = { 1: [0, 1, 0], 2: [0, 0, 0], 3: [1, 0, 0], 4: [0, 1, 1], 6: [1, 1, 1], 7: [1, 1, 0], 8: [0, 0, 1], 9: [1, 0, 1] };
const quaiTuHao = (h: number[]): SoCung => CUNG_SO.find((c) => HAO[c].every((v, i) => v === h[i]))!;
export const DU_NIEN = ['Sinh khí', 'Diên niên', 'Thiên y', 'Phục vị', 'Họa hại', 'Lục sát', 'Ngũ quỷ', 'Tuyệt mệnh'] as const;
export type TenDuNien = (typeof DU_NIEN)[number];
const CAT = new Set<TenDuNien>(['Sinh khí', 'Diên niên', 'Thiên y', 'Phục vị']);
/** Biến hào: [đáy, giữa, đỉnh] cần đổi. */
const BIEN: Record<TenDuNien, [number, number, number]> = {
  'Sinh khí': [0, 0, 1], 'Họa hại': [1, 0, 0], 'Tuyệt mệnh': [0, 1, 0], 'Thiên y': [1, 1, 0],
  'Ngũ quỷ': [0, 1, 1], 'Lục sát': [1, 0, 1], 'Diên niên': [1, 1, 1], 'Phục vị': [0, 0, 0],
};
export interface DuNien { ten: TenDuNien; cat: boolean; cung: SoCung; huong: string }
/** Tám du niên của một quái (cho người theo mệnh quái, cho nhà theo tọa quái). */
export function duNien(quai: SoCung): DuNien[] {
  return DU_NIEN.map((ten) => {
    const cung = quaiTuHao(HAO[quai].map((v, i) => (BIEN[ten][i] ? 1 - v : v)));
    return { ten, cat: CAT.has(ten), cung, huong: CUNG[cung].huong };
  });
}

export interface BatTrach {
  menhQuai: { so: SoCung; ten: string; hanh: string; nhom: string };
  duNienNguoi: DuNien[];
  nha?: { toa: string; huong: string; quai: string; nhom: string; duNien: DuNien[]; hopMenh: boolean; nhan: string };
}
function lapBatTrach(namSinh: number, gioi: GioiTinh, huongNhaDo?: number): BatTrach {
  const q = menhQuai(namSinh, gioi);
  const kq: BatTrach = { menhQuai: { so: q, ten: CUNG[q].ten, hanh: CUNG[q].hanh, nhom: CUNG[q].nhom }, duNienNguoi: duNien(q) };
  if (huongNhaDo !== undefined) {
    const h = cungTuGoc(huongNhaDo);
    const toa = doiCung(h);
    const hop = CUNG[toa].nhom === CUNG[q].nhom;
    kq.nha = {
      toa: CUNG[toa].huong, huong: CUNG[h].huong, quai: `${CUNG[toa].ten} trạch`, nhom: CUNG[toa].nhom, duNien: duNien(toa), hopMenh: hop,
      nhan: hop ? `Mệnh ${CUNG[q].nhom} ở nhà ${CUNG[toa].nhom}: hợp nhóm.` : `Mệnh ${CUNG[q].nhom} ở nhà ${CUNG[toa].nhom}: khác nhóm, nên chọn phòng ngủ và bếp theo hướng tốt của chính mình.`,
    };
  }
  return kq;
}

// ---------------------------------------------------------------- Huyền Không
/** 24 sơn: mỗi cung ba sơn theo thứ tự [địa nguyên, thiên nguyên, nhân nguyên] theo chiều kim đồng hồ, kèm âm dương. */
const SON24: { ten: string; han: string; cung: SoCung; nguyen: 'địa' | 'thiên' | 'nhân'; duong: boolean }[] = [
  ['Nhâm', '壬', 1, 'địa', true], ['Tý', '子', 1, 'thiên', false], ['Quý', '癸', 1, 'nhân', false],
  ['Sửu', '丑', 8, 'địa', false], ['Cấn', '艮', 8, 'thiên', true], ['Dần', '寅', 8, 'nhân', true],
  ['Giáp', '甲', 3, 'địa', true], ['Mão', '卯', 3, 'thiên', false], ['Ất', '乙', 3, 'nhân', false],
  ['Thìn', '辰', 4, 'địa', false], ['Tốn', '巽', 4, 'thiên', true], ['Tỵ', '巳', 4, 'nhân', true],
  ['Bính', '丙', 9, 'địa', true], ['Ngọ', '午', 9, 'thiên', false], ['Đinh', '丁', 9, 'nhân', false],
  ['Mùi', '未', 2, 'địa', false], ['Khôn', '坤', 2, 'thiên', true], ['Thân', '申', 2, 'nhân', true],
  ['Canh', '庚', 7, 'địa', true], ['Dậu', '酉', 7, 'thiên', false], ['Tân', '辛', 7, 'nhân', false],
  ['Tuất', '戌', 6, 'địa', false], ['Càn', '乾', 6, 'thiên', true], ['Hợi', '亥', 6, 'nhân', true],
].map(([ten, han, cung, nguyen, duong]) => ({ ten, han, cung, nguyen, duong }) as never);
/** Chỉ số sơn trong SON24 theo góc (Tý ở 0°, mỗi sơn 15°). SON24 bắt đầu từ Nhâm (337.5°). */
function chiSoSon(do_: number): number { return Math.floor(((m360(do_) + 22.5) % 360) / 15) ; }
export function sonTuGoc(do_: number) {
  const i = (chiSoSon(do_) + 0) % 24; // 0 = Nhâm vì 337.5–352.5 ứng với (do+22.5)=0..15
  const son = SON24[i];
  const tam = (i * 15 + 345) % 360; // góc tâm của sơn (Nhâm = 345°)
  const lech = ((do_ - tam + 540) % 360) - 180;
  return { ...son, chiSo: i, tam, lech };
}
/** Vòng bay Lạc Thư: trung cung, Càn, Đoài, Cấn, Ly, Khảm, Khôn, Chấn, Tốn. */
const VONG: ('T' | SoCung)[] = ['T', 6, 7, 8, 9, 1, 2, 3, 4];
const SAO_CUNG_GOC: Record<number, SoCung> = { 1: 1, 2: 2, 3: 3, 4: 4, 6: 6, 7: 7, 8: 8, 9: 9 };
const wrap9 = (n: number) => ((n - 1) % 9 + 9) % 9 + 1;
function bay(trungTinh: number, thuan: boolean): Record<'T' | SoCung, number> {
  const kq = {} as Record<'T' | SoCung, number>;
  VONG.forEach((c, i) => { kq[c] = wrap9(thuan ? trungTinh + i : trungTinh - i); });
  return kq;
}
/** Vận theo năm (Lập Xuân). Vận 9 = 2024–2043. */
export const vanCuaNam = (nam: number) => ((Math.floor((nam - 1864) / 20) % 9) + 9) % 9 + 1;
const THE_QUAI: Record<string, number> = { 子: 1, 癸: 1, 甲: 1, 申: 1, 坤: 2, 壬: 2, 乙: 2, 卯: 2, 未: 2, 戌: 6, 乾: 6, 亥: 6, 辰: 6, 巽: 6, 巳: 6, 艮: 7, 丙: 7, 辛: 7, 酉: 7, 丑: 7, 寅: 9, 午: 9, 庚: 9, 丁: 9 };
/** Chiều bay của sao `s` đặt ở trung cung khi tham chiếu sơn `ref` (cùng nguyên long). */
function chieuBay(s: number, ref: typeof SON24[number], theQuai: boolean): boolean {
  if (s === 5) return ref.duong;
  const cung = SAO_CUNG_GOC[s];
  const son = SON24.find((x) => x.cung === cung && x.nguyen === ref.nguyen)!;
  void theQuai;
  return son.duong;
}

export interface CungPhi { cung: SoCung; ten: string; huong: string; van: number; son: number; huongTinh: number }
export interface HuyenKhong {
  van: number; toaSon: string; huongSon: string; toaDo: number; huongDo: number; cungHuong: string; cungToa: string;
  cung: CungPhi[]; trung: { van: number; son: number; huongTinh: number };
  theQuai: { duocApDung: boolean; canNhac: boolean; ghiChu: string };
  khongVong: string | null;
  cachCuc: string[];
}
const TEN_TINH = ['', 'Nhất Bạch', 'Nhị Hắc', 'Tam Bích', 'Tứ Lục', 'Ngũ Hoàng', 'Lục Bạch', 'Thất Xích', 'Bát Bạch', 'Cửu Tử'];
export const tenTinh = (n: number) => TEN_TINH[n];

export function lapHuyenKhong(huongDo: number, van: number, theQuai = false): HuyenKhong {
  const h = sonTuGoc(huongDo);
  const t = sonTuGoc(huongDo + 180);
  const nen = bay(van, true);
  const trungHuong = nen[h.cung];
  const trungSon = nen[t.cung];
  // Thế quái: đổi sao trung cung theo bảng thế quái của sơn
  const canNhac = Math.abs(h.lech) > 3;
  let sH = trungHuong, sS = trungSon;
  if (theQuai) { sH = THE_QUAI[h.han] ?? sH; sS = THE_QUAI[t.han] ?? sS; }
  const phiHuong = bay(sH, chieuBay(sH, h, theQuai));
  const phiSon = bay(sS, chieuBay(sS, t, theQuai));
  const cung: CungPhi[] = CUNG_SO.map((c) => ({ cung: c, ten: CUNG[c].ten, huong: CUNG[c].huong, van: nen[c], son: phiSon[c], huongTinh: phiHuong[c] }));
  // khoảng trống (không vong): cách ranh giới sơn ≤ 1,5°
  const bien = Math.abs(Math.abs(h.lech) - 7.5);
  const trenBienCung = Math.min(...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => Math.abs(((huongDo - (22.5 + 45 * k)) + 540) % 360 - 180)));
  const khongVong = trenBienCung <= 1.5 ? 'Đại không vong: góc nằm sát ranh giới hai cung, nên đo lại bằng la bàn ở nhiều điểm.' : bien <= 1.5 ? 'Tiểu không vong: góc nằm sát ranh giới hai sơn trong cùng cung.' : null;
  const cachCuc: string[] = [];
  const vanTot = new Set([van, wrap9(van + 1)]);
  for (const c of cung) {
    if (c.cung === cungTuGoc(huongDo) && vanTot.has(c.huongTinh)) cachCuc.push(`Cung hướng (${c.ten}) có sao hướng ${c.huongTinh} đang vượng/sinh: hướng cửa, khoảng trống phía trước thuận.`);
    if (c.cung === cungTuGoc(huongDo + 180) && vanTot.has(c.son)) cachCuc.push(`Cung tọa (${c.ten}) có sao sơn ${c.son} đang vượng/sinh: phía sau nhà vững.`);
  }
  if (trungHuong + trungSon === 10 || (trungHuong === van && trungSon === van)) cachCuc.push('Có thể thuộc nhóm hợp thập hoặc phục ngâm: nên xem kỹ thêm trước khi kết luận.');
  return {
    van, toaSon: `${t.ten} (${t.han})`, huongSon: `${h.ten} (${h.han})`, toaDo: m360(huongDo + 180), huongDo: m360(huongDo),
    cungHuong: CUNG[h.cung].huong, cungToa: CUNG[t.cung].huong, cung, trung: { van, son: sS, huongTinh: sH },
    theQuai: {
      duocApDung: theQuai, canNhac,
      ghiChu: canNhac ? `Hướng lệch ${Math.abs(h.lech).toFixed(1)}° so với tâm sơn, vượt 3°: cân nhắc dùng thế quái (đổi sao) nếu thầy địa lý của bạn đo và thấy phù hợp.` : 'Hướng nằm gần tâm sơn, không cần thế quái.',
    },
    khongVong, cachCuc,
  };
}

// ---------------------------------------------------------------- lưu niên, lưu nguyệt, Thái Tuế
export interface LuuNien {
  nam: number; chiNam: string; saoTrung: number; bay: { cung: SoCung; ten: string; huong: string; sao: number }[];
  nguHoang: string; nhiHac: string; thaiTue: string; tuePha: string; tamSat: string; ghiChu: string;
}
const bayNien = (trung: number) => { const m = bay(trung, true); return CUNG_SO.map((c) => ({ cung: c, ten: CUNG[c].ten, huong: CUNG[c].huong, sao: m[c] })); };
export function luuNien(nam: number): LuuNien {
  const trung = ((10 - (nam % 9)) % 9) + 1;
  const b = bayNien(trung);
  const huongSao = (s: number) => b.find((x) => x.sao === s)!.huong;
  const chi = chiCuaNam(nam);
  const nhom = chi % 4; // 0: Tý Thìn Thân; 1: Sửu Tỵ Dậu; 2: Dần Ngọ Tuất; 3: Mão Mùi Hợi
  const sat = ['Nam', 'Đông', 'Bắc', 'Tây'][nhom];
  return {
    nam, chiNam: TEN_CHI[chi], saoTrung: trung, bay: b, nguHoang: huongSao(5), nhiHac: huongSao(2),
    thaiTue: huongCuaChi(chi), tuePha: huongCuaChi((chi + 6) % 12), tamSat: sat,
    ghiChu: 'Ngũ Hoàng và Nhị Hắc nên giữ yên, sạch, thoáng, tránh động thổ hay đặt giường, bếp ở đó; không cần hoảng sợ hay cúng giải tốn kém.',
  };
}
export function luuNguyet(nam: number, thang: number, ngay = 15): { chiThang: string; saoTrung: number; bay: { huong: string; sao: number }[] } {
  const zhi = Solar.fromYmdHms(nam, thang, ngay, 12, 0, 0).getLunar().getMonthZhiExact();
  const chiT = '子丑寅卯辰巳午未申酉戌亥'.indexOf(zhi);
  const idx = (chiT - 2 + 12) % 12; // Dần = 0
  const chi = chiCuaNam(namTheoLapXuan(nam, thang, ngay));
  const khoiDau = [0, 3, 6, 9].includes(chi) ? 8 : [1, 4, 7, 10].includes(chi) ? 5 : 2;
  const trung = wrap9(khoiDau - idx);
  const b = bayNien(trung);
  return { chiThang: TEN_CHI[chiT], saoTrung: trung, bay: b.map((x) => ({ huong: x.huong, sao: x.sao })) };
}

// ---------------------------------------------------------------- chọn ngày
const KIEN_TRU = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];
const TEN_TRUC = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế'];
const TRUC_TOT = new Set(['Trừ', 'Định', 'Chấp', 'Thành', 'Khai']);
const TRUC_XAU = new Set(['Kiến', 'Phá', 'Bế']);
const CHINH_TU_PHE: Record<string, string[]> = { // theo chi tháng tiết
  '寅卯辰': ['庚申', '辛酉'], '巳午未': ['壬子', '癸亥'], '申酉戌': ['甲寅', '乙卯'], '亥子丑': ['丙午', '丁巳'],
};
const THO_TU: Record<string, string> = { 寅: '戌', 卯: '辰', 辰: '亥', 巳: '巳', 午: '子', 未: '午', 申: '丑', 酉: '未', 戌: '寅', 亥: '申', 子: '卯', 丑: '酉' };
export type LoaiViec = 'nhap-trach' | 'khai-truong' | 'dong-tho' | 'cuoi-hoi' | 'chung';
export interface NgayChon {
  ngay: string; thu: string; canChi: string; thangTiet: string; truc: string; diem: number; loai: 'tốt' | 'trung bình' | 'nên tránh';
  lyDo: string[]; nhan: { moc: string; ten: string }[];
}
const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const LUC_XUNG = (a: number, b: number) => (a + 6) % 12 === b;
const TAM_HOP = [[8, 0, 4], [2, 6, 10], [11, 3, 7], [5, 9, 1]];
const LUC_HOP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
export function danhGiaNgay(y: number, m: number, d: number, chiNamSinh?: number, loai: LoaiViec = 'chung'): NgayChon {
  const l = Solar.fromYmdHms(y, m, d, 12, 0, 0).getLunar();
  const gz = l.getDayInGanZhi();
  const chiNgay = '子丑寅卯辰巳午未申酉戌亥'.indexOf(l.getDayZhi());
  const chiThang = l.getMonthZhiExact();
  const chiT = '子丑寅卯辰巳午未申酉戌亥'.indexOf(chiThang);
  const truc = TEN_TRUC[KIEN_TRU.indexOf(l.getZhiXing())];
  const lyDo: string[] = [];
  const nhan: { moc: string; ten: string }[] = [];
  let diem = 0;
  if (TRUC_TOT.has(truc)) { diem += 2; lyDo.push(`Trực ${truc}: trực tốt cho việc khởi sự.`); }
  else if (TRUC_XAU.has(truc)) { diem -= 2; lyDo.push(`Trực ${truc}: trực kém cho việc lớn.`); }
  else lyDo.push(`Trực ${truc}: trung bình.`);
  if (loai === 'khai-truong' && ['Khai', 'Thành', 'Mãn'].includes(truc)) { diem += 1; lyDo.push('Hợp khai trương (khai, thành, mãn).'); }
  if (loai === 'nhap-trach' && ['Định', 'Chấp', 'Thành'].includes(truc)) { diem += 1; lyDo.push('Hợp nhập trạch (định, chấp, thành).'); }
  if (loai === 'dong-tho' && ['Trừ', 'Khai', 'Định'].includes(truc)) { diem += 1; lyDo.push('Hợp động thổ (trừ, khai, định).'); }
  if (loai === 'cuoi-hoi' && ['Thành', 'Định', 'Khai'].includes(truc)) { diem += 1; lyDo.push('Hợp cưới hỏi (thành, định, khai).'); }
  if (LUC_XUNG(chiT, chiNgay)) { diem -= 5; lyDo.push('Nguyệt phá: chi ngày xung chi tháng, nên tránh việc lớn.'); nhan.push({ moc: '✓', ten: 'Nguyệt phá' }); }
  for (const [k, v] of Object.entries(CHINH_TU_PHE)) if (k.includes(chiThang) && v.includes(gz.length === 2 ? gz : gz)) { diem -= 4; lyDo.push('Chính tứ phế: ngày kỵ khởi sự lớn.'); nhan.push({ moc: '✓', ten: 'Chính tứ phế' }); }
  if (THO_TU[chiThang] === l.getDayZhi()) { diem -= 1; lyDo.push('Ngày Thụ tử (dân gian): tính nhẹ.'); nhan.push({ moc: '⚖', ten: 'Thụ tử (dân gian)' }); }
  const chiNamNay = chiCuaNam(namTheoLapXuan(y, m, d));
  if (LUC_XUNG(chiNamNay, chiNgay)) { diem -= 3; lyDo.push('Chi ngày xung Thái Tuế năm (tuế phá): tính vừa.'); nhan.push({ moc: '⚖', ten: 'Tuế phá' }); }
  if (chiNamSinh !== undefined) {
    if (LUC_XUNG(chiNamSinh, chiNgay)) { diem -= 4; lyDo.push(`Chi ngày xung tuổi ${TEN_CHI[chiNamSinh]}: nên tránh.`); }
    else if (TAM_HOP.some((g) => g.includes(chiNamSinh) && g.includes(chiNgay) && chiNamSinh !== chiNgay) || LUC_HOP.some((g) => g.includes(chiNamSinh) && g.includes(chiNgay))) { diem += 1; lyDo.push(`Chi ngày hợp tuổi ${TEN_CHI[chiNamSinh]}.`); }
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  return {
    ngay: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, thu: THU[dt.getUTCDay()], canChi: gz, thangTiet: `${chiThang}`,
    truc, diem, loai: diem >= 2 ? 'tốt' : diem <= -2 ? 'nên tránh' : 'trung bình', lyDo, nhan,
  };
}
/** Duyệt `soNgay` ngày kể từ ngày bắt đầu, trả về danh sách đủ chi tiết và vài ngày nên chọn. */
export function chonNgay(tu: string, soNgay: number, chiNamSinh?: number, loai: LoaiViec = 'chung') {
  const [y, m, d] = tu.split('-').map(Number);
  const ds: NgayChon[] = [];
  for (let i = 0; i < soNgay; i++) {
    const t = new Date(Date.UTC(y, m - 1, d + i));
    ds.push(danhGiaNgay(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), chiNamSinh, loai));
  }
  const tot = ds.filter((x) => x.loai === 'tốt').sort((a, b) => b.diem - a.diem).slice(0, 6);
  return { loai, tuNgay: tu, soNgay, ngayTot: tot, ngayTranh: ds.filter((x) => x.loai === 'nên tránh').slice(0, 8), tatCa: ds };
}

// ---------------------------------------------------------------- tổng hợp
export interface DauVaoPhongThuy {
  ngaySinh?: string; // YYYY-MM-DD dương lịch
  gioSinh?: string; // HH:mm (tuỳ chọn)
  gioiTinh?: GioiTinh;
  huongNhaDo?: number; // hướng mặt tiền (độ, 0 = Bắc, theo chiều kim đồng hồ)
  namNhapTrach?: number; // năm xây hoặc nhập trạch, mặc định năm xem
  ngayXem?: string; // YYYY-MM-DD
  thangXem?: number;
  theQuai?: boolean;
  loaiViec?: LoaiViec;
  soNgay?: number;
}
export function lapPhongThuy(v: DauVaoPhongThuy) {
  const homNay = v.ngayXem ?? new Date().toISOString().slice(0, 10);
  const [yx, mx, dx] = homNay.split('-').map(Number);
  const namXem = namTheoLapXuan(yx, mx, dx);
  let batTrach: BatTrach | undefined;
  let chiNamSinh: number | undefined;
  let namSinh: number | undefined;
  if (v.ngaySinh) {
    const [ys, ms, ds] = v.ngaySinh.split('-').map(Number);
    const gio = v.gioSinh ? Number(v.gioSinh.split(':')[0]) : 12;
    namSinh = namTheoLapXuan(ys, ms, ds, gio);
    chiNamSinh = chiCuaNam(namSinh);
    if (v.gioiTinh) batTrach = lapBatTrach(namSinh, v.gioiTinh, v.huongNhaDo);
  }
  const van = vanCuaNam(v.namNhapTrach ?? namXem);
  const huyenKhong = v.huongNhaDo !== undefined ? lapHuyenKhong(v.huongNhaDo, van, v.theQuai ?? false) : undefined;
  const nien = luuNien(namXem);
  const nguyet = luuNguyet(yx, v.thangXem ?? mx);
  const ngay = chonNgay(homNay, v.soNgay ?? 30, chiNamSinh, v.loaiViec ?? 'chung');
  return { ngayXem: homNay, namXem, namSinh, tuoi: namSinh ? TEN_CHI[chiNamSinh!] : undefined, van, batTrach, huyenKhong, luuNien: nien, luuNguyet: nguyet, chonNgay: ngay };
}
export type KetQuaPhongThuy = ReturnType<typeof lapPhongThuy>;
