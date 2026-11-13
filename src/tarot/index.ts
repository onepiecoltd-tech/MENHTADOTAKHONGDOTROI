import { taoNgauNhien } from '../random.js';

export interface LaBai { id: number; ten: string; tenAnh: string; nhom: 'Ẩn chính' | 'Ẩn phụ'; bo?: string; nguyenTo?: string; so: number }

const AN_CHINH: [string, string][] = [
  ['Chàng Khờ', 'The Fool'], ['Nhà Ảo Thuật', 'The Magician'], ['Nữ Tư Tế', 'The High Priestess'], ['Hoàng Hậu', 'The Empress'],
  ['Hoàng Đế', 'The Emperor'], ['Giáo Hoàng', 'The Hierophant'], ['Tình Nhân', 'The Lovers'], ['Cỗ Xe', 'The Chariot'],
  ['Sức Mạnh', 'Strength'], ['Ẩn Sĩ', 'The Hermit'], ['Bánh Xe Vận Mệnh', 'Wheel of Fortune'], ['Công Lý', 'Justice'],
  ['Người Treo Ngược', 'The Hanged Man'], ['Cái Chết', 'Death'], ['Tiết Chế', 'Temperance'], ['Ác Quỷ', 'The Devil'],
  ['Tòa Tháp', 'The Tower'], ['Ngôi Sao', 'The Star'], ['Mặt Trăng', 'The Moon'], ['Mặt Trời', 'The Sun'],
  ['Phán Xét', 'Judgement'], ['Thế Giới', 'The World'],
];
const BO: [string, string, string][] = [['Gậy', 'Wands', 'Hỏa'], ['Cốc', 'Cups', 'Thủy'], ['Kiếm', 'Swords', 'Khí'], ['Tiền', 'Pentacles', 'Thổ']];
const HANG: [string, string][] = [
  ['Át', 'Ace'], ['Hai', 'Two'], ['Ba', 'Three'], ['Bốn', 'Four'], ['Năm', 'Five'], ['Sáu', 'Six'], ['Bảy', 'Seven'],
  ['Tám', 'Eight'], ['Chín', 'Nine'], ['Mười', 'Ten'], ['Tiểu Đồng', 'Page'], ['Kỵ Sĩ', 'Knight'], ['Nữ Hoàng', 'Queen'], ['Vua', 'King'],
];

/** Bộ bài Rider–Waite 78 lá. */
export const BO_BAI: LaBai[] = [
  ...AN_CHINH.map(([ten, tenAnh], i): LaBai => ({ id: i, ten, tenAnh, nhom: 'Ẩn chính', so: i })),
  ...BO.flatMap(([bo, boAnh, nguyenTo], b) =>
    HANG.map(([h, hAnh], i): LaBai => ({ id: 22 + b * 14 + i, ten: `${h} ${bo}`, tenAnh: `${hAnh} of ${boAnh}`, nhom: 'Ẩn phụ', bo, nguyenTo, so: i + 1 })),
  ),
];

export const KIEU_TRAI = {
  'mot-la': ['Thông điệp'],
  'ba-la': ['Quá khứ', 'Hiện tại', 'Tương lai'],
  'tinh-huong': ['Tình huống', 'Trở ngại', 'Lời khuyên'],
  'celtic-cross': ['Hiện tại', 'Thử thách', 'Nền tảng', 'Quá khứ gần', 'Mục tiêu', 'Tương lai gần', 'Bản thân', 'Môi trường', 'Hy vọng và nỗi sợ', 'Kết quả'],
} as const;
export type KieuTrai = keyof typeof KIEU_TRAI;

export interface KetQuaTarot {
  loai: 'tarot';
  kieuTrai: KieuTrai;
  cauHoi?: string;
  cacLa: { viTri: string; la: LaBai; nguoc: boolean }[];
}

/** Xáo bài (Fisher–Yates) rồi rút không lặp; mỗi lá có 50% khả năng ngược. */
export function rutBai(kieuTrai: KieuTrai = 'ba-la', cauHoi?: string, opts: { seed?: number; choPhepNguoc?: boolean } = {}): KetQuaTarot {
  const viTri = KIEU_TRAI[kieuTrai];
  if (!viTri) throw new Error(`Kiểu trải không hỗ trợ: ${kieuTrai}`);
  const rnd = taoNgauNhien(opts.seed);
  const bai = [...BO_BAI];
  for (let i = bai.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [bai[i], bai[j]] = [bai[j], bai[i]];
  }
  return {
    loai: 'tarot',
    kieuTrai,
    cauHoi,
    cacLa: viTri.map((v, i) => ({ viTri: v, la: bai[i], nguoc: (opts.choPhepNguoc ?? true) && rnd(2) === 1 })),
  };
}
