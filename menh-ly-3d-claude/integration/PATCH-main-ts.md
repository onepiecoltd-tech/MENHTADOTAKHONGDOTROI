# PATCH cho app/main.ts — thêm đa nhà cung cấp + ghi chi phí + IPC quản trị

Áp dụng vào `app/main.ts` hiện có (chỉ sửa những chỗ dưới đây, không đổi logic tính toán).

## 1. Import thêm (đầu file)

```ts
import { taoMayKhach, TEN_NHA_CUNG_CAP, type NhaCungCap } from '../src/ai/nha-cung-cap.js';
import { ghiLuotGoi, luotGoiTuKetQua, tongHopLocal, datThuMucLocal } from '../src/ai/chi-phi.js';
```

## 2. Mở rộng CauHinh (thay interface cũ)

```ts
interface CauHinh {
  ketNoi: 'taikhoan' | 'api';
  nhaCungCap: NhaCungCap;          // 'claude' | 'openai' | 'gemini' | 'grok' | 'meta' | 'taikhoan'
  khoa: Record<string, string>;    // khóa theo hãng: { claude: 'sk-ant-...', openai: 'sk-...', ... }
  khoaApi: string;                 // giữ lại để tương thích cấu hình cũ (= khóa Claude)
}
const tepCauHinh = () => join(app.getPath('userData'), 'cau-hinh.json');
function docCauHinh(): CauHinh {
  try {
    const cu = JSON.parse(readFileSync(tepCauHinh(), 'utf8'));
    return { ketNoi: 'taikhoan', nhaCungCap: 'claude', khoa: {}, khoaApi: '', ...cu, khoa: { ...(cu.khoaApi ? { claude: cu.khoaApi } : {}), ...(cu.khoa ?? {}) } };
  } catch { return { ketNoi: 'taikhoan', nhaCungCap: 'claude', khoa: {}, khoaApi: '' }; }
}
```

## 3. Thay hàm moMayKhach() cũ bằng

```ts
function moMayKhach(): MayKhach {
  const c = docCauHinh();
  if (c.ketNoi === 'api') return taoMayKhach(c.nhaCungCap === 'taikhoan' ? 'claude' : c.nhaCungCap, c.khoa);
  const kt = kiemTraDangNhap();
  if (!kt.ok) throw new Error(kt.thongBao);
  return taoMayKhachTaiKhoan();
}
```

## 4. Ghi chi phí trong XU_LY.luan (thay handler cũ)

```ts
luan: async (d: { loai: LoaiLuan; duLieu: string[]; cauHoi?: string; hoSo?: string; hoiDap?: any[]; soLaBai?: number }) => {
  const batDau = Date.now();
  const c = docCauHinh();
  try {
    const kq = await luanGiai(moMayKhach(), { loai: d.loai, duLieu: d.duLieu, cauHoi: d.cauHoi, hoSo: d.hoSo, hoiDap: d.hoiDap, nguCanh: { soLaBai: d.soLaBai } });
    await ghiLuotGoi(luotGoiTuKetQua({ nhaCungCap: c.ketNoi === 'api' ? c.nhaCungCap : 'taikhoan', model: kq.model, loaiLuan: d.loai, tenNguoi: d.hoSo, suDung: kq.suDung, chiPhiUSD: kq.chiPhiUSD, thoiGianMs: Date.now() - batDau, thanhCong: true }));
    return { vanBan: kq.vanBan, model: kq.model, chiPhiUSD: kq.chiPhiUSD, ketNoi: c.ketNoi, nhaCungCap: c.ketNoi === 'api' ? TEN_NHA_CUNG_CAP[c.nhaCungCap] : 'Tài khoản Claude' };
  } catch (e) {
    await ghiLuotGoi(luotGoiTuKetQua({ nhaCungCap: c.ketNoi === 'api' ? c.nhaCungCap : 'taikhoan', model: '', loaiLuan: d.loai, tenNguoi: d.hoSo, suDung: {}, chiPhiUSD: 0, thoiGianMs: Date.now() - batDau, thanhCong: false, loi: (e as Error).message }));
    throw e;
  }
},
```

## 5. Thêm handler IPC 'chiPhi' vào XU_LY

```ts
chiPhi: (d: { kieu: 'tongHop' | 'gia' | 'suaGia'; tuNgay?: string; denNgay?: string; ds?: { nhaCungCap: string; model: string; giaVao: number; giaRa: number }[] }) => {
  if (d.kieu === 'tongHop') return tongHopLocal(d.tuNgay, d.denNgay);
  if (d.kieu === 'gia') return GIA_MAC_DINH; // xem mục 6
  if (d.kieu === 'suaGia') { ghiBangGia(d.ds ?? []); return { ok: true }; }
  throw new Error('Không có kiểu chiPhi ' + d.kieu);
},
```

## 6. Bảng giá đọc/ghi (đặt cuối file, trước taoCuaSo)

```ts
import { GIA_MOI } from '../src/ai/nha-cung-cap.js';
const tepGia = () => join(app.getPath('userData'), 'ai-gia.json');
const GIA_MAC_DINH = Object.entries(GIA_MOI).map(([model, g]) => ({ nha_cung_cap: model.startsWith('claude') ? 'claude' : model.startsWith('gpt') ? 'openai' : model.startsWith('gemini') ? 'gemini' : model.startsWith('grok') ? 'grok' : 'meta', model, gia_vao_1m: g.vao, gia_ra_1m: g.ra }));
function ghiBangGia(ds: { nhaCungCap: string; model: string; giaVao: number; giaRa: number }[]) {
  // Lưu đè bảng giá local; đồng thời UPDATE ai_gia nếu dùng Postgres (xem sql/quan-tri.sql).
  writeFileSync(tepGia(), JSON.stringify(ds, null, 2));
}
datThuMucLocal(app.getPath('userData')); // để chi-phi.ts ghi file ai-luot-goi.jsonl
```

## 7. Dialog Cài đặt (app/web/index.html + app/web-src/main.ts)

- Trong `#caidat`, thêm `<select id="nhaCungCap">` với 6 lựa chọn (Tài khoản Claude Code / Claude / ChatGPT / Gemini / Grok / Meta (Llama API)) và 5 ô khóa (`khoa-claude`, `khoa-openai`, `khoa-gemini`, `khoa-grok`, `khoa-meta`, type=password). Chỉ hiện ô khóa của hãng đang chọn.
- `nutLuu` lưu `{ ketNoi, nhaCungCap, khoa: {...} }` qua `ghiCauHinh` (mở rộng handler `ghiCauHinh` để nhận 2 trường mới).
- `nutKiemTra` gọi IPC mới `kiemTraHang` (thêm vào XU_LY: `(d) => kiemTraHang(d.nhaCungCap, docCauHinh().khoa)`).

## 8. CSP + intro video (app/web/index.html)

- Thêm `media-src 'self'` vào thẻ `<meta http-equiv="Content-Security-Policy">`.
- Thêm HTML overlay `#gioiThieu` (xem `man-tinh-nang-moi.ts` → `htmlGioiThieu`) ngay sau `<canvas id="c3d">`, gọi `ganGioiThieu()` trong `main.ts`.
- Copy `menh-ly-3d-ad-5min.mp4` → `app/web/assets/intro-men-ly-3d.mp4`.

## 9. Cài đặt thêm

```
npm i pg            (gốc menh-engine, chỉ khi dùng Postgres)
cd app && npm i better-sqlite3 html2canvas
```

## 10. Kiểm tra sau khi sửa

```
npm test && npm run typecheck
cd app && npx tsc --noEmit -p . && npm run bundle
```
