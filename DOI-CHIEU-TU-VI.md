# Phiếu đối chiếu tử vi

**Chuẩn đã chốt (11/11/2026): tử vi kiểu Việt Nam, giống lá số 1** (cung Nô Bộc, Quan Lộc, Tử Tức; Tuần, Triệt; Miếu/Vượng/Đắc/Bình/Hãm).
Mục "Nam phái" trên trang tham chiếu là phái Tam Hợp Trung Hoa (cung Giao Hữu, Sự Nghiệp; Tiệt Không; sao Niên Giải, Tai Sát...) và **không** dùng làm chuẩn.
Lá số đối chiếu về sau phải lấy cùng mục với lá số 1.

Mọi bảng an sao nằm trong `src/tuvi/bang-nam-phai.ts`. Sửa ở đó, chạy `npm test` và `npm run doi-chieu`.

## Kết quả hiện tại

5 lá số kiểu Việt Nam từ trang tham chiếu đều khớp 100% (938/938 mục): mọi sao, ba vòng sao, Tuần, Triệt,
đại hạn, tiểu hạn, độ sáng chính tinh, Mệnh chủ, Thân chủ. Chạy lại: `npm run so-la-so` (cũng nằm trong `npm test`).

| Lá số | Năm, tháng, ngày, giờ | Âm dương | Khớp |
|---|---|---|---|
| 1 | Ất Hợi, 11, 2, Dần | Âm nam | 186/186 |
| 3 | Canh Thìn, 3, 11, Tý | Dương nam | 188/188 |
| 4 | Nhâm Ngọ, 7, 2, Dần | Dương nam | 188/188 |
| 5 | Quý Mùi, 11, 2, Tỵ | Âm nam | 188/188 |
| 6 | Giáp Thìn, 1, 6, Hợi | Dương nữ | 188/188 |

Lá số 2 (mục "Nam phái" của trang, phái Trung Hoa) khớp 168/172 và không dùng làm chuẩn.

## Đã sửa theo lá số chuẩn (11/11/2026)

- Tứ hóa can Canh: Thái Dương Lộc, Vũ Khúc Quyền, **Thái Âm Khoa, Thiên Đồng Kỵ** (trước đó tôi để ngược Khoa và Kỵ).
- Tứ hóa can Nhâm: Hóa Khoa theo **Tả Phù** (trước đó tôi để Thiên Phủ).
- Văn Tinh tuổi Nhâm: an ở **Dậu** theo trang tham chiếu. Công thức thông dụng (Lộc Tồn tiến 3 cung) cho ra Dần; nếu sách của bạn chép Dần thì sửa `VAN_TINH[8]`.

## Đã được lá số chuẩn xác nhận

- Hỏa Tinh, Linh Tinh: cả bốn trường hợp dương nam, âm nam, dương nữ (âm nữ suy ra cùng quy tắc với dương nam).
- Khôi Việt, Lưu Hà, Thiên Trù, Lộc Tồn, tứ hóa: các can Giáp, Ất, Canh, Nhâm, Quý.
- Thiên Quý đếm nghịch; Thiên Thương ở Nô Bộc, Thiên Sứ ở Tật Ách với mọi giới.
- Độ sáng: 70 lượt chính tinh, không lệch lượt nào.
- Mệnh chủ, Thân chủ: tuổi Thìn, Ngọ, Mùi, Hợi.

## Chưa có lá số để xác nhận

- Các can Bính, Đinh, Mậu, Kỷ, Tân (tứ hóa và các sao an theo can; phần này trùng bản Trung Hoa nên rủi ro thấp).
- Người sinh tháng nhuận (ngày 1–15 tính tháng nhuận, 16 trở đi tính tháng kế).
- Một âm nữ.
- Các ô còn lại của bảng độ sáng; Mệnh chủ, Thân chủ các tuổi khác.

## Khác với thư viện iztro (bản Trung Hoa) — đúng như chủ ý

Thiên Khôi, Thiên Việt tuổi Canh; Hỏa Tinh, Linh Tinh; Thiên Quý; Thiên Trù tuổi Quý; Văn Tinh tuổi Nhâm.
Các sao hai bên an giống nhau vẫn khớp 100% trên 3.000 lá số ngẫu nhiên (`npm run doi-chieu`).

## Chưa làm

Sao lưu niên (Lưu Thái Tuế, Lưu Lộc Tồn...), nguyệt hạn.
