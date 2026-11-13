/**
 * Màn quản trị chi phí AI (bản vanilla TS cho app Electron).
 * Dữ liệu: IPC 'chiPhi' mới trong app/main.ts (xem PATCH-main-ts.md):
 *   goi('chiPhi', { kieu: 'tongHop', tuNgay, denNgay }) -> TongHop (từ src/ai/chi-phi.ts)
 *   goi('chiPhi', { kieu: 'gia' }) -> bảng ai_gia
 *   goi('chiPhi', { kieu: 'suaGia', nhaCungCap, model, giaVao, giaRa }) -> cập nhật giá
 */
declare global { interface Window { menhApi?: { goi: (ten: string, d?: unknown) => Promise<{ ok: boolean; kq?: any; loi?: string }> } } }
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
async function goi<T = any>(ten: string, d?: unknown): Promise<T> {
  if (!window.menhApi) throw new Error('Không kết nối được với bộ máy tính toán.');
  const r = await window.menhApi.goi(ten, d);
  if (!r.ok) throw new Error(r.loi);
  return r.kq as T;
}
const usd = (n: number) => `$${Number(n).toFixed(4)}`;

export async function veQuanTri(tuNgay?: string, denNgay?: string): Promise<string> {
  const th = await goi('chiPhi', { kieu: 'tongHop', tuNgay, denNgay });
  const gia = await goi<any[]>('chiPhi', { kieu: 'gia' });
  return `
  <div class="quan-tri"><h3>Quản trị chi phí AI</h3>
  <p>Tổng: <b>${th.tongLuot} lượt</b> · <b>${usd(th.tongChiPhiUSD)}</b></p>
  <h4>Lượt gần đây</h4>
  <table>${(th.ganDay ?? []).map((l: any) => `<tr><td>${esc(String(l.thoiGian).slice(0, 19).replace('T', ' '))}</td><td>${esc(l.nhaCungCap)}</td><td>${esc(l.model || '—')}</td><td>${esc(l.loaiLuan)}</td><td>${l.thanhCong ? usd(l.chiPhiUSD) : 'lỗi'}</td></tr>`).join('') || '<tr><td>Chưa có lượt nào.</td></tr>'}</table>
  <h4>Theo nhà cung cấp</h4>
  <table>${Object.entries(th.theoHang).map(([h, v]: any) => `<tr><td>${esc(h)}</td><td>${v.luot} lượt</td><td>${usd(v.chiPhiUSD)}</td></tr>`).join('')}</table>
  <h4>Theo loại luận</h4>
  <table>${Object.entries(th.theoLoai).map(([h, v]: any) => `<tr><td>${esc(h)}</td><td>${v.luot} lượt</td><td>${usd(v.chiPhiUSD)}</td></tr>`).join('')}</table>
  <h4>Theo ngày</h4>
  <table>${th.theoNgay.slice(0, 30).map((n: any) => `<tr><td>${esc(n.ngay)}</td><td>${n.luot} lượt</td><td>${usd(n.chiPhiUSD)}</td></tr>`).join('')}</table>
  <h4>Bảng giá (USD / 1M token) — bấm để sửa</h4>
  <table>${gia.map((g: any) => `<tr><td>${esc(g.nha_cung_cap)}</td><td>${esc(g.model)}</td>
    <td><input class="gia-vao" data-hang="${esc(g.nha_cung_cap)}" data-model="${esc(g.model)}" value="${g.gia_vao_1m}" size="6"></td>
    <td><input class="gia-ra" data-hang="${esc(g.nha_cung_cap)}" data-model="${esc(g.model)}" value="${g.gia_ra_1m}" size="6"></td></tr>`).join('')}</table>
  <button id="nutLuuGia" class="chinh">Lưu bảng giá</button></div>`;
}

/** Gắn sau khi veQuanTri() đã chèn HTML vào panel: lưu giá đã sửa. */
export function ganLuuGia() {
  document.getElementById('nutLuuGia')?.addEventListener('click', async () => {
    const hang: any[] = [];
    Array.from(document.querySelectorAll<HTMLInputElement>('.gia-vao')).forEach((el) => {
      const ra = Array.from(document.querySelectorAll<HTMLInputElement>('.gia-ra')).find((x) => x.dataset.model === el.dataset.model && x.dataset.hang === el.dataset.hang);
      hang.push({ nhaCungCap: el.dataset.hang, model: el.dataset.model, giaVao: Number(el.value), giaRa: Number(ra?.value ?? 0) });
    });
    await goi('chiPhi', { kieu: 'suaGia', ds: hang });
    const nut = document.getElementById('nutLuuGia'); if (nut) nut.textContent = 'Đã lưu ✓';
  });
}
