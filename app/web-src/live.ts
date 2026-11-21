/* Chế độ Live: đọc nhanh bình luận (ngày giờ sinh) và phụ đề lời luận. Không tính toán tử vi ở đây. */

export interface NhanhKq {
  ngay?: { d: number; m: number; y: number };
  gio?: { h: number; p: number };
  gioiTinh?: 'nam' | 'nu';
  /** Chủ đề khách hỏi, nhận từ bình luận (khớp khóa CHU_DE trong main.ts). */
  chuDe?: 'Tổng quan' | 'Tình duyên' | 'Công việc' | 'Tài lộc';
  ten: string;
}

/** Các cụm từ nhận chủ đề. Không dùng từ đơn dễ trùng tên người (Duyên, Tiền...). */
const CHU_DE_TU: [NonNullable<NhanhKq['chuDe']>, string][] = [
  ['Tình duyên', 'tình duyên|tinh duyen|tình yêu|tinh yeu|người yêu|nguoi yeu|hôn nhân|hon nhan|yêu đương|yeu duong|vợ chồng|vo chong|chuyện tình|chuyen tinh|lấy chồng|lay chong|lấy vợ|lay vo'],
  ['Công việc', 'công việc|cong viec|sự nghiệp|su nghiep|nghề nghiệp|nghe nghiep|thăng tiến|thang tien|việc làm|viec lam|kinh doanh|đổi việc|doi viec|xin việc|xin viec'],
  ['Tài lộc', 'tài lộc|tai loc|tiền bạc|tien bac|tài chính|tai chinh|làm giàu|lam giau|tiền tài|tien tai|đầu tư|dau tu'],
  ['Tổng quan', 'tổng quan|tong quan|tử vi|tu vi|bát tự|bat tu|vận mệnh|van menh|cuộc đời|cuoc doi|năm nay|nam nay'],
];

const CHU = '\\p{L}';
const tu = (s: string, g = '') => new RegExp(`(?<![${CHU}])(?:${s})(?![${CHU}])`, 'iu' + g);

/** Đọc một dòng tự do, ví dụ "Lan nữ 12/03/1995 7h sáng" hoặc "ngày 5 tháng 8 năm 1988 lúc 21:30 nam". Ngày là dương lịch. */
export function phanTichNhanh(vao: string): NhanhKq {
  let con = ' ' + vao.normalize('NFC') + ' ';
  const kq: NhanhKq = { ten: '' };

  // Chủ đề: tìm rồi bỏ khỏi chuỗi để không lẫn vào tên.
  for (const [chu, tuKhoa] of CHU_DE_TU) {
    const re = tu(tuKhoa, 'g');
    if (re.test(con)) { kq.chuDe ??= chu; con = con.replace(tu(tuKhoa, 'g'), ' '); }
  }
  const iso = con.match(/(?<!\d)(\d{4})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{1,2})(?!\d)/);
  if (iso && Number(iso[2]) <= 12 && Number(iso[3]) <= 31) con = con.replace(iso[0], ` ${iso[3]}/${iso[2]}/${iso[1]} `);

  let m = con.match(/(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{4}|\d{2})(?!\d)/) ?? con.match(new RegExp(`(\\d{1,2})\\s*(?:tháng|thang|th)\\s*(\\d{1,2})\\s*(?:năm|nam|n)\\s*(\\d{4})(?!\\d)`, 'iu')) ?? con.match(/(?<!\d)(\d{2})(\d{2})(\d{4})(?!\d)/);
  if (m) {
    const d = Number(m[1]), mo = Number(m[2]);
    let y = Number(m[3]);
    if (m[3].length === 2) y = y <= 26 ? 2000 + y : 1900 + y;
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 1900 && y <= 2035) { kq.ngay = { d, m: mo, y }; con = con.replace(m[0], ' '); }
  }

  const t = con.match(/(?<!\d)(\d{1,2})\s*(?:h|giờ|gio|:)\s*(\d{1,2})?(?!\d)\s*(?:p|phút|phut)?/iu);
  if (t) {
    let h = Number(t[1]);
    const p = t[2] ? Number(t[2]) : 0;
    const chieuToi = tu('chiều|chieu|tối|toi').test(con), dem = tu('đêm|dem|khuya').test(con), trua = tu('trưa|trua').test(con);
    if (chieuToi && h < 12) h += 12;
    else if (dem) { if (h === 12) h = 0; else if (h >= 6 && h < 12) h += 12; }
    else if (trua && h >= 1 && h <= 4) h += 12;
    if (h <= 23 && p <= 59) { kq.gio = { h, p }; con = con.replace(t[0], ' '); }
  }
  con = con.replace(tu('sáng|sang|trưa|trua|chiều|chieu|tối|toi|đêm|dem|khuya', 'g'), ' ');

  if (tu('nữ|nu|gái|gai|female').test(con)) { kq.gioiTinh = 'nu'; con = con.replace(tu('nữ|nu|gái|gai|female'), ' '); }
  else if (tu('nam|trai|male').test(con)) { kq.gioiTinh = 'nam'; con = con.replace(tu('nam|trai|male'), ' '); }

  kq.ten = con.replace(tu('sinh|ngày|ngay|lúc|luc|giờ|gio|tháng|thang|năm|dương lịch|duong lich|dl|là|xem|giúp|giup|tên|cho|mình|ơi|nhé|nhe|nha|ạ|về|luận|luan|xin|ad|admin|thầy|thay|bói|boi|nhờ|nho|lá số|la so', 'g'), ' ')
    .replace(/[\d/\-.:,;!?()]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
  return kq;
}

export const dinhDangNgay = (n: NhanhKq) => (n.ngay ? `${String(n.ngay.d).padStart(2, '0')}/${String(n.ngay.m).padStart(2, '0')}/${n.ngay.y}` : '');

/* ---------- Phụ đề ---------- */
export function lamSachVan(s: string): string {
  return s.replace(/\*\*|__|`/g, '').replace(/^\s*#{1,6}\s+/gm, '').replace(/^\s*[-•*]\s+/gm, '').replace(/\*(.+?)\*/g, '$1').replace(/[ \t]+/g, ' ').trim();
}

/** Cắt lời luận thành các đoạn ngắn (tối đa ~90 ký tự) để hiện lần lượt như phụ đề. */
export function chiaDoan(van: string, toiDa = 90): string[] {
  const cat = (s: string): string[] => {
    if (s.length <= toiDa + 20) return [s];
    const dau = [...s.matchAll(/[,;:]\s/g)].map((x) => x.index! + 1);
    const giua = s.length / 2;
    let k: number;
    if (dau.length) k = dau.reduce((a, b) => (Math.abs(b - giua) < Math.abs(a - giua) ? b : a));
    else { const sp = s.lastIndexOf(' ', Math.floor(giua)); k = sp > 0 ? sp : Math.floor(giua); }
    return [...cat(s.slice(0, k).trim()), ...cat(s.slice(k).trim())].filter(Boolean);
  };
  const cau = lamSachVan(van).split(/\n+/).flatMap((d) => d.split(/(?<=[.!?…])\s+/)).map((s) => s.trim().replace(/^[-•*]\s+/, '')).filter(Boolean);
  const ra: string[] = [];
  for (const c of cau.flatMap(cat)) {
    const cuoi = ra.at(-1);
    if (cuoi && (cuoi + ' ' + c).length <= toiDa) ra[ra.length - 1] = cuoi + ' ' + c; else ra.push(c);
  }
  return ra;
}

/** Tách lời luận thành từng câu để đọc và hiện lần lượt. Câu quá dài thì cắt ở dấu phẩy. */
export const chiaCau = (van: string): string[] => chiaDoan(van, 130).flatMap((d) => d.split(/(?<=[.!?…])\s+/)).map((x) => x.trim()).filter(Boolean);

const nghi = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const NGHI_GIUA_CAU = 750;

/** Khung lời luận bên phải: mỗi câu hiện ra rồi mới đọc, nghỉ một nhịp giữa các câu. */
export class PhuDe {
  docTo = false;
  tocDo = 1;
  private phien = 0;
  private readonly than: HTMLElement;
  constructor(el: HTMLElement) { this.than = el.querySelector('.pd-than')!; }

  /** Hiện một dòng cố định (đang chờ, lỗi, hướng dẫn). */
  hienTinh(text: string, loai = '') {
    this.phien++; this.dung1();
    this.than.innerHTML = '';
    const p = document.createElement('p'); p.className = 'tinh ' + loai; p.textContent = text;
    this.than.append(p);
  }
  private dung1() { try { window.speechSynthesis?.cancel(); } catch { /* không có giọng đọc */ } }
  dung() { this.phien++; this.dung1(); this.than.innerHTML = ''; }

  private doc(d: string): Promise<void> {
    return new Promise((xong) => {
      try {
        const u = new SpeechSynthesisUtterance(d);
        u.lang = 'vi-VN'; u.rate = this.tocDo;
        const v = speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith('vi'));
        if (v) u.voice = v;
        u.onend = u.onerror = () => xong();
        speechSynthesis.speak(u);
      } catch { xong(); }
    });
  }

  /** Hiện và đọc từng câu; gọi lại hoặc dung() sẽ dừng lượt cũ. Trả về khi đã đọc xong câu cuối. */
  async chay(van: string): Promise<void> {
    const p = ++this.phien;
    this.dung1();
    this.than.innerHTML = '';
    const doan = document.createElement('p'); doan.className = 'luan'; this.than.append(doan);
    let truoc: HTMLElement | undefined;
    for (const c of chiaCau(van)) {
      if (p !== this.phien) return;
      truoc?.classList.remove('dang');
      const sp = document.createElement('span'); sp.className = 'c dang'; sp.textContent = c + ' ';
      doan.append(sp); truoc = sp;
      requestAnimationFrame(() => sp.classList.add('hien'));
      this.than.scrollTo({ top: this.than.scrollHeight, behavior: 'smooth' });
      const ms = Math.max(1800, c.length * 58) / this.tocDo;
      if (this.docTo) await Promise.race([this.doc(c), nghi(ms * 2.5)]); else await nghi(ms);
      if (p !== this.phien) return;
      await nghi(NGHI_GIUA_CAU / this.tocDo);
    }
    if (p === this.phien) truoc?.classList.remove('dang');
  }
}
