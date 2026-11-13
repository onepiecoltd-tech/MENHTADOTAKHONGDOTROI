/**
 * Bảng an sao tử vi Nam phái (theo lối an sao phổ biến ở Việt Nam, hệ "Tử vi đẩu số tân biên").
 * Chỉ số chi: 0 = Tý ... 11 = Hợi. Chỉ số can: 0 = Giáp ... 9 = Quý.
 * Mọi bảng nằm ở đây để người rành tử vi sửa một chỗ khi đối chiếu sách.
 * Mục đánh dấu [CẦN ĐỐI CHIẾU] là chỗ các sách/phái hay chép khác nhau.
 */

export const TEN_CUNG = ['Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'];

/** Cục theo hành nạp âm của cung Mệnh. */
export const CUC: Record<string, { so: number; ten: string }> = {
  Thủy: { so: 2, ten: 'Thủy Nhị Cục' }, Mộc: { so: 3, ten: 'Mộc Tam Cục' }, Kim: { so: 4, ten: 'Kim Tứ Cục' },
  Thổ: { so: 5, ten: 'Thổ Ngũ Cục' }, Hỏa: { so: 6, ten: 'Hỏa Lục Cục' },
};

/** Chính tinh: khoảng cách so với Tử Vi (nghịch) và Thiên Phủ (thuận). */
export const NHOM_TU_VI: [string, number][] = [['Tử Vi', 0], ['Thiên Cơ', -1], ['Thái Dương', -3], ['Vũ Khúc', -4], ['Thiên Đồng', -5], ['Liêm Trinh', -8]];
export const NHOM_THIEN_PHU: [string, number][] = [['Thiên Phủ', 0], ['Thái Âm', 1], ['Tham Lang', 2], ['Cự Môn', 3], ['Thiên Tướng', 4], ['Thiên Lương', 5], ['Thất Sát', 6], ['Phá Quân', 10]];

/** [CẦN ĐỐI CHIẾU] Độ sáng 14 chính tinh theo 12 cung Tý..Hợi. M miếu, V vượng, Đ đắc, B bình, H hãm. */
export const DO_SANG: Record<string, string> = {
  //             Tý Sửu Dần Mão Thìn Tỵ Ngọ Mùi Thân Dậu Tuất Hợi
  'Tử Vi':       'B Đ M B V M M Đ M B V B',
  'Liêm Trinh':  'V Đ V H M H V Đ V H M H',
  'Thiên Đồng':  'V H M Đ H Đ H H M H H Đ',
  'Vũ Khúc':     'V M V Đ M H V M V Đ M H',
  'Thái Dương':  'H Đ V V V M M Đ H H H H',
  'Thiên Cơ':    'Đ Đ H M M V Đ Đ V M M H',
  'Thiên Phủ':   'M B M B V Đ M Đ M B V Đ',
  'Thái Âm':     'V Đ H H H H H Đ V M M M',
  'Tham Lang':   'H M Đ H V H H M Đ H V H',
  'Cự Môn':      'V H V M H H V H Đ M H Đ',
  'Thiên Tướng': 'V Đ M H V Đ V Đ M H V Đ',
  'Thiên Lương': 'V Đ V V M H M Đ V H M H',
  'Thất Sát':    'M Đ M H H V M Đ M H H V',
  'Phá Quân':    'M V H H Đ H M V H H Đ H',
};
export const TEN_DO_SANG: Record<string, string> = { M: 'Miếu', V: 'Vượng', Đ: 'Đắc', B: 'Bình', H: 'Hãm' };

/** Theo can năm. */
export const LOC_TON = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
/** Khôi Việt lối Việt Nam: Canh Tân ở Ngọ/Dần (khác bản Trung Hoa hiện hành). */
export const THIEN_KHOI = [1, 0, 11, 11, 1, 0, 6, 6, 3, 3];
export const THIEN_VIET = [7, 8, 9, 9, 7, 8, 2, 2, 5, 5];
export const THIEN_QUAN = [7, 4, 5, 2, 3, 9, 11, 9, 10, 6];
export const THIEN_PHUC = [9, 8, 0, 11, 3, 2, 6, 5, 6, 5];
/** Lưu Hà, Thiên Trù: đã khớp lá số tham chiếu các can Giáp, Ất, Canh, Nhâm, Quý. */
export const LUU_HA = [9, 10, 7, 4, 5, 6, 8, 3, 11, 2];
export const THIEN_TRU = [5, 6, 0, 5, 6, 8, 2, 6, 9, 10];
/** Văn Tinh theo can năm. Trang tham chiếu an tuổi Nhâm ở Dậu; công thức thông dụng (Lộc Tồn + 3 cung) cho Nhâm ở Dần. Đang theo trang tham chiếu. */
export const VAN_TINH = [5, 6, 8, 9, 8, 9, 11, 0, 9, 3];
/** Triệt theo can năm (can % 5): cặp cung. */
export const TRIET = [[8, 9], [6, 7], [4, 5], [2, 3], [0, 1]];

/** Tứ hóa theo can năm: Lộc, Quyền, Khoa, Kỵ. Đã khớp lá số tham chiếu các can Giáp, Ất, Canh, Nhâm, Quý. */
export const TU_HOA: string[][] = [
  ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'],
  ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'],
  ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'],
  ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'],
  ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'],
  ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'],
  ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'],
  ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'],
  ['Thiên Lương', 'Tử Vi', 'Tả Phù', 'Vũ Khúc'],
  ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang'],
];
export const TEN_HOA = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'];

/** Theo tam hợp tuổi (chi % 4): 0 Thân-Tý-Thìn, 1 Tỵ-Dậu-Sửu, 2 Dần-Ngọ-Tuất, 3 Hợi-Mão-Mùi. */
export const THIEN_MA = [2, 11, 8, 5];
export const HOA_CAI = [4, 1, 10, 7];
export const KIEP_SAT = [5, 2, 11, 8];
export const DAO_HOA = [9, 6, 3, 0];
export const KHOI_TIEU_HAN = [10, 7, 4, 1];
/** Hỏa Tinh, Linh Tinh: cung khởi giờ Tý. Dương nam/âm nữ: Hỏa thuận, Linh nghịch; âm nam/dương nữ ngược lại. */
export const KHOI_HOA = [2, 3, 1, 9];
export const KHOI_LINH = [10, 10, 3, 10];

/** Cô Thần, Quả Tú theo tam hội tuổi: Hợi-Tý-Sửu, Dần-Mão-Thìn, Tỵ-Ngọ-Mùi, Thân-Dậu-Tuất. */
export const CO_THAN = [2, 5, 8, 11];
export const QUA_TU = [10, 1, 4, 7];
/** Phá Toái theo chi % 3: Tý-Ngọ-Mão-Dậu, Thìn-Tuất-Sửu-Mùi, Dần-Thân-Tỵ-Hợi. */
export const PHA_TOAI = [5, 1, 9];

export const VONG_THAI_TUE = ['Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm', 'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức', 'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'];
export const VONG_LOC_TON = ['Bác Sĩ', 'Lực Sĩ', 'Thanh Long', 'Tiểu Hao', 'Tướng Quân', 'Tấu Thư', 'Phi Liêm', 'Hỷ Thần', 'Bệnh Phù', 'Đại Hao', 'Phục Binh', 'Quan Phủ'];
export const VONG_TRANG_SINH = ['Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'];
/** Cung khởi Tràng Sinh theo số cục. */
export const KHOI_TRANG_SINH: Record<number, number> = { 2: 8, 3: 11, 4: 5, 5: 8, 6: 2 };

export const SAT_TINH = ['Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp'];
export const CAT_TINH = ['Tả Phù', 'Hữu Bật', 'Văn Xương', 'Văn Khúc', 'Thiên Khôi', 'Thiên Việt', 'Lộc Tồn', 'Thiên Mã', 'Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa'];

/** Mệnh chủ, Thân chủ theo chi năm sinh (Tý..Hợi). [CẦN ĐỐI CHIẾU: mới xác nhận tuổi Hợi, Thìn] */
export const MENH_CHU = ['Tham Lang', 'Cự Môn', 'Lộc Tồn', 'Văn Khúc', 'Liêm Trinh', 'Vũ Khúc', 'Phá Quân', 'Vũ Khúc', 'Liêm Trinh', 'Văn Khúc', 'Lộc Tồn', 'Cự Môn'];
export const THAN_CHU = ['Linh Tinh', 'Thiên Tướng', 'Thiên Lương', 'Thiên Đồng', 'Văn Xương', 'Thiên Cơ', 'Hỏa Tinh', 'Thiên Tướng', 'Thiên Lương', 'Thiên Đồng', 'Văn Xương', 'Thiên Cơ'];
