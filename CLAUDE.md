# MenhEngine — hướng dẫn cho Claude khi làm việc trong thư mục này

Dự án tính và luận giải tử vi Việt Nam, bát tự, Kinh Dịch, tarot. Chủ dự án không phải lập trình viên: trả lời bằng tiếng Việt, ngắn gọn, tự chạy lệnh thay vì bảo họ chạy.

## Khi được nhờ "xem", "luận", "gieo quẻ", "rút bài"

Không tự tính can chi, không tự an sao, không tự nghĩ ra quẻ hay lá bài. Luôn lấy dữ liệu từ bộ máy rồi mới luận:

| Yêu cầu | Lệnh lấy dữ liệu và quy tắc luận |
|---|---|
| Xem tử vi | `npm run -s luan -- tuvi 1990-05-15 14:30 nam "câu hỏi" --xem-prompt` |
| Xem bát tự | `npm run -s luan -- batu 1990-05-15 14:30 nam "câu hỏi" --xem-prompt` |
| Gieo quẻ Kinh Dịch | `npm run -s luan -- que xu "câu hỏi" --xem-prompt` (hoặc `maihoa`) |
| Rút bài tarot | `npm run -s luan -- tarot ba-la "câu hỏi" --xem-prompt` (`mot-la`, `tinh-huong`, `celtic-cross`) |
| Luận chéo cho một việc lớn | `npm run -s luan -- cheo 1990-05-15 14:30 nam "câu hỏi" --xem-prompt` |

Ngày sinh là dương lịch, giờ theo đồng hồ nơi sinh, giới tính `nam` hoặc `nu`. Thiếu ngày, giờ sinh hay giới tính thì hỏi lại trước khi chạy.

Lệnh in ra hai phần: `SYSTEM` là quy tắc luận giải, `USER` là dữ liệu đã tính. Đọc cả hai rồi tự viết bài luận đúng theo phần `SYSTEM`, chỉ dựa trên phần `USER`. Mỗi câu hỏi chỉ gieo quẻ hoặc rút bài một lần; không chạy lại để có kết quả đẹp hơn.

Cách này dùng chính phiên Claude đang mở nên không tốn thêm gì. Bỏ `--xem-prompt` thì chương trình tự gọi Claude qua tài khoản đã đăng nhập Claude Code và in bài luận (trừ vào hạn mức Agent SDK của gói).

## Lệnh khác

- `npm test`: toàn bộ kiểm thử, phải đạt hết trước khi báo xong việc.
- `npm run so-la-so`: so module tử vi với 5 lá số chuẩn. `npm run doi-chieu`: so với thư viện iztro.
- `npm run luan -- kiemtra`: kiểm tra đăng nhập Claude Code. `npm run luan -- chat 1990-05-15 14:30 nam`: trò chuyện.
- `npm run cli -- hoso 1990-05-15 14:30 nam`: dữ liệu JSON đầy đủ.

## Ứng dụng 3D (`app/`)

- Electron 44 + Three.js. `app/main.ts` là tiến trình chính (gọi bộ máy và AI), `app/web-src/` là giao diện 3D, `app/build.mjs` đóng gói bằng esbuild.
- Sửa xong: `cd app && npx tsc --noEmit -p . && npm run bundle`, rồi `npm start` để xem. Đóng gói exe: `npm run build:win` (ra `app/release/`).
- Giao diện không tự tính gì: mọi dữ liệu lấy qua `window.menhApi.goi(...)`.

## Quy ước không được đổi khi sửa code

- Tử vi theo kiểu Việt Nam; 5 lá số chuẩn trong `scripts/so-la-so.ts` phải khớp 100%. Bảng an sao chỉ sửa trong `src/tuvi/bang-nam-phai.ts`.
- Âm lịch Việt Nam múi giờ +7; bát tự đổi năm ở Lập Xuân, tử vi đổi năm ở Tết.
- Lời quẻ Kinh Dịch lấy từ `data/kinhdich/loi-que.json` (bản Ngô Tất Tố), không tự viết.
- Sản phẩm cho khách phải gọi bằng khóa API (`KET_NOI=api`). Đường tài khoản Claude chỉ dành cho chủ dự án tự dùng.

Chi tiết: `README.md`, `DOI-CHIEU-TU-VI.md`, `CAI-DAT.md`.
