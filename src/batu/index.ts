import { Solar } from 'lunar-typescript';
import type { ThongTinSinh } from '../types.js';
import { chuanHoa, type GioTuong } from '../lich/thoi-gian.js';
import { duongSangAm } from '../lich/amlich-viet.js';
import {
  CAN, CHI, NGU_HANH, type CanChi, type NguHanh, amDuongCuaCan, hanhCuaCan, hanhCuaChi,
  napAm, tangCan, tenCanChi, thapThan, tuChuHan,
} from '../lich/canchi.js';

const TIET_KHI: Record<string, string> = {
  立春: 'Lập Xuân', 雨水: 'Vũ Thủy', 惊蛰: 'Kinh Trập', 春分: 'Xuân Phân', 清明: 'Thanh Minh', 谷雨: 'Cốc Vũ',
  立夏: 'Lập Hạ', 小满: 'Tiểu Mãn', 芒种: 'Mang Chủng', 夏至: 'Hạ Chí', 小暑: 'Tiểu Thử', 大暑: 'Đại Thử',
  立秋: 'Lập Thu', 处暑: 'Xử Thử', 白露: 'Bạch Lộ', 秋分: 'Thu Phân', 寒露: 'Hàn Lộ', 霜降: 'Sương Giáng',
  立冬: 'Lập Đông', 小雪: 'Tiểu Tuyết', 大雪: 'Đại Tuyết', 冬至: 'Đông Chí', 小寒: 'Tiểu Hàn', 大寒: 'Đại Hàn',
};

export interface Tru {
  ten: string;
  can: string;
  chi: string;
  hanhCan: NguHanh;
  hanhChi: NguHanh;
  napAm: string;
  /** Thập thần của thiên can so với nhật chủ ("Nhật Chủ" ở trụ ngày). */
  thapThan: string;
  tangCan: { can: string; hanh: NguHanh; thapThan: string }[];
}

export interface DaiVan { tuoiBatDau: number; tuoiKetThuc: number; namBatDau: number; canChi: string; thapThan: string }

export interface LaSoBatTu {
  loai: 'bat-tu';
  tuTru: { nam: Tru; thang: Tru; ngay: Tru; gio: Tru };
  nhatChu: { can: string; hanh: NguHanh; amDuong: string };
  /** Đếm ngũ hành trên 8 chữ (4 can + 4 chi, tính bản khí của chi). */
  nguHanh: Record<NguHanh, number>;
  /** Đếm ngũ hành tính cả tàng can. */
  nguHanhCoTangCan: Record<NguHanh, number>;
  hanhThieu: NguHanh[];
  tietKhi: string;
  amLich: { ngay: number; thang: number; nam: number; nhuan: boolean };
  daiVan: { khoiVanSau: string; thuan: boolean; danhSach: DaiVan[] };
  ghiChu: string[];
}

const solar = (g: GioTuong) => Solar.fromYmdHms(g.nam, g.thang, g.ngay, g.gio, g.phut, 0);

function taoTru(cc: CanChi, nhatChu: number, laTruNgay = false): Tru {
  return {
    ten: tenCanChi(cc),
    can: CAN[cc.can],
    chi: CHI[cc.chi],
    hanhCan: hanhCuaCan(cc.can),
    hanhChi: hanhCuaChi(cc.chi),
    napAm: napAm(cc),
    thapThan: laTruNgay ? 'Nhật Chủ' : thapThan(nhatChu, cc.can),
    tangCan: tangCan(cc.chi).map((c) => ({ can: CAN[c], hanh: hanhCuaCan(c), thapThan: thapThan(nhatChu, c) })),
  };
}

export function lapBatTu(t: ThongTinSinh): LaSoBatTu {
  const tg = chuanHoa(t);
  const ghiChu: string[] = [];

  // Trụ năm, trụ tháng, đại vận: phụ thuộc thời điểm giao tiết (tuyệt đối) -> dùng giờ Bắc Kinh của thư viện.
  const lunarA = solar(tg.gioBacKinh).getLunar();
  const ecA = lunarA.getEightChar();
  // Trụ ngày, trụ giờ: phụ thuộc giờ tại nơi sinh.
  const ecB = solar(tg.gioDiaPhuong).getLunar().getEightChar();
  ecB.setSect((t.tyMuon ?? 'homSau') === 'homSau' ? 1 : 2);

  const nam = tuChuHan(ecA.getYear());
  const thang = tuChuHan(ecA.getMonth());
  const ngay = tuChuHan(ecB.getDay());
  const gio = tuChuHan(ecB.getTime());
  const nc = ngay.can;

  const tuTru = { nam: taoTru(nam, nc), thang: taoTru(thang, nc), ngay: taoTru(ngay, nc, true), gio: taoTru(gio, nc) };

  const dem = () => Object.fromEntries(NGU_HANH.map((h) => [h, 0])) as Record<NguHanh, number>;
  const nguHanh = dem();
  const nguHanhCoTangCan = dem();
  for (const cc of [nam, thang, ngay, gio]) {
    nguHanh[hanhCuaCan(cc.can)]++;
    nguHanh[hanhCuaChi(cc.chi)]++;
    nguHanhCoTangCan[hanhCuaCan(cc.can)]++;
    for (const c of tangCan(cc.chi)) nguHanhCoTangCan[hanhCuaCan(c)]++;
  }

  const yun = ecA.getYun(t.gioiTinh === 'nam' ? 1 : 0);
  const danhSach: DaiVan[] = yun.getDaYun().filter((d) => d.getGanZhi()).map((d) => {
    const cc = tuChuHan(d.getGanZhi());
    return { tuoiBatDau: d.getStartAge(), tuoiKetThuc: d.getEndAge(), namBatDau: d.getStartYear(), canChi: tenCanChi(cc), thapThan: thapThan(nc, cc.can) };
  });

  if (tg.dieuChinhPhut) ghiChu.push(`Đã quy về giờ mặt trời thực: ${tg.dieuChinhPhut > 0 ? '+' : ''}${tg.dieuChinhPhut} phút.`);
  if (t.gio === 23) ghiChu.push(`Sinh giờ Tý muộn (23h): trụ ngày tính theo ${(t.tyMuon ?? 'homSau') === 'homSau' ? 'ngày hôm sau' : 'ngày hiện tại'}.`);
  const tk = lunarA.getPrevJieQi(false);
  const g = tg.gioDiaPhuong;

  return {
    loai: 'bat-tu',
    tuTru,
    nhatChu: { can: CAN[nc], hanh: hanhCuaCan(nc), amDuong: amDuongCuaCan(nc) },
    nguHanh,
    nguHanhCoTangCan,
    hanhThieu: NGU_HANH.filter((h) => nguHanh[h] === 0),
    tietKhi: TIET_KHI[tk.getName()] ?? tk.getName(),
    amLich: duongSangAm(g.ngay, g.thang, g.nam, 7),
    daiVan: {
      khoiVanSau: `${yun.getStartYear()} năm ${yun.getStartMonth()} tháng ${yun.getStartDay()} ngày`,
      thuan: yun.isForward(),
      danhSach,
    },
    ghiChu,
  };
}
