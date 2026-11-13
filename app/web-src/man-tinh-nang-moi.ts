/**
 * Tính năng mới của pack v2 + màn giới thiệu — bản vanilla TS cho app Electron.
 * Mọi dữ liệu do bộ máy tính (qua IPC); các hàm ở đây chỉ dựng HTML từ dữ liệu đó.
 * Không tự gieo quẻ, không tự rút bài, không tự chấm điểm.
 */
import { veHao } from './ui-anh.js';
import { fileBai } from './anh-bai.js';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/* ---------------- 1. Màn giới thiệu: clip quảng cáo 5 phút ---------------- */
/** Đặt ngay sau <canvas id="c3d"> trong index.html (đã cấp media-src 'self' trong CSP). */
export const htmlGioiThieu = `
<div id="gioiThieu">
  <div class="hop-gioi-thieu">
    <video id="videoGioiThieu" src="assets/intro-men-ly-3d.mp4" controls preload="metadata" poster="assets/menh-ly-3d/bg-cosmos.jpg"></video>
    <div class="hang nut"><button id="nutXemGioiThieu" class="chinh">Xem giới thiệu (5 phút)</button><button id="nutBoQuaGioiThieu" class="phu">Vào app ngay</button></div>
  </div>
</div>`;
export function ganGioiThieu() {
  const v = document.getElementById('videoGioiThieu') as HTMLVideoElement | null;
  const lop = document.getElementById('gioiThieu');
  document.getElementById('nutXemGioiThieu')?.addEventListener('click', () => { void v?.play().catch(() => undefined); });
  document.getElementById('nutBoQuaGioiThieu')?.addEventListener('click', () => { v?.pause(); lop?.classList.add('an'); });
  v?.addEventListener('ended', () => lop?.classList.add('an'));
}

/* ---------------- 2. Thẻ chia sẻ (xuất ảnh PNG) ---------------- */
export const htmlTheChiaSe = (tieuDe: string, tenNguoi: string, dong: [string, string][]): string => `
  <div id="theChiaSe" class="the-chia-se"><div class="tc-dau">MỆNH LÝ 3D · CRAFTBYTE</div><h2>${esc(tieuDe)}</h2><p class="tc-ten">${esc(tenNguoi || 'Người xem')}</p>
  ${dong.map(([a, b]) => `<div class="tc-dong"><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join('')}</div>`;
/** Chụp thẻ #theChiaSe thành PNG và tải về. Cần html2canvas (đã có trong app/package.json). */
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

/* ---------------- 3. Hào Kinh Dịch lấy đúng từ kết quả bộ máy ---------------- */
/** que = kết quả IPC 'que' (.que): vẽ 6 hào theo quẻ chủ, đánh dấu hào động; có giaTriHao (gieo xu) thì ghi 6/7/8/9. */
export function htmlHaoQue(que: { queChu: { hao: number[]; so: number; ten: string }; haoDong: number[]; giaTriHao?: number[] }): string {
  const hang = [...que.queChu.hao.keys()].map((i) => {
    const dong = que.haoDong.includes(i + 1), gt = que.giaTriHao?.[i];
    return `<div class="hang-hao${dong ? ' dong' : ''}"><span>Hào ${i + 1}</span>${veHao([que.queChu.hao[i]], 'nho')}<b>${gt ?? ''}${dong ? ' · động' : ''}</b></div>`;
  }).reverse().join('');
  return `<div class="gieo-xu">${hang}</div>`;
}

/* ---------------- 4. Trải bài Tarot: ảnh lá bài thật theo bộ máy rút ---------------- */
export const htmlTraiBai = (kieu: string, cacLa: { viTri: string; la: { ten: string; tenAnh: string }; nguoc: boolean }[]): string => `
  <div class="trai-bai ${esc(kieu)}">${cacLa.map((c, i) => {
    const f = fileBai(c.la.tenAnh);
    return `<figure class="la-bai${c.nguoc ? ' nguoc' : ''}">
      ${f ? `<img src="assets/menh-ly-3d/tarot/${f}" alt="${esc(c.la.ten)}">` : ''}
      <figcaption>${i + 1}. ${esc(c.viTri)}<br><b>${esc(c.la.ten)}</b>${c.nguoc ? ' · ngược' : ''}</figcaption>
    </figure>`;
  }).join('')}</div>`;

/* ---------------- 5. Vòng Đại Vận (đại hạn Tử Vi, dữ liệu từ lá số) ---------------- */
export const htmlDaiVan = (cacVan: { tuTuoi: number; denTuoi: number; tenCung: string; saoChinh: string }[], tuoiHienTai: number): string => `
  <div class="dai-van">${cacVan.map((v) => {
    const dang = tuoiHienTai >= v.tuTuoi && tuoiHienTai <= v.denTuoi;
    return `<button class="moc-van${dang ? ' dang' : ''}" data-cung="${esc(v.tenCung)}">
      <b>${v.tuTuoi}–${v.denTuoi}</b><span>${esc(v.tenCung)}</span><small>${esc(v.saoChinh)}</small>${dang ? '<em>◀ hiện tại</em>' : ''}
    </button>`;
  }).join('')}</div>`;
