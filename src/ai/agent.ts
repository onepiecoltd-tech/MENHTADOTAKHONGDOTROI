import type Anthropic from '@anthropic-ai/sdk';
import type { ThongTinSinh } from '../types.js';
import { lapBatTu } from '../batu/index.js';
import { lapTuVi } from '../tuvi/index.js';
import { gieoQueDongXu, gieoQueMaiHoa } from '../kinhdich/index.js';
import { ganLoiQue } from '../kinhdich/loi-que.js';
import { rutBai, KIEU_TRAI, type KieuTrai } from '../tarot/index.js';
import { rutGonBatTu, rutGonQue, rutGonTarot, rutGonTuVi } from './rut-gon.js';
import { PROMPT_AGENT, PROMPT_CHUNG } from './prompts.js';
import { MODEL, congSuDung, tinhChiPhi, type SuDung } from './dinh-tuyen.js';
import { layVanBan, type MayKhach } from './luan-giai.js';

export const CONG_CU: Anthropic.Tool[] = [
  { name: 'xem_tu_vi', description: 'Lấy lá số tử vi của người xem (từ ngày giờ sinh trong hồ sơ). Dùng cho câu hỏi về bản thân, các cung, đại hạn, tiểu hạn.', input_schema: { type: 'object', properties: {} } },
  { name: 'xem_bat_tu', description: 'Lấy bát tự (tứ trụ) của người xem: nhật chủ, ngũ hành, thập thần, đại vận.', input_schema: { type: 'object', properties: {} } },
  {
    name: 'gieo_que', description: 'Gieo một quẻ Kinh Dịch cho một câu hỏi cụ thể về việc nên hay không nên làm. Trả về quẻ chủ, hào động, quẻ biến kèm lời quẻ.',
    input_schema: { type: 'object', properties: { cau_hoi: { type: 'string', description: 'Câu hỏi của người xem, viết gọn' }, phuong_phap: { type: 'string', enum: ['xu', 'maihoa'], description: 'xu: gieo 3 đồng xu (mặc định). maihoa: Mai Hoa theo giờ hỏi' } }, required: ['cau_hoi'] },
  },
  {
    name: 'rut_bai', description: 'Rút bài tarot cho một câu hỏi.',
    input_schema: { type: 'object', properties: { cau_hoi: { type: 'string' }, kieu_trai: { type: 'string', enum: Object.keys(KIEU_TRAI), description: 'mot-la: thông điệp nhanh. ba-la: quá khứ, hiện tại, tương lai. tinh-huong: tình huống, trở ngại, lời khuyên. celtic-cross: 10 lá, chỉ dùng khi người xem muốn xem kỹ' } }, required: ['cau_hoi', 'kieu_trai'] },
  },
];

export interface HoSo { ten?: string; xungHo?: string; sinh?: ThongTinSinh; ghiNho?: string }
export interface PhienTroChuyen { hoSo: HoSo; tinNhan: Anthropic.MessageParam[]; ngayXem?: Date; /** Hạt giống ngẫu nhiên, chỉ dùng khi test. */ seed?: number }
export interface KetQuaTroChuyen { traLoi: string; tinNhan: Anthropic.MessageParam[]; congCuDaGoi: string[]; suDung: SuDung; chiPhiUSD: number; model: string }

function chayCongCu(ten: string, input: any, phien: PhienTroChuyen): string {
  const sinh = phien.hoSo.sinh;
  switch (ten) {
    case 'xem_tu_vi':
      if (!sinh) throw new Error('Hồ sơ chưa có ngày giờ sinh. Hãy hỏi người xem ngày, giờ, nơi sinh và giới tính.');
      return rutGonTuVi(lapTuVi(sinh), phien.ngayXem);
    case 'xem_bat_tu':
      if (!sinh) throw new Error('Hồ sơ chưa có ngày giờ sinh. Hãy hỏi người xem ngày, giờ, nơi sinh và giới tính.');
      return rutGonBatTu(lapBatTu(sinh), phien.ngayXem);
    case 'gieo_que':
      return rutGonQue(ganLoiQue(input.phuong_phap === 'maihoa' ? gieoQueMaiHoa(input.cau_hoi, phien.ngayXem) : gieoQueDongXu(input.cau_hoi, phien.seed)));
    case 'rut_bai':
      return rutGonTarot(rutBai((input.kieu_trai in KIEU_TRAI ? input.kieu_trai : 'ba-la') as KieuTrai, input.cau_hoi, { seed: phien.seed }));
    default:
      throw new Error(`Không có công cụ ${ten}`);
  }
}

const moTaHoSo = (h: HoSo) => {
  const s = h.sinh;
  return [
    'HỒ SƠ NGƯỜI XEM',
    h.ten ? `- Tên: ${h.ten}` : '', h.xungHo ? `- Xưng hô: ${h.xungHo}` : '',
    s ? `- Sinh: ${s.ngay}/${s.thang}/${s.nam} lúc ${s.gio}:${String(s.phut ?? 0).padStart(2, '0')} (dương lịch), ${s.gioiTinh === 'nam' ? 'nam' : 'nữ'}` : '- Chưa có ngày giờ sinh',
    h.ghiNho ? `- Ghi nhớ từ các lần trước: ${h.ghiNho}` : '',
  ].filter(Boolean).join('\n');
};

/** Một lượt trò chuyện: model tự chọn công cụ, hệ thống chạy công cụ, model luận giải. */
export async function troChuyen(client: MayKhach, phien: PhienTroChuyen, toiDaVong = 6): Promise<KetQuaTroChuyen> {
  const model = MODEL.chinh;
  const tinNhan = [...phien.tinNhan];
  const congCuDaGoi: string[] = [];
  let suDung: SuDung = {};
  for (let vong = 0; vong < toiDaVong; vong++) {
    const res = await client.messages.create({
      model,
      max_tokens: 4000,
      system: [
        { type: 'text', text: `${PROMPT_CHUNG}\n\n${PROMPT_AGENT}`, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: moTaHoSo(phien.hoSo) },
      ],
      tools: CONG_CU,
      messages: tinNhan,
    });
    suDung = congSuDung(suDung, res.usage ?? {});
    tinNhan.push({ role: 'assistant', content: res.content });
    if (res.stop_reason !== 'tool_use') {
      return { traLoi: layVanBan(res), tinNhan, congCuDaGoi, suDung, chiPhiUSD: tinhChiPhi(model, suDung), model };
    }
    const ketQua: Anthropic.ToolResultBlockParam[] = [];
    for (const b of res.content as any[]) {
      if (b.type !== 'tool_use') continue;
      congCuDaGoi.push(b.name);
      try {
        ketQua.push({ type: 'tool_result', tool_use_id: b.id, content: chayCongCu(b.name, b.input ?? {}, phien) });
      } catch (e) {
        ketQua.push({ type: 'tool_result', tool_use_id: b.id, content: (e as Error).message, is_error: true });
      }
    }
    tinNhan.push({ role: 'user', content: ketQua });
  }
  throw new Error('Agent gọi công cụ quá số vòng cho phép');
}
