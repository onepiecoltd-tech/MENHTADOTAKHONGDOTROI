import { KhungCanh } from './nen.js';
import { manTuVi } from './man-tuvi.js';
import { manBatTu } from './man-batu.js';
import { manChiemTinh } from './man-chiemtinh.js';
import { manPhongThuy } from './man-phongthuy.js';
import type { KetQuaPhongThuy } from '../../src/phongthuy/index.js';
import { manKinhDich } from './man-kinhdich.js';
import { manTarot } from './man-tarot.js';
import type { ManHinh } from './ve.js';
import { saoIconVi, canIconVi, chiIconVi, hanhTinhIconVi, cotNguHanh, demNguHanh, theTru, tamGiacTamHop } from './ui-anh.js';
import { ganGioiThieu, htmlDaiVan, htmlHaoQue, htmlTraiBai, htmlTheChiaSe, taiTheChiaSe } from './man-tinh-nang-moi.js';
import { veQuanTri, ganLuuGia } from './man-quan-tri.js';
import { phanTichNhanh, dinhDangNgay, PhuDe } from './live.js';
import hexagrams from '../web/assets/menh-ly-3d/kinh-dich/hexagrams.json';
import * as THREE from 'three';
import type { LaSoTuVi } from '../../src/tuvi/index.js';
import type { CungTuVi } from '../../src/tuvi/an-sao.js';
import type { LaSoBatTu, Tru } from '../../src/batu/index.js';
import { danhGiaVan, canChiNamDuong } from '../../src/batu/phan-tich.js';
import type { LaSoChiemTinh, ViTri, NoiSinh } from '../../src/chiemtinh/index.js';
import type { KetQuaTarot } from '../../src/tarot/index.js';
import type { LaSoVeDa } from '../../src/chiemtinh/veda.js';

type Tab = 'tuvi' | 'batu' | 'chiemtinh' | 'phongthuy' | 'kinhdich' | 'tarot';
const LOAI: Record<Tab, string> = { tuvi: 'tu-vi', batu: 'bat-tu', chiemtinh: 'chiem-tinh', phongthuy: 'phong-thuy', kinhdich: 'kinh-dich', tarot: 'tarot' };
const TEN_MON: Record<Tab, string> = { tuvi: 'Tử vi', batu: 'Bát tự', chiemtinh: 'Chiêm tinh Vệ Đà', phongthuy: 'Phong thủy', kinhdich: 'Kinh Dịch', tarot: 'Tarot' };
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

declare global { interface Window { menhApi?: { goi: (ten: string, d?: unknown) => Promise<{ ok: boolean; kq?: any; loi?: string }> }; __thu: (b: string) => Promise<void> } }
async function goi<T = any>(ten: string, d?: unknown): Promise<T> {
  if (!window.menhApi) throw new Error('Không kết nối được với bộ máy tính toán.');
  const r = await window.menhApi.goi(ten, d);
  if (!r.ok) throw new Error(r.loi);
  return r.kq as T;
}

const canh = new KhungCanh($<HTMLCanvasElement>('c3d'));
let tab: Tab = 'tuvi';
const st: {
  hoSo?: { tuVi: LaSoTuVi; batTu: LaSoBatTu; chiemTinh: LaSoChiemTinh; veDa: LaSoVeDa; rutGon: Record<string, string> };
  que?: { que: any; rutGon: string };
  pt?: { pt: KetQuaPhongThuy; rutGon: string };
  tarot?: { tarot: KetQuaTarot; rutGon: string };
  hoiDap: Record<string, { cauDau?: string; luot: { vai: 'user' | 'assistant'; noiDung: string }[] }>;
  dangGoi: boolean;
} = { hoiDap: {}, dangGoi: false };

/* ---------- Màn hình chờ: khung rỗng; phần hiển thị (astrolabe + nút) là lớp HTML #tamCho ---------- */
function manCho(): ManHinh {
  return { nhom: new THREE.Group(), chon: [], mayQuay: { viTri: [0, 6, 13], nhin: [0, 0.8, 0] } };
}
const NUT_CHO: Record<Tab, [string, () => void]> = {
  tuvi: ['Lập lá số', () => void lapLaSo()], batu: ['Lập lá số', () => void lapLaSo()], chiemtinh: ['Lập lá số', () => void lapLaSo()], phongthuy: ['Xem phong thủy', () => void xemPhongThuy()],
  kinhdich: ['Gieo quẻ', () => void gieoQue('xu')], tarot: ['Rút ba lá', () => void rutBai('ba-la')],
};

/* ---------- Khung Chi tiết ---------- */
const chiTiet = (tieuDe: string, html: string) => { $('chitiet').dataset.tab = tab; $('tieuDeChiTiet').textContent = tieuDe; $('chitiet').innerHTML = html; $('chitiet').scrollTop = 0; };
const dsSao = (ds: { ten: string }[]) => ds.map((s) => esc(s.ten)).join(', ') || '—';

const ANH_MENH = 'assets/menh-ly-3d';
// Ảnh icon thiếu (ví dụ Cô thần, Quả tú chưa có hình) thì bỏ đi, không hiện khung vỡ.
document.addEventListener('error', (e) => { const t = e.target as HTMLElement; if (t instanceof HTMLImageElement && /\b(ico|banner-cc|banner-pt)\b/.test(t.className)) t.remove(); }, true);
const bo = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ico = (duong: string, co: number, ten: string) => `<img class="ico" style="--co:${co}px" src="${ANH_MENH}/${duong}.png" alt="${esc(ten)}" title="${esc(ten)}">`;
const QUAI_ANH: Record<string, string> = { 'Càn': 'qian', 'Khảm': 'kan', 'Cấn': 'gen', 'Chấn': 'zhen', 'Tốn': 'xun', 'Ly': 'li', 'Khôn': 'kun', 'Đoài': 'dui' };
const icoQuai = (ten: string, co = 26) => QUAI_ANH[ten] ? ico(`phong-thuy/bat-quai/${QUAI_ANH[ten]}`, co, ten) : '';
const icoSao = (n: number, co = 22) => ico(`phong-thuy/sao/${n}`, co, `Sao ${n}`);
const LOAI_CC = (loai: string) => (/hung/i.test(loai) ? 'xau' : /đặc biệt/i.test(loai) ? 'db' : 'tot');
function htmlCachCuc(l: LaSoTuVi) {
  const ds = l.cachCuc ?? [];
  return `<img class="banner-cc" src="${ANH_MENH}/tu-vi/cach-cuc-banner.jpg" alt=""><h4>Cách cục (${ds.length}/51)</h4>${ds.length ? ds.map((c) => `<details class="cc cc-${LOAI_CC(c.loai)}"><summary>${ico(`tu-vi/cach-cuc/${LOAI_CC(c.loai) === 'xau' ? 'hung' : LOAI_CC(c.loai) === 'db' ? 'dac-biet' : 'cat'}`, 26, c.loai)}<b>${esc(c.ten)}</b> <span class="nhan">${esc(c.loai)}</span></summary><p>${esc(c.moTa)}</p><p class="mo">${esc(c.lyDo)}</p>${c.uuKhuyetDiem ? `<p class="mo">${esc(c.uuKhuyetDiem)}</p>` : ''}</details>`).join('') : '<p class="mo">Không có cách cục nào trong bộ 51 thỏa điều kiện.</p>'}<p class="mo">Bộ điều kiện lấy từ TuViMCP (Apache-2.0, Manh Ha Nguyen).</p>`;
}
function chiTietCung(c: CungTuVi | null, lienQuan: CungTuVi[]) {
  const l = st.hoSo!.tuVi;
  const mini = tamGiacTamHop(l.cung, c?.chi ?? null);
  if (!c) {
    chiTiet('Lá số tử vi', `${mini}<p><b>${esc(l.amDuong)}</b>, ${esc(l.thuanNghich.toLowerCase())}</p><p>Sinh ${esc(l.gioSinh)}, ngày ${l.amLich.ngay} tháng ${l.amLich.thang}${l.amLich.nhuan ? ' nhuận' : ''} năm ${esc(l.amLich.canChiNam)} (âm lịch)</p>
      <p>Bản mệnh <b>${esc(l.banMenh)}</b> · <b>${esc(l.cuc)}</b></p><p>Mệnh tại <b>${esc(l.cungMenhTai)}</b>, Thân cư <b>${esc(l.thanCu)}</b></p><p>Mệnh chủ ${esc(l.menhChu)} · Thân chủ ${esc(l.thanChu)}</p>
      ${htmlCachCuc(l)}${l.ghiChu.map((g) => `<p class="mo">${esc(g)}</p>`).join('')}<p class="mo">Bấm vào một cung để xem sao và tam phương tứ chính.</p>`);
    return;
  }
  const chinh = c.chinhTinh.map((s) => `${saoIconVi(s.ten, 30)}<b>${esc(s.ten)}</b> (${esc(s.doSang)}${s.tuHoa ? ', ' + esc(s.tuHoa) : ''})`).join('<br>') || 'Vô chính diệu';
  chiTiet(`Cung ${c.ten}`, `${mini}<p>${esc(c.can)} ${esc(c.chi)}${c.laCungThan ? ' · <b>Thân cư</b>' : ''}${c.tuan ? ' · <b>Tuần</b>' : ''}${c.triet ? ' · <b>Triệt</b>' : ''}</p>
    <h4>Chính tinh</h4><p>${chinh}</p>
    <h4>Cát tinh</h4><p>${dsSao(c.phuTinh.filter((s) => s.nhom === 'cát tinh'))}</p>
    <h4>Sát tinh</h4><p>${dsSao(c.phuTinh.filter((s) => s.nhom === 'sát tinh'))}</p>
    <h4>Sao khác</h4><p>${dsSao(c.phuTinh.filter((s) => s.nhom === 'phụ tinh'))}</p>
    <h4>Vòng sao và hạn</h4><p>${esc(c.vongThaiTue)} · ${esc(c.vongLocTon)} · ${esc(c.vongTrangSinh)}</p><p>Đại hạn ${c.daiHan[0]}–${c.daiHan[1]} tuổi · Tiểu hạn năm ${esc(c.tieuHan)}</p>
    <h4>Tam phương tứ chính</h4>${lienQuan.map((x) => `<p><b>${esc(x.ten)}</b> (${esc(x.chi)}): ${x.chinhTinh.map((s) => saoIconVi(s.ten, 20) + esc(s.ten)).join(', ') || 'vô chính diệu'}</p>`).join('')}`);
}

const tuTruHtml = (b: LaSoBatTu) => `<div class="tu-tru">${([['Trụ Giờ', 'tru-gio', b.tuTru.gio, false], ['Trụ Ngày · Nhật chủ', 'tru-ngay', b.tuTru.ngay, true], ['Trụ Tháng', 'tru-thang', b.tuTru.thang, false], ['Trụ Năm', 'tru-nam', b.tuTru.nam, false]] as const).map(([nhan, anh, x, nc]) => `<figure class="${nc ? 'nc' : ''}">${theTru({ anh, thienCan: x.can, diaChi: x.chi, thanCan: x.thapThan, napAmCan: x.hanhCan, napAmChi: x.hanhChi, laNhatChu: nc })}<figcaption>${nhan}</figcaption></figure>`).join('')}</div>`;
const VAN_ANH: Record<string, string> = { 'Thuận': 'thuan', 'Hơi thuận': 'hoi-thuan', 'Bình': 'binh', 'Hơi nghịch': 'hoi-nghich', 'Nghịch': 'nghich' };
const nhanVan = (n: string) => `${ico(`bat-tu/van-nhan/${VAN_ANH[n] ?? 'binh'}`, 22, n)}<span class="nv nv-${n === 'Thuận' ? 'a' : n === 'Hơi thuận' ? 'b' : n === 'Bình' ? 'c' : n === 'Hơi nghịch' ? 'd' : 'e'}">${esc(n)}</span>`;
function htmlLuuNien(b: LaSoBatTu) {
  const nam = new Date().getFullYear();
  const dong = []; for (let y = nam - 1; y <= nam + 6; y++) { const g = danhGiaVan(b.phanTich, canChiNamDuong(y), b.tuTruChi); dong.push(`<tr title="${esc(g.tuongTac.join('; '))}"><td>${y === nam ? '<b>' + y + '</b>' : y}</td><td>${esc(g.canChi)}</td><td>${esc(g.thapThanCan)} / ${esc(g.thapThanChi)}</td><td>${nhanVan(g.nhan)}</td><td class="mo">${esc(g.tuongTac.join('; '))}</td></tr>`); }
  return `<h4>Lưu niên</h4><table>${dong.join('')}</table><p class="mo">Tính theo năm dương lịch, gần đúng quanh Lập Xuân. Nhãn chỉ là xu hướng theo dụng–kỵ.</p>`;
}
const THAN_SAT_ANH = (ten: string) => { const k = bo(ten).replace(/-quy-nhan$/, ''); return k === 'loc-than' ? 'loc' : k; };
function htmlPhanTichBatTu(b: LaSoBatTu) {
  const p = b.phanTich, d = p.dungThan, v = p.vuongSuy;
  const hanh = (nhan: string, h: string | null, lop: string) => h ? `<span class="hx hx-${lop}">${ico(`bat-tu/dung-than/${lop === 'phu' ? 'dung' : lop}`, 22, nhan)}<i>${nhan}</i> ${esc(h)}</span>` : '';
  return `<h4>Vượng suy</h4><p><b>${esc(v.muc)}</b> (sức đỡ ${(v.diem * 100).toFixed(0)}%)</p><div class="thanh"><i style="width:${Math.round(v.diem * 100)}%"></i></div><p class="mo">${esc(v.giaiThich)}</p>
    <h4>Cách cục</h4><p><b>${esc(p.cachCuc.tenViet)}</b> <span class="mo">${esc(p.cachCuc.ten)}</span></p><p class="mo">${esc(p.cachCuc.ghiChu)}</p>
    <h4>Dụng thần</h4><p class="hx-dong">${hanh('Dụng', d.dung, 'dung')}${hanh('Phụ', d.phu, 'phu')}${hanh('Hỷ', d.hy, 'hy')}${hanh('Kỵ', d.ky, 'ky')}${hanh('Cừu', d.cuu, 'cuu')}${d.nhan.map((h) => hanh('Nhàn', h, 'nhan')).join('')}</p><p class="mo">${esc(d.phuongPhap.join(', '))}</p>${d.lyDo.map((x) => `<p class="mo">· ${esc(x)}</p>`).join('')}
    <h4>Hình xung hợp hội</h4>${p.tuongTac.length ? `<ul>${p.tuongTac.map((t) => `<li><b>${esc(t.loai)}</b> ${esc(t.chiTiet)} <span class="mo">(${esc(t.viTri)})</span></li>`).join('')}</ul>` : '<p class="mo">Không có đáng kể.</p>'}
    <h4>Thần sát</h4>${p.thanSat.length ? `<ul>${p.thanSat.map((t) => `<li>${ico(`bat-tu/than-sat/${THAN_SAT_ANH(t.ten)}`, 26, t.ten)}<b>${esc(t.ten)}</b> ở ${esc(t.viTri.join(', '))} <span class="mo">${esc(t.y)}</span></li>`).join('')}</ul>` : '<p class="mo">Không có.</p>'}<p class="mo">${ico('bat-tu/than-sat/khong-vong', 22, 'Không vong')}Không vong (theo trụ ngày): ${esc(p.khongVong.join(', '))}</p>
    <h4>Thập thần (kể tàng can)</h4><p><div class="luoi-ts">${p.demThan.filter((x) => x.so > 0).map((x) => `<span>${ico(`bat-tu/thap-than/${bo(x.ten)}`, 30, x.ten)}${esc(x.ten)} <b>${x.so}</b></span>`).join('')}</div>`;
}
function chiTietBatTu(ten?: string, t?: Tru) {
  const b = st.hoSo!.batTu;
  const dong = (n: string, x: Tru) => `<tr><td>${n}</td><td>${canIconVi(x.can, 22)}${chiIconVi(x.chi, 22)}<b>${esc(x.ten)}</b></td><td>${esc(x.thapThan)}</td><td>${esc(x.napAm)}</td></tr>`;
  const nam = new Date().getFullYear();
  const dv = b.daiVan.danhSach.map((d, i, a) => { const dang = d.namBatDau <= nam && (a[i + 1]?.namBatDau ?? 9999) > nam; const g = danhGiaVan(b.phanTich, d.chiSo, b.tuTruChi); return `<tr><td>${d.tuoiBatDau}–${d.tuoiKetThuc}</td><td>${dang ? '<b>' : ''}${esc(d.canChi)}${dang ? '</b> ◀' : ''}</td><td>${esc(d.thapThan)}</td><td>${d.namBatDau}</td><td>${nhanVan(g.nhan)}</td></tr>`; }).join('');
  chiTiet(ten ? ten : 'Bát tự', `${t ? `<p><b>${esc(t.ten)}</b>: can ${esc(t.can)} (${esc(t.hanhCan)}), chi ${esc(t.chi)} (${esc(t.hanhChi)})</p><p>Thập thần: ${esc(t.thapThan)} · Nạp âm: ${esc(t.napAm)}</p><p>Tàng can: ${t.tangCan.map((c) => `${esc(c.can)} (${esc(c.thapThan)})`).join(', ')}</p>` : ''}
    <h4>Tứ trụ</h4>${tuTruHtml(b)}<table>${dong('Năm', b.tuTru.nam)}${dong('Tháng', b.tuTru.thang)}${dong('Ngày', b.tuTru.ngay)}${dong('Giờ', b.tuTru.gio)}</table>
    <p>Nhật chủ <b>${esc(b.nhatChu.can)}</b> (${esc(b.nhatChu.amDuong)} ${esc(b.nhatChu.hanh)}), sinh sau tiết ${esc(b.tietKhi)}</p>
    <h4>Ngũ hành</h4>${cotNguHanh(demNguHanh(b.nguHanh))}
    <p>Ngũ hành: ${Object.entries(b.nguHanh).map(([h, n]) => `${h} ${n}`).join(' · ')}${b.hanhThieu.length ? ` · thiếu <b>${b.hanhThieu.join(', ')}</b>` : ''}</p>
    ${htmlPhanTichBatTu(b)}
    <h4>Đại vận (${b.daiVan.thuan ? 'thuận' : 'nghịch'}) theo dụng–kỵ</h4><table>${dv}</table>${htmlLuuNien(b)}${b.ghiChu.map((g) => `<p class="mo">${esc(g)}</p>`).join('')}`);
}

const PHAN: Record<string, string> = { Sun: 'Surya', Moon: 'Chandra', Mars: 'Mangala', Mercury: 'Budha', Jupiter: 'Guru', Venus: 'Shukra', Saturn: 'Shani', Rahu: 'Rahu', Ketu: 'Ketu' };
const TEN_G: Record<string, string> = { Sun: 'Mặt Trời', Moon: 'Mặt Trăng', Mars: 'Sao Hỏa', Mercury: 'Sao Thủy', Jupiter: 'Sao Mộc', Venus: 'Sao Kim', Saturn: 'Sao Thổ', Rahu: 'La Hầu', Ketu: 'Kế Đô' };
const RASHI_VI = ['Mesha · Bạch Dương', 'Vrishabha · Kim Ngưu', 'Mithuna · Song Tử', 'Karka · Cự Giải', 'Simha · Sư Tử', 'Kanya · Xử Nữ', 'Tula · Thiên Bình', 'Vrishchika · Bọ Cạp', 'Dhanu · Nhân Mã', 'Makara · Ma Kết', 'Kumbha · Bảo Bình', 'Meena · Song Ngư'];
function chiTietChiemTinh(h?: ViTri) {
  const v = st.hoSo!.veDa, dd = (x: number) => `${Math.floor(x)}°${String(Math.floor((x % 1) * 60)).padStart(2, '0')}′`;
  const g = h ? v.graha.find((x) => x.ten === h.ten) : undefined;
  const ds = v.dasha;
  const chieu = g ? v.chieu.filter((c) => c.den === g.ma).map((c) => PHAN[c.tu]).join(', ') : '';
  chiTiet(g ? `${g.ten} (${g.phan})` : 'Lá số Vệ Đà', `${g ? `<p>${hanhTinhIconVi(g.ten, 30)}<b>${dd(g.doTrongRashi)} ${esc(RASHI_VI[g.rashi])}</b>, nhà ${g.nha}${g.phamChat ? ', <b>' + esc(g.phamChat) + '</b>' : ''}${g.nghichHanh && g.ma !== 'Rahu' && g.ma !== 'Ketu' ? ', nghịch hành' : ''}${g.biDot ? ', bị đốt' : ''}</p>
      <p>Nakshatra <b>${esc(g.nakshatra)}</b> pada ${g.pada} (chủ ${PHAN[g.chuNakshatra]}) · Navamsa ${esc(RASHI_VI[g.navamsa])}</p>
      <p>Làm chủ nhà: ${v.chuNha.filter((c) => c.chu === g.ma).map((c) => c.nha).join(', ') || '—'}${chieu ? ` · được chiếu bởi ${esc(chieu)}` : ''}</p>` : ''}
    <p class="mo">Hoàng đạo sao cố định · ayanamsa Lahiri ${v.ayanamsa.toFixed(2)}° · nhà cung trọn</p>
    <p>Lagna <b>${dd(v.lagna.doTrongRashi)} ${esc(RASHI_VI[v.lagna.rashi])}</b> · ${esc(v.lagna.nakshatra)} pada ${v.lagna.pada}</p>
    <h4>Graha</h4><table>${v.graha.map((x) => `<tr${g?.ma === x.ma ? ' style="background:rgba(245,196,81,.14)"' : ''}><td>${hanhTinhIconVi(x.ten, 22)}${esc(x.phan)}</td><td>${dd(x.doTrongRashi)} ${esc(RASHI_VI[x.rashi].split(' · ')[0])}<br><span class="mo">${esc(x.nakshatra)} ${x.pada}</span></td><td>nhà ${x.nha}${x.phamChat ? '<br><span class="mo">' + esc(x.phamChat.split(' (')[0]) + '</span>' : ''}${x.biDot ? '<br><span class="mo">bị đốt</span>' : ''}</td></tr>`).join('')}</table>
    <h4>Vimshottari dasha</h4>${ds.hienTai ? `<p>Đang chạy <b>${PHAN[ds.hienTai.graha]}</b> (${ds.hienTai.batDau} → ${ds.hienTai.ketThuc})${ds.antarHienTai ? `, antardasha <b>${PHAN[ds.antarHienTai.graha]}</b> đến ${ds.antarHienTai.ketThuc}` : ''}</p>` : ''}
    <table>${ds.maha.slice(0, 9).map((m) => `<tr${m === ds.hienTai || (ds.hienTai && m.batDau === ds.hienTai.batDau) ? ' style="background:rgba(245,196,81,.14)"' : ''}><td>${PHAN[m.graha]} · ${TEN_G[m.graha]}</td><td>${m.batDau} → ${m.ketThuc}</td></tr>`).join('')}</table>
    <h4>Yoga</h4>${v.yoga.map((y) => `<p>• ${esc(y)}</p>`).join('') || '<p class="mo">Không có yoga nào trong danh sách hệ thống kiểm tra.</p>'}
    <h4>Quá cảnh hôm nay</h4><p>${v.quaCanh.graha.map((q) => `${PHAN[q.ma]} ở ${esc(RASHI_VI[q.rashi].split(' · ')[0])} (nhà ${q.tuLagna})`).join(' · ')}</p>${v.quaCanh.ghiChu.map((x) => `<p class="mo">${esc(x)}</p>`).join('')}
    ${v.ghiChu.map((x) => `<p class="mo">${esc(x)}</p>`).join('')}`);
}

const anhQue = (so: number) => { const h = (hexagrams as { number: number; file: string; name_vi: string }[]).find((x) => x.number === so); return h ? `<img class="anh-que" src="assets/menh-ly-3d/kinh-dich/${h.file}" alt="${esc(h.name_vi)}">` : ''; };
function chiTietQue() {
  const q = st.que!.que, l = q.loiQue;
  const loi = (x: any) => `${x.loiQue ? `<p class="trich">${esc(x.loiQue)}</p>` : ''}${x.daiTuong ? `<p class="mo">${esc(x.daiTuong)}</p>` : ''}`;
  chiTiet('Quẻ Kinh Dịch', `${q.cauHoi ? `<p>Câu hỏi: <b>${esc(q.cauHoi)}</b></p>` : ''}<p class="mo">${q.phuongPhap === 'ba-dong-xu' ? 'Gieo ba đồng xu' : 'Mai Hoa theo thời gian'}</p>
    ${anhQue(q.queChu.so)}${htmlHaoQue(q)}
    <h4>Quẻ chủ: ${q.queChu.so}. ${esc(q.queChu.ten)}</h4><p>${esc(q.queChu.thuongQuai)} trên, ${esc(q.queChu.haQuai)} dưới</p>${loi(l.queChu)}
    <h4>${q.haoDong.length ? 'Hào động' : 'Không có hào động'}</h4>${l.haoDong.map((h: any) => `<p><b>${esc(h.ten)}</b> (hào ${h.viTri})</p><p class="trich">${esc(h.loi || 'Chưa có nguyên văn')}</p>`).join('') || '<p class="mo">Quẻ tĩnh: luận theo lời quẻ chủ.</p>'}
    <h4>Quẻ hỗ: ${q.queHo.so}. ${esc(q.queHo.ten)}</h4>
    ${q.queBien ? `<h4>Quẻ biến: ${q.queBien.so}. ${esc(q.queBien.ten)}</h4>${loi(l.queBien)}` : ''}<p class="mo">Lời quẻ: ${esc(l.nguon)}</p>`);
}

function chiTietTarot(i?: number) {
  const k = st.tarot!.tarot;
  chiTiet('Trải bài tarot', `${k.cauHoi ? `<p>Câu hỏi: <b>${esc(k.cauHoi)}</b></p>` : ''}${htmlTraiBai(k.kieuTrai, k.cacLa)}<table>${k.cacLa.map((c, j) => `<tr${j === i ? ' style="background:rgba(245,196,81,.14)"' : ''}><td>${j + 1}. ${esc(c.viTri)}</td><td><b>${esc(c.la.ten)}</b><br><span class="mo">${esc(c.la.tenAnh)}${c.la.bo ? ' · ' + esc(c.la.nguyenTo!) : ' · Ẩn chính'}</span></td><td>${c.nguoc ? 'ngược' : 'xuôi'}</td></tr>`).join('')}</table>
    <p class="mo">Ảnh lá bài lấy từ bộ ảnh 78 lá của app; lá nào chưa có ảnh sẽ chỉ hiện tên.</p>`);
}

function chiTietPhongThuy(huong?: string) {
  const r = st.pt!.pt, b = r.batTrach, h = r.huyenKhong;
  const dn = (l: { ten: string; huong: string; cat: boolean }[]) => `<table>${l.map((x) => `<tr><td>${esc(x.ten)}</td><td>${esc(x.huong)}</td><td>${x.cat ? 'tốt' : 'xấu'}</td></tr>`).join('')}</table>`;
  const cung = huong && h ? h.cung.find((c) => c.huong === huong) : undefined;
  chiTiet('Phong thủy', `<img class="banner-pt" src="${ANH_MENH}/phong-thuy/hero.jpg" alt="">${cung ? `<h4>Cung ${esc(cung.ten)} (${esc(cung.huong)})</h4><p>Sao sơn ${icoSao(cung.son)}<b>${cung.son}</b>, sao hướng ${icoSao(cung.huongTinh)}<b>${cung.huongTinh}</b>, sao vận ${icoSao(cung.van)}<b>${cung.van}</b>.</p>` : ''}
    ${b ? `<h4>${icoQuai(b.menhQuai.ten)}Bát Trạch: mệnh ${esc(b.menhQuai.ten)} (${esc(b.menhQuai.nhom)})</h4>${dn(b.duNienNguoi)}${b.nha ? `<h4>${icoQuai(b.nha.quai)}Nhà tọa ${esc(b.nha.toa)} hướng ${esc(b.nha.huong)}: ${esc(b.nha.quai)}</h4><p>${esc(b.nha.nhan)}</p>${dn(b.nha.duNien)}` : ''}` : '<p class="mo">Nhập ngày sinh và giới tính để xem Bát Trạch.</p>'}
    ${h ? `<h4>Huyền Không vận ${h.van}</h4><p>Tọa ${esc(h.toaSon)}, hướng ${esc(h.huongSon)}.</p><p class="mo">${esc(h.theQuai.ghiChu)} ${esc(h.khongVong ?? '')}</p>` : '<p class="mo">Nhập hướng nhà (độ) để xem Huyền Không.</p>'}
    <h4>Năm ${r.luuNien.nam}</h4><p>Ngũ Hoàng: ${esc(r.luuNien.nguHoang)}; Nhị Hắc: ${esc(r.luuNien.nhiHac)}; Thái Tuế: ${esc(r.luuNien.thaiTue)}; Tuế Phá: ${esc(r.luuNien.tuePha)}; Tam Sát: ${esc(r.luuNien.tamSat)}.</p>
    <h4>Ngày tốt</h4><table>${r.chonNgay.ngayTot.map((x) => `<tr><td>${esc(x.ngay)}</td><td>${esc(x.thu)} ${esc(x.canChi)}</td><td>trực ${esc(x.truc)}</td></tr>`).join('') || '<tr><td>Chưa có ngày tốt trong khoảng này</td></tr>'}</table>
    <p class="mo">Phong thủy chỉ là yếu tố phụ; mục dân gian tính nhẹ. Hướng nhà đo bằng la bàn ở cửa chính, đứng quay mặt ra ngoài.</p>`);
}
async function xemPhongThuy() {
  const ngaySinh = $<HTMLInputElement>('ngay').value, gioSinh = $<HTMLInputElement>('gio').value;
  const huong = $<HTMLInputElement>('huongNha').value.trim();
  try {
    st.pt = await goi('phongThuy', { ngaySinh, gioSinh, gioiTinh: $<HTMLSelectElement>('gioitinh').value, huongNhaDo: huong === '' ? undefined : Number(huong), loaiViec: $<HTMLSelectElement>('loaiViec').value });
    delete st.hoiDap['hoso:phongthuy']; hienMan(); veTinNhan();
  } catch (e) { chiTiet('Lỗi', `<p>${esc((e as Error).message)}</p>`); }
}

/* ---------- Đại vận (dưới bảng Tử Vi): dữ liệu đại hạn lấy từ lá số ---------- */
function veDaiVan() {
  const o = $('daiVan');
  if (tab !== 'tuvi' || !st.hoSo) { o.classList.add('an'); o.innerHTML = ''; return; }
  const nam = Number($<HTMLInputElement>('ngay').value.split('-')[0]);
  const tuoi = new Date().getFullYear() - nam + 1; // tuổi âm
  const van = [...st.hoSo.tuVi.cung].sort((a, b) => a.daiHan[0] - b.daiHan[0]).map((c) => ({ tuTuoi: c.daiHan[0], denTuoi: c.daiHan[1], tenCung: c.ten, saoChinh: c.chinhTinh.map((s) => s.ten).join(', ') || 'Vô chính diệu' }));
  o.innerHTML = htmlDaiVan(van, tuoi); o.classList.remove('an');
}
$('daiVan').addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>('.moc-van'); if (b?.dataset.cung) manTv?.chonCung(b.dataset.cung); });
$('chitiet').addEventListener('click', (e) => { const o = (e.target as HTMLElement).closest<HTMLElement>('.o-cung'); const ten = o?.querySelector('b')?.textContent; if (ten) manTv?.chonCung(ten); });

/* ---------- Dựng màn theo tab ---------- */
let manTv: ReturnType<typeof manTuVi> | null = null;
function hienMan() {
  const tenNguoi = $<HTMLInputElement>('ten').value.trim();
  manTv = null;
  veDaiVan();
  $('tamCho').classList.add('an');
  if (tab === 'tuvi' && st.hoSo) { manTv = manTuVi(st.hoSo.tuVi, tenNguoi, chiTietCung); canh.dat(manTv); chiTietCung(null, []); }
  else if (tab === 'batu' && st.hoSo) { canh.dat(manBatTu(st.hoSo.batTu, chiTietBatTu)); chiTietBatTu(); }
  else if (tab === 'chiemtinh' && st.hoSo) { canh.dat(manChiemTinh(st.hoSo.chiemTinh, chiTietChiemTinh)); chiTietChiemTinh(); }
  else if (tab === 'phongthuy' && st.pt) { canh.dat(manPhongThuy(st.pt.pt, chiTietPhongThuy)); chiTietPhongThuy(); }
  else if (tab === 'kinhdich' && st.que) { canh.dat(manKinhDich(st.que.que)); chiTietQue(); }
  else if (tab === 'tarot' && st.tarot) { canh.dat(manTarot(st.tarot.tarot, chiTietTarot)); chiTietTarot(); }
  else {
    canh.dat(manCho());
    chiTiet('Chi tiết', `<p class="mo">${tab === 'kinhdich' ? 'Nhập câu hỏi rồi bấm Gieo quẻ.' : tab === 'tarot' ? 'Nhập câu hỏi rồi chọn kiểu trải bài.' : 'Nhập ngày giờ sinh rồi bấm Lập lá số.'}</p>`);
    $('tamCho').classList.remove('an'); $('nutTamCho').textContent = NUT_CHO[tab][0];
    $('tamCho').classList.toggle('pt', tab === 'phongthuy');
    return;
  }
  $('tamCho').classList.add('an');
}

$('nutTamCho').addEventListener('click', () => NUT_CHO[tab][1]());
function doiTab(t: Tab) {
  tab = t;
  document.querySelectorAll('#tab button').forEach((b) => b.classList.toggle('bat', (b as HTMLElement).dataset.tab === t));
  const hoiViec = t === 'kinhdich' || t === 'tarot';
  $('hangPhongThuy').classList.toggle('an', t !== 'phongthuy'); $('nutLap').textContent = t === 'phongthuy' ? 'Xem phong thủy' : 'Lập lá số';
  $('theHoSo').classList.toggle('an', hoiViec); $('theHoi').classList.toggle('an', !hoiViec);
  $('tieuDeHoi').textContent = t === 'tarot' ? 'Rút bài tarot' : 'Gieo quẻ Kinh Dịch';
  $('nutHoi').innerHTML = t === 'tarot'
    ? `<button class="chinh" data-kieu="ba-la">Ba lá</button><button class="phu" data-kieu="mot-la">Một lá</button><button class="phu" data-kieu="tinh-huong">Tình huống</button><button class="phu" data-kieu="celtic-cross">Celtic Cross</button>`
    : `<button class="chinh" data-pp="xu">Gieo ba đồng xu</button><button class="phu" data-pp="maihoa">Mai Hoa theo giờ</button>`;
  $('tenMon').textContent = TEN_MON[t];
  hienMan(); veGoiY(); veTinNhan();
}

/* ---------- Khung luận giải AI ---------- */
function duLieuTab(): { loai: string; duLieu: string[]; soLaBai?: number } | null {
  if (tab === 'kinhdich') return st.que ? { loai: 'kinh-dich', duLieu: [st.que.rutGon] } : null;
  if (tab === 'phongthuy') return st.pt ? { loai: 'phong-thuy', duLieu: [st.pt.rutGon] } : null;
  if (tab === 'tarot') return st.tarot ? { loai: 'tarot', duLieu: [st.tarot.rutGon], soLaBai: st.tarot.tarot.cacLa.length } : null;
  return st.hoSo ? { loai: LOAI[tab], duLieu: [st.hoSo.rutGon[LOAI[tab]]] } : null;
}
const GOI_Y: Record<Tab, string[]> = {
  tuvi: ['Luận tổng quan', 'Công việc năm nay', 'Tài lộc', 'Tình duyên'], batu: ['Luận tổng quan', 'Hành nào nên bổ?', 'Đại vận hiện tại'],
  chiemtinh: ['Luận tổng quan', 'Đại vận (dasha) hiện tại', 'Sự nghiệp (nhà 10)', 'Hôn nhân (nhà 7)'], phongthuy: ['Luận tổng quan', 'Hướng nào đặt giường, bếp?', 'Năm nay cần tránh gì?', 'Chọn ngày tốt'], kinhdich: ['Luận quẻ này', 'Nên làm gì lúc này?'], tarot: ['Luận trải bài', 'Lời khuyên chính'],
};
function veGoiY() {
  $('goiY').innerHTML = GOI_Y[tab].map((g) => `<button class="phu" data-goi="${esc(g)}">${esc(g)}</button>`).join('') + `<button class="phu" data-cheo="1">Luận chéo các môn</button>`;
}
function dinhDang(s: string): string {
  const dong = esc(s).split('\n');
  let html = '', trongDs = false;
  for (const d of dong) {
    const t = d.trim().replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
    const ds = /^[-•]\s+/.test(t);
    if (trongDs && !ds) { html += '</ul>'; trongDs = false; }
    if (!t) continue;
    if (/^#{1,4}\s+/.test(t)) html += `<h4>${t.replace(/^#{1,4}\s+/, '')}</h4>`;
    else if (ds) { if (!trongDs) { html += '<ul>'; trongDs = true; } html += `<li>${t.replace(/^[-•]\s+/, '')}</li>`; }
    else html += `<p>${t}</p>`;
  }
  return html + (trongDs ? '</ul>' : '');
}
const khoa = () => (tab === 'kinhdich' || tab === 'tarot' ? tab : 'hoso:' + tab);
function veTinNhan(them?: string) {
  const h = st.hoiDap[khoa()];
  let html = '';
  if (h?.cauDau) html += `<div class="tn toi"><div class="dau">BẠN</div>${esc(h.cauDau)}</div>`;
  for (const l of h?.luot ?? []) html += l.vai === 'user' ? `<div class="tn toi"><div class="dau">BẠN</div>${esc(l.noiDung)}</div>` : `<div class="tn"><div class="dau">LUẬN GIẢI · ${TEN_MON[tab].toUpperCase()}</div>${dinhDang(l.noiDung)}</div>`;
  if (!html && !them) html = `<p class="mo">Lập lá số, gieo quẻ hoặc rút bài, rồi bấm một gợi ý bên dưới hay gõ câu hỏi. AI chỉ luận trên dữ liệu do chương trình tính; nội dung mang tính tham khảo.</p>`;
  $('tinnhan').innerHTML = html + (them ?? '');
  $('tinnhan').scrollTop = $('tinnhan').scrollHeight;
}
async function hoiAI(cauHoi: string, cheo = false) {
  if (st.dangGoi) return;
  let d = duLieuTab();
  if (cheo) {
    const tat = [st.hoSo?.rutGon['tu-vi'], st.hoSo?.rutGon['bat-tu'], st.hoSo?.rutGon['chiem-tinh'], st.que?.rutGon, st.tarot?.rutGon].filter(Boolean) as string[];
    d = tat.length >= 2 ? { loai: 'luan-cheo', duLieu: tat } : null;
  }
  const k = cheo ? 'cheo' : khoa();
  if (!d) { veTinNhan(`<div class="tn loi">${cheo ? 'Luận chéo cần ít nhất hai loại dữ liệu, ví dụ lá số và một quẻ.' : 'Chưa có dữ liệu để luận. Hãy lập lá số, gieo quẻ hoặc rút bài trước.'}</div>`); return; }
  const h = (st.hoiDap[k] ??= { luot: [] });
  if (cheo) { h.cauDau = cauHoi; h.luot = []; }
  else if (!h.cauDau) h.cauDau = cauHoi; else h.luot.push({ vai: 'user', noiDung: cauHoi });
  if (cheo) st.hoiDap[khoa()] = h;
  st.dangGoi = true; $<HTMLButtonElement>('nutGui').disabled = true;
  veTinNhan(`<div class="tn"><div class="dau">LUẬN GIẢI</div><span class="cham">Đang luận giải</span></div>`);
  try {
    const ten = $<HTMLInputElement>('ten').value.trim();
    const kq = await goi('luan', { ...d, cauHoi: h.cauDau, hoiDap: h.luot, hoSo: ten ? `Tên: ${ten}` : undefined });
    h.luot.push({ vai: 'assistant', noiDung: kq.vanBan });
    veTinNhan(`<p class="mo">${esc(kq.nhaCungCap ?? 'Claude')} · ${esc(kq.model)}</p>`);
  } catch (e) {
    if (h.luot.at(-1)?.vai === 'user') h.luot.pop(); else if (!h.luot.length) h.cauDau = undefined;
    veTinNhan(`<div class="tn loi">Không gọi được AI: ${esc((e as Error).message)}</div>`);
  } finally { st.dangGoi = false; $<HTMLButtonElement>('nutGui').disabled = false; }
}

/* ---------- Lưu hồ sơ người xem (ghi nhớ trên máy, khôi phục khi mở lại app) ---------- */
const KHOA_HO_SO = 'menhly3d.hoSoNguoiXem';
const TRUONG_HO_SO = ['ten', 'ngay', 'gio', 'gioitinh', 'huongNha', 'loaiViec'] as const;
function luuHoSo() {
  try {
    const d: Record<string, string> = {};
    for (const k of TRUONG_HO_SO) { const e = document.getElementById(k) as HTMLInputElement | null; if (e) d[k] = e.value; }
    d.noisinhTen = diaDiem[Number($<HTMLSelectElement>('noisinh').value)]?.ten ?? '';
    localStorage.setItem(KHOA_HO_SO, JSON.stringify(d));
  } catch { /* không lưu được thì bỏ qua */ }
}
function khoiPhucHoSo() {
  try {
    const d = JSON.parse(localStorage.getItem(KHOA_HO_SO) ?? 'null') as Record<string, string> | null;
    if (d) {
      for (const k of TRUONG_HO_SO) { const e = document.getElementById(k) as HTMLInputElement | null; if (e && typeof d[k] === 'string') e.value = d[k]; }
      const i = diaDiem.findIndex((x) => x.ten === d.noisinhTen); if (i >= 0) $<HTMLSelectElement>('noisinh').value = String(i);
    }
  } catch { /* dữ liệu hỏng thì dùng giá trị mặc định */ }
  for (const k of [...TRUONG_HO_SO, 'noisinh']) document.getElementById(k)?.addEventListener('input', luuHoSo);
  for (const k of ['gioitinh', 'noisinh', 'loaiViec']) document.getElementById(k)?.addEventListener('change', luuHoSo);
}

/* ---------- Thao tác ---------- */
let diaDiem: NoiSinh[] = [];
async function lapLaSo() {
  const [nam, thang, ngay] = $<HTMLInputElement>('ngay').value.split('-').map(Number), [gio, phut] = $<HTMLInputElement>('gio').value.split(':').map(Number);
  if (!nam || Number.isNaN(gio)) { chiTiet('Chi tiết', '<p class="mo">Cần nhập đủ ngày và giờ sinh.</p>'); return; }
  try {
    st.hoSo = await goi('hoSo', { sinh: { nam, thang, ngay, gio, phut: phut || 0, gioiTinh: $<HTMLSelectElement>('gioitinh').value }, noiSinh: diaDiem[Number($<HTMLSelectElement>('noisinh').value)] });
    for (const k of Object.keys(st.hoiDap)) if (k.startsWith('hoso:') || k === 'cheo') delete st.hoiDap[k];
    if (tab === 'kinhdich' || tab === 'tarot') doiTab('tuvi'); else { hienMan(); veTinNhan(); }
  } catch (e) { chiTiet('Lỗi', `<p>${esc((e as Error).message)}</p>`); }
}
async function gieoQue(pp: string) { st.que = await goi('que', { phuongPhap: pp, cauHoi: $<HTMLTextAreaElement>('cauhoi').value.trim() }); delete st.hoiDap.kinhdich; hienMan(); veTinNhan(); }
async function rutBai(kieu: string) { st.tarot = await goi('tarot', { kieuTrai: kieu, cauHoi: $<HTMLTextAreaElement>('cauhoi').value.trim() }); delete st.hoiDap.tarot; hienMan(); veTinNhan(); }

async function capNhatTrangThai() {
  const c = $('trangthai');
  try { const k = await goi('kiemTra'); c.textContent = `AI: ${k.nhaCungCap ?? (k.ketNoi === 'api' ? 'khóa API' : 'tài khoản Claude')} ${k.ok ? 'sẵn sàng' : 'chưa sẵn sàng'}`; c.className = 'chip ' + (k.ok ? 'tot' : 'xau'); c.title = k.thongBao; return k; }
  catch (e) { c.textContent = 'AI: chưa kết nối'; c.className = 'chip xau'; return { ok: false, thongBao: (e as Error).message }; }
}

document.querySelectorAll('#tab button').forEach((b) => b.addEventListener('click', () => doiTab((b as HTMLElement).dataset.tab as Tab)));
$('nutLap').addEventListener('click', () => (tab === 'phongthuy' ? void xemPhongThuy() : void lapLaSo()));
$('nutHoi').addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest('button'); if (!b) return; if (b.dataset.pp) gieoQue(b.dataset.pp); else if (b.dataset.kieu) rutBai(b.dataset.kieu); });
$('goiY').addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest('button'); if (!b) return; if (b.dataset.cheo) hoiAI($<HTMLTextAreaElement>('cauhoi').value.trim() || 'Luận chéo tổng quan cho tôi.', true); else hoiAI(b.dataset.goi!); });
const gui = () => { const o = $<HTMLTextAreaElement>('nhap'), v = o.value.trim(); if (v) { o.value = ''; hoiAI(v); } };
$('nutGui').addEventListener('click', gui);
$('nhap').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gui(); } });
const HANG: Record<string, string> = { claude: 'Claude (Anthropic)', openai: 'ChatGPT (OpenAI)', gemini: 'Gemini (Google AI)', grok: 'Grok (xAI)', meta: 'Meta (Llama API)' };
let coKhoa: Record<string, boolean> = {};
const hangChon = () => $<HTMLSelectElement>('nhaCungCap').value;
function hienOKhoa() {
  const h = hangChon();
  $('o-model-tk').style.display = h === 'taikhoan' ? '' : 'none';
  document.querySelectorAll<HTMLElement>('.o-khoa').forEach((l) => l.classList.toggle('hien', l.dataset.hang === h));
  const o = $<HTMLInputElement>('khoa-' + h);
  if (o) o.placeholder = coKhoa[h] ? 'Đã lưu khóa (để trống nếu không đổi)' : o.placeholder.replace('Đã lưu khóa (để trống nếu không đổi)', '');
  $('ghiChuHang').textContent = h === 'taikhoan' ? 'Dùng tài khoản Claude đã đăng nhập Claude Code; chỉ dành cho chủ app tự dùng.' : h === 'meta' ? 'Meta cung cấp Llama API công khai (api.llama.com); app không dùng "Muse".' : h === 'claude' ? 'Khóa API trả tiền theo lượt, dùng khi phục vụ khách.' : 'Trò chuyện hỏi đáp dùng được với hãng này; tính năng công cụ (tool) chỉ có ở Claude.';
}
$('nhaCungCap').addEventListener('change', hienOKhoa);
function hienQuanTri(_c: { quanTri?: boolean }) { /* nút Quản trị luôn hiện; vào được hay không do đăng nhập quyết định */ }
$('nutCaiDat').addEventListener('click', async () => {
  const c = await goi('docCauHinh');
  coKhoa = c.coKhoa ?? {};
  $<HTMLSelectElement>('nhaCungCap').value = c.ketNoi === 'taikhoan' ? 'taikhoan' : c.nhaCungCap;
  $<HTMLSelectElement>('modelTaiKhoan').value = c.modelTaiKhoan ?? 'claude-sonnet-5-5';
  document.querySelectorAll<HTMLInputElement>('.o-khoa input').forEach((i) => (i.value = ''));
  hienOKhoa(); hienQuanTri(c);
  $('ketquaKiemTra').textContent = ''; $('caidat').classList.remove('an');
});
const luuCauHinh = async () => {
  const h = hangChon(), khoa: Record<string, string> = {};
  for (const k of Object.keys(HANG)) { const v = $<HTMLInputElement>('khoa-' + k).value.trim(); if (v) khoa[k] = v; }
  const c = await goi('ghiCauHinh', h === 'taikhoan' ? { ketNoi: 'taikhoan', khoa, modelTaiKhoan: $<HTMLSelectElement>('modelTaiKhoan').value } : { ketNoi: 'api', nhaCungCap: h, khoa });
  coKhoa = c.coKhoa ?? {}; hienQuanTri(c);
};
$('nutLuu').addEventListener('click', async () => { await luuCauHinh(); await capNhatTrangThai(); $('caidat').classList.add('an'); });
$('nutKiemTra').addEventListener('click', async () => {
  await luuCauHinh();
  $('ketquaKiemTra').textContent = 'Đang kiểm tra…';
  const h = hangChon();
  const k = h === 'taikhoan' ? await goi('kiemTra') : await goi('kiemTraHang', { nhaCungCap: h });
  await capNhatTrangThai();
  $('ketquaKiemTra').textContent = (k.ok ? 'Sẵn sàng. ' : 'Chưa sẵn sàng. ') + (k.thongBao ?? '');
});
$('nutDong').addEventListener('click', () => $('caidat').classList.add('an'));

/* ---------- Quản trị chi phí (chỉ hiện với quản trị viên) ---------- */
async function moTrangQuanTri() {
  try { $('noiDungQuanTri').innerHTML = await veQuanTri(); ganLuuGia(); } catch (e) { $('noiDungQuanTri').innerHTML = `<p class="mo">${esc((e as Error).message)}</p>`; }
  $('hopQuanTri').classList.remove('an');
}
$('nutQuanTri').addEventListener('click', async () => {
  let da = false;
  try { da = Boolean((await goi('docCauHinh')).quanTri); } catch { /* ngoài Electron */ }
  if (da) { await moTrangQuanTri(); return; }
  $('qtLoi').textContent = ''; $<HTMLInputElement>('qtMatKhau').value = '';
  $('hopDangNhap').classList.remove('an'); $<HTMLInputElement>('qtId').focus();
});
async function dangNhapQt() {
  $('qtLoi').textContent = '';
  try {
    await goi('dangNhapQuanTri', { id: $<HTMLInputElement>('qtId').value, matKhau: $<HTMLInputElement>('qtMatKhau').value, ghiNho: $<HTMLInputElement>('qtGhiNho').checked });
    $<HTMLInputElement>('qtMatKhau').value = ''; $('hopDangNhap').classList.add('an');
    await moTrangQuanTri();
  } catch (e) { $('qtLoi').textContent = (e as Error).message; }
}
$('nutDangNhapQt').addEventListener('click', dangNhapQt);
$('qtMatKhau').addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') void dangNhapQt(); });
$('nutDongDangNhap').addEventListener('click', () => $('hopDangNhap').classList.add('an'));
$('nutDangXuatQuanTri').addEventListener('click', async () => { await goi('dangXuatQuanTri'); $('hopQuanTri').classList.add('an'); });
$('nutDongQuanTri').addEventListener('click', () => $('hopQuanTri').classList.add('an'));

/* ---------- Chia sẻ thẻ lá số ---------- */
function dongChiaSe(): { tieuDe: string; dong: [string, string][] } | null {
  const h = st.hoSo;
  if (tab === 'tuvi' && h) { const l = h.tuVi; return { tieuDe: 'Lá số tử vi', dong: [['Năm', l.amLich.canChiNam], ['Bản mệnh', l.banMenh], ['Cục', l.cuc], ['Mệnh tại', l.cungMenhTai], ['Thân cư', l.thanCu]] }; }
  if (tab === 'batu' && h) { const b = h.batTu, t = b.tuTru; return { tieuDe: 'Bát tự', dong: [['Tứ trụ', `${t.nam.ten} · ${t.thang.ten} · ${t.ngay.ten} · ${t.gio.ten}`], ['Nhật chủ', `${b.nhatChu.can} (${b.nhatChu.hanh})`], ['Ngũ hành', Object.entries(b.nguHanh).map(([k, n]) => `${k} ${n}`).join(' · ')], ['Thiếu', b.hanhThieu.join(', ') || 'đủ']] }; }
  if (tab === 'chiemtinh' && h) { const v = h.veDa, mt = v.graha.find((x) => x.ma === 'Moon')!, sun = v.graha.find((x) => x.ma === 'Sun')!; return { tieuDe: 'Lá số Vệ Đà', dong: [['Lagna', RASHI_VI[v.lagna.rashi]], ['Mặt Trăng', `${RASHI_VI[mt.rashi]} · ${mt.nakshatra}`], ['Mặt Trời', RASHI_VI[sun.rashi]], ['Đại vận', v.dasha.hienTai ? `${PHAN[v.dasha.hienTai.graha]} đến ${v.dasha.hienTai.ketThuc}` : '—']] }; }
  if (tab === 'phongthuy' && st.pt) { const r = st.pt.pt; return { tieuDe: 'Phong thủy', dong: [['Mệnh quái', r.batTrach ? `${r.batTrach.menhQuai.ten} (${r.batTrach.menhQuai.nhom})` : '—'], ['Nhà', r.huyenKhong ? `Tọa ${r.huyenKhong.toaSon}, hướng ${r.huyenKhong.huongSon}` : '—'], ['Ngũ Hoàng năm nay', r.luuNien.nguHoang], ['Thái Tuế', r.luuNien.thaiTue]] }; }
  if (tab === 'kinhdich' && st.que) { const q = st.que.que; return { tieuDe: 'Quẻ Kinh Dịch', dong: [['Quẻ chủ', `${q.queChu.so}. ${q.queChu.ten}`], ['Quẻ biến', q.queBien ? `${q.queBien.so}. ${q.queBien.ten}` : 'Quẻ tĩnh']] }; }
  if (tab === 'tarot' && st.tarot) return { tieuDe: 'Trải bài tarot', dong: st.tarot.tarot.cacLa.map((c): [string, string] => [c.viTri, c.la.ten + (c.nguoc ? ' (ngược)' : '')]) };
  return null;
}
$('nutChiaSe').addEventListener('click', () => {
  const d = dongChiaSe();
  if (!d) { chiTiet('Chia sẻ', '<p class="mo">Chưa có dữ liệu để chia sẻ ở tab này.</p>'); return; }
  $('noiDungChiaSe').innerHTML = htmlTheChiaSe(d.tieuDe, $<HTMLInputElement>('ten').value.trim(), d.dong);
  $('hopChiaSe').classList.remove('an');
});
$('nutTaiChiaSe').addEventListener('click', () => { void taiTheChiaSe().catch((e) => chiTiet('Lỗi', `<p>${esc((e as Error).message)}</p>`)); });
$('nutDongChiaSe').addEventListener('click', () => $('hopChiaSe').classList.add('an'));

/* ---------- Chế độ Live: ô nhập nhanh, giao diện sạch để quay, lời luận hiện thành phụ đề ---------- */
const phuDe = new PhuDe($('phuDe'));
const CHU_DE: Record<string, string> = {
  'Tổng quan': 'Luận tổng quan, nêu 2–3 điểm nổi bật nhất.',
  'Tình duyên': 'Luận về tình duyên và các mối quan hệ.',
  'Công việc': 'Luận về công việc và sự nghiệp trong năm nay.',
  'Tài lộc': 'Luận về tài lộc và cách giữ tiền, không khuyên đầu tư cụ thể.',
};
const DINH_DANG_LIVE = '\n\nĐỊNH DẠNG (livestream, hiện thành phụ đề): văn nói tự nhiên, 6–8 câu ngắn, khoảng 120–160 từ, không đầu mục, không gạch đầu dòng, không in đậm. Nếu có tên người xem thì gọi tên ở câu đầu. Kết bằng một lời khuyên thực tế và nhắc đây là luận giải tham khảo. Không khẳng định chắc chắn về bệnh tật, tử vong hay đầu tư tài chính.';
let dangLive = false, chuDeLive = 'Tổng quan', tdAn: number | undefined;
/** Khóa khi đang luận cho một người: chỉ chọn người tiếp theo sau khi luận xong (hoặc bấm Dừng luận). */
let banLive = false, luotLive = 0;
function khoaLive(b: boolean, hieu?: string) {
  banLive = b;
  $('liveBar').classList.toggle('ban', b);
  $<HTMLInputElement>('liveNhanh').readOnly = b;
  $('liveDung').classList.toggle('an', !b);
  if (b) { $('liveHieu').textContent = hieu ?? 'Đang luận… chờ xong mới nhập người tiếp theo.'; $('liveBar').classList.remove('mo-di'); }
}
const laTabHoi = () => tab === 'kinhdich' || tab === 'tarot';
const MAU_BINH_LUAN = ['Lan nữ 12/03/1995 7h sáng tình duyên', 'Minh nam 05/08/1988 17h30 công việc', 'Hoa nữ 15/05/1990 tài lộc', 'Tuấn nam 20/11/2000 tổng quan'];
const MAU_CAU_HOI = ['Tôi có nên đổi việc năm nay không?', 'Chuyện tình cảm của tôi sắp tới thế nào?'];
/** Khung cú pháp hiện trên màn hình live cho khán giả đọc, và các ô mẫu để bấm điền nhanh cho người phát. */
function veCuPhap() {
  const hoi = laTabHoi();
  const mau = hoi ? MAU_CAU_HOI : MAU_BINH_LUAN;
  $('liveCuPhap').innerHTML = hoi
    ? `<b>Gõ bình luận để ${tab === 'kinhdich' ? 'gieo quẻ' : 'rút bài'}</b><p>Viết câu hỏi của bạn, càng cụ thể càng tốt.</p><p class="vd">${esc(mau[0])}</p>`
    : `<b>Gõ bình luận để xem lá số</b><p><span>Tên</span> · <span>nam/nữ</span> · <span>ngày/tháng/năm dương lịch</span> · <span>giờ sinh</span> · <span>chủ đề</span></p><p class="vd">${esc(mau[0])}</p><small>Chủ đề: tổng quan, tình duyên, công việc, tài lộc. Không rõ giờ sinh thì bỏ qua.</small>`;
  $('liveMau').innerHTML = `<span class="mo">Cú pháp mẫu:</span>${mau.map((m) => `<button class="mau" data-mau="${esc(m)}">${esc(m)}</button>`).join('')}`;
}

function veThanhLive() {
  document.querySelectorAll<HTMLElement>('#liveTab button').forEach((b) => b.classList.toggle('bat', b.dataset.tab === tab));
  document.querySelectorAll<HTMLElement>('#liveChu button').forEach((b) => b.classList.toggle('bat', b.dataset.chu === chuDeLive));
  $('liveChu').classList.toggle('an', laTabHoi());
  $<HTMLInputElement>('liveNhanh').placeholder = tab === 'kinhdich' ? 'Gõ câu hỏi của bạn rồi Enter để gieo quẻ' : tab === 'tarot' ? 'Gõ câu hỏi của bạn rồi Enter để rút ba lá' : 'Dán bình luận: Lan nữ 12/03/1995 7h sáng (dương lịch)';
  veCuPhap(); capNhatHieu();
}
function capNhatHieu() {
  const o = $('liveHieu');
  if (laTabHoi()) { o.textContent = ''; return; }
  const n = phanTichNhanh($<HTMLInputElement>('liveNhanh').value);
  o.textContent = n.ngay ? `→ ${dinhDangNgay(n)} · ${n.gio ? `${String(n.gio.h).padStart(2, '0')}:${String(n.gio.p).padStart(2, '0')}` : 'chưa rõ giờ (lấy 12:00)'} · ${n.gioiTinh === 'nu' ? 'Nữ' : n.gioiTinh === 'nam' ? 'Nam' : 'giới tính giữ như cũ'}${n.ten ? ' · ' + n.ten : ''} · chủ đề: ${n.chuDe ?? chuDeLive}` : '';
}
function hienThanhLive() {
  $('liveBar').classList.remove('mo-di');
  clearTimeout(tdAn);
  tdAn = window.setTimeout(() => { if (dangLive && document.activeElement !== $('liveNhanh')) $('liveBar').classList.add('mo-di'); }, 6000);
}
function veTieuDeLive(tieuDe?: string, phu?: string) {
  const o = $('liveTieuDe');
  if (!tieuDe) { o.classList.add('an'); return; }
  o.innerHTML = `<b>${esc(tieuDe)}</b>${phu ? `<small>${esc(phu)}</small>` : ''}`; o.classList.remove('an');
}
function datCheDoLive(b: boolean) {
  dangLive = b;
  document.body.classList.toggle('live', b);
  for (const id of ['liveBar', 'phuDe', 'liveCuPhap']) $(id).classList.toggle('an', !b);
  if (!b) { luotLive++; khoaLive(false); $('liveTieuDe').classList.add('an'); phuDe.dung(); veTinNhan(); }
  canh.datLech(b ? 0 : (384 - 318) / 2, b ? 0 : -20);
  try { if (b) void document.documentElement.requestFullscreen?.().catch(() => undefined); else if (document.fullscreenElement) void document.exitFullscreen(); } catch { /* không bật được toàn màn hình */ }
  if (b) { veThanhLive(); hienThanhLive(); phuDe.hienTinh(laTabHoi() ? 'Gõ câu hỏi rồi bấm Luận' : 'Dán ngày giờ sinh của bạn vào ô phía trên'); $('liveNhanh').focus(); }
}
async function luanLive(cauHoi: string, ten: string, tok: number) {
  const d = duLieuTab();
  if (!d) { phuDe.hienTinh('Chưa có dữ liệu để luận.', 'loi'); return; }
  st.dangGoi = true; $<HTMLButtonElement>('liveChay').disabled = true;
  phuDe.hienTinh(`Đang xem ${TEN_MON[tab].toLowerCase()}${ten ? ' cho ' + ten : ''}…`);
  let van = '';
  try {
    const kq = await goi('luan', { ...d, cauHoi: cauHoi + DINH_DANG_LIVE, hoiDap: [], hoSo: ten ? `Tên: ${ten}` : undefined });
    van = kq.vanBan;
    st.hoiDap[khoa()] = { cauDau: cauHoi, luot: [{ vai: 'assistant', noiDung: van }] };
  } catch (e) { phuDe.hienTinh(`Không gọi được AI: ${(e as Error).message}`, 'loi'); }
  finally { st.dangGoi = false; $<HTMLButtonElement>('liveChay').disabled = false; }
  if (van && tok === luotLive) await phuDe.chay(van);
}
async function chayLive() {
  if (st.dangGoi || banLive) return;
  const tok = ++luotLive;
  khoaLive(true);
  let xong = false;
  try { xong = await chayLiveTrong(tok); }
  finally {
    if (tok === luotLive) { khoaLive(false); if (xong) $<HTMLInputElement>('liveNhanh').value = ''; capNhatHieu(); hienThanhLive(); $('liveNhanh').focus(); }
  }
}
async function chayLiveTrong(tok: number): Promise<boolean> {
  const chuoi = $<HTMLInputElement>('liveNhanh').value.trim();
  let cauHoi: string, ten = '';
  try {
    if (laTabHoi()) {
      if (!chuoi) { phuDe.hienTinh('Hãy gõ câu hỏi của bạn rồi bấm Luận.', 'loi'); return false; }
      $<HTMLTextAreaElement>('cauhoi').value = chuoi;
      if (tab === 'kinhdich') await gieoQue('xu'); else await rutBai('ba-la');
      cauHoi = chuoi; veTieuDeLive(tab === 'tarot' ? 'Trải bài tarot' : 'Quẻ Kinh Dịch', chuoi);
    } else {
      const n = phanTichNhanh(chuoi);
      if (!n.ngay) { phuDe.hienTinh('Chưa đọc được ngày sinh. Ví dụ: Lan nữ 12/03/1995 7h sáng', 'loi'); return false; }
      ten = n.ten;
      khoaLive(true, `Đang luận cho ${ten || 'khách'}… chờ xong mới nhập người tiếp theo.`);
      if (n.chuDe) { chuDeLive = n.chuDe; veThanhLive(); }
      $<HTMLInputElement>('ngay').value = `${n.ngay.y}-${String(n.ngay.m).padStart(2, '0')}-${String(n.ngay.d).padStart(2, '0')}`;
      $<HTMLInputElement>('gio').value = n.gio ? `${String(n.gio.h).padStart(2, '0')}:${String(n.gio.p).padStart(2, '0')}` : '12:00';
      if (n.gioiTinh) $<HTMLSelectElement>('gioitinh').value = n.gioiTinh;
      $<HTMLInputElement>('ten').value = ten;
      st.hoSo = undefined;
      phuDe.hienTinh('Đang lập lá số…');
      await lapLaSo();
      if (!st.hoSo) { phuDe.hienTinh('Không lập được lá số. Kiểm tra lại ngày giờ sinh.', 'loi'); return false; }
      cauHoi = CHU_DE[chuDeLive] + (n.gio ? '' : ' Chưa rõ giờ sinh nên đừng khẳng định các chi tiết phụ thuộc giờ.');
      const gt = $<HTMLSelectElement>('gioitinh').value === 'nu' ? 'Nữ' : 'Nam';
      veTieuDeLive(ten ? `Lá số của ${ten}` : 'Lá số', `${TEN_MON[tab]} · ${gt} · ${dinhDangNgay(n)}${n.gio ? '' : ' · chưa rõ giờ'}`);
    }
  } catch (e) { phuDe.hienTinh(`Lỗi: ${(e as Error).message}`, 'loi'); return false; }
  await luanLive(cauHoi, ten, tok);
  return tok === luotLive;
}
$('nutLive').addEventListener('click', () => datCheDoLive(true));
$('liveThoat').addEventListener('click', () => datCheDoLive(false));
$('liveChay').addEventListener('click', () => void chayLive());
$('liveNhanh').addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') void chayLive(); });
$('liveNhanh').addEventListener('input', capNhatHieu);
$('liveTab').addEventListener('click', (e) => { if (banLive) return; const b = (e.target as HTMLElement).closest<HTMLElement>('button'); if (!b) return; phuDe.dung(); doiTab(b.dataset.tab as Tab); veThanhLive(); veTieuDeLive(); phuDe.hienTinh(laTabHoi() ? 'Gõ câu hỏi rồi bấm Luận' : 'Dán ngày giờ sinh của bạn vào ô phía trên'); });
$('liveDung').addEventListener('click', () => { luotLive++; phuDe.dung(); khoaLive(false); veTieuDeLive(); capNhatHieu(); phuDe.hienTinh('Đã dừng. Có thể nhập người tiếp theo.'); });
$('liveMau').addEventListener('click', (e) => { if (banLive) return; const b = (e.target as HTMLElement).closest<HTMLElement>('button.mau'); if (!b) return; $<HTMLInputElement>('liveNhanh').value = b.dataset.mau ?? ''; capNhatHieu(); $('liveNhanh').focus(); });
$('liveChu').addEventListener('click', (e) => { if (banLive) return; const b = (e.target as HTMLElement).closest<HTMLElement>('button'); if (b?.dataset.chu) { chuDeLive = b.dataset.chu; veThanhLive(); } });
$('liveTocDo').addEventListener('click', () => { phuDe.tocDo = phuDe.tocDo === 1 ? 1.25 : phuDe.tocDo === 1.25 ? 0.8 : 1; $('liveTocDo').textContent = `Tốc độ ${String(phuDe.tocDo).replace('.', ',')}×`; });
$('liveDoc').addEventListener('click', () => {
  if (!phuDe.docTo && !(window.speechSynthesis?.getVoices() ?? []).some((v) => v.lang.toLowerCase().startsWith('vi'))) { $('liveHieu').textContent = 'Máy chưa có giọng đọc tiếng Việt (Windows: Cài đặt > Giờ & ngôn ngữ > Giọng nói).'; return; }
  phuDe.docTo = !phuDe.docTo; $('liveDoc').textContent = `Đọc: ${phuDe.docTo ? 'bật' : 'tắt'}`;
});
document.addEventListener('mousemove', () => { if (dangLive) hienThanhLive(); });
document.addEventListener('keydown', (e) => {
  if (!dangLive) return;
  hienThanhLive();
  if (e.key === 'Escape' && !document.fullscreenElement) datCheDoLive(false);
});

ganGioiThieu();

(async () => {
  try { diaDiem = await goi('diaDiem'); $('noisinh').innerHTML = diaDiem.map((d, i) => `<option value="${i}">${esc(d.ten)}</option>`).join(''); }  catch { /* chạy ngoài Electron */ }
  { const hp = diaDiem.findIndex((x) => x.ten === 'Hải Phòng'); if (hp >= 0) $<HTMLSelectElement>('noisinh').value = String(hp); } // mặc định khi chưa có hồ sơ đã lưu
  khoiPhucHoSo();
  doiTab('tuvi');
  // Mở app là có sẵn lá số mẫu (đúng dữ liệu đã điền trong form) để màn hình không bao giờ trống.
  $<HTMLInputElement>('ten').value = 'Bùi Hải Long';
  void lapLaSo();
  capNhatTrangThai();
  try { hienQuanTri(await goi('docCauHinh')); } catch { /* ngoài Electron */ }
})();

/** Móc kiểm thử: tự thao tác để chụp màn hình. */
window.__thu = async (b: string) => {
  try {
    if (b === 'gioithieu') { console.log('[thu] xong ' + b); return; }
    if (b === 'gioithieu-play') {
      const v = $<HTMLVideoElement>('videoGioiThieu'); $('nutXemGioiThieu').click(); await new Promise((r) => setTimeout(r, 2500));
      console.log(`[thu] video: paused=${v.paused} t=${v.currentTime.toFixed(2)} dur=${v.duration} muted=${v.muted} vol=${v.volume} err=${v.error?.code ?? 0} audio=${(v as any).webkitAudioDecodedByteCount ?? 'n/a'}`);
      $('nutBoQuaGioiThieu').click(); console.log('[thu] overlay an=' + $('gioiThieu').classList.contains('an')); return;
    }
    $('gioiThieu').classList.add('an');
    if (dangLive && b !== 'live') datCheDoLive(false);
    for (const id of ['caidat', 'hopQuanTri', 'hopChiaSe', 'hopDangNhap']) $(id).classList.add('an');
    if (!st.hoSo) await lapLaSo();
    $<HTMLTextAreaElement>('cauhoi').value = 'Có nên đổi việc trong năm nay?';
    if (b === 'tuvi') doiTab('tuvi');
    else if (b === 'tuvi-chon') { doiTab('tuvi'); manTv?.chonCung('Mệnh'); }
    else if (b === 'batu' || b === 'chiemtinh') doiTab(b);
    else if (b.startsWith('cuon-')) { const [, t, y] = b.split('-'); doiTab(t as Tab); await new Promise((r) => setTimeout(r, 800)); $('chitiet').scrollTop = Number(y); }
    else if (b === 'phongthuy') { doiTab('phongthuy'); $<HTMLInputElement>('huongNha').value = '187'; $<HTMLSelectElement>('loaiViec').value = 'nhap-trach'; await xemPhongThuy(); }
    else if (b === 'kinhdich') { doiTab('kinhdich'); await gieoQue('xu'); }
    else if (b === 'tarot') { doiTab('tarot'); await rutBai('ba-la'); }
    else if (b === 'tarot-celtic') { doiTab('tarot'); await rutBai('celtic-cross'); }
    else if (b === 'live') {
      doiTab('tuvi'); datCheDoLive(true);
      $<HTMLInputElement>('liveNhanh').value = 'Lan nữ 12/03/1995 7h sáng'; capNhatHieu();
      $('liveNhanh').blur();
      $('liveBar').classList.remove('mo-di');
      const n = phanTichNhanh('Lan nữ 12/03/1995 7h sáng');
      $<HTMLInputElement>('ngay').value = '1995-03-12'; $<HTMLInputElement>('gio').value = '07:00'; $<HTMLSelectElement>('gioitinh').value = 'nu'; $<HTMLInputElement>('ten').value = n.ten;
      st.hoSo = undefined; await lapLaSo(); veTieuDeLive('Lá số của Lan', `Tử vi · Nữ · ${dinhDangNgay(n)}`);
      void phuDe.chay('Chào Lan, lá số của bạn cho thấy một người sống nội tâm nhưng rất có chính kiến. Năm nay công việc có cơ hội mở ra nếu bạn chủ động nói ra mong muốn của mình. Về tình duyên, hãy cởi mở hơn một chút, đừng giữ mọi thứ trong lòng. Đây là luận giải tham khảo.');
      hienThanhLive(); await new Promise((r) => setTimeout(r, 1500));
    }
    else if (b === 'cho') { doiTab('kinhdich'); }
    else if (b === 'caidat') { $('nutCaiDat').click(); await new Promise((r) => setTimeout(r, 400)); $<HTMLSelectElement>('nhaCungCap').value = 'meta'; hienOKhoa(); }
    else if (b === 'qt-sai' || b === 'quantri') {
      $('hopQuanTri').classList.add('an'); $('nutQuanTri').click(); await new Promise((r) => setTimeout(r, 500));
      if (!$('hopDangNhap').classList.contains('an')) { $<HTMLInputElement>('qtId').value = 'admin'; $<HTMLInputElement>('qtMatKhau').value = b === 'qt-sai' ? 'sai-mat-khau' : '0901424238'; $('nutDangNhapQt').click(); }
      await new Promise((r) => setTimeout(r, 1500));
    }
    else if (b === 'chiase') { doiTab('tuvi'); $('nutChiaSe').click(); }
    console.log('[thu] xong ' + b);
  } catch (e) { console.error('[thu] lỗi ' + b + ': ' + (e as Error).stack); }
};
