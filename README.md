# menh-engine — bộ máy dữ liệu mệnh lý và AI luận giải

Tính toán bát tự, tử vi, Kinh Dịch, tarot bằng code và trả về JSON tiếng Việt.
AI chỉ nhận JSON này để luận giải, không tự tính lịch hay an sao.

## Ứng dụng desktop 3D

Thư mục `app` là ứng dụng Electron + Three.js "Huyền Cơ Đồ" (tử vi, bát tự, chiêm tinh, Kinh Dịch, tarot, khung luận giải AI), đóng gói thành `MenhLy3D-1.0.0.exe`. Xem `app/HUONG-DAN.md`.
Tiến trình chính (`app/main.ts`) gọi thẳng bộ máy trong `src`; giao diện (`app/web-src`) chỉ vẽ và gọi qua IPC.

## Chạy thử

```bash
npm install
npm test
npm run cli -- hoso 1990-05-15 14:30 nam     # bát tự + tử vi
npm run cli -- que maihoa "Có nên đổi việc?"
npm run cli -- que xu "Có nên đổi việc?"
npm run cli -- tarot ba-la "Chuyện tình cảm"
```

Dùng trong code:

```ts
import { lapBatTu, lapTuVi, gieoQueDongXu, gieoQueMaiHoa, rutBai } from './src/index.js';
const sinh = { nam: 1990, thang: 5, ngay: 15, gio: 14, phut: 30, gioiTinh: 'nam' as const };
const batTu = lapBatTu(sinh);
const tuVi = lapTuVi(sinh);
```

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `src/lich` | Can chi, nạp âm, thập thần, âm lịch Việt Nam (+7), chuẩn hóa múi giờ |
| `src/batu` | Tứ trụ, tàng can, ngũ hành, đại vận |
| `src/tuvi` | Lá số tử vi **kiểu Việt Nam** tự an sao (`an-sao.ts`, bảng trong `bang-nam-phai.ts`); `iztro.ts` chỉ dùng để đối chiếu |
| `data/kinhdich/loi-que.json` | Lời quẻ, Thoán, Đại Tượng, lời 6 hào, Tiểu Tượng của 64 quẻ (phiên âm + dịch nghĩa, bản Ngô Tất Tố) |
| `scripts` | `npm run doi-chieu` so với iztro, `npm run so-la-so` so với lá số tham chiếu, `npm run loi-que` kiểm tệp lời quẻ, `tach-kinh-dich.py` tách kinh văn từ sách |
| `src/kinhdich` | 64 quẻ, gieo 3 đồng xu, Mai Hoa theo thời gian, quẻ hỗ, quẻ biến |
| `src/tarot` | 78 lá, 4 kiểu trải, có lá ngược |
| `src/chiemtinh` | Chiêm tinh phương Tây: 10 thiên thể (thư viện astronomy-engine), cung Mọc, Thiên Đỉnh, nhà Placidus, góc chiếu |
| `app` | Ứng dụng desktop 3D và cấu hình đóng gói exe |
| `tests` | Đối chiếu với các mốc lịch đã biết |

## Các quy ước đã chọn (ảnh hưởng độ chuẩn)

1. **Múi giờ.** Đầu vào là giờ đồng hồ nơi sinh, mặc định +7. Trụ năm/tháng và đại vận so với thời điểm giao tiết tuyệt đối; trụ ngày/giờ theo giờ địa phương. Người sinh ở miền Nam từ 1960 đến 13/6/1975 dùng giờ +8: truyền `muiGio: 8`.
2. **Âm lịch Việt Nam.** Tính theo +7 (thuật toán Hồ Ngọc Đức), kể cả khi lệch với lịch Trung Quốc (vd Tết 1985 lệch một tháng). Tử vi luôn an theo lịch Việt.
3. **Ranh năm.** Bát tự đổi năm ở Lập Xuân; tử vi đổi năm ở mùng 1 Tết.
4. **Giờ Tý muộn (23h).** Mặc định tính sang ngày hôm sau; đổi bằng `tyMuon: 'trongNgay'`.
5. **Giờ mặt trời thực.** Mặc định tắt; bật bằng `dungGioMatTroiThuc: true` kèm `kinhDo`.

## Phần AI luận giải (`src/ai`)

Code tính dữ liệu, AI chỉ luận. Mỗi yêu cầu gồm: system prompt chung + hướng dẫn theo môn + dữ liệu đã rút gọn + câu hỏi.

Có hai đường kết nối, cùng prompt và dữ liệu:

| Đường | Khi nào | Cách bật |
|---|---|---|
| Tài khoản Claude (qua `claude -p`, như JARVIS) | Chủ dự án tự dùng, thử nghiệm | Mặc định khi không có `ANTHROPIC_API_KEY`; cần `claude auth login` |
| Khóa API | Phục vụ khách | `KET_NOI=api` và `ANTHROPIC_API_KEY` |

```bash
npm run luan -- kiemtra                                        # kiểm tra đăng nhập Claude Code
npm run luan -- tuvi  1990-05-15 14:30 nam "Năm nay công việc thế nào?"
npm run luan -- batu  1990-05-15 14:30 nam
npm run luan -- que   xu "Có nên đổi việc?"
npm run luan -- tarot ba-la "Chuyện tình cảm"
npm run luan -- cheo  1990-05-15 14:30 nam "Có nên đổi việc?"   # tử vi + bát tự + quẻ
npm run luan -- ngay  1990-05-15 14:30 nam                      # tử vi ngày
npm run luan -- chat  1990-05-15 14:30 nam                      # trò chuyện, tự chọn công cụ
```

Cài đặt và cách dùng trên Windows: xem `CAI-DAT.md`.

Thêm `--xem-prompt` để in đúng prompt sẽ gửi mà không gọi API (không tốn tiền, không cần khóa).

| Tệp | Việc |
|---|---|
| `rut-gon.ts` | Đổi lá số, quẻ, trải bài thành văn bản ngắn; tự tính đại hạn, tiểu hạn, đại vận đang hành theo ngày xem |
| `prompts.ts` | System prompt chung (nguyên tắc dữ liệu, giới hạn nội dung, cách viết) và hướng dẫn từng môn |
| `dinh-tuyen.ts` | Chọn model theo loại yêu cầu, bảng giá, tính chi phí từ `usage` |
| `luan-giai.ts` | Một lượt luận giải, có 2 điểm prompt caching (hướng dẫn; lá số của người xem) |
| `agent.ts` | Trò chuyện qua API (tool-use): model gọi `xem_tu_vi`, `xem_bat_tu`, `gieo_que`, `rut_bai` |
| `may-khach-taikhoan.ts` | Gọi Claude bằng tài khoản đã đăng nhập Claude Code (`claude -p`), tắt mọi công cụ và cấu hình |
| `tro-chuyen-hai-buoc.ts` | Trò chuyện chạy được trên cả hai đường: model nhẹ chọn công cụ, hệ thống chạy, model chính luận |

Định tuyến mặc định (đổi bằng biến môi trường `MODEL_NHE`, `MODEL_CHINH`, `MODEL_SAU`):

| Yêu cầu | Model |
|---|---|
| Tử vi ngày, tarot 1 lá | Haiku 5.5 |
| Luận tử vi, bát tự, quẻ Dịch, tarot nhiều lá, trò chuyện | Sonnet 5.5 |
| Luận chéo nhiều môn | `MODEL_SAU` (mặc định Sonnet 5.5; đặt `claude-opus-5-5` cho gói chuyên sâu) |

Kích thước đầu vào đo được (ký tự; số token thật xem ở `usage` khi chạy): tử vi khoảng 5.200, bát tự 3.300, quẻ Dịch 3.200–3.900, tarot 3 lá 2.400, luận chéo 7.800.

Mức đã kiểm: toàn bộ luồng chạy với máy khách giả và lệnh `claude` giả trong test; bộ tham số dòng lệnh đã thử với Claude Code thật (bản 2.1.322) và được chấp nhận, nhưng chưa có lượt nào đăng nhập để sinh bài luận thật. Với đường API, lần chạy thật đầu tiên cần xem `cache_creation_input_tokens` có khác 0 không; nếu bằng 0 nghĩa là prompt ngắn hơn ngưỡng tối thiểu để cache của model đó.

## Việc còn mở

- **Đối chiếu tử vi kiểu Việt Nam.** Xem `DOI-CHIEU-TU-VI.md`: phần nào đã kiểm bằng máy, phần nào cần kiểm tay.
- **Lời quẻ Kinh Dịch.** Đã tách từ ebook bản Ngô Tất Tố: đủ 64 lời quẻ, 64 Thoán, 64 Đại Tượng, 384 lời hào, 379/384 Tiểu Tượng. Chỉ lấy kinh văn (dịch âm, dịch nghĩa), chưa lấy phần giảng của Trình Di, Chu Hy. Ebook có nhiều lỗi đánh máy và chúng còn nguyên trong dữ liệu; nên rà lại với sách in. Tách lại: `pdftotext sach.pdf sach.txt && python3 -I scripts/tach-kinh-dich.py sach.txt data/kinhdich/loi-que.json`.
- **Chất lượng bài luận.** Prompt chưa được chấm trên bài luận thật; cần chạy 10–20 ca rồi chỉnh.
- **Lưu hồ sơ và lịch sử xem** (database), giới hạn lượt dùng theo người: chưa làm.
- **Lục hào** (nạp giáp, lục thân, dụng thần), sao lưu niên tử vi, thần sát bát tự: chưa làm.

## Ghi công

- Bộ 51 cách cục tử vi (`data/tuvi/cach-cuc.json`) lấy từ TuViMCP của Manh Ha Nguyen (github.com/nmhaaa3218/TuViMCP), giấy phép Apache-2.0 (xem `data/tuvi/LICENSE-TuViMCP.txt`, `NOTICE-TuViMCP.txt`). Bộ đánh giá điều kiện viết lại bằng TypeScript.
- Phần bát tự (vượng suy, cách cục, dụng thần, thần sát) và phong thủy viết lại theo quy tắc cổ pháp; các ứng dụng tham chiếu chỉ dùng để đối chiếu kết quả, không sao chép mã.
