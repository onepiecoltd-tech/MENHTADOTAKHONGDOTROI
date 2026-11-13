/**
 * Chiêm tinh phương Tây (hoàng đạo nhiệt đới, địa tâm): vị trí hành tinh, cung Mọc, Thiên Đỉnh, hệ nhà, góc chiếu.
 * Vị trí thiên thể tính bằng thư viện astronomy-engine (giấy phép MIT).
 */
import * as A from 'astronomy-engine';
import type { ThongTinSinh } from '../types.js';
import { chuanHoa } from '../lich/thoi-gian.js';

export interface NoiSinh { ten: string; viDo: number; kinhDo: number }

export const DIA_DIEM: NoiSinh[] = [
  { ten: 'TP. Hồ Chí Minh', viDo: 10.82, kinhDo: 106.63 }, { ten: 'Hà Nội', viDo: 21.03, kinhDo: 105.85 }, { ten: 'Đà Nẵng', viDo: 16.05, kinhDo: 108.2 },
  { ten: 'Hải Phòng', viDo: 20.86, kinhDo: 106.68 }, { ten: 'Cần Thơ', viDo: 10.03, kinhDo: 105.78 }, { ten: 'Huế', viDo: 16.46, kinhDo: 107.6 },
  { ten: 'Nha Trang', viDo: 12.24, kinhDo: 109.19 }, { ten: 'Đà Lạt', viDo: 11.94, kinhDo: 108.44 }, { ten: 'Vũng Tàu', viDo: 10.35, kinhDo: 107.08 },
  { ten: 'Biên Hòa', viDo: 10.95, kinhDo: 106.82 }, { ten: 'Buôn Ma Thuột', viDo: 12.67, kinhDo: 108.04 }, { ten: 'Quy Nhơn', viDo: 13.78, kinhDo: 109.22 },
  { ten: 'Vinh', viDo: 18.67, kinhDo: 105.69 }, { ten: 'Thanh Hóa', viDo: 19.81, kinhDo: 105.78 }, { ten: 'Nam Định', viDo: 20.43, kinhDo: 106.16 },
  { ten: 'Thái Nguyên', viDo: 21.59, kinhDo: 105.85 }, { ten: 'Hạ Long', viDo: 20.95, kinhDo: 107.08 }, { ten: 'Lào Cai', viDo: 22.49, kinhDo: 103.97 },
  { ten: 'Pleiku', viDo: 13.98, kinhDo: 108.0 }, { ten: 'Phan Thiết', viDo: 10.93, kinhDo: 108.1 }, { ten: 'Mỹ Tho', viDo: 10.36, kinhDo: 106.36 },
  { ten: 'Long Xuyên', viDo: 10.39, kinhDo: 105.44 }, { ten: 'Rạch Giá', viDo: 10.01, kinhDo: 105.08 }, { ten: 'Cà Mau', viDo: 9.18, kinhDo: 105.15 },
];

export const CUNG_HOANG_DAO = [
  { ten: 'Bạch Dương', kyHieu: '♈', nguyenTo: 'Lửa', tinhChat: 'Thống lĩnh' }, { ten: 'Kim Ngưu', kyHieu: '♉', nguyenTo: 'Đất', tinhChat: 'Kiên định' },
  { ten: 'Song Tử', kyHieu: '♊', nguyenTo: 'Khí', tinhChat: 'Biến đổi' }, { ten: 'Cự Giải', kyHieu: '♋', nguyenTo: 'Nước', tinhChat: 'Thống lĩnh' },
  { ten: 'Sư Tử', kyHieu: '♌', nguyenTo: 'Lửa', tinhChat: 'Kiên định' }, { ten: 'Xử Nữ', kyHieu: '♍', nguyenTo: 'Đất', tinhChat: 'Biến đổi' },
  { ten: 'Thiên Bình', kyHieu: '♎', nguyenTo: 'Khí', tinhChat: 'Thống lĩnh' }, { ten: 'Bọ Cạp', kyHieu: '♏', nguyenTo: 'Nước', tinhChat: 'Kiên định' },
  { ten: 'Nhân Mã', kyHieu: '♐', nguyenTo: 'Lửa', tinhChat: 'Biến đổi' }, { ten: 'Ma Kết', kyHieu: '♑', nguyenTo: 'Đất', tinhChat: 'Thống lĩnh' },
  { ten: 'Bảo Bình', kyHieu: '♒', nguyenTo: 'Khí', tinhChat: 'Kiên định' }, { ten: 'Song Ngư', kyHieu: '♓', nguyenTo: 'Nước', tinhChat: 'Biến đổi' },
] as const;

const THIEN_THE = [
  { id: 'Sun', ten: 'Mặt Trời', kyHieu: '☉' }, { id: 'Moon', ten: 'Mặt Trăng', kyHieu: '☽' }, { id: 'Mercury', ten: 'Sao Thủy', kyHieu: '☿' },
  { id: 'Venus', ten: 'Sao Kim', kyHieu: '♀' }, { id: 'Mars', ten: 'Sao Hỏa', kyHieu: '♂' }, { id: 'Jupiter', ten: 'Sao Mộc', kyHieu: '♃' },
  { id: 'Saturn', ten: 'Sao Thổ', kyHieu: '♄' }, { id: 'Uranus', ten: 'Thiên Vương', kyHieu: '♅' }, { id: 'Neptune', ten: 'Hải Vương', kyHieu: '♆' },
  { id: 'Pluto', ten: 'Diêm Vương', kyHieu: '♇' },
] as const;

const GOC_CHIEU = [
  { ten: 'Trùng tụ', goc: 0, sai: 8, loai: 'trung' }, { ten: 'Lục hợp', goc: 60, sai: 4, loai: 'thuan' }, { ten: 'Vuông góc', goc: 90, sai: 6, loai: 'nghich' },
  { ten: 'Tam hợp', goc: 120, sai: 6, loai: 'thuan' }, { ten: 'Đối đỉnh', goc: 180, sai: 8, loai: 'nghich' },
] as const;

const RAD = Math.PI / 180;
const m360 = (x: number) => ((x % 360) + 360) % 360;

/** Kinh độ hoàng đạo địa tâm (độ, phân điểm của ngày) của một thiên thể. */
export function kinhDoHoangDao(id: string, luc: Date): number {
  if (id === 'Sun') return m360(A.SunPosition(luc).elon);
  if (id === 'Moon') return m360(A.EclipticGeoMoon(luc).lon);
  return m360(A.Ecliptic(A.GeoVector(id as A.Body, luc, true)).elon);
}

const doNghieng = (luc: Date) => 23.439291 - 0.0130042 * ((luc.getTime() / 86400000 + 2440587.5 - 2451545) / 36525);

/** Cung Mọc (ASC) và Thiên Đỉnh (MC) theo giờ sao địa phương. */
export function gocChinh(luc: Date, viDo: number, kinhDo: number) {
  const ramc = m360(A.SiderealTime(luc) * 15 + kinhDo);
  const e = doNghieng(luc) * RAD, t = ramc * RAD, p = viDo * RAD;
  const mc = m360(Math.atan2(Math.sin(t), Math.cos(t) * Math.cos(e)) / RAD);
  const asc = m360(Math.atan2(Math.cos(t), -(Math.sin(t) * Math.cos(e) + Math.tan(p) * Math.sin(e))) / RAD);
  return { ramc, asc, mc, e, p };
}

/** 12 đỉnh nhà theo Placidus; vĩ độ quá cao (không tính được) thì trả null. */
export function nhaPlacidus(ramc: number, asc: number, mc: number, e: number, p: number): number[] | null {
  const dinh = (phan: number, duoi: boolean): number | null => {
    let ra = duoi ? ramc + 180 - phan * 90 : ramc + phan * 90;
    let lon = 0;
    for (let i = 0; i < 30; i++) {
      lon = Math.atan2(Math.sin(ra * RAD), Math.cos(ra * RAD) * Math.cos(e));
      const x = Math.tan(p) * Math.tan(Math.asin(Math.sin(e) * Math.sin(lon)));
      if (Math.abs(x) >= 1) return null;
      const ad = Math.asin(x) / RAD;
      const moi = duoi ? ramc + 180 - phan * (90 - ad) : ramc + phan * (90 + ad);
      if (Math.abs(moi - ra) < 1e-7) { ra = moi; break; }
      ra = moi;
    }
    return m360(Math.atan2(Math.sin(ra * RAD), Math.cos(ra * RAD) * Math.cos(e)) / RAD);
  };
  const c11 = dinh(1 / 3, false), c12 = dinh(2 / 3, false), c2 = dinh(2 / 3, true), c3 = dinh(1 / 3, true);
  if (c11 == null || c12 == null || c2 == null || c3 == null) return null;
  const d = (x: number) => m360(x + 180);
  return [asc, c2, c3, d(mc), d(c11), d(c12), d(asc), d(c2), d(c3), mc, c11, c12];
}

export interface ViTri { ten: string; kyHieu: string; kinhDo: number; cung: string; kyHieuCung: string; doTrongCung: number; nha: number; nghichHanh: boolean }
export interface LaSoChiemTinh {
  loai: 'chiem-tinh';
  noiSinh: NoiSinh;
  gioUTC: string;
  heNha: 'Placidus' | 'Cung trọn (Whole Sign)';
  hanhTinh: ViTri[];
  cungMoc: { kinhDo: number; cung: string; doTrongCung: number };
  thienDinh: { kinhDo: number; cung: string; doTrongCung: number };
  dinhNha: number[];
  gocChieu: { a: string; b: string; ten: string; loai: 'trung' | 'thuan' | 'nghich'; lech: number }[];
  nguyenTo: Record<string, number>;
  tinhChat: Record<string, number>;
  ghiChu: string[];
}

const taiCung = (lon: number) => ({ kinhDo: +lon.toFixed(3), cung: CUNG_HOANG_DAO[Math.floor(lon / 30)].ten, doTrongCung: +(lon % 30).toFixed(2) });

export function lapChiemTinh(t: ThongTinSinh, noi: NoiSinh = DIA_DIEM[0]): LaSoChiemTinh {
  const luc = new Date(chuanHoa({ ...t, dungGioMatTroiThuc: false }).utcMs);
  const g = gocChinh(luc, noi.viDo, noi.kinhDo);
  const ghiChu: string[] = [];
  let dinhNha = nhaPlacidus(g.ramc, g.asc, g.mc, g.e, g.p);
  let heNha: LaSoChiemTinh['heNha'] = 'Placidus';
  if (!dinhNha) {
    const dau = Math.floor(g.asc / 30) * 30;
    dinhNha = Array.from({ length: 12 }, (_, i) => m360(dau + i * 30));
    heNha = 'Cung trọn (Whole Sign)';
    ghiChu.push('Vĩ độ quá cao, không tính được nhà Placidus; dùng hệ nhà cung trọn.');
  }
  const nhaCua = (lon: number) => {
    for (let i = 0; i < 12; i++) if (m360(lon - dinhNha![i]) < m360(dinhNha![(i + 1) % 12] - dinhNha![i])) return i + 1;
    return 1;
  };
  const sau = new Date(luc.getTime() + 3600_000), truoc = new Date(luc.getTime() - 3600_000);
  const hanhTinh: ViTri[] = THIEN_THE.map((h) => {
    const lon = kinhDoHoangDao(h.id, luc);
    const d = m360(kinhDoHoangDao(h.id, sau) - kinhDoHoangDao(h.id, truoc) + 180) - 180;
    const c = CUNG_HOANG_DAO[Math.floor(lon / 30)];
    return { ten: h.ten, kyHieu: h.kyHieu, kinhDo: +lon.toFixed(3), cung: c.ten, kyHieuCung: c.kyHieu, doTrongCung: +(lon % 30).toFixed(2), nha: nhaCua(lon), nghichHanh: d < 0 };
  });
  const gocChieu: LaSoChiemTinh['gocChieu'] = [];
  for (let i = 0; i < hanhTinh.length; i++) for (let j = i + 1; j < hanhTinh.length; j++) {
    const kc = Math.abs(m360(hanhTinh[i].kinhDo - hanhTinh[j].kinhDo + 180) - 180);
    const gc = GOC_CHIEU.find((x) => Math.abs(kc - x.goc) <= x.sai);
    if (gc) gocChieu.push({ a: hanhTinh[i].ten, b: hanhTinh[j].ten, ten: gc.ten, loai: gc.loai, lech: +Math.abs(kc - gc.goc).toFixed(2) });
  }
  gocChieu.sort((x, y) => x.lech - y.lech);
  const nguyenTo: Record<string, number> = { Lửa: 0, Đất: 0, Khí: 0, Nước: 0 };
  const tinhChat: Record<string, number> = { 'Thống lĩnh': 0, 'Kiên định': 0, 'Biến đổi': 0 };
  for (const h of hanhTinh) { const c = CUNG_HOANG_DAO[Math.floor(h.kinhDo / 30)]; nguyenTo[c.nguyenTo]++; tinhChat[c.tinhChat]++; }
  return {
    loai: 'chiem-tinh', noiSinh: noi, gioUTC: luc.toISOString().slice(0, 16).replace('T', ' '), heNha, hanhTinh,
    cungMoc: taiCung(g.asc), thienDinh: taiCung(g.mc), dinhNha: dinhNha.map((x) => +x.toFixed(3)), gocChieu, nguyenTo, tinhChat, ghiChu,
  };
}
