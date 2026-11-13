import type { ThongTinSinh } from '../types.js';

export interface GioTuong { nam: number; thang: number; ngay: number; gio: number; phut: number }

const tuMs = (ms: number): GioTuong => {
  const d = new Date(ms);
  return { nam: d.getUTCFullYear(), thang: d.getUTCMonth() + 1, ngay: d.getUTCDate(), gio: d.getUTCHours(), phut: d.getUTCMinutes() };
};

/** Phương trình thời gian (phút) theo ngày trong năm. */
function phuongTrinhThoiGian(ngayTrongNam: number): number {
  const B = (2 * Math.PI * (ngayTrongNam - 81)) / 364;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

export interface ThoiGianChuan {
  /** Thời điểm tuyệt đối (ms UTC). */
  utcMs: number;
  /** Giờ Bắc Kinh (+8) của cùng thời điểm: dùng để so với tiết khí. */
  gioBacKinh: GioTuong;
  /** Giờ địa phương dùng để định trụ ngày/giờ (đã quy về giờ mặt trời thực nếu bật). */
  gioDiaPhuong: GioTuong;
  dieuChinhPhut: number;
}

export function chuanHoa(t: ThongTinSinh): ThoiGianChuan {
  const tz = t.muiGio ?? 7;
  const dongHoMs = Date.UTC(t.nam, t.thang - 1, t.ngay, t.gio, t.phut ?? 0);
  if (Number.isNaN(dongHoMs) || t.thang < 1 || t.thang > 12 || t.ngay < 1 || t.ngay > 31 || t.gio < 0 || t.gio > 23)
    throw new Error('Ngày giờ sinh không hợp lệ');
  const utcMs = dongHoMs - tz * 3600_000;
  let dieuChinhPhut = 0;
  if (t.dungGioMatTroiThuc) {
    if (t.kinhDo == null) throw new Error('Cần kinhDo khi bật dungGioMatTroiThuc');
    const dauNam = Date.UTC(t.nam, 0, 1);
    const n = Math.floor((dongHoMs - dauNam) / 86400_000) + 1;
    dieuChinhPhut = Math.round((t.kinhDo - tz * 15) * 4 + phuongTrinhThoiGian(n));
  }
  return {
    utcMs,
    gioBacKinh: tuMs(utcMs + 8 * 3600_000),
    gioDiaPhuong: tuMs(dongHoMs + dieuChinhPhut * 60_000),
    dieuChinhPhut,
  };
}

/** Chỉ số chi của giờ (0 = Tý ... 11 = Hợi). */
export const chiGio = (gio: number): number => Math.floor((gio + 1) / 2) % 12;
