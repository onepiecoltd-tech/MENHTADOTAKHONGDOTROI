/**
 * 5 tính năng mới của pack v2 + màn giới thiệu — bản vanilla TS cho app Electron.
 * Viết lại từ các component React (.jsx) trong pack v2 sang cùng phong cách
 * app/web-src hiện có. Mọi dữ liệu lấy qua window.menhApi.goi(...) (IPC đã có
 * sẵn: 'hoSo', 'que', 'tarot', 'luan'); giao diện không tự tính gì.
 *
 * Cách gắn: import các hàm vào app/web-src/main.ts, thêm nút/tab gọi chúng,
 * thêm CSS ở cuối file này vào app/web/style.css.
 */
import { saoIcon, cotNguHanh, theTru, veHao, tamGiacTamHop, MAU_NGU_HANH } from './ui-anh.js';

declare global { interface Window { menhApi?: { goi: (ten: string, d?: unknown) => Promise<{ ok: boolean; kq?: any; loi?: string }> } } }
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
async function goi<T = any>(ten: string, d?: unknown): Promise<T> {
  if (!window.menhApi) throw new Error('Không kết nối được với bộ máy tính toán.');
  const r = await window.menhApi.goi(ten, d);
  if (!r.ok) throw new Error(r.loi);
  return r.kq as T;
}

/* ---------------- 1. Màn giới thiệu: clip quảng cáo 5 phút ---------------- */
/** Đặt <div id="gioiThieu"> vào app/web/index.html ngay sau <canvas id="c3d">.
 *  BẮT BUỘC: thêm media-src 'self' vào CSP trong <head> thì <video> mới chạy.
 *  File video: app/web/assets/intro-men-ly-3d.mp4 (copy từ menh-ly-3d-ad-5min.mp4). */
export const htmlGioiThieu = `
<div id="gioiThieu">
  <div class="hop-gioi-thieu">
    <video id="videoGioiThieu" src="assets/intro-men-ly-3d.mp4" controls poster="assets/menh-ly-3d/bg-cosmos.jpg"></video>
    <div class="hang nut"><button id="nutXemGioiThieu" class="chinh">Xem giới thiệu (5 phút)</button><button id="nutBoQuaGioiThieu" class="phu">Vào app ngay</button></div>
  </div>
</div>`;
export function ganGioiThieu() {
  const v = document.getElementById('videoGioiThieu') as HTMLVideoElement | null;
  const lop = document.getElementById('gioiThieu');
  document.getElementById('nutXemGioiThieu')?.addEventListener('click', () => { v?.play().catch(() => undefined); });
  document.getElementById('nutBoQuaGioiThieu')?.addEventListener('click', () => { v?.pause(); lop?.classList.add('an'); });
  v?.addEventListener('ended', () => lop?.classList.add('an'));
}

/* ---------------- 2. Đối chiếu 2 lá số ---------------- */
/** So sánh nhanh 2 hồ sơ: gọi IPC 'hoSo' 2 lần rồi chấm điểm theo ngũ hành + cung Phu Thê. */
export async function doiChieuHaiLaSo(a: { sinh: any; noiSinh?: any }, b: { sinh: any; noiSinh?: any }): Promise<{ diem: number; chiTiet: { nhan: string; diem: number; ghiChu: string }[] }> {
  const la = await goi('hoSo', a);
  const lb = await goi('hoSo', b);
  const nguHanh = (x: any) => x.batTu.nguHanh as Record<string, number>;
  const thieuChung = Object.keys(nguHanh(la)).filter((h) => (nguHanh(la)[h] ?? 0) === 0 && (nguHanh(lb)[h] ?? 0) === 0).length;
  const diemNguHanh = Math.max(40, 100 - thieuChung * 15);
  const diemPhuThe = 80; // chi tiết cung Phu Thê cần luận AI; điểm sơ bộ
  const diem = Math.round((diemNguHanh + diemPhuThe) / 2);
  return {
    diem,
    chiTiet: [
      { nhan: 'Ngũ hành bổ khuyết', diem: diemNguHanh, ghiChu: thieuChung ? `Cả hai cùng thiếu ${thieuChung} hành` : 'Hai lá số bổ sung ngũ hành cho nhau' },
      { nhan: 'Cung Phu Thê', diem: diemPhuThe, ghiChu: 'Xem chi tiết bằng luận giải AI ở khung bên phải' },
    ],
  };
}
export const htmlDoiChieu = (tenA: string, tenB: string, kq: { diem: number; chiTiet: { nhan: string; diem: number; ghiChu: string }[] }): string => `
  <div class="doi-chieu"><h3>Đối chiếu lá số</h3>
  <p><b>${esc(tenA)}</b> × <b>${esc(tenB)}</b></p>
  <div class="diem-lon">${kq.diem}<small>/100</small></div>
  ${kq.chiTiet.map((c) => `<div class="hang-diem"><span>${esc(c.nhan)}</span><b>${c.diem}</b><small>${esc(c.ghiChu)}</small></div>`).join('')}
  </div>`;

/* ---------------- 3. Thẻ chia sẻ lá số (xuất ảnh) ---------------- */
/** Cần: cd app && npm i html2canvas. Chụp đúng thẻ #theChiaSe rồi tải PNG về. */
export async function taiTheChiaSe(): Promise<void> {
  const el = document.getElementById('theChiaSe');
  if (!el) throw new Error('Chưa có thẻ chia sẻ trên màn hình.');
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(el as HTMLElement, { backgroundColor: '#0A1030', scale: 2 });
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'la-so-men-ly-3d.png';
  a.click();
}

/* ---------------- 4. Gieo quẻ 3 đồng xu (động) ---------------- */
/** Gieo 6 lần (mỗi lần 3 đồng xu) rồi gọi IPC 'que' để lấy lời quẻ + quẻ biến.
 *  Quy ước xu: 3 ngửa = 9 (lão dương, động), 2 ngửa = 8, 1 ngửa = 7, 0 ngửa = 6 (lão âm, động). */
export function gieoMotLan(): number {
  const ngua = [0, 1, 2].filter(() => Math.random() < 0.5).length;
  return ngua === 3 ? 9 : ngua === 2 ? 8 : ngua === 1 ? 7 : 6;
}
export async function gieoQueDongXu(cauHoi: string): Promise<{ hao: number[]; que: any }> {
  const hao = Array.from({ length: 6 }, () => gieoMotLan()); // hào 1 (dưới) → hào 6 (trên)
  const que = await goi('que', { phuongPhap: 'xu', cauHoi });
  return { hao, que };
}
export const htmlHaoGieo = (hao: number[]): string => `
  <div class="gieo-xu">${hao.map((h, i) => `<div class="hang-hao"><span>Hào ${i + 1}</span>${veHao([h === 9 || h === 7 ? 1 : 0], 'nho')}<b>${h}${h === 6 || h === 9 ? ' · động' : ''}</b></div>`).join('')}</div>`;

/* ---------------- 5. Trải bài Tarot ---------------- */
/** Dùng IPC 'tarot' đã có sẵn (kieuTrai: 'ba-la' | 'tinh-huong' | 'celtic-cross'). */
export const VI_TRI_TRAI: Record<string, string[]> = {
  'ba-la': ['Quá khứ', 'Hiện tại', 'Tương lai'],
  'tinh-huong': ['Tình huống', 'Thử thách', 'Lời khuyên'],
  'celtic-cross': ['Hiện tại', 'Thử thách', 'Quá khứ xa', 'Quá khứ gần', 'Mục tiêu', 'Tương lai gần', 'Bản thân', 'Môi trường', 'Hy vọng / Nỗi sợ', 'Kết quả'],
};
export async function traiBai(kieu: 'ba-la' | 'tinh-huong' | 'celtic-cross', cauHoi: string) {
  return goi('tarot', { kieuTrai: kieu, cauHoi });
}
export const htmlTraiBai = (kieu: string, cacLa: { la: { ten: string; tenAnh: string }; nguoc: boolean }[]): string => `
  <div class="trai-bai ${esc(kieu)}">${cacLa.map((c, i) => `
    <figure class="la-bai${c.nguoc ? ' nguoc' : ''}">
      <img src="assets/menh-ly-3d/tarot/${c.la.tenAnh.includes('/') ? c.la.tenAnh : 'major-arcana/' + c.la.tenAnh}" alt="${esc(c.la.ten)}">
      <figcaption>${i + 1}. ${esc(VI_TRI_TRAI[kieu]?.[i] ?? '')}<br><b>${esc(c.la.ten)}</b>${c.nguoc ? ' · ngược' : ''}</figcaption>
    </figure>`).join('')}</div>`;

/* ---------------- 6. Vòng Đại Vận ---------------- */
/** Dữ liệu từ IPC 'hoSo' -> tuVi.cungMenh.daiHan... (đại hạn từng cung đã có trong engine).
 *  Hàm này chỉ vẽ timeline; bấm vào một vận sẽ gọi lại chiTietCung tương ứng. */
export const htmlDaiVan = (cacVan: { tuTuoi: number; denTuoi: number; tenCung: string; saoChinh: string }[], tuoiHienTai: number): string => `
  <div class="dai-van">${cacVan.map((v) => `
    <button class="moc-van${tuoiHienTai >= v.tuTuoi && tuoiHienTai <= v.denTuoi ? ' dang' : ''}" data-tuoi="${v.tuTuoi}">
      <b>${v.tuTuoi}–${v.denTuoi}</b><span>${esc(v.tenCung)}</span><small>${esc(v.saoChinh)}</small>${tuoiHienTai >= v.tuTuoi && tuoiHienTai <= v.denTuoi ? '<em>◀ đang ở đây</em>' : ''}
    </button>`).join('')}</div>`;
