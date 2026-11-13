export type GioiTinh = 'nam' | 'nu';

/** Thông tin sinh do người dùng nhập (giờ đồng hồ tại nơi sinh). */
export interface ThongTinSinh {
  nam: number;
  thang: number;
  ngay: number;
  gio: number; // 0-23
  phut?: number;
  gioiTinh: GioiTinh;
  /** Múi giờ đồng hồ lúc sinh. Mặc định 7 (Việt Nam). Miền Nam 1960–13/6/1975 dùng +8. */
  muiGio?: number;
  /** Kinh độ nơi sinh (độ Đông). Chỉ dùng khi bật giờ mặt trời thực. */
  kinhDo?: number;
  /** Quy đổi giờ đồng hồ sang giờ mặt trời thực trước khi định trụ ngày/giờ. Mặc định tắt. */
  dungGioMatTroiThuc?: boolean;
  /** Sinh 23:00–23:59: 'homSau' = tính sang ngày hôm sau (mặc định), 'trongNgay' = giữ ngày hiện tại. */
  tyMuon?: 'homSau' | 'trongNgay';
}
