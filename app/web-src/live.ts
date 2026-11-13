/* Chế độ Live: đọc nhanh bình luận (ngày giờ sinh) và phụ đề lời luận. Không tính toán tử vi ở đây. */

export interface NhanhKq {
  ngay?: { d: number; m: number; y: number };
  gio?: { h: number; p: number };
  gioiTinh?: 'nam' | 'nu';
  ten: string;
}

const CHU = '\\p{L}';
const tu = (s: string, g = '') => new RegExp(`(?<![${CHU}])(?:${s})(?![${CHU}])`, 'iu' + g);

/** Đọc một dòng tự do, ví dụ "Lan nữ 12/03/1995 7h sáng" hoặc "ngày 5 tháng 8 năm 1988 lúc 21:30 nam". Ngày là dương lịch. */
export function phanTichNhanh(vao: string): NhanhKq {
  let con = ' ' + vao.normalize('NFC') + ' ';
  const kq: NhanhKq = { ten: '' };

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

  kq.ten = con.replace(tu('sinh|ngày|ngay|lúc|luc|giờ|gio|tháng|thang|năm|dương lịch|duong lich|dl|là|xem|giúp|giup|tên', 'g'), ' ')
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

const nghi = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class PhuDe {
  docTo = false;
  tocDo = 1;
  private phien = 0;
  private readonly ben: HTMLElement;
  constructor(el: HTMLElement) { this.ben = el.querySelector('span')!; }

  private dat(text: string, loai = '') {
    this.ben.className = loai;
    this.ben.textContent = text;
    void this.ben.offsetWidth; // chạy lại hiệu ứng hiện dần
    this.ben.classList.add('hien');
  }
  /** Hiện một dòng cố định (đang chờ, lỗi, hướng dẫn). */
  hienTinh(text: string, loai = '') { this.phien++; this.dung1(); this.dat(text, loai); }
  private dung1() { try { window.speechSynthesis?.cancel(); } catch { /* không có giọng đọc */ } }
  dung() { this.phien++; this.dung1(); this.ben.className = ''; this.ben.textContent = ''; }

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

  /** Hiện lời luận từng đoạn; gọi lại hoặc dung() sẽ dừng lượt cũ. */
  async chay(van: string): Promise<void> {
    const p = ++this.phien;
    this.dung1();
    for (const d of chiaDoan(van)) {
      if (p !== this.phien) return;
      this.dat(d);
      const ms = Math.max(2200, d.length * 62) / this.tocDo;
      if (this.docTo) await Promise.race([this.doc(d), nghi(ms * 2.5)]); else await nghi(ms);
      if (this.docTo && p === this.phien) await nghi(220);
    }
    if (p !== this.phien) return;
    await nghi(7000);
    if (p === this.phien) this.ben.className = '';
  }
}
