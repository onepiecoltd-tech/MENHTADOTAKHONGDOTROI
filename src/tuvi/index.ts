import type { ThongTinSinh } from '../types.js';
import { chuanHoa, chiGio } from '../lich/thoi-gian.js';
import { duongSangAm, type NgayAm } from '../lich/amlich-viet.js';
import { CAN, CHI } from '../lich/canchi.js';
import { anSao, type KetQuaAnSao } from './an-sao.js';
import { danhCachCuc, type CachCucTuVi } from './cach-cuc.js';

export interface LaSoTuVi extends KetQuaAnSao {
  loai: 'tu-vi';
  phai: 'Tử vi Việt Nam';
  duongLich: string;
  amLich: NgayAm & { canChiNam: string };
  gioSinh: string;
  /** Các cách cục (trong bộ 51 của TuViMCP, Apache-2.0) mà lá số thỏa điều kiện. */
  cachCuc: CachCucTuVi[];
  ghiChu: string[];
}

/** Lập lá số tử vi kiểu Việt Nam (chuẩn đã chốt: giống lá số 1 trong DOI-CHIEU). Âm lịch Việt Nam (+7), đổi năm ở mùng 1 Tết. */
export function lapTuVi(t: ThongTinSinh): LaSoTuVi {
  const tg = chuanHoa(t);
  const g = tg.gioDiaPhuong;
  const ghiChu: string[] = [];
  const tyMuon = t.tyMuon ?? 'homSau';

  // Giờ Tý muộn tính sang ngày hôm sau (mặc định).
  let ngayTinh = new Date(Date.UTC(g.nam, g.thang - 1, g.ngay));
  if (g.gio === 23) {
    if (tyMuon === 'homSau') ngayTinh = new Date(ngayTinh.getTime() + 86400_000);
    ghiChu.push(`Sinh giờ Tý muộn (23h): tính theo ${tyMuon === 'homSau' ? 'ngày hôm sau' : 'ngày hiện tại'}.`);
  }
  const am = duongSangAm(ngayTinh.getUTCDate(), ngayTinh.getUTCMonth() + 1, ngayTinh.getUTCFullYear(), 7);

  // Tháng nhuận: nửa đầu tính theo tháng đó, nửa sau tính sang tháng kế.
  let thang = am.thang;
  if (am.nhuan) {
    if (am.ngay > 15) thang = thang === 12 ? 1 : thang + 1;
    ghiChu.push(`Sinh tháng ${am.thang} nhuận: an sao theo tháng ${thang} (ngày 1–15 tính tháng nhuận, 16 trở đi tính tháng kế).`);
  }
  if (tg.dieuChinhPhut) ghiChu.push(`Đã quy về giờ mặt trời thực: ${tg.dieuChinhPhut > 0 ? '+' : ''}${tg.dieuChinhPhut} phút.`);

  const canNam = (am.nam + 6) % 10;
  const chiNam = (am.nam + 8) % 12;
  const gio = chiGio(g.gio);
  const kq = anSao({ canNam, chiNam, thang, ngay: am.ngay, chiGio: gio, nam: t.gioiTinh === 'nam' });

  const la: LaSoTuVi = {
    loai: 'tu-vi',
    phai: 'Tử vi Việt Nam',
    duongLich: `${g.nam}-${g.thang}-${g.ngay} ${String(g.gio).padStart(2, '0')}:${String(g.phut).padStart(2, '0')}`,
    amLich: { ...am, canChiNam: `${CAN[canNam]} ${CHI[chiNam]}` },
    gioSinh: `giờ ${CHI[gio]}`,
    ...kq,
    cachCuc: [],
    ghiChu,
  };
  la.cachCuc = danhCachCuc(la);
  return la;
}
