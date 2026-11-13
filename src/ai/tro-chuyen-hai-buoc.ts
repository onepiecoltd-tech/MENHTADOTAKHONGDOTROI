/**
 * Trò chuyện kiểu hai bước, chạy được với mọi máy khách (khóa API hoặc tài khoản qua `claude -p`):
 *   bước 1: model nhẹ đọc câu hỏi và chọn công cụ (trả về JSON);
 *   bước 2: hệ thống chạy công cụ; model chính luận giải trên dữ liệu.
 */
import type { ThongTinSinh } from '../types.js';
import { lapBatTu } from '../batu/index.js';
import { lapTuVi } from '../tuvi/index.js';
import { gieoQueDongXu, gieoQueMaiHoa } from '../kinhdich/index.js';
import { ganLoiQue } from '../kinhdich/loi-que.js';
import { rutBai, KIEU_TRAI, type KieuTrai } from '../tarot/index.js';
import { rutGonBatTu, rutGonQue, rutGonTarot, rutGonTuVi } from './rut-gon.js';
import { PROMPT_CHUNG, PROMPT_MON } from './prompts.js';
import { MODEL, congSuDung, tinhChiPhi, type SuDung } from './dinh-tuyen.js';
import { layVanBan, type MayKhach } from './luan-giai.js';
import type { HoSo } from './agent.js';

export interface Phien2 {
  hoSo: HoSo;
  luot: { vai: 'user' | 'assistant'; noiDung: string }[];
  /** Dữ liệu đã lấy trong phiên: lá số chỉ lập một lần, quẻ và trải bài cộng dồn. */
  laSo: { tuVi?: string; batTu?: string };
  queVaBai: string[];
  ngayXem?: Date;
  seed?: number;
}
export const taoPhien = (hoSo: HoSo = {}): Phien2 => ({ hoSo, luot: [], laSo: {}, queVaBai: [] });

const PROMPT_CHON = `Bạn là bộ định tuyến của một ứng dụng mệnh lý. Đọc lượt hỏi mới nhất và chọn công cụ cần chạy. Chỉ trả về MỘT đối tượng JSON, không thêm chữ nào khác.

Công cụ:
- {"ten":"xem_tu_vi"}: câu hỏi về con người, các mặt đời sống, vận hạn năm nay, đại hạn.
- {"ten":"xem_bat_tu"}: câu hỏi về ngũ hành, mệnh khuyết, tính cách theo tứ trụ, đại vận; hoặc người xem nhắc bát tự.
- {"ten":"gieo_que","cau_hoi":"...","phuong_phap":"xu"}: nên hay không nên làm một việc cụ thể, việc sẽ ra sao. phuong_phap là "xu" hoặc "maihoa".
- {"ten":"rut_bai","cau_hoi":"...","kieu_trai":"ba-la"}: cảm xúc, tình cảm, tình huống rối. kieu_trai: "mot-la", "ba-la", "tinh-huong", "celtic-cross".

Quy tắc: lá số đã có trong phiên thì không gọi lại. Mỗi câu hỏi chỉ gieo một quẻ hoặc rút một lần bài; câu hỏi tiếp về quẻ hay trải bài vừa có thì không gieo, rút lại. Câu hỏi lớn có thể kết hợp một lá số với một quẻ. Chào hỏi, cảm ơn, hỏi kiến thức chung thì không cần công cụ.

Định dạng: {"cong_cu":[ ... ]}`;

/** Lấy JSON đầu tiên trong câu trả lời của model; hỏng thì coi như không chọn công cụ. */
export function docLuaChon(vanBan: string): { ten: string; cau_hoi?: string; phuong_phap?: string; kieu_trai?: string }[] {
  const m = vanBan.match(/\{[\s\S]*\}/);
  if (!m) return [];
  try {
    const j = JSON.parse(m[0]);
    return Array.isArray(j.cong_cu) ? j.cong_cu.filter((c: any) => c && typeof c.ten === 'string') : [];
  } catch {
    return [];
  }
}

const moTaSinh = (s?: ThongTinSinh) => (s ? `Sinh ${s.ngay}/${s.thang}/${s.nam} lúc ${s.gio}:${String(s.phut ?? 0).padStart(2, '0')} (dương lịch), ${s.gioiTinh === 'nam' ? 'nam' : 'nữ'}` : 'Chưa có ngày giờ sinh');

export async function troChuyenHaiBuoc(client: MayKhach, phien: Phien2, cauHoi: string) {
  phien.luot.push({ vai: 'user', noiDung: cauHoi });
  let suDung: SuDung = {};
  let chiPhi = 0;
  const cong = (model: string, res: any) => { suDung = congSuDung(suDung, res.usage ?? {}); chiPhi += res.chiPhiUocTinhUSD ?? tinhChiPhi(model, res.usage ?? {}); };

  // Bước 1: chọn công cụ
  const daCo = [phien.laSo.tuVi && 'lá số tử vi', phien.laSo.batTu && 'bát tự', phien.queVaBai.length && `${phien.queVaBai.length} quẻ/trải bài`].filter(Boolean).join(', ') || 'chưa có gì';
  const ganDay = phien.luot.slice(-5).map((l) => `${l.vai === 'user' ? 'Người xem' : 'Trợ lý'}: ${l.noiDung.slice(0, 400)}`).join('\n');
  const chon = await client.messages.create({
    model: MODEL.nhe, max_tokens: 300, system: PROMPT_CHON,
    messages: [{ role: 'user', content: `Hồ sơ: ${moTaSinh(phien.hoSo.sinh)}\nDữ liệu đã có trong phiên: ${daCo}\n\nHội thoại gần đây:\n${ganDay}` }],
  });
  cong(MODEL.nhe, chon);

  // Bước 2: chạy công cụ
  const congCuDaGoi: string[] = [];
  const thieu: string[] = [];
  for (const c of docLuaChon(layVanBan(chon))) {
    const sinh = phien.hoSo.sinh;
    if (c.ten === 'xem_tu_vi' || c.ten === 'xem_bat_tu') {
      if (!sinh) { thieu.push('Hồ sơ chưa có ngày giờ sinh: hãy hỏi người xem ngày, giờ, nơi sinh và giới tính.'); continue; }
      if (c.ten === 'xem_tu_vi' && !phien.laSo.tuVi) { phien.laSo.tuVi = rutGonTuVi(lapTuVi(sinh), phien.ngayXem); congCuDaGoi.push(c.ten); }
      if (c.ten === 'xem_bat_tu' && !phien.laSo.batTu) { phien.laSo.batTu = rutGonBatTu(lapBatTu(sinh), phien.ngayXem); congCuDaGoi.push(c.ten); }
    } else if (c.ten === 'gieo_que') {
      const q = c.cau_hoi || cauHoi;
      phien.queVaBai.push(rutGonQue(ganLoiQue(c.phuong_phap === 'maihoa' ? gieoQueMaiHoa(q, phien.ngayXem) : gieoQueDongXu(q, phien.seed))));
      congCuDaGoi.push(c.ten);
    } else if (c.ten === 'rut_bai') {
      const k = (c.kieu_trai && c.kieu_trai in KIEU_TRAI ? c.kieu_trai : 'ba-la') as KieuTrai;
      phien.queVaBai.push(rutGonTarot(rutBai(k, c.cau_hoi || cauHoi, { seed: phien.seed })));
      congCuDaGoi.push(c.ten);
    }
  }

  // Bước 3: luận giải
  const mon = [phien.laSo.tuVi && PROMPT_MON['tu-vi'], phien.laSo.batTu && PROMPT_MON['bat-tu'],
    phien.queVaBai.some((d) => d.startsWith('QUẺ')) && PROMPT_MON['kinh-dich'], phien.queVaBai.some((d) => d.startsWith('TRẢI')) && PROMPT_MON.tarot].filter(Boolean) as string[];
  if (mon.length >= 2) mon.push(PROMPT_MON['luan-cheo']);
  const h = phien.hoSo;
  const duLieu = [
    'HỒ SƠ NGƯỜI XEM', [h.ten && `Tên: ${h.ten}`, h.xungHo && `Xưng hô: ${h.xungHo}`, moTaSinh(h.sinh), h.ghiNho && `Ghi nhớ: ${h.ghiNho}`].filter(Boolean).join('\n'),
    'DỮ LIỆU (do hệ thống tính, dùng nguyên như vậy)', phien.laSo.tuVi, phien.laSo.batTu,
    ...phien.queVaBai.map((d, i) => (i === phien.queVaBai.length - 1 && congCuDaGoi.some((t) => t === 'gieo_que' || t === 'rut_bai') ? `[MỚI, cho câu hỏi vừa rồi]\n${d}` : d)),
    ...thieu.map((t) => `LƯU Ý: ${t}`),
  ].filter(Boolean).join('\n\n');
  const huongDan = `${PROMPT_CHUNG}\n\nBạn đang trò chuyện trực tiếp với người xem. Trả lời đúng điều họ vừa hỏi, dựa trên dữ liệu được cấp; câu chào hỏi hay kiến thức chung thì trả lời ngắn gọn, không cần dữ liệu. Không tự gieo quẻ hay rút bài: hệ thống đã làm và kết quả nằm trong DỮ LIỆU.${mon.length ? '\n\n' + mon.join('\n\n') : ''}`;
  const res = await client.messages.create({
    model: MODEL.chinh, max_tokens: 4000,
    system: [{ type: 'text', text: huongDan, cache_control: { type: 'ephemeral' } }],
    messages: [
      { role: 'user', content: [{ type: 'text', text: duLieu }, { type: 'text', text: phien.luot[0].noiDung }] },
      ...phien.luot.slice(1).map((l) => ({ role: l.vai, content: l.noiDung })),
    ],
  });
  cong(MODEL.chinh, res);
  const traLoi = layVanBan(res);
  phien.luot.push({ vai: 'assistant', noiDung: traLoi });
  return { traLoi, congCuDaGoi, suDung, chiPhiUSD: chiPhi };
}
