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
  jupiter: 'Sao Mộc', saturn: 'Sao Thổ', uranus: 'Thiên Vương', neptune: 'Hải Vương', pluto: 'Diêm Vương', rahu: 'La Hầu', ketu: 'Kế Đô',
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

/* ---------------- Tên tiếng Việt do bộ máy trả về -> tên tệp ảnh ---------------- */
const KHOA_SAO: Record<string, string> = Object.fromEntries(Object.entries(TEN_SAO_VI).map(([k, v]) => [v, k]));
const KHOA_CAN: Record<string, string> = Object.fromEntries(Object.entries(TEN_CAN_VI).map(([k, v]) => [v, k]));
const KHOA_CHI: Record<string, string> = Object.fromEntries(Object.entries(TEN_CHI_VI).map(([k, v]) => [v, k]));
const KHOA_HANH_TINH: Record<string, string> = Object.fromEntries(Object.entries(TEN_HANH_TINH_VI).map(([k, v]) => [v, k]));
export const khoaSao = (ten: string) => KHOA_SAO[ten];
export const khoaCan = (ten: string) => KHOA_CAN[ten];
export const khoaChi = (ten: string) => KHOA_CHI[ten];
/** Các hàm *Vi nhận đúng chuỗi tiếng Việt từ engine ("Tử Vi", "Giáp", "Tý", "Sao Thủy"); không có ảnh thì trả chuỗi rỗng. */
export const saoIconVi = (ten: string, co = 30): string => (KHOA_SAO[ten] ? saoIcon(KHOA_SAO[ten], co) : '');
export const canIconVi = (ten: string, co = 28): string => (KHOA_CAN[ten] ? canIcon(KHOA_CAN[ten], co) : '');
export const chiIconVi = (ten: string, co = 28): string => (KHOA_CHI[ten] ? chiIcon(KHOA_CHI[ten], co) : '');
export const hanhTinhIconVi = (ten: string, co = 26): string => (KHOA_HANH_TINH[ten] ? hanhTinhIcon(KHOA_HANH_TINH[ten], co) : '');
const HANH_KHOA: Record<string, 'moc' | 'hoa' | 'tho' | 'kim' | 'thuy'> = { 'Mộc': 'moc', 'Hỏa': 'hoa', 'Thổ': 'tho', 'Kim': 'kim', 'Thủy': 'thuy' };
/** Đổi bảng ngũ hành của engine ({Mộc:2,...}) sang dạng cotNguHanh cần. */
export const demNguHanh = (b: Record<string, number>) => ({ moc: b['Mộc'] ?? 0, hoa: b['Hỏa'] ?? 0, tho: b['Thổ'] ?? 0, kim: b['Kim'] ?? 0, thuy: b['Thủy'] ?? 0 });
export { HANH_KHOA };

/* ---------------- Tam giác Tam Hợp (SVG) trên bản đồ 12 cung ---------------- */
/** Vị trí 12 chi trên địa bàn 4×4 — GIỐNG HỆT bảng O trong man-tuvi.ts (cột, hàng; hàng 0 ở phía xa). */
const O: Record<string, [number, number]> = { 'Tỵ': [0, 0], 'Ngọ': [1, 0], 'Mùi': [2, 0], 'Thân': [3, 0], 'Dậu': [3, 1], 'Tuất': [3, 2], 'Hợi': [3, 3], 'Tý': [2, 3], 'Sửu': [1, 3], 'Dần': [0, 3], 'Mão': [0, 2], 'Thìn': [0, 1] };
const CHI12 = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const tam = (chi: string): [number, number] => [(O[chi][0] + 0.5) * 25, (O[chi][1] + 0.5) * 25];
/** Tam hợp = chi cách nhau 4; xung chiếu = chi cách 6 (đúng quy tắc tam phương tứ chính, tính theo chi của cung được bấm). */
export function tamHopTheoChi(chi: string) {
  const i = CHI12.indexOf(chi);
  return { tamHop: [chi, CHI12[(i + 4) % 12], CHI12[(i + 8) % 12]], xung: CHI12[(i + 6) % 12] };
}
/** Bản đồ nhỏ 12 cung + tam giác vàng tam hợp + đường xanh xung chiếu. Đổi theo cung đang bấm.
 *  cung: [{ten:'Mệnh', chi:'Ngọ'}...]; chiChon: chi của cung đang chọn (hoặc null = chưa chọn). */
export function tamGiacTamHop(cung: { ten: string; chi: string }[], chiChon: string | null): string {
  const o = chiChon ? tamHopTheoChi(chiChon) : null;
  const diem = o ? o.tamHop.map((c) => tam(c).join(',')).join(' ') : '';
  const [x1, y1] = chiChon ? tam(chiChon) : [0, 0];
  const [x2, y2] = o ? tam(o.xung) : [0, 0];
  const o12 = cung.map((c) => {
    const [x, y] = tam(c.chi);
    const dang = c.chi === chiChon ? ' chon' : o?.tamHop.includes(c.chi) ? ' tam' : c.chi === o?.xung ? ' xung' : '';
    return `<div class="o-cung${dang}" style="left:${x}%;top:${y}%"><b>${esc(c.ten)}</b><small>${esc(c.chi)}</small></div>`;
  }).join('');
  return `<div class="mini-ban"><div class="lop-tam-hop">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">${o ? `<polygon points="${diem}" class="tam-giac"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="duong-xung"/>` : ''}</svg>
    ${o ? `${o.tamHop.map((c) => { const [x, y] = tam(c); return `<img class="dinh-vang" style="left:${x}%;top:${y}%" src="${DUONG}/tu-vi/tam-hop-vertex.png" alt="">`; }).join('')}<img class="dinh-xanh" style="left:${x2}%;top:${y2}%" src="${DUONG}/tu-vi/xung-chieu-vertex.png" alt="">` : ''}
  </div>${o12}</div>`;
}
