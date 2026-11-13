import { astro } from 'iztro';
import { Solar } from 'lunar-typescript';
import type { ThongTinSinh } from '../types.js';
import { chuanHoa } from '../lich/thoi-gian.js';
import { duongSangAm, type NgayAm } from '../lich/amlich-viet.js';
import { CAN, CHI } from '../lich/canchi.js';

export interface Sao { ten: string; loai: string; doSang?: string; tuHoa?: string }
export interface CungIztro {
  ten: string;
  can: string;
  chi: string;
  laCungThan: boolean;
  chinhTinh: Sao[];
  phuTinh: Sao[];
  tapTinh: Sao[];
  truongSinh: string;
  bacSi: string;
  daiHan: [number, number];
  tieuHanTuoi: number[];
}
export interface LaSoTuViIztro {
  loai: 'tu-vi';
  gioiTinh: string;
  duongLich: string;
  amLich: NgayAm & { canChiNam: string };
  gioSinh: string;
  cuc: string;
  menhChu: string;
  thanChu: string;
  cungMenhTai: string;
  cungThanTai: string;
  cung: CungIztro[];
  ghiChu: string[];
}

const sao = (s: any): Sao => ({ ten: s.name, loai: s.type, ...(s.brightness ? { doSang: s.brightness } : {}), ...(s.mutagen ? { tuHoa: s.mutagen } : {}) });

export function lapTuViIztro(t: ThongTinSinh): LaSoTuViIztro {
  const tg = chuanHoa(t);
  const g = tg.gioDiaPhuong;
  const ghiChu: string[] = [];
  const tyMuon = t.tyMuon ?? 'homSau';

  // Tử vi tính năm theo Tết âm lịch (không theo Lập Xuân).
  astro.config({ yearDivide: 'normal', horoscopeDivide: 'normal', dayDivide: tyMuon === 'homSau' ? 'forward' : 'current' });

  const timeIndex = g.gio === 23 ? 12 : Math.floor((g.gio + 1) / 2);
  const gender = t.gioiTinh === 'nam' ? '男' : '女';
  const duongLich = `${g.nam}-${g.thang}-${g.ngay}`;

  // So âm lịch Việt Nam (+7) với âm lịch Trung Quốc (+8) mà thư viện dùng.
  const viet = duongSangAm(g.ngay, g.thang, g.nam, 7);
  const trung = Solar.fromYmd(g.nam, g.thang, g.ngay).getLunar();
  const trungNhuan = trung.getMonth() < 0;
  const giongNhau = viet.ngay === trung.getDay() && viet.thang === Math.abs(trung.getMonth()) && viet.nam === trung.getYear() && viet.nhuan === trungNhuan;

  let a: any;
  if (giongNhau) {
    a = astro.bySolar(duongLich, timeIndex, gender, true, 'vi-VN');
  } else {
    // Lịch Việt lệch lịch Trung: an sao theo ngày âm lịch Việt Nam.
    let thang = viet.thang;
    if (viet.nhuan && viet.ngay > 15) thang = thang === 12 ? 12 : thang + 1; // tháng nhuận: nửa sau tính sang tháng kế
    a = astro.byLunar(`${viet.nam}-${thang}-${viet.ngay}`, timeIndex, gender, false, true, 'vi-VN');
    ghiChu.push(`Ngày này âm lịch Việt Nam (${viet.ngay}/${viet.thang}${viet.nhuan ? ' nhuận' : ''}/${viet.nam}) khác âm lịch Trung Quốc (${trung.getDay()}/${Math.abs(trung.getMonth())}/${trung.getYear()}); lá số an theo lịch Việt Nam.`);
    const kq = a.rawDates.lunarDate;
    if (kq.lunarDay !== viet.ngay || kq.lunarMonth !== thang) ghiChu.push('CẢNH BÁO: thư viện không nhận đúng ngày âm lịch Việt Nam, cần kiểm tra tay lá số này.');
  }
  if (tg.dieuChinhPhut) ghiChu.push(`Đã quy về giờ mặt trời thực: ${tg.dieuChinhPhut > 0 ? '+' : ''}${tg.dieuChinhPhut} phút.`);
  if (g.gio === 23) ghiChu.push(`Sinh giờ Tý muộn (23h): tính theo ${tyMuon === 'homSau' ? 'ngày hôm sau' : 'ngày hiện tại'}.`);

  const namAm = viet.nam;
  const canChiNam = `${CAN[(namAm + 6) % 10]} ${CHI[(namAm + 8) % 12]}`;

  return {
    loai: 'tu-vi',
    gioiTinh: a.gender,
    duongLich,
    amLich: { ...viet, canChiNam },
    gioSinh: `${a.time} (${a.timeRange})`,
    cuc: a.fiveElementsClass,
    menhChu: a.soul,
    thanChu: a.body,
    cungMenhTai: a.earthlyBranchOfSoulPalace,
    cungThanTai: a.earthlyBranchOfBodyPalace,
    cung: a.palaces.map((p: any): CungIztro => ({
      ten: p.name,
      can: p.heavenlyStem,
      chi: p.earthlyBranch,
      laCungThan: p.isBodyPalace,
      chinhTinh: p.majorStars.map(sao),
      phuTinh: p.minorStars.map(sao),
      tapTinh: p.adjectiveStars.map(sao),
      truongSinh: p.changsheng12,
      bacSi: p.boshi12,
      daiHan: p.decadal.range,
      tieuHanTuoi: p.ages,
    })),
    ghiChu,
  };
}
