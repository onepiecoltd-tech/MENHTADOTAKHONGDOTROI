import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { QUE } from './data.js';
import type { KetQuaGieoQue, Que } from './index.js';

/**
 * Lời quẻ, lời hào đọc từ data/kinhdich/loi-que.json (tách từ sách bằng scripts/tach-kinh-dich.py).
 * Code không tự sinh lời quẻ: trường nào trống thì trả về chuỗi rỗng và AI phải nói rõ là chưa có nguyên văn.
 */
export interface LoiQue {
  so: number;
  ten: string;
  /** Tên quẻ và hai quái theo cách ghi của sách (Kiền = Càn, Đoái = Đoài). */
  tenTrongSach?: string;
  quaiTrongSach?: string;
  /** Lời quẻ (quái từ): phiên âm và dịch nghĩa. */
  loiQueAm: string;
  loiQue: string;
  /** Thoán truyện. */
  thoanAm: string;
  thoan: string;
  /** Đại Tượng. */
  loiTuongAm: string;
  loiTuong: string;
  /** Lời 6 hào (hào từ), từ hào sơ đến hào thượng. */
  tenHao: string[];
  haoAm: string[];
  hao: string[];
  /** Tiểu Tượng của từng hào. */
  tieuTuongAm: string[];
  tieuTuong: string[];
  /** Dụng Cửu (quẻ Càn) / Dụng Lục (quẻ Khôn). */
  dungAm?: string;
  dung?: string;
}
export interface TepLoiQue { nguon: string; ghiChu?: string; que: LoiQue[] }

let boNho: TepLoiQue | null = null;
/** Nạp sẵn dữ liệu lời quẻ (dùng khi đóng gói ứng dụng, không đọc tệp theo đường dẫn). */
export function datLoiQue(t: TepLoiQue) { boNho = t; }
const sau = () => ['', '', '', '', '', ''];

export function taoTepMau(): TepLoiQue {
  return {
    nguon: '(chưa nhập)',
    que: QUE.map(([ten], i) => ({
      so: i + 1, ten, loiQueAm: '', loiQue: '', thoanAm: '', thoan: '', loiTuongAm: '', loiTuong: '',
      tenHao: sau(), haoAm: sau(), hao: sau(), tieuTuongAm: sau(), tieuTuong: sau(), ...(i < 2 ? { dungAm: '', dung: '' } : {}),
    })),
  };
}

export function docLoiQue(): TepLoiQue {
  if (boNho) return boNho;
  const duongDan = fileURLToPath(new URL('../../data/kinhdich/loi-que.json', import.meta.url));
  boNho = existsSync(duongDan) ? (JSON.parse(readFileSync(duongDan, 'utf8')) as TepLoiQue) : taoTepMau();
  if (boNho.que.length !== 64) throw new Error('loi-que.json phải có đúng 64 quẻ');
  boNho.que.forEach((q, i) => {
    if (q.so !== i + 1 || q.ten !== QUE[i][0] || q.hao.length !== 6) throw new Error(`loi-que.json sai ở quẻ ${i + 1} (${QUE[i][0]})`);
  });
  return boNho;
}

/** Thống kê mức độ hoàn thành tệp lời quẻ. */
export function kiemLoiQue() {
  const t = docLoiQue();
  const thieu: string[] = [];
  for (const q of t.que) {
    const m = [!q.loiQue && 'lời quẻ', !q.thoan && 'Thoán', !q.loiTuong && 'Đại Tượng',
      ...q.hao.map((h, i) => !h && `hào ${i + 1}`), ...q.tieuTuong.map((h, i) => !h && `tiểu tượng ${i + 1}`)].filter(Boolean);
    if (m.length) thieu.push(`${q.so}. ${q.ten}: ${m.join(', ')}`);
  }
  return { nguon: t.nguon, tongQue: t.que.length, daDuLoiQueVaHao: t.que.filter((q) => q.loiQue && q.hao.every(Boolean)).length, thieu };
}

const tenHao = (viTri: number, duong: number) => (viTri === 1 ? `Sơ ${duong ? 'Cửu' : 'Lục'}` : viTri === 6 ? `Thượng ${duong ? 'Cửu' : 'Lục'}` : `${duong ? 'Cửu' : 'Lục'} ${['', '', 'Nhị', 'Tam', 'Tứ', 'Ngũ'][viTri]}`);

/** Gắn lời quẻ chủ, lời các hào động và lời quẻ biến vào kết quả gieo quẻ. */
export function ganLoiQue(kq: KetQuaGieoQue) {
  const t = docLoiQue();
  const lay = (q: Que) => {
    const l = t.que[q.so - 1];
    return { ten: q.ten, loiQueAm: l.loiQueAm, loiQue: l.loiQue, thoan: l.thoan, daiTuong: l.loiTuong };
  };
  const chu = t.que[kq.queChu.so - 1];
  return {
    ...kq,
    loiQue: {
      nguon: t.nguon,
      queChu: lay(kq.queChu),
      haoDong: kq.haoDong.map((v) => ({ viTri: v, ten: tenHao(v, kq.queChu.hao[v - 1]), am: chu.haoAm[v - 1], loi: chu.hao[v - 1], tieuTuong: chu.tieuTuong[v - 1] })),
      // Sáu hào đều động ở quẻ Càn/Khôn: xem thêm Dụng Cửu/Dụng Lục
      ...(kq.haoDong.length === 6 && chu.dung ? { dung: chu.dung } : {}),
      queBien: kq.queBien ? lay(kq.queBien) : null,
      daCoNguyenVan: Boolean(chu.loiQue),
    },
  };
}
