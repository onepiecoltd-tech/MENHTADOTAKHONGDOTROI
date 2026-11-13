export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;
export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;
export const CAN_HAN = '甲乙丙丁戊己庚辛壬癸';
export const CHI_HAN = '子丑寅卯辰巳午未申酉戌亥';
export const NGU_HANH = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'] as const;
export type NguHanh = (typeof NGU_HANH)[number];

/** Ngũ hành của 12 chi (chỉ số vào NGU_HANH). */
const CHI_HANH = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
/** Tàng can của 12 chi (chỉ số can), bản khí đứng đầu. */
const TANG_CAN = [[9], [5, 9, 7], [0, 2, 4], [1], [4, 1, 9], [2, 6, 4], [3, 5], [5, 3, 1], [6, 8, 4], [7], [4, 7, 3], [8, 0]];

const THAP_THAN = [
  ['Tỷ Kiên', 'Kiếp Tài'],
  ['Thực Thần', 'Thương Quan'],
  ['Thiên Tài', 'Chính Tài'],
  ['Thất Sát', 'Chính Quan'],
  ['Thiên Ấn', 'Chính Ấn'],
];

const NAP_AM = [
  'Hải Trung Kim', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim', 'Sơn Đầu Hỏa',
  'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc', 'Tuyền Trung Thủy', 'Ốc Thượng Thổ',
  'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy', 'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc',
  'Bích Thượng Thổ', 'Kim Bạch Kim', 'Phú Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Thoa Xuyến Kim',
  'Tang Đố Mộc', 'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy',
];

export interface CanChi { can: number; chi: number }

export const hanhCuaCan = (can: number): NguHanh => NGU_HANH[Math.floor(can / 2)];
export const hanhCuaChi = (chi: number): NguHanh => NGU_HANH[CHI_HANH[chi]];
export const amDuongCuaCan = (can: number) => (can % 2 === 0 ? 'Dương' : 'Âm');
export const tangCan = (chi: number): number[] => TANG_CAN[chi];
export const tenCanChi = (cc: CanChi) => `${CAN[cc.can]} ${CHI[cc.chi]}`;

/** Thập thần của một can so với nhật chủ. */
export function thapThan(nhatChu: number, can: number): string {
  const quanHe = (Math.floor(can / 2) - Math.floor(nhatChu / 2) + 5) % 5;
  const cungAmDuong = can % 2 === nhatChu % 2;
  return THAP_THAN[quanHe][cungAmDuong ? 0 : 1];
}

/** Vị trí trong lục thập hoa giáp (0 = Giáp Tý). */
export function viTriHoaGiap(cc: CanChi): number {
  for (let i = 0; i < 60; i++) if (i % 10 === cc.can && i % 12 === cc.chi) return i;
  throw new Error(`Can chi không hợp lệ: ${cc.can}/${cc.chi}`);
}
export const napAm = (cc: CanChi): string => NAP_AM[Math.floor(viTriHoaGiap(cc) / 2)];

/** Đổi chuỗi can chi chữ Hán (vd "甲子") sang chỉ số. */
export function tuChuHan(s: string): CanChi {
  const can = CAN_HAN.indexOf(s[0]);
  const chi = CHI_HAN.indexOf(s[1]);
  if (can < 0 || chi < 0) throw new Error(`Không đọc được can chi: ${s}`);
  return { can, chi };
}
