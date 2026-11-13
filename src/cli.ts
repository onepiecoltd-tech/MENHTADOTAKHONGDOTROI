import { lapBatTu, lapTuVi, gieoQueDongXu, gieoQueMaiHoa, ganLoiQue, rutBai, type ThongTinSinh } from './index.js';

const [lenh, ...a] = process.argv.slice(2);
const huongDan = `Cách dùng:
  npm run cli -- batu  1990-05-15 14:30 nam [muiGio]
  npm run cli -- tuvi  1990-05-15 14:30 nu  [muiGio]
  npm run cli -- hoso  1990-05-15 14:30 nam        (bát tự + tử vi)
  npm run cli -- que   [xu|maihoa] ["câu hỏi"]
  npm run cli -- tarot [mot-la|ba-la|tinh-huong|celtic-cross] ["câu hỏi"]`;

function docSinh(): ThongTinSinh {
  const [ngay, gio, gt, tz] = a;
  const [nam, thang, d] = (ngay ?? '').split('-').map(Number);
  const [h, m] = (gio ?? '').split(':').map(Number);
  if (!nam || !thang || !d || Number.isNaN(h) || !['nam', 'nu'].includes(gt)) throw new Error(huongDan);
  return { nam, thang, ngay: d, gio: h, phut: m || 0, gioiTinh: gt as 'nam' | 'nu', muiGio: tz ? Number(tz) : 7 };
}

try {
  let kq: unknown;
  if (lenh === 'batu') kq = lapBatTu(docSinh());
  else if (lenh === 'tuvi') kq = lapTuVi(docSinh());
  else if (lenh === 'hoso') { const s = docSinh(); kq = { thongTinSinh: s, batTu: lapBatTu(s), tuVi: lapTuVi(s) }; }
  else if (lenh === 'que') kq = ganLoiQue(a[0] === 'maihoa' ? gieoQueMaiHoa(a[1]) : gieoQueDongXu(a[1]));
  else if (lenh === 'tarot') kq = rutBai((a[0] as any) || 'ba-la', a[1]);
  else throw new Error(huongDan);
  console.log(JSON.stringify(kq, null, 2));
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
