/**
 * npm run luan -- tuvi  1990-05-15 14:30 nam ["câu hỏi"]
 * npm run luan -- chiemtinh 1990-05-15 14:30 nam ["câu hỏi"]   (chiêm tinh Vệ Đà)
 * npm run luan -- batu  1990-05-15 14:30 nam ["câu hỏi"]
 * npm run luan -- que   xu|maihoa "câu hỏi"
 * npm run luan -- tarot mot-la|ba-la|tinh-huong|celtic-cross "câu hỏi"
 * npm run luan -- cheo  1990-05-15 14:30 nam "câu hỏi"      (tử vi + bát tự + quẻ)
 * npm run luan -- ngay  1990-05-15 14:30 nam                (tử vi ngày, model nhẹ)
 * npm run luan -- chat  [1990-05-15 14:30 nam]              (trò chuyện với agent)
 * npm run luan -- kiemtra                                     (kiểm tra đăng nhập Claude Code)
 * Thêm --xem-prompt để in prompt và ước lượng kích thước mà không gọi API.
 *
 * Kết nối: mặc định dùng tài khoản Claude đã đăng nhập Claude Code (không cần khóa API).
 * Đặt KET_NOI=api cùng ANTHROPIC_API_KEY để gọi API trả tiền theo token (bắt buộc khi phục vụ khách).
 */
import Anthropic from '@anthropic-ai/sdk';
import { createInterface } from 'node:readline/promises';
import { lapVeDa, lapBatTu, lapTuVi, gieoQueDongXu, gieoQueMaiHoa, ganLoiQue, rutBai, type ThongTinSinh } from '../index.js';
import { rutGonVeDa, rutGonBatTu, rutGonQue, rutGonTarot, rutGonTuVi, taoYeuCau, luanGiai, troChuyen, troChuyenHaiBuoc, taoPhien, taoMayKhachTaiKhoan, kiemTraDangNhap, type YeuCauLuan, type PhienTroChuyen, type MayKhach } from './index.js';

const tham = process.argv.slice(2).filter((x) => x !== '--xem-prompt');
const xemPrompt = process.argv.includes('--xem-prompt');
const [lenh, ...a] = tham;

function docSinh(v: string[]): ThongTinSinh | undefined {
  const [ngay, gio, gt] = v;
  const [nam, thang, d] = (ngay ?? '').split('-').map(Number);
  const [h, m] = (gio ?? '').split(':').map(Number);
  if (!nam || !thang || !d || Number.isNaN(h) || !['nam', 'nu'].includes(gt)) return undefined;
  return { nam, thang, ngay: d, gio: h, phut: m || 0, gioiTinh: gt as 'nam' | 'nu' };
}
const canSinh = () => { const s = docSinh(a); if (!s) throw new Error('Cần ngày giờ sinh dạng: 1990-05-15 14:30 nam'); return s; };

function dungYeuCau(): YeuCauLuan {
  switch (lenh) {
    case 'tuvi': return { loai: 'tu-vi', duLieu: [rutGonTuVi(lapTuVi(canSinh()))], cauHoi: a[3] };
    case 'chiemtinh': return { loai: 'chiem-tinh', duLieu: [rutGonVeDa(lapVeDa(canSinh()))], cauHoi: a[3] };
    case 'batu': return { loai: 'bat-tu', duLieu: [rutGonBatTu(lapBatTu(canSinh()))], cauHoi: a[3] };
    case 'ngay': return { loai: 'tu-vi-ngay', duLieu: [rutGonTuVi(lapTuVi(canSinh())), `Ngày xem: ${new Date().toLocaleDateString('vi-VN')}`] };
    case 'que': return { loai: 'kinh-dich', duLieu: [rutGonQue(ganLoiQue(a[0] === 'maihoa' ? gieoQueMaiHoa(a[1]) : gieoQueDongXu(a[1])))], cauHoi: a[1] };
    case 'tarot': { const k = rutBai((a[0] as any) || 'ba-la', a[1]); return { loai: 'tarot', duLieu: [rutGonTarot(k)], cauHoi: a[1], nguCanh: { soLaBai: k.cacLa.length } }; }
    case 'cheo': { const s = canSinh(); return { loai: 'luan-cheo', duLieu: [rutGonTuVi(lapTuVi(s)), rutGonBatTu(lapBatTu(s)), rutGonQue(ganLoiQue(gieoQueDongXu(a[3])))], cauHoi: a[3] }; }
    default: throw new Error('Lệnh: tuvi | batu | que | tarot | cheo | ngay | chat. Xem đầu tệp src/ai/cli.ts.');
  }
}

const tien = (usd: number) => `${usd.toFixed(4)} USD`;

/** Chọn đường kết nối: KET_NOI=api | taikhoan. Không đặt thì có khóa API dùng API, không có dùng tài khoản. */
const DUNG_API = (process.env.KET_NOI ?? (process.env.ANTHROPIC_API_KEY ? 'api' : 'taikhoan')) === 'api';
function moMayKhach(): MayKhach {
  if (DUNG_API) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('KET_NOI=api nhưng chưa đặt ANTHROPIC_API_KEY.');
    return new Anthropic();
  }
  const kt = kiemTraDangNhap();
  if (!kt.ok) throw new Error(kt.thongBao);
  return taoMayKhachTaiKhoan();
}

async function main() {
  if (lenh === 'kiemtra') {
    const kt = kiemTraDangNhap();
    console.log(`${kt.ok ? 'SẴN SÀNG' : 'CHƯA SẴN SÀNG'}: ${kt.thongBao}`);
    process.exitCode = kt.ok ? 0 : 1;
    return;
  }
  if (lenh === 'chat') {
    const client = moMayKhach();
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    console.log(`[kết nối: ${DUNG_API ? 'khóa API' : 'tài khoản Claude'}; gõ "thoat" để dừng]`);
    let tong = 0;
    const phienApi: PhienTroChuyen = { hoSo: { sinh: docSinh(a) }, tinNhan: [] };
    const phien2 = taoPhien({ sinh: docSinh(a) });
    for (;;) {
      const cau = (await rl.question('\nBạn: ')).trim();
      if (!cau || cau === 'thoat') break;
      let kq: { traLoi: string; congCuDaGoi: string[]; chiPhiUSD: number };
      if (DUNG_API) {
        phienApi.tinNhan.push({ role: 'user', content: cau });
        const r = await troChuyen(client, phienApi);
        phienApi.tinNhan = r.tinNhan;
        kq = r;
      } else {
        kq = await troChuyenHaiBuoc(client, phien2, cau);
      }
      tong += kq.chiPhiUSD;
      console.log(`\n${kq.traLoi}\n\n[công cụ: ${kq.congCuDaGoi.join(', ') || 'không'} | lượt này ${tien(kq.chiPhiUSD)} | cả phiên ${tien(tong)}]`);
    }
    rl.close();
    return;
  }
  const y = dungYeuCau();
  const p = taoYeuCau(y);
  if (xemPrompt) {
    const sys = (p.system as { text: string }[]).map((s) => s.text).join('\n\n');
    const user = (p.messages[0].content as { text: string }[]).map((s) => s.text).join('\n\n');
    console.log(`MODEL: ${p.model} | max_tokens: ${p.max_tokens}\n\n===== SYSTEM =====\n${sys}\n\n===== USER =====\n${user}`);
    console.log(`\n[kích thước: system ${sys.length} ký tự, dữ liệu ${user.length} ký tự; ước lượng thô ${Math.round((sys.length + user.length) / 3)} token đầu vào]`);
    return;
  }
  const kq = await luanGiai(moMayKhach(), y);
  const u = kq.suDung;
  console.log(`${kq.vanBan}\n\n[${DUNG_API ? 'API' : 'tài khoản Claude'} | ${kq.model} | vào ${u.input_tokens ?? 0} + ghi cache ${u.cache_creation_input_tokens ?? 0} + đọc cache ${u.cache_read_input_tokens ?? 0}, ra ${u.output_tokens ?? 0} token | ${tien(kq.chiPhiUSD)}]`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
