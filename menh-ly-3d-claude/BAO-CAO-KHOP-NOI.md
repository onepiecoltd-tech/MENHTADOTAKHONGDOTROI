# BÁO CÁO KHỚP NỐI — Mệnh Lý 3D: pack v2 + clip quảng cáo + source menh-engine
Ngày: 2026-11-11. Đọc từ file `menh-engine-nguon.zip` (68 file, 4.4MB).

## 1. Source thật sự là gì (quan trọng — khác với giả định ban đầu)

- **Không phải app React.** Đây là **Electron 44 + Three.js + TypeScript thuần**:
  - Bộ máy tính toán: `src/` (tuvi dùng `iztro`, batu, chiemtinh dùng `astronomy-engine`, kinhdich, tarot, lich âm lịch Việt, ai).
  - App desktop: `app/main.ts` (tiến trình chính, gọi bộ máy + AI qua IPC `window.menhApi.goi(...)`), `app/web-src/` (giao diện: `main.ts` + `man-tuvi.ts`, `man-batu.ts`, `man-chiemtinh.ts`, `man-kinhdich.ts`, `man-tarot.ts`, `nen.ts`, `ve.ts`), build bằng esbuild ra `app/web/` (`app.js`, `index.html`, `style.css`).
  - Giao diện không tự tính gì: mọi dữ liệu đi qua IPC (`hoSo`, `que`, `tarot`, `luan`, `kiemTra`, `docCauHinh`, `ghiCauHinh`).
- **AI hiện tại chỉ có Claude:** `src/ai/` có 2 chế độ — tài khoản Claude Code (`may-khach-taikhoan.ts`, chạy `claude -p`) và khóa API Anthropic (`@anthropic-ai/sdk`). Mọi hàm luận (`luanGiai`, `troChuyen`) đều nhận một `MayKhach` — interface tối thiểu giống Anthropic (`messages.create`). Đây là điểm cắm nhà cung cấp mới.
- **Giá + chọn model đã có sẵn:** `src/ai/dinh-tuyen.ts` (`MODEL` 3 bậc, `GIA` USD/1M token, `tinhChiPhi`, `dinhTuyen` theo loại luận). Mở rộng bảng này là đủ để tính chi phí cho nhà cung cấp mới.
- **Cài đặt hiện tại:** `app/main.ts` lưu `cau-hinh.json` trong thư mục userData của Electron (`{ ketNoi: 'taikhoan'|'api', khoaApi }`), dialog #caidat trong `app/web/index.html` chỉ có 2 lựa chọn.

## 2. Ảnh — khớp trực tiếp, chỉ cần copy (244 ảnh)

Copy toàn bộ `public/assets/menh-ly-3d/` trong pack v2 vào **`app/web/assets/menh-ly-3d/`** (thư mục web tĩnh của app). CSP trong `index.html` (`img-src 'self' data: blob:`) cho phép ảnh local, không cần sửa.

| Nhóm | Vị trí đích | Dùng ở đâu |
|---|---|---|
| Gốc 20 ảnh | `app/web/assets/menh-ly-3d/` | nền `bg-cosmos.jpg`, đĩa xoay 3D, panel chi tiết |
| Chiêm Tinh 32 | `.../chiem-tinh/` | icon hành tinh/cung trong `man-chiemtinh.ts` + danh sách bên trái |
| Kinh Dịch 75 | `.../kinh-dich/` | `trigrams/` + `hexagrams/` (64 quẻ) trong `man-kinhdich.ts` |
| Tarot 78 | `.../tarot/` | mặt bài trong `man-tarot.ts` (mặt sau `tarot-card.png`) |
| Tử Vi 17 | `.../tu-vi/` | tam hợp + `stars/` 14 chính tinh trong `man-tuvi.ts` |
| Can Chi 22 | `.../can-chi/` | icon Can/Chi trong `man-batu.ts` + vòng Đại Vận |

⚠️ **2 quẻ Kinh Dịch đã sửa trong pack v2** (42 Ích = hạ Chấn thượng Tốn [1,0,0,0,1,1]; 45 Tụy = hạ Khôn thượng Đoài [0,0,0,1,1,0]). Nếu source đã copy ảnh quẻ từ pack v1, **ghi đè 2 file `42-yi-2.png`, `45-cui.png` + `hexagrams.json` bằng bản v2**.

## 3. Component React (.jsx) — KHÔNG thả trực tiếp được, đã viết lại dạng vanilla TS

App dùng TS thuần + HTML string (xem `man-tuvi.ts`, `main.ts`), không có React. Toàn bộ 14 component đã được viết lại thành **`app/web-src/ui-anh.ts`** (helper ảnh/icon) và **`app/web-src/man-tinh-nang-moi.ts`** (5 tính năng mới), cùng một phong cách với code hiện có: hàm trả về HTML string, CSS thêm vào `style.css`, dữ liệu lấy qua `window.menhApi.goi(...)` (không tự tính).

| Component gốc (.jsx) | Bản vanilla TS | Gắn vào đâu |
|---|---|---|
| StarIcon / CanChiIcon / PlanetIcon | `ui-anh.ts`: `saoIcon()`, `canIcon()`, `chiIcon()`, `hanhTinhIcon()` | ô cung Tử Vi, Tứ Trụ, danh sách hành tinh |
| BatTuBars | `ui-anh.ts`: `cotNguHanh()` | panel Bát Tự (chiều cao theo số liệu thật) |
| TruCot | `ui-anh.ts`: `theTru()` | 4 trụ Bát Tự |
| HexagramLines | `ui-anh.ts`: `veHao()` | quẻ Kinh Dịch (vẽ hào bằng CSS) |
| TamHopTriangle | `ui-anh.ts`: `tamGiacTamHop()` | SVG overlay trên bảng Tử Vi (đỉnh đổi theo cung bấm) |
| MatchScore | `man-tinh-nang-moi.ts`: `manDoiChieu()` | tab/màn mới "Đối chiếu" (gọi `hoSo` 2 lần) |
| ShareCard | `man-tinh-nang-moi.ts`: `theChiaSe()` | nút Chia sẻ ở mỗi tab (html2canvas: `npm i html2canvas` trong `app/`) |
| CoinToss | `man-tinh-nang-moi.ts`: `manGieoXu()` | tab Kinh Dịch (gieo 6 lần rồi gọi IPC `que` để lấy lời quẻ) |
| TarotSpread | `man-tinh-nang-moi.ts`: `manTraiBai()` | tab Tarot (gọi IPC `tarot` với `ba-la`/`tinh-huong`/`celtic-cross`) |
| DaiVanTimeline | `man-tinh-nang-moi.ts`: `thanhDaiVan()` | dưới bảng Tử Vi (dữ liệu từ `lapTuVi().daiHan` qua IPC `hoSo`) |

Quy tắc giữ nguyên: ảnh chỉ là khung/icon; mọi chữ tiếng Việt, số liệu, màu sắc do code render theo người xem.

## 4. Clip quảng cáo 5 phút — làm clip giới thiệu (intro) của app

File: `menh-ly-3d-ad-5min.mp4` (30 cảnh × 10s, 1280×720, có voiceover tiếng Việt, đang ghép lần 2 vì lần 1 bị ngắt giữa chừng khi máy khởi động lại).
- Copy vào **`app/web/assets/intro-men-ly-3d.mp4`**.
- **Bắt buộc sửa CSP** trong `app/web/index.html`: thêm `media-src 'self'` (CSP hiện tại không có `media-src` nên `<video>` sẽ bị chặn).
- Thêm vào `index.html` ngay sau `<canvas id="c3d">`: overlay `#gioiThieu` với `<video src="assets/intro-men-ly-3d.mp4" controls poster="assets/menh-ly-3d/bg-cosmos.jpg">` + nút "Bỏ qua" (xem mẫu trong `man-tinh-nang-moi.ts`, hàm `manGioiThieu()`). Video chỉ phát khi người dùng bấm (trình duyệt chặn autoplay có tiếng).
- Clip lẻ S01–S30 nằm trong `menh-ly-3d-ad/clips/` để dùng lại làm teaser từng tab.

## 5. AI đa nhà cung cấp + bảng quản trị chi phí (nhiệm vụ 2)

Thiết kế trong **`src/ai/nha-cung-cap.ts`** (xem file kèm theo):

- **Một interface chung `MayKhach`** (đã có sẵn): mỗi nhà cung cấp là một adapter chuyển request dạng Anthropic → API riêng của hãng, rồi map usage về lại. Nhờ vậy `luanGiai()` và `troChuyen()` **không cần sửa**.
- **5 lựa chọn trong Cài đặt** (mở rộng dialog #caidat + `cau-hinh.json`):
  1. **Claude (Anthropic)** — đã có. Khóa `ANTHROPIC_API_KEY` / `sk-ant-...`.
  2. **ChatGPT (OpenAI)** — `OPENAI_API_KEY` / `sk-...`, model mặc định `gpt-5-mini` (nhẹ) / `gpt-5` (chính).
  3. **Gemini (Google AI)** — `GEMINI_API_KEY` / `AIza...`, model `gemini-2.5-flash`.
  4. **Grok (xAI)** — `XAI_API_KEY` / `xai-...`, model `grok-4`.
  5. **Meta (Llama API)** — `LLAMA_API_KEY`. **Lưu ý thật:** bản thân "Muse" không có hệ thống API key công khai như 4 hãng trên; đường API công khai của Meta là **Llama API** (`api.llama.com`). Trong giao diện ghi "Meta (Llama API)" cho đúng, không ghi "Muse API".
  6. Giữ nguyên chế độ **tài khoản Claude Code** (chỉ chủ dùng, không tốn key).
- **Tool-use (agent `troChuyen`) chỉ Claude hỗ trợ đầy đủ.** 4 hãng còn lại qua adapter sẽ báo rõ nếu gọi tool; trò chuyện 2 bước (`tro-chuyen-hai-buoc.ts`) vẫn dùng được với mọi hãng.
- **Giá:** bảng `GIA` mở rộng thêm model 5 hãng (giá tham khảo tháng 11/2026 trong file, **ghi rõ cần kiểm tra lại trên trang giá từng hãng**; admin sửa được trong bảng `ai_gia`).
- **Khóa lưu ở đâu:** khóa API lưu trong `cau-hinh.json` tại thư mục userData của Electron (như khóa Claude hiện tại), **không commit vào git**, không bao giờ gửi lên client web. Chỉ tiến trình chính (`app/main.ts`) được đọc khóa.

### Bảng quản trị SQL (`sql/quan-tri.sql`, Postgres — xem file kèm theo)
- `ai_gia` — bảng giá theo (nhà cung cấp, model), admin sửa được.
- `ai_luot_goi` — mỗi lượt luận giải ghi 1 dòng: thời gian, nhà cung cấp, model, loại luận, tên người xem, token vào/ra/cache, chi phí USD, thời gian chạy, thành công/lỗi.
- View sẵn: `v_chi_phi_ngay`, `v_chi_phi_nha_cung_cap`, `v_chi_phi_loai_luan`.
- Ghi log: hook trong `XU_LY.luan` ở `app/main.ts` (đã viết sẵn trong `src/ai/chi-phi.ts`): sau mỗi `luanGiai()` thì `ghiLuotGoi(...)`.
- Lưu trữ khi chạy app desktop: SQLite file trong userData qua `better-sqlite3` (`npm i better-sqlite3` trong `app/`); nếu chưa cài thì tự rơi về file JSONL (không crash). Khi triển khai server thì dùng Postgres với đúng schema trong `sql/quan-tri.sql`.
- Màn quản trị: `app/web-src/man-quan-tri.ts` (bảng tổng chi phí theo ngày / theo hãng / theo môn + sửa bảng giá), gọi IPC `chiPhi` mới trong `app/main.ts`.

## 6. Cách Claude Code áp dụng (cho Claude đang làm dở)

1. Copy thư mục `integration/` kèm theo vào gốc repo `menh-engine` (đè file trùng tên sau khi đối chiếu).
2. Copy ảnh pack v2 vào `app/web/assets/menh-ly-3d/` (mục 2).
3. Copy `menh-ly-3d-ad-5min.mp4` vào `app/web/assets/intro-men-ly-3d.mp4` + sửa CSP + thêm overlay intro (mục 4).
4. `npm install` ở gốc (thêm `pg` nếu dùng Postgres) và `cd app && npm install` (thêm `better-sqlite3`, `html2canvas`).
5. Paste **`PROMPT-CLAUDE-MASTER-V3.md`** vào Claude Code trong thư mục repo, làm theo checklist trong đó, chạy `npm test` + `npm run typecheck` trước khi báo xong.
