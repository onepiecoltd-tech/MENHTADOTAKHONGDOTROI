import { BAT_QUAI, QUE, type TenQuai } from './data.js';
import { taoNgauNhien } from '../random.js';
import { duongSangAm } from '../lich/amlich-viet.js';
import { chiGio } from '../lich/thoi-gian.js';

export interface Que { so: number; ten: string; thuongQuai: TenQuai; haQuai: TenQuai; hao: number[] }
export interface KetQuaGieoQue {
  loai: 'kinh-dich';
  phuongPhap: 'ba-dong-xu' | 'mai-hoa-thoi-gian';
  cauHoi?: string;
  /** Giá trị từng hào từ dưới lên (chỉ có khi gieo xu): 6 lão âm, 7 thiếu dương, 8 thiếu âm, 9 lão dương. */
  giaTriHao?: number[];
  queChu: Que;
  /** Vị trí hào động, 1 = hào sơ ... 6 = hào thượng. */
  haoDong: number[];
  queHo: Que;
  queBien: Que | null;
}

const TEN_QUAI = Object.keys(BAT_QUAI) as TenQuai[];
const quaiTuHao = (h: number[]): TenQuai => TEN_QUAI.find((t) => BAT_QUAI[t].hao.every((v, i) => v === h[i]))!;
const quaiTuSo = (so: number): TenQuai => TEN_QUAI.find((t) => BAT_QUAI[t].so === so)!;

/** Tra quẻ từ 6 hào (dưới lên, 1 = dương, 0 = âm). */
export function traQue(hao: number[]): Que {
  if (hao.length !== 6 || hao.some((h) => h !== 0 && h !== 1)) throw new Error('Cần đúng 6 hào 0/1');
  const ha = quaiTuHao(hao.slice(0, 3));
  const thuong = quaiTuHao(hao.slice(3));
  const i = QUE.findIndex(([, t, h]) => t === thuong && h === ha);
  return { so: i + 1, ten: QUE[i][0], thuongQuai: thuong, haQuai: ha, hao: [...hao] };
}

function hoanThanh(queChuHao: number[], haoDong: number[]) {
  const queChu = traQue(queChuHao);
  const queHo = traQue([...queChuHao.slice(1, 4), ...queChuHao.slice(2, 5)]);
  const queBien = haoDong.length ? traQue(queChuHao.map((h, i) => (haoDong.includes(i + 1) ? 1 - h : h))) : null;
  return { queChu, haoDong, queHo, queBien };
}

/** Gieo 3 đồng xu 6 lần. Ngửa = 3, sấp = 2. */
export function gieoQueDongXu(cauHoi?: string, seed?: number): KetQuaGieoQue {
  const rnd = taoNgauNhien(seed);
  const giaTriHao = Array.from({ length: 6 }, () => 6 + rnd(2) + rnd(2) + rnd(2));
  const hao = giaTriHao.map((v) => (v % 2 === 1 ? 1 : 0));
  const haoDong = giaTriHao.flatMap((v, i) => (v === 6 || v === 9 ? [i + 1] : []));
  return { loai: 'kinh-dich', phuongPhap: 'ba-dong-xu', cauHoi, giaTriHao, ...hoanThanh(hao, haoDong) };
}

/** Mai Hoa Dịch Số theo năm tháng ngày giờ âm lịch (giờ Việt Nam). */
export function gieoQueMaiHoa(cauHoi?: string, luc: Date = new Date()): KetQuaGieoQue {
  const vn = new Date(luc.getTime() + 7 * 3600_000);
  let ngayTinh = vn;
  if (vn.getUTCHours() === 23) ngayTinh = new Date(vn.getTime() + 3600_000); // giờ Tý thuộc ngày hôm sau
  const am = duongSangAm(ngayTinh.getUTCDate(), ngayTinh.getUTCMonth() + 1, ngayTinh.getUTCFullYear(), 7);
  const soNam = ((am.nam - 4) % 12) + 1;
  const soGio = chiGio(vn.getUTCHours()) + 1;
  const tong = soNam + am.thang + am.ngay;
  const thuong = quaiTuSo(tong % 8 || 8);
  const ha = quaiTuSo((tong + soGio) % 8 || 8);
  const haoDong = (tong + soGio) % 6 || 6;
  const hao = [...BAT_QUAI[ha].hao, ...BAT_QUAI[thuong].hao];
  return { loai: 'kinh-dich', phuongPhap: 'mai-hoa-thoi-gian', cauHoi, ...hoanThanh(hao, [haoDong]) };
}
