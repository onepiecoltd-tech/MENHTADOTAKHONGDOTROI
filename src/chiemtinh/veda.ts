/**
 * Chiêm tinh Vệ Đà (Jyotish): hoàng đạo sao cố định (sidereal) theo ayanamsa Lahiri, nhà cung trọn tính từ Lagna,
 * chín graha (gồm La Hầu/Rahu và Kế Đô/Ketu theo nút trung bình), 27 nakshatra, Navamsa (D9), đại vận Vimshottari,
 * một số yoga cơ bản và quá cảnh của Sao Thổ, Sao Mộc, La Hầu tại ngày xem.
 * Vị trí thiên thể lấy từ cùng bộ tính với chiêm tinh phương Tây rồi trừ ayanamsa.
 */
import type { ThongTinSinh } from '../types.js';
import { chuanHoa } from '../lich/thoi-gian.js';
import { CUNG_HOANG_DAO, DIA_DIEM, kinhDoHoangDao, gocChinh, lapChiemTinh, type LaSoChiemTinh, type NoiSinh, type ViTri } from './index.js';

const m360 = (x: number) => ((x % 360) + 360) % 360;
const theKy = (luc: Date) => (luc.getTime() / 86400000 + 2440587.5 - 2451545) / 36525;

/** Ayanamsa Lahiri (Chitrapaksha), độ. Sai số cỡ 0,01° so với lịch Ấn Độ chính thức. */
export const ayanamsaLahiri = (luc: Date) => { const T = theKy(luc); return 23.85306 + 1.39722 * T + 0.00018 * T * T; };
/** Kinh độ nút Bắc trung bình của Mặt Trăng (La Hầu), hoàng đạo nhiệt đới của ngày. */
export const nutBacTrungBinh = (luc: Date) => { const T = theKy(luc); return m360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000); };

export type MaGraha = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';
export const GRAHA: Record<MaGraha, { ten: string; phan: string; kyHieu: string }> = {
  Sun: { ten: 'Mặt Trời', phan: 'Surya', kyHieu: '☉' }, Moon: { ten: 'Mặt Trăng', phan: 'Chandra', kyHieu: '☽' }, Mars: { ten: 'Sao Hỏa', phan: 'Mangala', kyHieu: '♂' },
  Mercury: { ten: 'Sao Thủy', phan: 'Budha', kyHieu: '☿' }, Jupiter: { ten: 'Sao Mộc', phan: 'Guru', kyHieu: '♃' }, Venus: { ten: 'Sao Kim', phan: 'Shukra', kyHieu: '♀' },
  Saturn: { ten: 'Sao Thổ', phan: 'Shani', kyHieu: '♄' }, Rahu: { ten: 'La Hầu', phan: 'Rahu', kyHieu: '☊' }, Ketu: { ten: 'Kế Đô', phan: 'Ketu', kyHieu: '☋' },
};
const THU_TU: MaGraha[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
/** Chủ tinh của 12 rashi. */
export const CHU_RASHI: MaGraha[] = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const VUONG: Partial<Record<MaGraha, number>> = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7 };
const DOT_CHAY: Partial<Record<MaGraha, number>> = { Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };

export const NAKSHATRA = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const CHU_DASHA: MaGraha[] = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const NAM_DASHA: Record<MaGraha, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const NAM_MS = 365.25 * 86400000;
const PHAN_NAK = 360 / 27;

export const tenRashi = (i: number) => `${RASHI[i]} (${CUNG_HOANG_DAO[i].ten})`;
export const nakshatraCua = (lon: number) => { const i = Math.floor(m360(lon) / PHAN_NAK); return { i, ten: NAKSHATRA[i], pada: Math.floor((m360(lon) % PHAN_NAK) / (PHAN_NAK / 4)) + 1, chu: CHU_DASHA[i % 9] }; };
/** Rashi trong Navamsa (D9): mỗi rashi chia 9 phần 3°20′, chuỗi chạy liên tục từ Mesha. */
export const navamsaCua = (lon: number) => Math.floor(m360(lon) / (30 / 9)) % 12;

export function phamChat(g: MaGraha, rashi: number): string {
  const v = VUONG[g];
  if (v === rashi) return 'vượng (exalted)';
  if (v !== undefined && (v + 6) % 12 === rashi) return 'suy (debilitated)';
  if (g !== 'Rahu' && g !== 'Ketu' && CHU_RASHI[rashi] === g) return 'nhà mình (own sign)';
  return '';
}

export interface GrahaVeDa {
  ma: MaGraha; ten: string; phan: string; kinhDo: number; rashi: number; doTrongRashi: number; nha: number;
  nakshatra: string; pada: number; chuNakshatra: MaGraha; navamsa: number; phamChat: string; nghichHanh: boolean; biDot: boolean;
}
export interface KyDasha { graha: MaGraha; batDau: string; ketThuc: string }
export interface LaSoVeDa {
  loai: 've-da';
  noiSinh: NoiSinh;
  gioUTC: string;
  ayanamsa: number;
  lagna: { kinhDo: number; rashi: number; doTrongRashi: number; nakshatra: string; pada: number; navamsa: number };
  graha: GrahaVeDa[];
  /** Chủ nhà: nhà i (1–12) do graha nào làm chủ, chủ đó đang ngồi nhà nào. */
  chuNha: { nha: number; rashi: number; chu: MaGraha; ngoiNha: number }[];
  chieu: { tu: MaGraha; den: MaGraha; nhaThu: number }[];
  yoga: string[];
  dasha: { duDauDoi: string; maha: KyDasha[]; hienTai?: KyDasha; antar: KyDasha[]; antarHienTai?: KyDasha };
  quaCanh: { ngayXem: string; graha: { ma: MaGraha; rashi: number; tuLagna: number; tuMatTrang: number; nghichHanh: boolean }[]; ghiChu: string[] };
  /** Cùng dữ liệu ở dạng bản đồ sao để vẽ vòng 3D (sidereal, nhà cung trọn). */
  banDo: LaSoChiemTinh;
  ghiChu: string[];
}

const thang = (ms: number) => new Date(ms).toISOString().slice(0, 7);

function viTriSidereal(ma: MaGraha, luc: Date, ay: number): number {
  if (ma === 'Rahu') return m360(nutBacTrungBinh(luc) - ay);
  if (ma === 'Ketu') return m360(nutBacTrungBinh(luc) + 180 - ay);
  return m360(kinhDoHoangDao(ma, luc) - ay);
}
function nghich(ma: MaGraha, luc: Date): boolean {
  if (ma === 'Rahu' || ma === 'Ketu') return true;
  if (ma === 'Sun' || ma === 'Moon') return false;
  const a = kinhDoHoangDao(ma, new Date(luc.getTime() - 3600_000)), b = kinhDoHoangDao(ma, new Date(luc.getTime() + 3600_000));
  return m360(b - a + 180) - 180 < 0;
}
/** Nhà thứ mấy (1–12) từ rashi gốc. */
const tuRashi = (goc: number, r: number) => ((r - goc + 12) % 12) + 1;
/** Các nhà một graha chiếu tới (graha drishti): ai cũng chiếu nhà 7; Hỏa thêm 4, 8; Mộc 5, 9; Thổ 3, 10; La Hầu, Kế Đô 5, 9. */
const NHA_CHIEU: Record<MaGraha, number[]> = { Sun: [7], Moon: [7], Mercury: [7], Venus: [7], Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10], Rahu: [5, 7, 9], Ketu: [5, 7, 9] };
const CAT: MaGraha[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

function vimshottari(mocSinh: number, lonTrang: number, ngayXem: number): LaSoVeDa['dasha'] {
  const n = nakshatraCua(lonTrang);
  const daQua = (m360(lonTrang) % PHAN_NAK) / PHAN_NAK;
  let k = CHU_DASHA.indexOf(n.chu);
  let dau = mocSinh - daQua * NAM_DASHA[n.chu] * NAM_MS;
  const maha: KyDasha[] = [];
  const tho: { g: MaGraha; a: number; b: number }[] = [];
  while (dau < mocSinh + 121 * NAM_MS) {
    const g = CHU_DASHA[k % 9], cuoi = dau + NAM_DASHA[g] * NAM_MS;
    tho.push({ g, a: dau, b: cuoi }); maha.push({ graha: g, batDau: thang(Math.max(dau, mocSinh)), ketThuc: thang(cuoi) });
    dau = cuoi; k++;
  }
  const du = (1 - daQua) * NAM_DASHA[n.chu];
  const hien = tho.find((x) => ngayXem >= x.a && ngayXem < x.b);
  const antar: KyDasha[] = [];
  let antarHienTai: KyDasha | undefined;
  if (hien) {
    let a = hien.a, j = CHU_DASHA.indexOf(hien.g);
    for (let i = 0; i < 9; i++, j++) {
      const g = CHU_DASHA[j % 9], b = a + (NAM_DASHA[hien.g] * NAM_DASHA[g] / 120) * NAM_MS;
      const ky = { graha: g, batDau: thang(a), ketThuc: thang(b) };
      antar.push(ky); if (ngayXem >= a && ngayXem < b) antarHienTai = ky;
      a = b;
    }
  }
  return {
    duDauDoi: `${GRAHA[n.chu].phan} còn ${Math.floor(du)} năm ${Math.round((du % 1) * 12)} tháng lúc sinh`,
    maha, hienTai: hien ? maha[tho.indexOf(hien)] : undefined, antar, antarHienTai,
  };
}

export function lapVeDa(t: ThongTinSinh, noi: NoiSinh = DIA_DIEM[0], ngayXem: Date = new Date()): LaSoVeDa {
  const luc = new Date(chuanHoa({ ...t, dungGioMatTroiThuc: false }).utcMs);
  const ay = ayanamsaLahiri(luc);
  const g0 = gocChinh(luc, noi.viDo, noi.kinhDo);
  const lagLon = m360(g0.asc - ay), mcLon = m360(g0.mc - ay);
  const L = Math.floor(lagLon / 30);
  const lonMt = viTriSidereal('Sun', luc, ay);

  const graha: GrahaVeDa[] = THU_TU.map((ma) => {
    const lon = viTriSidereal(ma, luc, ay), r = Math.floor(lon / 30), nk = nakshatraCua(lon), ng = nghich(ma, luc);
    const gioiHan = DOT_CHAY[ma];
    const lechMt = Math.abs(m360(lon - lonMt + 180) - 180);
    return {
      ma, ten: GRAHA[ma].ten, phan: GRAHA[ma].phan, kinhDo: +lon.toFixed(3), rashi: r, doTrongRashi: +(lon % 30).toFixed(2), nha: tuRashi(L, r),
      nakshatra: nk.ten, pada: nk.pada, chuNakshatra: nk.chu, navamsa: navamsaCua(lon), phamChat: phamChat(ma, r), nghichHanh: ng,
      biDot: gioiHan !== undefined && lechMt < (ma === 'Mercury' && ng ? 12 : ma === 'Venus' && ng ? 8 : gioiHan),
    };
  });
  const theo = (ma: MaGraha) => graha.find((x) => x.ma === ma)!;
  const lagNk = nakshatraCua(lagLon);

  const chuNha = Array.from({ length: 12 }, (_, i) => { const r = (L + i) % 12, chu = CHU_RASHI[r]; return { nha: i + 1, rashi: r, chu, ngoiNha: theo(chu).nha }; });

  const chieu: LaSoVeDa['chieu'] = [];
  for (const a of graha) for (const b of graha) {
    if (a.ma === b.ma || (a.ma === 'Rahu' && b.ma === 'Ketu') || (a.ma === 'Ketu' && b.ma === 'Rahu')) continue;
    const k = tuRashi(a.rashi, b.rashi);
    if (NHA_CHIEU[a.ma].includes(k)) chieu.push({ tu: a.ma, den: b.ma, nhaThu: k });
  }

  // Yoga cơ bản
  const yoga: string[] = [];
  const mt = theo('Moon'), kendra = [1, 4, 7, 10], trikona = [1, 5, 9];
  const giang = m360(mt.kinhDo - theo('Sun').kinhDo);
  const pha = `Mặt Trăng ${giang < 180 ? 'tăng (Shukla paksha)' : 'giảm (Krishna paksha)'}, cách Mặt Trời ${Math.round(Math.min(giang, 360 - giang))}°${Math.min(giang, 360 - giang) < 72 ? ', trăng yếu (gần trăng non)' : Math.min(giang, 360 - giang) > 144 ? ', trăng mạnh (gần trăng tròn)' : ''}`;
  if (kendra.includes(tuRashi(mt.rashi, theo('Jupiter').rashi))) yoga.push('Gajakesari yoga: Sao Mộc ở nhà góc (kendra) tính từ Mặt Trăng');
  if (theo('Sun').rashi === theo('Mercury').rashi) yoga.push(`Budhaditya yoga: Mặt Trời và Sao Thủy cùng ở ${tenRashi(theo('Sun').rashi)}${theo('Mercury').biDot ? ' (Sao Thủy bị đốt nên yếu bớt)' : ''}`);
  if (mt.rashi === theo('Mars').rashi) yoga.push('Chandra–Mangala yoga: Mặt Trăng cùng Sao Hỏa');
  const MAHAPURUSHA: [MaGraha, string][] = [['Mars', 'Ruchaka'], ['Mercury', 'Bhadra'], ['Jupiter', 'Hamsa'], ['Venus', 'Malavya'], ['Saturn', 'Shasha']];
  for (const [ma, ten] of MAHAPURUSHA) { const x = theo(ma); if (kendra.includes(x.nha) && /vượng|nhà mình/.test(x.phamChat)) yoga.push(`${ten} yoga (Pancha Mahapurusha): ${x.ten} ${x.phamChat} ở nhà ${x.nha}`); }
  for (const ma of ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as MaGraha[]) {
    const nhaChu = chuNha.filter((c) => c.chu === ma).map((c) => c.nha);
    if (nhaChu.some((h) => [4, 7, 10].includes(h)) && nhaChu.some((h) => [5, 9].includes(h))) yoga.push(`Yogakaraka: ${GRAHA[ma].ten} làm chủ cả nhà ${nhaChu.join(' và ')} (một nhà góc, một nhà tam hợp), ngồi nhà ${theo(ma).nha}`);
  }
  const daCap = new Set<string>();
  for (const k of chuNha.filter((c) => kendra.includes(c.nha))) for (const tr of chuNha.filter((c) => trikona.includes(c.nha))) {
    if (k.chu === tr.chu || k.nha === tr.nha) continue;
    const key = [k.chu, tr.chu].sort().join('-');
    if (!daCap.has(key) && theo(k.chu).rashi === theo(tr.chu).rashi) { daCap.add(key); yoga.push(`Raja yoga: chủ nhà ${k.nha} (${GRAHA[k.chu].ten}) đồng cung chủ nhà ${tr.nha} (${GRAHA[tr.chu].ten}) ở nhà ${theo(k.chu).nha}`); }
  }
  const quanhTrang = graha.filter((x) => !['Sun', 'Moon', 'Rahu', 'Ketu'].includes(x.ma) && [2, 12].includes(tuRashi(mt.rashi, x.rashi)));
  if (!quanhTrang.length) yoga.push('Dấu hiệu Kemadruma: không có hành tinh ở nhà 2 và 12 tính từ Mặt Trăng (chưa xét điều kiện hóa giải)');
  const hoa = theo('Mars');
  const mangalLag = [1, 2, 4, 7, 8, 12].includes(hoa.nha), mangalTrang = [1, 2, 4, 7, 8, 12].includes(tuRashi(mt.rashi, hoa.rashi));
  if (mangalLag || mangalTrang) yoga.push(`Mangal dosha (Kuja dosha): Sao Hỏa ở nhà ${hoa.nha} tính từ Lagna${mangalTrang ? `, nhà ${tuRashi(mt.rashi, hoa.rashi)} tính từ Mặt Trăng` : ''}${/vượng|nhà mình/.test(hoa.phamChat) ? ' (Sao Hỏa ' + hoa.phamChat + ' nên nhẹ đi)' : ''}`);

  const dasha = vimshottari(luc.getTime(), mt.kinhDo, ngayXem.getTime());

  // Quá cảnh (gochara) tại ngày xem
  const ayNay = ayanamsaLahiri(ngayXem);
  const qc = (['Saturn', 'Jupiter', 'Rahu', 'Ketu'] as MaGraha[]).map((ma) => {
    const r = Math.floor(viTriSidereal(ma, ngayXem, ayNay) / 30);
    return { ma, rashi: r, tuLagna: tuRashi(L, r), tuMatTrang: tuRashi(mt.rashi, r), nghichHanh: nghich(ma, ngayXem) };
  });
  const qcGhi: string[] = [];
  const tho = qc[0].tuMatTrang;
  if (tho === 12) qcGhi.push('Sade Sati giai đoạn 1 (Sao Thổ quá cảnh nhà 12 tính từ Mặt Trăng)');
  else if (tho === 1) qcGhi.push('Sade Sati giai đoạn 2, đỉnh (Sao Thổ quá cảnh trên rashi Mặt Trăng)');
  else if (tho === 2) qcGhi.push('Sade Sati giai đoạn 3 (Sao Thổ quá cảnh nhà 2 tính từ Mặt Trăng)');
  else if (tho === 8) qcGhi.push('Ashtama Shani (Sao Thổ quá cảnh nhà 8 tính từ Mặt Trăng)');
  else if (tho === 4) qcGhi.push('Kantaka Shani (Sao Thổ quá cảnh nhà 4 tính từ Mặt Trăng)');
  else qcGhi.push('Không trong Sade Sati');
  const moc = qc[1].tuMatTrang;
  qcGhi.push([2, 5, 7, 9, 11].includes(moc) ? `Sao Mộc quá cảnh nhà ${moc} tính từ Mặt Trăng: thường được coi là thuận` : `Sao Mộc quá cảnh nhà ${moc} tính từ Mặt Trăng: không phải vị trí thuận`);

  // Bản đồ để vẽ: dạng giống LaSoChiemTinh
  const tay = lapChiemTinh(t, noi);
  const viTri: ViTri[] = graha.map((x) => ({ ten: x.ten, kyHieu: GRAHA[x.ma].kyHieu, kinhDo: x.kinhDo, cung: CUNG_HOANG_DAO[x.rashi].ten, kyHieuCung: CUNG_HOANG_DAO[x.rashi].kyHieu, doTrongCung: x.doTrongRashi, nha: x.nha, nghichHanh: x.nghichHanh }));
  const nguyenTo: Record<string, number> = { Lửa: 0, Đất: 0, Khí: 0, Nước: 0 };
  const tinhChat: Record<string, number> = { 'Thống lĩnh': 0, 'Kiên định': 0, 'Biến đổi': 0 };
  for (const x of graha) { nguyenTo[CUNG_HOANG_DAO[x.rashi].nguyenTo]++; tinhChat[CUNG_HOANG_DAO[x.rashi].tinhChat]++; }
  const viTriCung = (lon: number) => ({ kinhDo: +lon.toFixed(3), cung: CUNG_HOANG_DAO[Math.floor(lon / 30)].ten, doTrongCung: +(lon % 30).toFixed(2) });
  const banDo: LaSoChiemTinh = {
    loai: 'chiem-tinh', noiSinh: noi, gioUTC: tay.gioUTC, heNha: 'Cung trọn (Whole Sign)', hanhTinh: viTri,
    cungMoc: viTriCung(lagLon), thienDinh: viTriCung(mcLon), dinhNha: Array.from({ length: 12 }, (_, i) => ((L + i) % 12) * 30),
    gocChieu: chieu.filter((c) => c.nhaThu !== 1).map((c) => {
      const a = theo(c.tu), b = theo(c.den), dung = (c.nhaThu - 1) * 30;
      return { a: a.ten, b: b.ten, ten: `chiếu nhà ${c.nhaThu}`, loai: CAT.includes(c.tu) ? 'thuan' as const : 'nghich' as const, lech: +Math.abs(m360(b.kinhDo - a.kinhDo - dung + 180) - 180).toFixed(2) };
    }).sort((x, y) => x.lech - y.lech),
    nguyenTo, tinhChat, ghiChu: [],
  };

  return {
    loai: 've-da', noiSinh: noi, gioUTC: tay.gioUTC, ayanamsa: +ay.toFixed(4),
    lagna: { kinhDo: +lagLon.toFixed(3), rashi: L, doTrongRashi: +(lagLon % 30).toFixed(2), nakshatra: lagNk.ten, pada: lagNk.pada, navamsa: navamsaCua(lagLon) },
    graha, chuNha, chieu, yoga, dasha,
    quaCanh: { ngayXem: ngayXem.toISOString().slice(0, 10), graha: qc, ghiChu: qcGhi },
    banDo,
    ghiChu: [pha, 'Hoàng đạo sao cố định, ayanamsa Lahiri; nhà cung trọn tính từ Lagna; La Hầu, Kế Đô theo nút trung bình; năm Vimshottari tính 365,25 ngày.'],
  };
}
