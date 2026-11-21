# Huyền Cơ Đồ (Craftbyte)

Ứng dụng desktop 3D gồm năm môn: tử vi Việt Nam, bát tự, chiêm tinh phương Tây, Kinh Dịch và tarot. Chương trình tự tính lá số, gieo quẻ, rút bài; AI chỉ luận giải trên dữ liệu đã tính.

## Chạy ứng dụng

1. Bấm đúp `HuyenCoDo-<phiên bản>.exe`. Bản chạy ngay, không cần cài đặt, không cần Node.js.
2. Windows có thể hiện cảnh báo SmartScreen vì tệp chưa ký số. Bấm **More info** → **Run anyway**.
3. Lần mở đầu mất vài giây vì ứng dụng tự giải nén.

Phần tính toán và hình 3D chạy được khi không có mạng. Chỉ cần mạng khi bấm luận giải AI.

## Cách dùng

| Tab | Thao tác | Hình 3D |
|---|---|---|
| Tử vi | Nhập ngày giờ sinh dương lịch, giới tính → **Lập lá số** | 12 cung quanh thiên bàn. Bấm một cung để xem sao và đường tam phương tứ chính |
| Bát tự | Dùng chung hồ sơ | Bốn trụ can chi tô màu theo ngũ hành, năm cột ngũ hành. Bấm một khối để xem chi tiết trụ |
| Chiêm tinh | Chọn thêm nơi sinh | Vòng hoàng đạo, 12 nhà Placidus, hành tinh, đường góc chiếu. Bấm hành tinh để xem góc chiếu của nó |
| Kinh Dịch | Nhập câu hỏi → **Gieo ba đồng xu** hoặc **Mai Hoa theo giờ** | Sáu hào hiện dần, hào động màu cam, quẻ biến bên phải. Lời quẻ theo bản Ngô Tất Tố |
| Tarot | Nhập câu hỏi → chọn kiểu trải | Lá bài bay ra và lật mặt; lá ngược nằm ngược |

Kéo chuột để xoay, lăn chuột để phóng to.

## Luận giải AI (khung bên phải)

- Bấm một gợi ý hoặc gõ câu hỏi. Hỏi tiếp bao nhiêu lượt cũng được, AI nhớ dữ liệu đang xem.
- **Luận chéo các môn**: gộp lá số, quẻ và trải bài đang có để trả lời một việc.
- Nút **Kết nối AI** (góc trên phải) chọn một trong hai đường:
  - **Tài khoản Claude** (mặc định): dùng đăng nhập Claude Code trên máy, giống JARVIS. Chỉ dành cho bạn tự dùng. Nếu báo chưa sẵn sàng, mở PowerShell chạy `claude auth login`.
  - **Khóa API**: dán khóa `sk-ant-...`; bắt buộc khi cho khách dùng.
- Việc nhẹ (tarot một lá) dùng Haiku, bài luận dùng Sonnet.

## Giới hạn của bản 1.0

- Mặt lá bài tarot là hình minh họa tự vẽ, chưa phải tranh Rider–Waite.
- Chiêm tinh: 10 thiên thể chính, nhà Placidus, 5 góc chiếu chính; chưa có quá cảnh, tiểu hành tinh. Danh sách nơi sinh gồm 24 thành phố Việt Nam.
- Chưa lưu hồ sơ và lịch sử xem giữa các lần mở.
- Nội dung luận giải mang tính tham khảo.

## Mã nguồn và build lại

Mã nguồn ở `E:\CRAFTBYTE\menh-engine` (bộ máy trong `src`, ứng dụng trong `app`).

```powershell
cd E:\CRAFTBYTE\menh-engine
npm install
cd app
npm install
npm start          # chạy thử
npm run build:win  # tạo app\release\HuyenCoDo-<phiên bản>.exe
```
