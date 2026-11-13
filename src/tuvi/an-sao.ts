import { CAN, CHI, napAm } from '../lich/canchi.js';
import * as B from './bang-nam-phai.js';

export interface DauVaoAnSao {
  canNam: number; // 0-9
  chiNam: number; // 0-11
  thang: number; // tháng âm 1-12
  ngay: number; // ngày âm 1-30
  chiGio: number; // 0-11
  nam: boolean; // giới tính nam
}

export interface SaoChinh { ten: string; doSang: string; tuHoa?: string }
export interface SaoPhu { ten: string; nhom: 'cát tinh' | 'sát tinh' | 'phụ tinh'; tuHoa?: string }
export interface CungTuVi {
  ten: string;
  can: string;
  chi: string;
  laCungThan: boolean;
  chinhTinh: SaoChinh[];
  phuTinh: SaoPhu[];
  vongThaiTue: string;
  vongLocTon: string;
  vongTrangSinh: string;
  tuan: boolean;
  triet: boolean;
  daiHan: [number, number];
  /** Chi của các năm tiểu hạn rơi vào cung này. */
  tieuHan: string;
}
export interface KetQuaAnSao {
  amDuong: string; // vd "Dương Nam"
  thuanNghich: 'Âm dương thuận lý' | 'Âm dương nghịch lý';
  banMenh: string; // nạp âm năm sinh
  cuc: string;
  soCuc: number;
  cungMenhTai: string;
  cungThanTai: string;
  thanCu: string; // Thân cư cung nào
  menhChu: string;
  thanChu: string;
  cung: CungTuVi[]; // theo thứ tự Mệnh, Phụ Mẫu, ...
}

const m12 = (n: number) => ((n % 12) + 12) % 12;

/** Vị trí Tử Vi theo số cục và ngày sinh. */
export function viTriTuVi(soCuc: number, ngay: number): number {
  let x = 0;
  while ((ngay + x) % soCuc !== 0) x++;
  const q = (ngay + x) / soCuc;
  return m12(2 + q - 1 + (x % 2 === 0 ? x : -x));
}

export function anSao(v: DauVaoAnSao): KetQuaAnSao {
  const { canNam, chiNam, thang, ngay, chiGio: gio, nam } = v;
  if (thang < 1 || thang > 12 || ngay < 1 || ngay > 30) throw new Error('Ngày tháng âm lịch không hợp lệ');
  const duong = canNam % 2 === 0;
  const thuan = duong === nam; // dương nam, âm nữ: thuận

  const menh = m12(2 + (thang - 1) - gio);
  const than = m12(2 + (thang - 1) + gio);
  const canDan = ((canNam % 5) * 2 + 2) % 10;
  const canCung = (chi: number) => (canDan + m12(chi - 2)) % 10;
  const hanhMenh = napAm({ can: canCung(menh), chi: menh }).split(' ').pop()!;
  const cuc = B.CUC[hanhMenh];

  const sao: string[][] = Array.from({ length: 12 }, () => []);
  const dat = (ten: string, chi: number) => sao[m12(chi)].push(ten);
  const viTri = (ten: string) => sao.findIndex((s) => s.includes(ten));

  // 14 chính tinh
  const tuVi = viTriTuVi(cuc.so, ngay);
  const thienPhu = m12(4 - tuVi);
  const chinh: string[][] = Array.from({ length: 12 }, () => []);
  for (const [ten, d] of B.NHOM_TU_VI) chinh[m12(tuVi + d)].push(ten);
  for (const [ten, d] of B.NHOM_THIEN_PHU) chinh[m12(thienPhu + d)].push(ten);

  // Theo giờ
  const xuong = m12(10 - gio), khuc = m12(4 + gio);
  dat('Văn Xương', xuong); dat('Văn Khúc', khuc);
  dat('Địa Kiếp', 11 + gio); dat('Địa Không', 11 - gio);
  dat('Thai Phụ', khuc + 2); dat('Phong Cáo', khuc - 2);
  const t4 = chiNam % 4;
  dat('Hỏa Tinh', B.KHOI_HOA[t4] + (thuan ? gio : -gio));
  dat('Linh Tinh', B.KHOI_LINH[t4] + (thuan ? -gio : gio));

  // Theo tháng
  const ta = m12(4 + thang - 1), huu = m12(10 - (thang - 1));
  dat('Tả Phù', ta); dat('Hữu Bật', huu);
  dat('Thiên Hình', 9 + thang - 1); dat('Thiên Riêu', 1 + thang - 1); dat('Thiên Y', 1 + thang - 1);
  dat('Thiên Giải', 8 + thang - 1); dat('Địa Giải', 7 + thang - 1);

  // Theo ngày
  dat('Tam Thai', ta + ngay - 1); dat('Bát Tọa', huu - (ngay - 1));
  dat('Ân Quang', xuong + ngay - 2); dat('Thiên Quý', khuc - ngay + 2);

  // Theo can năm
  const loc = B.LOC_TON[canNam];
  dat('Lộc Tồn', loc); dat('Kình Dương', loc + 1); dat('Đà La', loc - 1);
  dat('Quốc Ấn', loc + 8); dat('Đường Phù', loc - 7); dat('Văn Tinh', B.VAN_TINH[canNam]);
  dat('Thiên Khôi', B.THIEN_KHOI[canNam]); dat('Thiên Việt', B.THIEN_VIET[canNam]);
  dat('Thiên Quan', B.THIEN_QUAN[canNam]); dat('Thiên Phúc', B.THIEN_PHUC[canNam]);
  dat('Lưu Hà', B.LUU_HA[canNam]); dat('Thiên Trù', B.THIEN_TRU[canNam]);

  // Theo chi năm
  dat('Thiên Mã', B.THIEN_MA[t4]); dat('Hoa Cái', B.HOA_CAI[t4]); dat('Kiếp Sát', B.KIEP_SAT[t4]); dat('Đào Hoa', B.DAO_HOA[t4]);
  dat('Hồng Loan', 3 - chiNam); dat('Thiên Hỷ', 9 - chiNam);
  dat('Long Trì', 4 + chiNam); dat('Phượng Các', 10 - chiNam); dat('Giải Thần', 10 - chiNam);
  dat('Thiên Khốc', 6 - chiNam); dat('Thiên Hư', 6 + chiNam);
  dat('Thiên Đức', 9 + chiNam); dat('Nguyệt Đức', 5 + chiNam);
  dat('Thiên Không', chiNam + 1);
  const hoi = Math.floor(((chiNam + 1) % 12) / 3);
  dat('Cô Thần', B.CO_THAN[hoi]); dat('Quả Tú', B.QUA_TU[hoi]);
  dat('Phá Toái', B.PHA_TOAI[chiNam % 3]);
  dat('Đẩu Quân', chiNam - (thang - 1) + gio);
  dat('Thiên Tài', menh + chiNam); dat('Thiên Thọ', than + chiNam);
  dat('Thiên Thương', menh + 5); dat('Thiên Sứ', menh + 7);
  dat('Thiên La', 4); dat('Địa Võng', 10);

  // Tứ hóa
  const hoaCua: Record<string, string> = {};
  B.TU_HOA[canNam].forEach((ten, i) => {
    hoaCua[ten] = B.TEN_HOA[i];
    const c = chinh.findIndex((s) => s.includes(ten));
    dat(B.TEN_HOA[i], c >= 0 ? c : viTri(ten));
  });

  // Tuần, Triệt
  const p = Array.from({ length: 60 }, (_, i) => i).find((i) => i % 10 === canNam && i % 12 === chiNam)!;
  const dauTuan = (p - (p % 10)) % 12;
  const tuan = [m12(dauTuan + 10), m12(dauTuan + 11)];
  const triet = B.TRIET[canNam % 5];

  const khoiTS = B.KHOI_TRANG_SINH[cuc.so];
  const khoiTH = B.KHOI_TIEU_HAN[t4];
  const d = thuan ? 1 : -1;

  const cung: CungTuVi[] = B.TEN_CUNG.map((ten, i) => {
    const c = m12(menh + i);
    const buoc = m12((c - menh) * d);
    return {
      ten,
      can: CAN[canCung(c)],
      chi: CHI[c],
      laCungThan: c === than,
      chinhTinh: chinh[c].map((t) => ({
        ten: t,
        doSang: B.TEN_DO_SANG[B.DO_SANG[t].split(/\s+/)[c]],
        ...(hoaCua[t] ? { tuHoa: hoaCua[t] } : {}),
      })),
      phuTinh: sao[c].map((t) => ({
        ten: t,
        nhom: B.SAT_TINH.includes(t) || t === 'Hóa Kỵ' ? 'sát tinh' : B.CAT_TINH.includes(t) ? 'cát tinh' : 'phụ tinh',
        ...(hoaCua[t] ? { tuHoa: hoaCua[t] } : {}),
      })),
      vongThaiTue: B.VONG_THAI_TUE[m12(c - chiNam)],
      vongLocTon: B.VONG_LOC_TON[m12((c - loc) * d)],
      vongTrangSinh: B.VONG_TRANG_SINH[m12((c - khoiTS) * d)],
      tuan: tuan.includes(c),
      triet: triet.includes(c),
      daiHan: [cuc.so + buoc * 10, cuc.so + buoc * 10 + 9],
      tieuHan: CHI[m12(chiNam + (c - khoiTH) * (nam ? 1 : -1))],
    };
  });

  return {
    amDuong: `${duong ? 'Dương' : 'Âm'} ${nam ? 'Nam' : 'Nữ'}`,
    thuanNghich: (menh % 2 === 0) === duong ? 'Âm dương thuận lý' : 'Âm dương nghịch lý',
    banMenh: napAm({ can: canNam, chi: chiNam }),
    cuc: cuc.ten,
    soCuc: cuc.so,
    cungMenhTai: CHI[menh],
    cungThanTai: CHI[than],
    thanCu: B.TEN_CUNG[m12(than - menh)],
    menhChu: B.MENH_CHU[chiNam],
    thanChu: B.THAN_CHU[chiNam],
    cung,
  };
}
