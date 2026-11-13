# PROMPT CHO CLAUDE CODE — Khớp pack v2 + clip intro + AI đa hãng + quản trị chi phí

> Dán toàn bộ prompt này vào Claude Code trong thư mục repo `menh-engine` (đã giải nén `menh-ly-3d-claude.zip` vào gốc repo). Đọc kỹ `BAO-CAO-KHOP-NOI.md` trong gói trước khi làm.

## Bối cảnh

Repo này là **Electron 44 + Three.js + TypeScript thuần** (không phải React):
- Bộ máy: `src/` (tính tử vi/bát tự/chiêm tinh/kinh dịch/tarot → JSON tiếng Việt).
- App: `app/main.ts` (IPC `window.menhApi.goi(...)`), `app/web-src/` (giao diện), build ra `app/web/`.
- AI hiện tại chỉ có Claude (tài khoản Claude Code hoặc khóa API Anthropic).

Gói kèm theo (`integration/`) chứa: báo cáo khớp nối, code nhà cung cấp AI mới, ghi chi phí, màn tính năng mới, màn quản trị, SQL, CSS, patch cho `app/main.ts`.

## Quy tắc bắt buộc (không được phá)

- Không đổi logic tính toán: tử vi kiểu Việt Nam, 5 lá số chuẩn trong `scripts/so-la-so.ts` phải khớp 100%; âm lịch VN múi +7; lời quẻ lấy từ `data/kinhdich/loi-que.json`.
- Ảnh chỉ là khung/icon; mọi chữ tiếng Việt, số liệu, màu sắc do code render theo người xem.
- Khóa API chỉ ở tiến trình chính (đọc từ `cau-hinh.json` trong userData), không commit, không gửi ra client web.
- Sau mỗi bước: `npm test` và `npm run typecheck` phải đạt hết mới báo xong.

## Việc 1 — Ảnh pack v2 (244 ảnh)

Copy `public/assets/menh-ly-3d/` từ pack `menh-ly-3d-full-v2-FINAL.zip` vào `app/web/assets/menh-ly-3d/`.
Ghi đè 2 file quẻ đã sửa trong v2: `kinh-dich/hexagrams/42-yi-2.png`, `kinh-dich/hexagrams/45-cui.png` + `hexagrams.json`
(42 Ích = hạ Chấn thượng Tốn [1,0,0,0,1,1]; 45 Tụy = hạ Khôn thượng Đoài [0,0,0,1,1,0]).

## Việc 2 — Component (bản vanilla TS, KHÔNG dùng JSX)

Copy:
- `integration/app/web-src/ui-anh.ts` → `app/web-src/ui-anh.ts`
- `integration/app/web-src/man-tinh-nang-moi.ts` → `app/web-src/man-tinh-nang-moi.ts`
- `integration/app/web-src/man-quan-tri.ts` → `app/web-src/man-quan-tri.ts`
- Nối nội dung `integration/app/web-src/style-them.css` vào cuối `app/web/style.css`.
- Trong `app/web-src/main.ts`: import và gắn các helper vào đúng màn (icon sao vào ô cung Tử Vi, `cotNguHanh` vào panel Bát Tự, `theTru` vào 4 trụ, `tamGiacTamHop` lên bảng Tử Vi, `htmlDaiVan` dưới bảng Tử Vi, `htmlTraiBai`/`htmlHaoGieo` vào tab Tarot/Kinh Dịch).
- `cd app && npm i html2canvas` (cho nút tải thẻ chia sẻ).

## Việc 3 — Clip giới thiệu 5 phút

- Copy `menh-ly-3d-ad-5min.mp4` → `app/web/assets/intro-men-ly-3d.mp4`.
- Thêm `media-src 'self'` vào CSP trong `app/web/index.html` (không có là `<video>` bị chặn).
- Thêm overlay `#gioiThieu` (HTML trong `man-tinh-nang-moi.ts` → `htmlGioiThieu`) ngay sau `<canvas id="c3d">`, gọi `ganGioiThieu()` trong `main.ts`.

## Việc 4 — AI đa nhà cung cấp (5 hãng + tài khoản)

- Copy `integration/src/ai/nha-cung-cap.ts` → `src/ai/nha-cung-cap.ts`, thêm export vào `src/ai/index.ts`.
- Áp dụng `integration/PATCH-main-ts.md` vào `app/main.ts` (mở rộng `CauHinh`, thay `moMayKhach`, hook ghi chi phí trong `XU_LY.luan`, thêm IPC `chiPhi` + `kiemTraHang`).
- Mở rộng dialog `#caidat` trong `app/web/index.html` + `app/web-src/main.ts`: select 6 lựa chọn — Tài khoản Claude Code / Claude (Anthropic) / ChatGPT (OpenAI) / Gemini (Google AI) / Grok (xAI) / Meta (Llama API) — và ô khóa riêng cho từng hãng (type=password, chỉ hiện hãng đang chọn).
- Lưu ý: "Muse" không có API key công khai; hãng Meta dùng **Llama API** (`api.llama.com`). Trong giao diện ghi đúng "Meta (Llama API)".
- Tool-use (agent) chỉ Claude hỗ trợ đầy đủ; các hãng khác báo rõ nếu gọi tool, trò chuyện 2 bước vẫn dùng được.
- Bảng giá trong `GIA_MOI` là giá tham khảo tháng 11/2026 — kiểm tra lại trên trang giá từng hãng trước khi dùng cho khách.

## Việc 5 — Bảng quản trị chi phí (SQL)

- Copy `integration/src/ai/chi-phi.ts` → `src/ai/chi-phi.ts`, thêm export vào `src/ai/index.ts`.
- Chạy `integration/sql/quan-tri.sql` lên Postgres của admin (`psql "$DATABASE_URL" -f sql/quan-tri.sql`) để tạo bảng `ai_gia`, `ai_luot_goi` + 3 view.
- Khi chạy app desktop chưa có server: chi phí tự ghi vào file `ai-luot-goi.jsonl` trong userData (không cần Postgres).
- Gắn màn quản trị (`man-quan-tri.ts` → `veQuanTri()`) vào một nút "Quản trị" ở header, chỉ hiện khi là admin.
- `npm i pg` ở gốc repo nếu dùng Postgres.

## Tự kiểm tra cuối (checklist — báo cáo đủ từng dòng)

- [ ] `npm test` đạt hết; `npm run typecheck` không lỗi.
- [ ] `cd app && npx tsc --noEmit -p . && npm run bundle` thành công.
- [ ] Mở app: 5 tab hiện ảnh mới (sao, Can/Chi, hành tinh, quẻ, bài Tarot); tam giác tam hợp đổi theo cung bấm; cột Ngũ Hành đổi theo người xem.
- [ ] Clip intro phát được từ overlay (có tiếng), nút "Vào app ngay" đóng overlay.
- [ ] Cài đặt: chọn được 6 lựa chọn AI, lưu khóa, nút Kiểm tra báo sẵn sàng.
- [ ] Gọi luận giải 1 lần bằng 1 hãng khác Claude → màn Quản trị hiện đúng 1 dòng, đúng model, chi phí > 0.
- [ ] Không còn file `.jsx` nào trong `app/`; không còn chữ tiếng Việt hard-code trong ảnh.
