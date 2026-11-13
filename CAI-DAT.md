# Cài đặt trên Windows (làm một lần)

1. **Giải nén** `menh-engine.zip` vào `E:\CRAFTBYTE\` để có thư mục `E:\CRAFTBYTE\menh-engine`.
2. **Cài Node.js** bản LTS từ nodejs.org nếu máy chưa có. Kiểm tra: mở PowerShell, gõ `node -v`.
3. **Cài thư viện:** trong PowerShell

   ```powershell
   cd E:\CRAFTBYTE\menh-engine
   npm install
   npm test
   ```

   `npm test` phải báo `fail 0`.
4. **Kiểm tra đăng nhập Claude Code** (máy đã chạy JARVIS thì thường đã đăng nhập sẵn):

   ```powershell
   npm run luan -- kiemtra
   ```

   Nếu báo chưa sẵn sàng, chạy `claude auth login` rồi thử lại.

# Dùng hằng ngày

## Cách 1: gõ lệnh, chương trình tự gọi Claude bằng tài khoản của bạn

```powershell
npm run luan -- tuvi 1990-05-15 14:30 nam "Năm nay công việc thế nào?"
npm run luan -- batu 1990-05-15 14:30 nam
npm run luan -- que xu "Có nên đổi việc?"
npm run luan -- tarot ba-la "Chuyện tình cảm"
npm run luan -- cheo 1990-05-15 14:30 nam "Có nên đổi việc?"
npm run luan -- chat 1990-05-15 14:30 nam
```

Đây là cách JARVIS đang làm: chương trình gọi lệnh `claude -p` với tài khoản đã đăng nhập, không cần khóa API. Cuối mỗi bài có dòng ghi model và chi phí ước tính.

Lưu ý: nếu máy có đặt biến `ANTHROPIC_API_KEY`, chương trình sẽ chuyển sang gọi API tính tiền. Muốn ép dùng tài khoản: `$env:KET_NOI="taikhoan"`.

## Cách 2: mở thư mục này trong Claude rồi nói bằng lời

Mở Claude Code tại `E:\CRAFTBYTE\menh-engine` (hoặc thêm thư mục này vào phiên Claude trên máy tính), rồi gõ ví dụ:

> Xem tử vi cho nam sinh 15/5/1990 lúc 14:30, hỏi về công việc năm nay.

Claude đọc tệp `CLAUDE.md`, tự chạy bộ máy lấy lá số và viết bài luận. Cách này dùng luôn phiên đang mở.

## Muốn nối vào JARVIS

Cho JARVIS chạy lệnh và lấy kết quả in ra, ví dụ:

```
npm run -s luan -- que xu "câu hỏi của người dùng"
```

hoặc gọi thẳng trong code TypeScript:

```ts
import { luanGiai, taoMayKhachTaiKhoan, rutGonTuVi } from './src/ai/index.js';
import { lapTuVi } from './src/index.js';
const kq = await luanGiai(taoMayKhachTaiKhoan(), { loai: 'tu-vi', duLieu: [rutGonTuVi(lapTuVi(sinh))], cauHoi });
```

# Giới hạn cần nhớ

- Đường tài khoản chỉ dành cho bạn tự dùng. Mở dịch vụ cho khách thì đặt `KET_NOI=api` và `ANTHROPIC_API_KEY`; Anthropic không cho phép dùng đăng nhập gói Pro để phục vụ người dùng của một sản phẩm.
- Lượng dùng qua `claude -p` trừ vào hạn mức Agent SDK hằng tháng của gói, tách khỏi usage trò chuyện.
