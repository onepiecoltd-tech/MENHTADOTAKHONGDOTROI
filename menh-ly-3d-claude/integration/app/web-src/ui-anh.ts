/**
 * Helper ảnh/icon cho Mệnh Lý 3D (bản vanilla TS cho app Electron).
 *
 * Viết lại từ các component React (.jsx) trong pack v2 sang cùng phong cách
 * với app/web-src hiện có: hàm trả về HTML string, CSS thêm vào style.css,
 * mọi chữ/số/màu do code render theo người xem (ảnh chỉ là khung/icon).
 *
 * Ảnh nằm ở app/web/assets/menh-ly-3d/ (copy từ pack v2).
 */
const DUONG = 'assets/menh-ly-3d';
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/* ---------------- Tên tiếng Việt + màu theo ngũ hành ---------------- */
export const TEN_SAO_VI: Record<string, string> = {
  'tu-vi': 'Tử Vi', 'thien-co': 'Thiên Cơ', 'thai-duong': 'Thái Dương', 'thai-am': 'Thái Âm',
  'vu-khuc': 'Vũ Khúc', 'thien-dong': 'Thiên Đồng', 'liem-trinh': 'Liêm Trinh', 'thien-phu': 'Thiên Phủ',
  'tham-lang': 'Tham Lang', 'cu-mon': 'Cự Môn', 'thien-tuong': 'Thiên Tướng', 'thien-luong': 'Thiên Lương',
  'that-sat': 'Thất Sát', 'pha-quan': 'Phá Quân',
};
export const NGU_HANH_SAO: Record<string, 'moc' | 'hoa' | 'tho' | 'kim' | 'thuy'> = {
  'tu-vi': 'tho', 'thien-co': 'moc', 'thai-duong': 'hoa', 'thai-am': 'thuy',
  'vu-khuc': 'kim', 'thien-dong': 'thuy', 'liem-trinh': 'hoa', 'thien-phu': 'tho',
  'tham-lang': 'thuy', 'cu-mon': 'kim', 'thien-tuong': 'thuy', 'thien-luong': 'moc',
  'that-sat': 'kim', 'pha-quan': 'thuy',
};
export const MAU_NGU_HANH: Record<string, string> = {
  moc: '#2E9E5B', hoa: '#E5484D', tho: '#E8B84B', kim: '#C0C8D8', thuy: '#4A90D9',
};
export const TEN_CAN_VI: Record<string, string> = {
  jia: 'Giáp', yi: 'Ất', bing: 'Bính', ding: 'Đinh', wu: 'Mậu', ji: 'Kỷ', geng: 'Canh', xin: 'Tân', ren: 'Nhâm', gui: 'Quý',
};
export const TEN_CHI_VI: Record<string, string> = {
  zi: 'Tý', chou: 'Sửu', yin: 'Dần', mao: 'Mão', chen: 'Thìn', si: 'Tỵ', wu: 'Ngọ', wei: 'Mùi', shen: 'Thân', you: 'Dậu', xu: 'Tuất', hai: 'Hợi',
};
export const TEN_HANH_TINH_VI: Record<string, string> = {
  sun: 'Mặt Trời', moon: 'Mặt Trăng', mercury: 'Sao Thủy', venus: 'Sao Kim', mars: 'Sao Hỏa',
  jupiter: 'Sao Mộc', saturn: 'Sao Thổ', uranus: 'Thiên Vương', neptune: 'Hải Vương', pluto: 'Diêm Vương',
};

/** Icon chính tinh Tử Vi (viền theo ngũ hành của sao). */
export const saoIcon = (khoa: string, co = 44): string =>
  `<img class="icon-tron" style="--co:${co}px;--vien:${MAU_NGU_HANH[NGU_HANH_SAO[khoa] ?? 'tho']}" src="${DUONG}/tu-vi/stars/${esc(khoa)}.png" alt="${esc(TEN_SAO_VI[khoa] ?? khoa)}" title="${esc(TEN_SAO_VI[khoa] ?? khoa)}">`;
/** Icon Thiên Can. */
export const canIcon = (khoa: string, co = 40): string =>
  `<img class="icon-tron" style="--co:${co}px" src="${DUONG}/can-chi/can/${esc(khoa)}.png" alt="${esc(TEN_CAN_VI[khoa] ?? khoa)}" title="${esc(TEN_CAN_VI[khoa] ?? khoa)}">`;
/** Icon Địa Chi. */
export const chiIcon = (khoa: string, co = 40): string =>
  `<img class="icon-tron" style="--co:${co}px" src="${DUONG}/can-chi/chi/${esc(khoa)}.png" alt="${esc(TEN_CHI_VI[khoa] ?? khoa)}" title="${esc(TEN_CHI_VI[khoa] ?? khoa)}">`;
/** Icon hành tinh Chiêm Tinh. */
export const hanhTinhIcon = (khoa: string, co = 40): string =>
  `<img class="icon-tron" style="--co:${co}px" src="${DUONG}/chiem-tinh/planets/${esc(khoa)}.png" alt="${esc(TEN_HANH_TINH_VI[khoa] ?? khoa)}" title="${esc(TEN_HANH_TINH_VI[khoa] ?? khoa)}">`;

/* ---------------- Cột Ngũ Hành (Bát Tự) — chiều cao theo số liệu thật ---------------- */
/** counts: { moc, hoa, tho, kim, thuy }. 0 => cột thấp + chữ "thiếu", hành nhiều nhất phát sáng. */
export function cotNguHanh(counts: { moc: number; hoa: number; tho: number; kim: number; thuy: number }): string {
  const ds: { khoa: keyof typeof counts; ten: string }[] = [
    { khoa: 'moc', ten: 'Mộc' }, { khoa: 'hoa', ten: 'Hỏa' }, { khoa: 'tho', ten: 'Thổ' },
    { khoa: 'kim', ten: 'Kim' }, { khoa: 'thuy', ten: 'Thủy' },
  ];
  const lonNhat = Math.max(...ds.map((d) => counts[d.khoa]));
  return `<div class="cot-ngu-hanh">${ds.map((d) => {
    const n = counts[d.khoa];
    const cao = n === 0 ? 10 : 28 + n * 42;
    return `<div class="cot-nh"><div class="cot" style="height:${cao}px;background:${MAU_NGU_HANH[d.khoa]};${n > 0 && n === lonNhat ? 'box-shadow:0 0 14px ' + MAU_NGU_HANH[d.khoa] : ''};${n === 0 ? 'outline:1px dashed ' + MAU_NGU_HANH[d.khoa] : ''}">${n}</div><span>${d.ten}</span>${n === 0 ? '<em>thiếu</em>' : ''}</div>`;
  }).join('')}</div>`;
}

/* ---------------- Thẻ Trụ (Bát Tự) — ảnh nền + 2 bảng chữ trống ---------------- */
/** tru: { anh: 'tru-nam'|'tru-thang'|'tru-ngay'|'tru-gio', thienCan, diaChi, thanCan, napAmCan, napAmChi, laNhatChu } */
export function theTru(tru: { anh: string; thienCan: string; diaChi: string; thanCan: string; napAmCan: string; napAmChi: string; laNhatChu?: boolean }): string {
  return `<div class="the-tru${tru.laNhatChu ? ' nhat-chu' : ''}" style="background-image:url(${DUONG}/${esc(tru.anh)}.png)">
    <div class="bang-tru tren"><b>${esc(tru.thienCan)}</b><span>${esc(tru.thanCan)}</span><small>${esc(tru.napAmCan)}</small></div>
    <div class="bang-tru duoi"><b>${esc(tru.diaChi)}</b><small>${esc(tru.napAmChi)}</small></div>
  </div>`;
}

/* ---------------- Hào Kinh Dịch vẽ bằng CSS ---------------- */
/** lines: mảng 6 số từ dưới lên (1 = dương liền, 0 = âm đứt). */
export function veHao(lines: number[], co: 'nho' | 'vua' | 'lon' = 'vua'): string {
  const hang = [...lines].reverse().map((l) => `<div class="hao ${l === 1 ? 'duong' : 'am'}">${l === 0 ? '<i></i><i></i>' : ''}</div>`).join('');
  return `<div class="que-hao ${co}">${hang}</div>`;
}

/* ---------------- Tam giác Tam Hợp (SVG) trên bảng Tử Vi ---------------- */
/** Vị trí tâm mỗi cung trên lưới 4×4 (%, khớp PALACE_POS trong pack v2). */
export const VI_TRI_CUNG: Record<string, [number, number]> = {
  'tat-ach': [12.5, 12.5], 'tai-bach': [37.5, 12.5], 'tu-tuc': [62.5, 12.5], 'phu-the': [87.5, 12.5],
  'thien-di': [12.5, 37.5], 'huynh-de': [87.5, 37.5],
  'no-boc': [12.5, 62.5], 'menh': [87.5, 62.5],
  'quan-loc': [12.5, 87.5], 'dien-trach': [37.5, 87.5], 'phuc-duc': [62.5, 87.5], 'phu-mau': [87.5, 87.5],
};
export const TAM_HOP: Record<string, { nhom: string; cuc: string; cung: string[] }> = {
  'menh': { nhom: 'Mệnh – Tài – Quan', cuc: 'Hỏa', cung: ['menh', 'tai-bach', 'quan-loc'] },
  'tai-bach': { nhom: 'Mệnh – Tài – Quan', cuc: 'Hỏa', cung: ['menh', 'tai-bach', 'quan-loc'] },
  'quan-loc': { nhom: 'Mệnh – Tài – Quan', cuc: 'Hỏa', cung: ['menh', 'tai-bach', 'quan-loc'] },
  'huynh-de': { nhom: 'Huynh – Tật – Điền', cuc: 'Kim', cung: ['huynh-de', 'tat-ach', 'dien-trach'] },
  'tat-ach': { nhom: 'Huynh – Tật – Điền', cuc: 'Kim', cung: ['huynh-de', 'tat-ach', 'dien-trach'] },
  'dien-trach': { nhom: 'Huynh – Tật – Điền', cuc: 'Kim', cung: ['huynh-de', 'tat-ach', 'dien-trach'] },
  'phu-the': { nhom: 'Phu – Di – Phúc', cuc: 'Thủy', cung: ['phu-the', 'thien-di', 'phuc-duc'] },
  'thien-di': { nhom: 'Phu – Di – Phúc', cuc: 'Thủy', cung: ['phu-the', 'thien-di', 'phuc-duc'] },
  'phuc-duc': { nhom: 'Phu – Di – Phúc', cuc: 'Thủy', cung: ['phu-the', 'thien-di', 'phuc-duc'] },
  'tu-tuc': { nhom: 'Tử – Nô – Phụ', cuc: 'Mộc', cung: ['tu-tuc', 'no-boc', 'phu-mau'] },
  'no-boc': { nhom: 'Tử – Nô – Phụ', cuc: 'Mộc', cung: ['tu-tuc', 'no-boc', 'phu-mau'] },
  'phu-mau': { nhom: 'Tử – Nô – Phụ', cuc: 'Mộc', cung: ['tu-tuc', 'no-boc', 'phu-mau'] },
};
export const XUNG_CHIEU: Record<string, string> = {
  'menh': 'thien-di', 'thien-di': 'menh', 'phu-mau': 'tat-ach', 'tat-ach': 'phu-mau',
  'phuc-duc': 'tai-bach', 'tai-bach': 'phuc-duc', 'dien-trach': 'tu-tuc', 'tu-tuc': 'dien-trach',
  'quan-loc': 'phu-the', 'phu-the': 'quan-loc', 'no-boc': 'huynh-de', 'huynh-de': 'no-boc',
};
/** Vẽ tam giác vàng tam hợp + đường xanh xung chiếu lên bảng Tử Vi (đặt trong container position:relative). */
export function tamGiacTamHop(cungDangChon: string): string {
  const t = TAM_HOP[cungDangChon];
  if (!t) return '';
  const diem = t.cung.map((c) => VI_TRI_CUNG[c].join(',')).join(' ');
  const xung = XUNG_CHIEU[cungDangChon];
  const [x1, y1] = VI_TRI_CUNG[cungDangChon];
  const [x2, y2] = VI_TRI_CUNG[xung];
  const dinhVang = t.cung.map((c) => { const [x, y] = VI_TRI_CUNG[c]; return `<img class="dinh-vang" style="left:${x}%;top:${y}%" src="${DUONG}/tu-vi/tam-hop-vertex.png" alt="">`; }).join('');
  return `<div class="lop-tam-hop">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <polygon points="${diem}" class="tam-giac"/>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="duong-xung"/>
    </svg>${dinhVang}
    <img class="dinh-xanh" style="left:${x2}%;top:${y2}%" src="${DUONG}/tu-vi/xung-chieu-vertex.png" alt="">
  </div>`;
}
