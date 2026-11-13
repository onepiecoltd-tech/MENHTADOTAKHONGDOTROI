import type Anthropic from '@anthropic-ai/sdk';
import { PROMPT_CHUNG, PROMPT_MON, type LoaiLuan } from './prompts.js';
import { dinhTuyen, tinhChiPhi, type NguCanh, type SuDung } from './dinh-tuyen.js';

/** Máy khách tối thiểu: SDK thật hoặc bản giả trong test đều dùng được. */
export interface MayKhach { messages: { create: (p: Anthropic.MessageCreateParamsNonStreaming) => Promise<any> } }

export interface YeuCauLuan {
  loai: LoaiLuan;
  /** Các khối dữ liệu đã rút gọn (rutGonTuVi, rutGonBatTu, rutGonQue, rutGonTarot). */
  duLieu: string[];
  cauHoi?: string;
  /** Thông tin người xem: tên, cách xưng hô, điều họ quan tâm, tóm tắt các lần xem trước. */
  hoSo?: string;
  /** Các lượt hỏi đáp tiếp theo trên cùng dữ liệu. */
  hoiDap?: { vai: 'user' | 'assistant'; noiDung: string }[];
  nguCanh?: NguCanh;
  model?: string;
}

export interface KetQuaLuan { vanBan: string; model: string; suDung: SuDung; chiPhiUSD: number }

const CACHE = { type: 'ephemeral' as const };

/** Dựng tham số gọi API. Tách riêng để xem trước prompt và để test không cần mạng. */
export function taoYeuCau(y: YeuCauLuan): Anthropic.MessageCreateParamsNonStreaming {
  if (!y.duLieu.length) throw new Error('Thiếu dữ liệu để luận giải');
  const tuyen = dinhTuyen(y.loai, y.nguCanh);
  const khoiDuLieu = [y.hoSo ? `HỒ SƠ NGƯỜI XEM\n${y.hoSo}` : '', 'DỮ LIỆU (do hệ thống tính, dùng nguyên như vậy)', ...y.duLieu].filter(Boolean).join('\n\n');
  return {
    model: y.model ?? tuyen.model,
    max_tokens: tuyen.maxTokens,
    system: [
      { type: 'text', text: PROMPT_CHUNG },
      // Điểm cache 1: phần hướng dẫn, giống nhau cho mọi người xem cùng một môn.
      { type: 'text', text: PROMPT_MON[y.loai], cache_control: CACHE },
    ],
    messages: [
      {
        role: 'user',
        content: [
          // Điểm cache 2: lá số của người này, dùng lại cho các câu hỏi tiếp theo trong phiên.
          { type: 'text', text: khoiDuLieu, cache_control: CACHE },
          { type: 'text', text: `YÊU CẦU: ${y.cauHoi?.trim() || 'Luận giải tổng quan.'}` },
        ],
      },
      ...(y.hoiDap ?? []).map((h) => ({ role: h.vai, content: h.noiDung })),
    ],
  };
}

export const layVanBan = (res: any): string => (res.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();

export async function luanGiai(client: MayKhach, y: YeuCauLuan): Promise<KetQuaLuan> {
  const p = taoYeuCau(y);
  const res = await client.messages.create(p);
  // Chế độ tài khoản: Claude Code tự ước tính chi phí; chế độ API: tính từ usage.
  return { vanBan: layVanBan(res), model: p.model, suDung: res.usage ?? {}, chiPhiUSD: res.chiPhiUocTinhUSD ?? tinhChiPhi(p.model, res.usage ?? {}) };
}
