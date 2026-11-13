/** So lá số tham chiếu (chép tay từ trang tử vi) với module Nam phái. */
import { anSao } from '../src/index.js';
import { CHI } from '../src/lich/canchi.js';

const CHUAN: Record<string, string> = { 'Thiên Hỉ': 'Thiên Hỷ', 'Hỉ Thần': 'Hỷ Thần', 'Trường Sinh': 'Tràng Sinh', 'Thiên Diêu': 'Thiên Riêu', 'Đài Phụ': 'Thai Phụ', 'Hàm Trì': 'Đào Hoa' };
const ch = (s: string) => CHUAN[s] ?? s;

interface ThamChieu { ten: string; dauVao: Parameters<typeof anSao>[0]; cuc: string; menh: string; than: string; menhChu?: string; thanChu?: string; boQua?: string[]; cung: Record<string, { ten: string; daiHan: number; tieuHan: string; sao: string; doSang?: string; tuan?: boolean; triet?: boolean }> }

const LA_SO: ThamChieu[] = [
  {
    ten: 'Lá số 1: Ất Hợi, tháng 11, ngày 2, giờ Dần, Âm Nam (kiểu Việt Nam — CHUẨN ĐÃ CHỌN)',
    dauVao: { canNam: 1, chiNam: 11, thang: 11, ngay: 2, chiGio: 2, nam: true }, cuc: 'Thổ Ngũ Cục', menh: 'Tuất', than: 'Quan Lộc',
    cung: {
      Tỵ: { ten: 'Tật Ách', daiHan: 55, tieuHan: 'Mão', sao: 'Thiên Phủ, Địa Giải, Thiên Mã, Tuế Phá, Phục Binh, Thiên Hư, Thiên Sứ, Lâm Quan', doSang: 'Thiên Phủ:Đ' },
      Ngọ: { ten: 'Tài Bạch', daiHan: 45, tieuHan: 'Thìn', sao: 'Thiên Đồng, Thái Âm, Long Đức, Văn Khúc, Thiên Quý, Thiên Giải, Thiên Trù, Văn Tinh, Đại Hao, Hóa Kỵ, Quan Đới', doSang: 'Thiên Đồng:H, Thái Âm:H', triet: true },
      Mùi: { ten: 'Tử Tức', daiHan: 35, tieuHan: 'Tỵ', sao: 'Vũ Khúc, Tham Lang, Hoa Cái, Bạch Hổ, Bệnh Phù, Hỏa Tinh, Thiên Khốc, Thiên Hình, Mộc Dục', doSang: 'Vũ Khúc:M, Tham Lang:M', triet: true },
      Thân: { ten: 'Phu Thê', daiHan: 25, tieuHan: 'Ngọ', sao: 'Thái Dương, Cự Môn, Phúc Đức, Hỉ Thần, Văn Xương, Ân Quang, Thiên Việt, Thiên Đức, Đường Phù, Thai Phụ, Thiên Phúc, Kiếp Sát, Trường Sinh', doSang: 'Thái Dương:H, Cự Môn:Đ', tuan: true },
      Dậu: { ten: 'Huynh Đệ', daiHan: 15, tieuHan: 'Mùi', sao: 'Thiên Tướng, Thiên Tài, Điếu Khách, Phi Liêm, Địa Không, Phá Toái, Dưỡng', doSang: 'Thiên Tướng:H', tuan: true },
      Tuất: { ten: 'Mệnh', daiHan: 5, tieuHan: 'Thân', sao: 'Thiên Cơ, Thiên Lương, Trực Phù, Tấu Thư, Thiên Hỉ, Hóa Quyền, Hóa Lộc, Địa Võng, Quả Tú, Lưu Hà, Thai', doSang: 'Thiên Cơ:M, Thiên Lương:M' },
      Hợi: { ten: 'Phụ Mẫu', daiHan: 115, tieuHan: 'Dậu', sao: 'Tử Vi, Thất Sát, Tướng Quân, Bát Tọa, Phượng Các, Thiên Y, Quốc Ấn, Giải Thần, Hóa Khoa, Thái Tuế, Thiên Riêu, Tuyệt', doSang: 'Tử Vi:B, Thất Sát:V' },
      Tý: { ten: 'Phúc Đức', daiHan: 105, tieuHan: 'Tuất', sao: 'Thiếu Dương, Thiên Khôi, Hữu Bật, Đào Hoa, Tiểu Hao, Linh Tinh, Thiên Không, Mộ' },
      Sửu: { ten: 'Điền Trạch', daiHan: 95, tieuHan: 'Hợi', sao: 'Thanh Long, Thiên Thọ, Tang Môn, Địa Kiếp, Tử' },
      Dần: { ten: 'Quan Lộc', daiHan: 85, tieuHan: 'Tý', sao: 'Thiếu Âm, Lực Sĩ, Tả Phù, Đà La, Cô Thần, Bệnh' },
      Mão: { ten: 'Nô Bộc', daiHan: 75, tieuHan: 'Sửu', sao: 'Liêm Trinh, Phá Quân, Lộc Tồn, Bác Sĩ, Tam Thai, Long Trì, Đẩu Quân, Quan Phù, Thiên Thương, Suy', doSang: 'Liêm Trinh:H, Phá Quân:H' },
      Thìn: { ten: 'Thiên Di', daiHan: 65, tieuHan: 'Dần', sao: 'Nguyệt Đức, Hồng Loan, Phong Cáo, Thiên Quan, Tử Phù, Quan Phủ, Kình Dương, Thiên La, Đế Vượng' },
    },
  },
  {
    ten: 'Lá số 2: Canh Thìn, tháng 7, ngày 10, giờ Sửu, Dương Nữ (mục "Nam phái" của trang = phái Tam Hợp Trung Hoa, KHÔNG phải chuẩn đã chọn)',
    dauVao: { canNam: 6, chiNam: 4, thang: 7, ngay: 10, chiGio: 1, nam: false }, cuc: 'Mộc Tam Cục', menh: 'Mùi', than: 'Phúc Đức',
    // Sao chỉ có ở chế độ kia của trang, module Nam phái không dùng:
    boQua: ['Niên Giải', 'Tai Sát', 'Thiên Sát', 'Chỉ Bối', 'Nguyệt Sát', 'Thiên Nguyệt', 'Vong Thần', 'Tướng Tinh', 'Phan An', 'Thiên Vu', 'Tuế Dịch', 'Âm Sát', 'Nguyệt Giải', 'Tức Thần'],
    cung: {
      Tỵ: { ten: 'Phu Thê', daiHan: 23, tieuHan: 'Dậu', sao: 'Thiếu Dương, Ân Quang, Văn Khúc, Thiên Hỉ, Tiểu Hao, Cô Thần, Kiếp Sát, Thiên Không, Bệnh' },
      Ngọ: { ten: 'Huynh Đệ', daiHan: 13, tieuHan: 'Thân', sao: 'Thiên Cơ, Thanh Long, Thiên Khôi, Phượng Các, Giải Thần, Thiên Phúc, Tang Môn, Niên Giải, Tai Sát, Suy', triet: true },
      Mùi: { ten: 'Mệnh', daiHan: 3, tieuHan: 'Mùi', sao: 'Tử Vi, Phá Quân, Thiếu Âm, Lực Sĩ, Tam Thai, Bát Tọa, Thiên Y, Đài Phụ, Đà La, Thiên Diêu, Thiên Sát, Đế Vượng', triet: true },
      Thân: { ten: 'Phụ Mẫu', daiHan: 113, tieuHan: 'Ngọ', sao: 'Lộc Tồn, Bác Sĩ, Long Trì, Quan Phù, Lưu Hà, Chỉ Bối, Lâm Quan', tuan: true },
      Dậu: { ten: 'Phúc Đức', daiHan: 103, tieuHan: 'Tỵ', sao: 'Thiên Phủ, Văn Xương, Thiên Quý, Nguyệt Đức, Hàm Trì, Hóa Khoa, Tử Phù, Quan Phủ, Kình Dương, Quan Đới', tuan: true },
      Tuất: { ten: 'Điền Trạch', daiHan: 93, tieuHan: 'Thìn', sao: 'Thái Âm, Tả Phù, Tuế Phá, Phục Binh, Địa Không, Thiên Hư, Địa Võng, Nguyệt Sát, Mộc Dục' },
      Hợi: { ten: 'Quan Lộc', daiHan: 83, tieuHan: 'Mão', sao: 'Liêm Trinh, Tham Lang, Long Đức, Hồng Loan, Thiên Tài, Thiên Quan, Văn Tinh, Đẩu Quân, Đại Hao, Linh Tinh, Thiên Nguyệt, Vong Thần, Trường Sinh' },
      Tý: { ten: 'Nô Bộc', daiHan: 73, tieuHan: 'Dần', sao: 'Cự Môn, Tướng Tinh, Bạch Hổ, Bệnh Phù, Địa Kiếp, Thiên Sứ, Dưỡng' },
      Sửu: { ten: 'Thiên Di', daiHan: 63, tieuHan: 'Sửu', sao: 'Thiên Tướng, Phúc Đức, Hỉ Thần, Thiên Đức, Đường Phù, Địa Giải, Thiên Thọ, Phan An, Quả Tú, Phá Toái, Thai' },
      Dần: { ten: 'Tật Ách', daiHan: 53, tieuHan: 'Tý', sao: 'Thiên Đồng, Thiên Lương, Thiên Việt, Thiên Giải, Thiên Mã, Thiên Trù, Thiên Vu, Tuế Dịch, Điếu Khách, Phi Liêm, Thiên Khốc, Thiên Thương, Hóa Kỵ, Âm Sát, Nguyệt Giải, Tuyệt' },
      Mão: { ten: 'Tài Bạch', daiHan: 43, tieuHan: 'Hợi', sao: 'Vũ Khúc, Thất Sát, Trực Phù, Tấu Thư, Phong Cáo, Hóa Quyền, Hỏa Tinh, Thiên Hình, Tức Thần, Mộ' },
      Thìn: { ten: 'Tử Tức', daiHan: 33, tieuHan: 'Tuất', sao: 'Thái Dương, Tướng Quân, Hữu Bật, Quốc Ấn, Hóa Lộc, Hoa Cái, Thái Tuế, Thiên La, Tử' },
    },
  },
  {
    ten: 'Lá số 3: Canh Thìn, tháng 3, ngày 11, giờ Tý, Dương Nam (kiểu Việt Nam)',
    dauVao: { canNam: 6, chiNam: 4, thang: 3, ngay: 11, chiGio: 0, nam: true }, cuc: 'Kim Tứ Cục', menh: 'Thìn', than: 'Mệnh', menhChu: 'Liêm Trinh', thanChu: 'Văn Xương',
    cung: {
      Tỵ: { ten: 'Phụ Mẫu', daiHan: 14, tieuHan: 'Hợi', sao: 'Thiên Tướng, Thiếu Dương, Thiên Hỉ, Đại Hao, Cô Thần, Kiếp Sát, Thiên Không, Trường Sinh', doSang: 'Thiên Tướng:Đ' },
      Ngọ: { ten: 'Phúc Đức', daiHan: 24, tieuHan: 'Tý', sao: 'Thiên Lương, Thiên Khôi, Tả Phù, Phượng Các, Giải Thần, Thai Phụ, Thiên Phúc, Tang Môn, Phục Binh, Mộc Dục', doSang: 'Thiên Lương:M', triet: true },
      Mùi: { ten: 'Điền Trạch', daiHan: 34, tieuHan: 'Sửu', sao: 'Liêm Trinh, Thất Sát, Thiếu Âm, Ân Quang, Thiên Quý, Quan Phủ, Đà La, Quan Đới', doSang: 'Liêm Trinh:Đ, Thất Sát:Đ', triet: true },
      Thân: { ten: 'Quan Lộc', daiHan: 44, tieuHan: 'Dần', sao: 'Lộc Tồn, Bác Sĩ, Hữu Bật, Long Trì, Thiên Tài, Thiên Thọ, Quan Phù, Lưu Hà, Lâm Quan', tuan: true },
      Dậu: { ten: 'Nô Bộc', daiHan: 54, tieuHan: 'Mão', sao: 'Lực Sĩ, Nguyệt Đức, Đào Hoa, Địa Giải, Tử Phù, Kình Dương, Thiên Thương, Đế Vượng', tuan: true },
      Tuất: { ten: 'Thiên Di', daiHan: 64, tieuHan: 'Thìn', sao: 'Thiên Đồng, Thanh Long, Văn Xương, Bát Tọa, Thiên Giải, Tuế Phá, Linh Tinh, Thiên Hư, Địa Võng, Hóa Kỵ, Suy', doSang: 'Thiên Đồng:H' },
      Hợi: { ten: 'Tật Ách', daiHan: 74, tieuHan: 'Tỵ', sao: 'Vũ Khúc, Phá Quân, Long Đức, Hồng Loan, Hóa Quyền, Thiên Quan, Văn Tinh, Tiểu Hao, Địa Kiếp, Địa Không, Thiên Hình, Thiên Sứ, Bệnh', doSang: 'Vũ Khúc:H, Phá Quân:H' },
      Tý: { ten: 'Tài Bạch', daiHan: 84, tieuHan: 'Ngọ', sao: 'Thái Dương, Tướng Quân, Hóa Lộc, Bạch Hổ, Tử', doSang: 'Thái Dương:H' },
      Sửu: { ten: 'Tử Tức', daiHan: 94, tieuHan: 'Mùi', sao: 'Thiên Phủ, Phúc Đức, Tấu Thư, Thiên Đức, Đường Phù, Quả Tú, Phá Toái, Mộ', doSang: 'Thiên Phủ:B' },
      Dần: { ten: 'Phu Thê', daiHan: 104, tieuHan: 'Thân', sao: 'Thiên Cơ, Thái Âm, Thiên Việt, Phong Cáo, Hóa Khoa, Thiên Mã, Thiên Trù, Đẩu Quân, Điếu Khách, Phi Liêm, Hỏa Tinh, Thiên Khốc, Tuyệt', doSang: 'Thiên Cơ:H, Thái Âm:H' },
      Mão: { ten: 'Huynh Đệ', daiHan: 114, tieuHan: 'Dậu', sao: 'Tử Vi, Tham Lang, Trực Phù, Hỉ Thần, Thiên Y, Thiên Riêu, Thai', doSang: 'Tử Vi:B, Tham Lang:H' },
      Thìn: { ten: 'Mệnh', daiHan: 4, tieuHan: 'Tuất', sao: 'Cự Môn, Văn Khúc, Tam Thai, Quốc Ấn, Hoa Cái, Thái Tuế, Bệnh Phù, Thiên La, Dưỡng', doSang: 'Cự Môn:H' },
    },
  },
  {
    ten: 'Lá số 4: Nhâm Ngọ, tháng 7, ngày 2, giờ Dần, Dương Nam (kiểu Việt Nam)',
    dauVao: { canNam: 8, chiNam: 6, thang: 7, ngay: 2, chiGio: 2, nam: true }, cuc: 'Thủy Nhị Cục', menh: 'Ngọ', than: 'Quan Lộc', menhChu: 'Phá Quân', thanChu: 'Hỏa Tinh',
    cung: {
      Tỵ: { ten: 'Huynh Đệ', daiHan: 112, tieuHan: 'Mùi', sao: 'Cự Môn, Trực Phù, Thiên Việt, Phi Liêm, Phá Toái, Tuyệt', doSang: 'Cự Môn:H' },
      Ngọ: { ten: 'Mệnh', daiHan: 2, tieuHan: 'Thân', sao: 'Liêm Trinh, Thiên Tướng, Hỉ Thần, Văn Khúc, Thiên Quý, Thiên Phúc, Thái Tuế, Thai', doSang: 'Liêm Trinh:V, Thiên Tướng:V' },
      Mùi: { ten: 'Phụ Mẫu', daiHan: 12, tieuHan: 'Dậu', sao: 'Thiên Lương, Thiếu Dương, Thiên Y, Quốc Ấn, Hóa Lộc, Bệnh Phù, Thiên Riêu, Thiên Không, Dưỡng', doSang: 'Thiên Lương:Đ' },
      Thân: { ten: 'Phúc Đức', daiHan: 22, tieuHan: 'Tuất', sao: 'Thất Sát, Văn Xương, Ân Quang, Thai Phụ, Thiên Mã, Tang Môn, Đại Hao, Cô Thần, Trường Sinh', doSang: 'Thất Sát:M', tuan: true },
      Dậu: { ten: 'Điền Trạch', daiHan: 32, tieuHan: 'Hợi', sao: 'Thiên Đồng, Thiếu Âm, Hồng Loan, Thiên Trù, Văn Tinh, Phục Binh, Địa Không, Mộc Dục', doSang: 'Thiên Đồng:H', tuan: true },
      Tuất: { ten: 'Quan Lộc', daiHan: 42, tieuHan: 'Tý', sao: 'Vũ Khúc, Tả Phù, Long Trì, Hóa Khoa, Thiên Quan, Hoa Cái, Quan Phù, Quan Phủ, Đà La, Địa Võng, Hóa Kỵ, Quan Đới', doSang: 'Vũ Khúc:M' },
      Hợi: { ten: 'Nô Bộc', daiHan: 52, tieuHan: 'Sửu', sao: 'Thái Dương, Lộc Tồn, Bác Sĩ, Tam Thai, Nguyệt Đức, Tử Phù, Thiên Thương, Lưu Hà, Kiếp Sát, Lâm Quan', doSang: 'Thái Dương:H' },
      Tý: { ten: 'Thiên Di', daiHan: 62, tieuHan: 'Dần', sao: 'Phá Quân, Lực Sĩ, Thiên Tài, Tuế Phá, Kình Dương, Thiên Khốc, Thiên Hư, Đế Vượng', doSang: 'Phá Quân:M' },
      Sửu: { ten: 'Tật Ách', daiHan: 72, tieuHan: 'Mão', sao: 'Thiên Cơ, Long Đức, Thanh Long, Địa Giải, Địa Kiếp, Linh Tinh, Thiên Sứ, Suy', doSang: 'Thiên Cơ:Đ' },
      Dần: { ten: 'Tài Bạch', daiHan: 82, tieuHan: 'Thìn', sao: 'Tử Vi, Thiên Phủ, Thiên Giải, Hóa Quyền, Đẩu Quân, Bạch Hổ, Tiểu Hao, Bệnh', doSang: 'Tử Vi:M, Thiên Phủ:M', triet: true },
      Mão: { ten: 'Tử Tức', daiHan: 92, tieuHan: 'Tỵ', sao: 'Thái Âm, Phúc Đức, Tướng Quân, Thiên Khôi, Bát Tọa, Thiên Đức, Đào Hoa, Thiên Hỉ, Hỏa Tinh, Thiên Hình, Tử', doSang: 'Thái Âm:H', triet: true },
      Thìn: { ten: 'Phu Thê', daiHan: 102, tieuHan: 'Ngọ', sao: 'Tham Lang, Tấu Thư, Hữu Bật, Phượng Các, Đường Phù, Giải Thần, Phong Cáo, Thiên Thọ, Điếu Khách, Thiên La, Quả Tú, Mộ', doSang: 'Tham Lang:V' },
    },
  },
  {
    ten: 'Lá số 5: Quý Mùi, tháng 11, ngày 2, giờ Tỵ, Âm Nam (kiểu Việt Nam)',
    dauVao: { canNam: 9, chiNam: 7, thang: 11, ngay: 2, chiGio: 5, nam: true }, cuc: 'Hỏa Lục Cục', menh: 'Mùi', than: 'Phu Thê', menhChu: 'Vũ Khúc', thanChu: 'Thiên Tướng',
    cung: {
      Tỵ: { ten: 'Phu Thê', daiHan: 26, tieuHan: 'Hợi', sao: 'Thiên Cơ, Hỉ Thần, Văn Xương, Ân Quang, Thiên Việt, Đường Phù, Địa Giải, Thiên Mã, Thiên Phúc, Điếu Khách, Tuyệt', doSang: 'Thiên Cơ:V' },
      Ngọ: { ten: 'Huynh Đệ', daiHan: 16, tieuHan: 'Tý', sao: 'Tử Vi, Trực Phù, Thiên Giải, Thiên Quan, Phi Liêm, Địa Không, Mộ', doSang: 'Tử Vi:M' },
      Mùi: { ten: 'Mệnh', daiHan: 6, tieuHan: 'Sửu', sao: 'Tấu Thư, Phong Cáo, Hoa Cái, Thái Tuế, Thiên Hình, Tử' },
      Thân: { ten: 'Phụ Mẫu', daiHan: 116, tieuHan: 'Dần', sao: 'Phá Quân, Thiếu Dương, Tướng Quân, Quốc Ấn, Hồng Loan, Hóa Lộc, Cô Thần, Kiếp Sát, Thiên Không, Bệnh', doSang: 'Phá Quân:H', tuan: true },
      Dậu: { ten: 'Phúc Đức', daiHan: 106, tieuHan: 'Mão', sao: 'Văn Khúc, Thiên Quý, Tang Môn, Tiểu Hao, Suy', tuan: true },
      Tuất: { ten: 'Điền Trạch', daiHan: 96, tieuHan: 'Thìn', sao: 'Liêm Trinh, Thiên Phủ, Thiếu Âm, Thanh Long, Thiên Trù, Địa Võng, Đế Vượng', doSang: 'Liêm Trinh:M, Thiên Phủ:V' },
      Hợi: { ten: 'Quan Lộc', daiHan: 86, tieuHan: 'Tỵ', sao: 'Thái Âm, Lực Sĩ, Bát Tọa, Long Trì, Thiên Y, Thai Phụ, Hóa Khoa, Quan Phù, Đà La, Thiên Khốc, Thiên Riêu, Lâm Quan', doSang: 'Thái Âm:M' },
      Tý: { ten: 'Nô Bộc', daiHan: 76, tieuHan: 'Ngọ', sao: 'Tham Lang, Lộc Tồn, Bác Sĩ, Hữu Bật, Nguyệt Đức, Đào Hoa, Thiên Thọ, Tử Phù, Thiên Thương, Hóa Kỵ, Quan Đới', doSang: 'Tham Lang:H', triet: true },
      Sửu: { ten: 'Thiên Di', daiHan: 66, tieuHan: 'Mùi', sao: 'Thiên Đồng, Cự Môn, Hóa Quyền, Tuế Phá, Quan Phủ, Kình Dương, Thiên Hư, Phá Toái, Mộc Dục', doSang: 'Thiên Đồng:H, Cự Môn:H', triet: true },
      Dần: { ten: 'Tật Ách', daiHan: 56, tieuHan: 'Thân', sao: 'Vũ Khúc, Thiên Tướng, Long Đức, Tả Phù, Thiên Hỉ, Thiên Tài, Đẩu Quân, Phục Binh, Thiên Sứ, Lưu Hà, Trường Sinh', doSang: 'Vũ Khúc:V, Thiên Tướng:M' },
      Mão: { ten: 'Tài Bạch', daiHan: 46, tieuHan: 'Dậu', sao: 'Thái Dương, Thiên Lương, Thiên Khôi, Tam Thai, Phượng Các, Giải Thần, Văn Tinh, Bạch Hổ, Đại Hao, Linh Tinh, Dưỡng', doSang: 'Thái Dương:V, Thiên Lương:V' },
      Thìn: { ten: 'Tử Tức', daiHan: 36, tieuHan: 'Tuất', sao: 'Thất Sát, Phúc Đức, Thiên Đức, Bệnh Phù, Địa Kiếp, Hỏa Tinh, Thiên La, Quả Tú, Thai', doSang: 'Thất Sát:H' },
    },
  },
  {
    ten: 'Lá số 6: Giáp Thìn, tháng 1, ngày 6, giờ Hợi, Dương Nữ (kiểu Việt Nam)',
    dauVao: { canNam: 0, chiNam: 4, thang: 1, ngay: 6, chiGio: 11, nam: false }, cuc: 'Hỏa Lục Cục', menh: 'Mão', than: 'Phu Thê', menhChu: 'Liêm Trinh', thanChu: 'Văn Xương',
    cung: {
      Tỵ: { ten: 'Phúc Đức', daiHan: 106, tieuHan: 'Dậu', sao: 'Cự Môn, Thiếu Dương, Bát Tọa, Thiên Hỉ, Thai Phụ, Thiên Thọ, Thiên Trù, Văn Tinh, Đại Hao, Cô Thần, Kiếp Sát, Thiên Không, Tuyệt', doSang: 'Cự Môn:H' },
      Ngọ: { ten: 'Điền Trạch', daiHan: 96, tieuHan: 'Thân', sao: 'Liêm Trinh, Thiên Tướng, Phượng Các, Giải Thần, Hóa Lộc, Tang Môn, Bệnh Phù, Mộ', doSang: 'Liêm Trinh:V, Thiên Tướng:V' },
      Mùi: { ten: 'Quan Lộc', daiHan: 86, tieuHan: 'Mùi', sao: 'Thiên Lương, Thiếu Âm, Hỉ Thần, Thiên Việt, Đường Phù, Địa Giải, Thiên Tài, Thiên Quan, Tử', doSang: 'Thiên Lương:Đ' },
      Thân: { ten: 'Nô Bộc', daiHan: 76, tieuHan: 'Ngọ', sao: 'Thất Sát, Long Trì, Thiên Giải, Quan Phù, Phi Liêm, Thiên Thương, Bệnh', doSang: 'Thất Sát:M', triet: true },
      Dậu: { ten: 'Thiên Di', daiHan: 66, tieuHan: 'Tỵ', sao: 'Thiên Đồng, Tấu Thư, Tam Thai, Nguyệt Đức, Đào Hoa, Thiên Phúc, Tử Phù, Linh Tinh, Thiên Hình, Lưu Hà, Suy', doSang: 'Thiên Đồng:H', triet: true },
      Tuất: { ten: 'Tật Ách', daiHan: 56, tieuHan: 'Thìn', sao: 'Vũ Khúc, Tướng Quân, Hữu Bật, Quốc Ấn, Hóa Khoa, Tuế Phá, Địa Kiếp, Thiên Hư, Thiên Sứ, Địa Võng, Đế Vượng', doSang: 'Vũ Khúc:M' },
      Hợi: { ten: 'Tài Bạch', daiHan: 46, tieuHan: 'Mão', sao: 'Thái Dương, Long Đức, Văn Xương, Thiên Quý, Hồng Loan, Tiểu Hao, Hóa Kỵ, Lâm Quan', doSang: 'Thái Dương:H' },
      Tý: { ten: 'Tử Tức', daiHan: 36, tieuHan: 'Dần', sao: 'Phá Quân, Thanh Long, Hóa Quyền, Bạch Hổ, Địa Không, Quan Đới', doSang: 'Phá Quân:M' },
      Sửu: { ten: 'Phu Thê', daiHan: 26, tieuHan: 'Sửu', sao: 'Thiên Cơ, Phúc Đức, Lực Sĩ, Thiên Khôi, Thiên Đức, Thiên Y, Phong Cáo, Đà La, Thiên Riêu, Quả Tú, Phá Toái, Mộc Dục', doSang: 'Thiên Cơ:Đ' },
      Dần: { ten: 'Huynh Đệ', daiHan: 16, tieuHan: 'Tý', sao: 'Tử Vi, Thiên Phủ, Lộc Tồn, Bác Sĩ, Thiên Mã, Điếu Khách, Thiên Khốc, Trường Sinh', doSang: 'Tử Vi:M, Thiên Phủ:M', tuan: true },
      Mão: { ten: 'Mệnh', daiHan: 6, tieuHan: 'Hợi', sao: 'Thái Âm, Trực Phù, Ân Quang, Văn Khúc, Đẩu Quân, Quan Phủ, Kình Dương, Hỏa Tinh, Dưỡng', doSang: 'Thái Âm:H', tuan: true },
      Thìn: { ten: 'Phụ Mẫu', daiHan: 116, tieuHan: 'Tuất', sao: 'Tham Lang, Tả Phù, Hoa Cái, Thái Tuế, Phục Binh, Thiên La, Thai', doSang: 'Tham Lang:V' },
    },
  },
];

export function chayDoiChieu() {
  return LA_SO.map((ls) => {
  const kq = anSao(ls.dauVao);
  const lech: string[] = [];
  let tong = 0, khop = 0;
  const so = (mo: string, a: unknown, b: unknown) => { tong++; a === b ? khop++ : lech.push(`${mo}: trang=${b} | module=${a}`); };
  so('Cục', kq.cuc, ls.cuc); so('Mệnh tại', kq.cungMenhTai, ls.menh); so('Thân cư', kq.thanCu, ls.than);
  if (ls.menhChu) so('Mệnh chủ', kq.menhChu, ls.menhChu);
  if (ls.thanChu) so('Thân chủ', kq.thanChu, ls.thanChu);
  const viM = new Map<string, string>(), viT = new Map<string, string>();
  for (const c of kq.cung) {
    const t = ls.cung[c.chi];
    so(`Tên cung ${c.chi}`, c.ten, t.ten); so(`Đại hạn ${c.chi}`, c.daiHan[0], t.daiHan); so(`Tiểu hạn ${c.chi}`, c.tieuHan, t.tieuHan);
    so(`Tuần ${c.chi}`, c.tuan, Boolean(t.tuan)); so(`Triệt ${c.chi}`, c.triet, Boolean(t.triet));
    for (const s of [...c.chinhTinh.map((x) => x.ten), ...c.phuTinh.map((x) => x.ten), c.vongThaiTue, c.vongLocTon, c.vongTrangSinh]) viM.set(s + (viM.has(s) ? '#2' : ''), c.chi);
    for (const d of (t.doSang ?? '').split(',').map((x) => x.trim()).filter(Boolean)) {
      const [ten, ds] = d.split(':');
      so(`Độ sáng ${ten} tại ${c.chi}`, c.chinhTinh.find((x) => x.ten === ten)?.doSang[0], ds);
    }
  }
  for (const chi of CHI) for (const s of ls.cung[chi].sao.split(',').map((x) => ch(x.trim()))) if (!ls.boQua?.includes(s)) viT.set(s + (viT.has(s) ? '#2' : ''), chi);
  for (const [s, chi] of viT) so(`Sao ${s}`, viM.get(s) ?? '(không an)', chi);
  for (const [s, chi] of viM) if (!viT.has(s)) lech.push(`Module có ${s} tại ${chi}, trang không hiện`);
  return { ten: ls.ten, chuan: !ls.boQua, khop, tong, lech };
  });
}

if (process.argv[1]?.endsWith('so-la-so.ts')) {
  for (const r of chayDoiChieu()) {
    console.log(`\n${r.ten}\n  Khớp ${r.khop}/${r.tong}`);
    for (const l of r.lech) console.log('  LỆCH ' + l);
  }
}
