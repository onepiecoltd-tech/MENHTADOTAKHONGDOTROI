/** Đối chiếu module Nam phái với iztro trên ngày ngẫu nhiên: thống kê tỷ lệ khớp vị trí từng sao trùng tên. */
import { lapTuVi, lapTuViIztro, duongSangAm } from '../src/index.js';
import { Solar } from 'lunar-typescript';
import { taoNgauNhien } from '../src/random.js';

const N = Number(process.argv[2] ?? 3000);
const rnd = taoNgauNhien(2026);
const tk = new Map<string, { khop: number; lech: number; vd?: string }>();
const ghi = (k: string, ok: boolean, vd: string) => {
  const e = tk.get(k) ?? { khop: 0, lech: 0 };
  ok ? e.khop++ : (e.lech++, (e.vd ??= vd));
  tk.set(k, e);
};
const DOI_TEN: Record<string, string> = { 'Thiên Riêu': 'Thiên Diêu', 'Phượng Các': 'Phụng Các', 'Tử Tức': 'Tử Nữ', 'Giải Thần': 'Niên Giải', 'Thai Phụ': 'Đài Phụ', 'Đào Hoa': 'Hàm Trì', 'Bác Sĩ': 'Bác Sỹ', 'Lực Sĩ': 'Lực Sỹ', 'Tràng Sinh': 'Trường Sinh' };
let dem = 0;
const tenIztro = new Set<string>(), tenNam = new Set<string>();
while (dem < N) {
  const nam = 1930 + rnd(100), thang = 1 + rnd(12), ngay = 1 + rnd(28), gio = rnd(23);
  const v = duongSangAm(ngay, thang, nam, 7);
  const l = Solar.fromYmd(nam, thang, ngay).getLunar();
  if (v.ngay !== l.getDay() || v.thang !== Math.abs(l.getMonth()) || v.nam !== l.getYear() || v.nhuan !== l.getMonth() < 0) continue;
  dem++;
  const sinh = { nam, thang, ngay, gio, gioiTinh: rnd(2) ? ('nam' as const) : ('nu' as const) };
  const a = lapTuVi(sinh), b = lapTuViIztro(sinh);
  const vd = `${nam}-${thang}-${ngay} ${gio}h ${sinh.gioiTinh}`;
  const viA = new Map<string, string>(), viB = new Map<string, string>();
  for (const c of a.cung) {
    viA.set(`cung:${DOI_TEN[c.ten] ?? c.ten}`, c.chi);
    viA.set(`can@${c.chi}`, c.can);
    viA.set(`đại hạn@${c.chi}`, c.daiHan.join('-'));
    viA.set(`vòng Tràng Sinh@${c.chi}`, DOI_TEN[c.vongTrangSinh] ?? c.vongTrangSinh);
    viA.set(`vòng Lộc Tồn@${c.chi}`, DOI_TEN[c.vongLocTon] ?? c.vongLocTon);
    for (const s of [...c.chinhTinh, ...c.phuTinh]) { viA.set(DOI_TEN[s.ten] ?? s.ten, c.chi); tenNam.add(s.ten); if (s.tuHoa) viA.set(`hóa:${s.ten}`, s.tuHoa); }
  }
  for (const c of b.cung) {
    viB.set(`cung:${c.ten}`, c.chi);
    viB.set(`can@${c.chi}`, c.can);
    viB.set(`đại hạn@${c.chi}`, c.daiHan.join('-'));
    viB.set(`vòng Tràng Sinh@${c.chi}`, c.truongSinh);
    viB.set(`vòng Lộc Tồn@${c.chi}`, c.bacSi);
    for (const s of [...c.chinhTinh, ...c.phuTinh, ...c.tapTinh]) { viB.set(s.ten, c.chi); tenIztro.add(s.ten); if (s.tuHoa) viB.set(`hóa:${s.ten}`, `Hóa ${s.tuHoa}`); }
  }
  ghi('cục', a.cuc.toLowerCase() === b.cuc.toLowerCase(), vd);
  for (const [k, va] of viA) {
    const key = k.includes('@') ? k.split('@')[0] : k.startsWith('hóa:') ? 'tứ hóa' : k;
    if (viB.has(k)) ghi(key, viB.get(k) === va, `${vd}: nam phái=${va} iztro=${viB.get(k)}`);
    else if (k.startsWith('hóa:')) ghi('tứ hóa', false, `${vd}: ${k}=${va}, iztro không có`);
  }
}
const dong = [...tk].sort((x, y) => y[1].lech - x[1].lech);
console.log(`Đối chiếu ${N} lá số`);
for (const [k, e] of dong) console.log(`${e.lech === 0 ? 'KHỚP ' : 'LỆCH '} ${k.padEnd(18)} ${e.khop}/${e.khop + e.lech}${e.vd ? '   vd ' + e.vd : ''}`);
console.log('\nSao Nam phái không có tên tương ứng trong iztro:', [...tenNam].filter((t) => !tenIztro.has(DOI_TEN[t] ?? t)).join(', '));
console.log('Sao iztro không dùng trong Nam phái:', [...tenIztro].filter((t) => ![...tenNam].some((n) => (DOI_TEN[n] ?? n) === t)).join(', '));
