/** Bát quái. hao: 3 hào từ dưới lên (1 = dương, 0 = âm). so: số tiên thiên (dùng cho Mai Hoa). */
export const BAT_QUAI = {
  Càn: { hao: [1, 1, 1], so: 1, tuong: 'Thiên', hanh: 'Kim' },
  Đoài: { hao: [1, 1, 0], so: 2, tuong: 'Trạch', hanh: 'Kim' },
  Ly: { hao: [1, 0, 1], so: 3, tuong: 'Hỏa', hanh: 'Hỏa' },
  Chấn: { hao: [1, 0, 0], so: 4, tuong: 'Lôi', hanh: 'Mộc' },
  Tốn: { hao: [0, 1, 1], so: 5, tuong: 'Phong', hanh: 'Mộc' },
  Khảm: { hao: [0, 1, 0], so: 6, tuong: 'Thủy', hanh: 'Thủy' },
  Cấn: { hao: [0, 0, 1], so: 7, tuong: 'Sơn', hanh: 'Thổ' },
  Khôn: { hao: [0, 0, 0], so: 8, tuong: 'Địa', hanh: 'Thổ' },
} as const;
export type TenQuai = keyof typeof BAT_QUAI;

/** 64 quẻ theo thứ tự Văn Vương: [tên, thượng quái, hạ quái]. */
export const QUE: [string, TenQuai, TenQuai][] = [
  ['Thuần Càn', 'Càn', 'Càn'], ['Thuần Khôn', 'Khôn', 'Khôn'], ['Thủy Lôi Truân', 'Khảm', 'Chấn'], ['Sơn Thủy Mông', 'Cấn', 'Khảm'],
  ['Thủy Thiên Nhu', 'Khảm', 'Càn'], ['Thiên Thủy Tụng', 'Càn', 'Khảm'], ['Địa Thủy Sư', 'Khôn', 'Khảm'], ['Thủy Địa Tỷ', 'Khảm', 'Khôn'],
  ['Phong Thiên Tiểu Súc', 'Tốn', 'Càn'], ['Thiên Trạch Lý', 'Càn', 'Đoài'], ['Địa Thiên Thái', 'Khôn', 'Càn'], ['Thiên Địa Bĩ', 'Càn', 'Khôn'],
  ['Thiên Hỏa Đồng Nhân', 'Càn', 'Ly'], ['Hỏa Thiên Đại Hữu', 'Ly', 'Càn'], ['Địa Sơn Khiêm', 'Khôn', 'Cấn'], ['Lôi Địa Dự', 'Chấn', 'Khôn'],
  ['Trạch Lôi Tùy', 'Đoài', 'Chấn'], ['Sơn Phong Cổ', 'Cấn', 'Tốn'], ['Địa Trạch Lâm', 'Khôn', 'Đoài'], ['Phong Địa Quán', 'Tốn', 'Khôn'],
  ['Hỏa Lôi Phệ Hạp', 'Ly', 'Chấn'], ['Sơn Hỏa Bí', 'Cấn', 'Ly'], ['Sơn Địa Bác', 'Cấn', 'Khôn'], ['Địa Lôi Phục', 'Khôn', 'Chấn'],
  ['Thiên Lôi Vô Vọng', 'Càn', 'Chấn'], ['Sơn Thiên Đại Súc', 'Cấn', 'Càn'], ['Sơn Lôi Di', 'Cấn', 'Chấn'], ['Trạch Phong Đại Quá', 'Đoài', 'Tốn'],
  ['Thuần Khảm', 'Khảm', 'Khảm'], ['Thuần Ly', 'Ly', 'Ly'], ['Trạch Sơn Hàm', 'Đoài', 'Cấn'], ['Lôi Phong Hằng', 'Chấn', 'Tốn'],
  ['Thiên Sơn Độn', 'Càn', 'Cấn'], ['Lôi Thiên Đại Tráng', 'Chấn', 'Càn'], ['Hỏa Địa Tấn', 'Ly', 'Khôn'], ['Địa Hỏa Minh Di', 'Khôn', 'Ly'],
  ['Phong Hỏa Gia Nhân', 'Tốn', 'Ly'], ['Hỏa Trạch Khuê', 'Ly', 'Đoài'], ['Thủy Sơn Kiển', 'Khảm', 'Cấn'], ['Lôi Thủy Giải', 'Chấn', 'Khảm'],
  ['Sơn Trạch Tổn', 'Cấn', 'Đoài'], ['Phong Lôi Ích', 'Tốn', 'Chấn'], ['Trạch Thiên Quải', 'Đoài', 'Càn'], ['Thiên Phong Cấu', 'Càn', 'Tốn'],
  ['Trạch Địa Tụy', 'Đoài', 'Khôn'], ['Địa Phong Thăng', 'Khôn', 'Tốn'], ['Trạch Thủy Khốn', 'Đoài', 'Khảm'], ['Thủy Phong Tỉnh', 'Khảm', 'Tốn'],
  ['Trạch Hỏa Cách', 'Đoài', 'Ly'], ['Hỏa Phong Đỉnh', 'Ly', 'Tốn'], ['Thuần Chấn', 'Chấn', 'Chấn'], ['Thuần Cấn', 'Cấn', 'Cấn'],
  ['Phong Sơn Tiệm', 'Tốn', 'Cấn'], ['Lôi Trạch Quy Muội', 'Chấn', 'Đoài'], ['Lôi Hỏa Phong', 'Chấn', 'Ly'], ['Hỏa Sơn Lữ', 'Ly', 'Cấn'],
  ['Thuần Tốn', 'Tốn', 'Tốn'], ['Thuần Đoài', 'Đoài', 'Đoài'], ['Phong Thủy Hoán', 'Tốn', 'Khảm'], ['Thủy Trạch Tiết', 'Khảm', 'Đoài'],
  ['Phong Trạch Trung Phu', 'Tốn', 'Đoài'], ['Lôi Sơn Tiểu Quá', 'Chấn', 'Cấn'], ['Thủy Hỏa Ký Tế', 'Khảm', 'Ly'], ['Hỏa Thủy Vị Tế', 'Ly', 'Khảm'],
];
