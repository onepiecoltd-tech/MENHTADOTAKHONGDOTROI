/**
 * Nhà cung cấp AI (multi-provider) cho Mệnh Lý 3D.
 *
 * Mỗi hãng là một adapter biến thành "MayKhach" — cùng interface tối thiểu
 * giống Anthropic mà luanGiai() / troChuyen() đã dùng. Nhờ vậy đổi hãng chỉ
 * là đổi adapter, không sửa code luận giải.
 *
 * Các hãng:
 *  - claude : Anthropic SDK (đã có sẵn) — hỗ trợ tool-use đầy đủ.
 *  - openai : ChatGPT, API chat.completions — model mặc định gpt-5-mini / gpt-5.
 *  - gemini : Google AI, generateContent — model gemini-2.5-flash.
 *  - grok   : xAI, API tương thích OpenAI — model grok-4.
 *  - meta   : Llama API của Meta (api.llama.com). LƯU Ý: "Muse" không có hệ
 *             thống API key công khai; đường API công khai của Meta là Llama API.
 *             Trong giao diện ghi "Meta (Llama API)".
 *  - taikhoan: tài khoản Claude Code đã đăng nhập (taoMayKhachTaiKhoan, đã có).
 *
 * Tool-use (agent troChuyen) chỉ Claude hỗ trợ đầy đủ. Các hãng khác nếu
 * request có tools sẽ báo lỗi rõ ràng; trò chuyện 2 bước vẫn dùng được.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { MayKhach } from './luan-giai.js';
import type { LoaiLuan } from './prompts.js';
import { taoMayKhachTaiKhoan } from './may-khach-taikhoan.js';

export type NhaCungCap = 'claude' | 'openai' | 'gemini' | 'grok' | 'meta' | 'taikhoan';

export const TEN_NHA_CUNG_CAP: Record<NhaCungCap, string> = {
  claude: 'Claude (Anthropic)',
  openai: 'ChatGPT (OpenAI)',
  gemini: 'Gemini (Google AI)',
  grok: 'Grok (xAI)',
  meta: 'Meta (Llama API)',
  taikhoan: 'Tài khoản Claude Code',
};

/** Model mặc định theo hãng và bậc (nhẹ / chính / sâu). Đổi bằng biến môi trường. */
export const MODEL_THEO_HANG: Record<Exclude<NhaCungCap, 'taikhoan'>, { nhe: string; chinh: string; sau: string }> = {
  claude: {
    nhe: process.env.MODEL_CLAUDE_NHE ?? 'claude-haiku-5-5',
    chinh: process.env.MODEL_CLAUDE_CHINH ?? 'claude-sonnet-5-5',
    sau: process.env.MODEL_CLAUDE_SAU ?? 'claude-sonnet-5-5',
  },
  openai: {
    nhe: process.env.MODEL_OPENAI_NHE ?? 'gpt-5-mini',
    chinh: process.env.MODEL_OPENAI_CHINH ?? 'gpt-5',
    sau: process.env.MODEL_OPENAI_SAU ?? 'gpt-5',
  },
  gemini: {
    nhe: process.env.MODEL_GEMINI_NHE ?? 'gemini-2.5-flash',
    chinh: process.env.MODEL_GEMINI_CHINH ?? 'gemini-2.5-flash',
    sau: process.env.MODEL_GEMINI_SAU ?? 'gemini-2.5-pro',
  },
  grok: {
    nhe: process.env.MODEL_GROK_NHE ?? 'grok-4',
    chinh: process.env.MODEL_GROK_CHINH ?? 'grok-4',
    sau: process.env.MODEL_GROK_SAU ?? 'grok-4',
  },
  meta: {
    nhe: process.env.MODEL_META_NHE ?? 'llama-4-maverick',
    chinh: process.env.MODEL_META_CHINH ?? 'llama-4-maverick',
    sau: process.env.MODEL_META_SAU ?? 'llama-4-maverick',
  },
};

/** Giá USD / 1 triệu token. THAM KHẢO tháng 11/2026 — kiểm tra lại trên trang giá
 *  từng hãng trước khi dùng cho khách; admin sửa trong bảng ai_gia (xem sql/quan-tri.sql). */
export const GIA_MOI: Record<string, { vao: number; ra: number; ghiCache: number; docCache: number }> = {
  // Claude (đã có trong dinh-tuyen.ts — giữ nguyên giá trị)
  'claude-haiku-5-5': { vao: 0.1, ra: 0.5, ghiCache: 0.125, docCache: 0.01 },
  'claude-sonnet-5-5': { vao: 2, ra: 10, ghiCache: 2.5, docCache: 0.1 },
  'claude-opus-5-5': { vao: 4, ra: 20, ghiCache: 5, docCache: 0.2 },
  // OpenAI (ChatGPT)
  'gpt-5-mini': { vao: 0.25, ra: 2, ghiCache: 0, docCache: 0 },
  'gpt-5': { vao: 1.25, ra: 10, ghiCache: 0, docCache: 0 },
  // Google AI (Gemini)
  'gemini-2.5-flash': { vao: 0.3, ra: 2.5, ghiCache: 0, docCache: 0 },
  'gemini-2.5-pro': { vao: 1.25, ra: 10, ghiCache: 0, docCache: 0 },
  // xAI (Grok)
  'grok-4': { vao: 3, ra: 15, ghiCache: 0, docCache: 0 },
  // Meta (Llama API)
  'llama-4-maverick': { vao: 0.2, ra: 0.6, ghiCache: 0, docCache: 0 },
};

export function tinhChiPhiMoi(model: string, u: { input_tokens?: number; output_tokens?: number; cache_creation_input_tokens?: number | null; cache_read_input_tokens?: number | null }): number {
  const g = GIA_MOI[model];
  if (!g) return NaN;
  return (((u.input_tokens ?? 0) * g.vao + (u.output_tokens ?? 0) * g.ra + (u.cache_creation_input_tokens ?? 0) * g.ghiCache + (u.cache_read_input_tokens ?? 0) * g.docCache) / 1e6);
}

/** Chọn model theo hãng + loại luận (cùng logic bậc như dinhTuyen, nhưng theo hãng). */
export function chonModel(hang: Exclude<NhaCungCap, 'taikhoan'>, loai: LoaiLuan, chuyenSau = false, soLaBai = 3): string {
  const m = MODEL_THEO_HANG[hang];
  if (chuyenSau) return m.sau;
  if (loai === 'tu-vi-ngay') return m.nhe;
  if (loai === 'tarot' && soLaBai <= 1) return m.nhe;
  return m.chinh;
}

/* ---------------- Chuyển đổi request dạng Anthropic sang từng hãng ---------------- */

type KhoiVanBan = { type: 'text'; text: string; cache_control?: unknown };
const vanBanHeThong = (system: unknown): string => {
  if (typeof system === 'string') return system;
  if (Array.isArray(system)) return system.map((s: any) => s.text ?? '').filter(Boolean).join('\n\n');
  return '';
};
const vanBanTinNhan = (content: unknown): string => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((b: any) => (b.type === 'text' ? b.text : b.type === 'tool_result' ? `[KẾT QUẢ CÔNG CỤ]\n${typeof b.content === 'string' ? b.content : JSON.stringify(b.content)}` : '')).filter(Boolean).join('\n\n');
  return '';
};
const layVanBan = (content: any[]): string => (content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();

async function goiJson(url: string, khoa: string, than: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${khoa}` },
    body: JSON.stringify(than),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error?.message ?? j.error?.details?.[0]?.message ?? `Lỗi HTTP ${res.status} từ ${url}`);
  return j;
}

/** Adapter cho API tương thích OpenAI (ChatGPT, Grok, Llama API đều dùng dạng này). */
function mayKhachOpenAICompatible(hang: 'openai' | 'grok' | 'meta', khoa: string): MayKhach {
  const goc: Record<string, string> = {
    openai: 'https://api.openai.com/v1/chat/completions',
    grok: 'https://api.x.ai/v1/chat/completions',
    meta: 'https://api.llama.com/v1/chat/completions',
  };
  return {
    messages: {
      create: async (p: any) => {
        if (p.tools?.length) throw new Error(`${TEN_NHA_CUNG_CAP[hang]} chưa hỗ trợ tool-use trực tiếp trong app; dùng chế độ trò chuyện 2 bước hoặc chọn Claude.`);
        const messages = [
          ...(vanBanHeThong(p.system) ? [{ role: 'system', content: vanBanHeThong(p.system) }] : []),
          ...(p.messages ?? []).map((m: any) => ({ role: m.role, content: vanBanTinNhan(m.content) })),
        ];
        const j = await goiJson(goc[hang], khoa, { model: p.model, messages, max_tokens: p.max_tokens, temperature: 0.7 });
        const lua = j.choices?.[0]?.message?.content ?? '';
        const u = j.usage ?? {};
        const usage = { input_tokens: u.prompt_tokens ?? 0, output_tokens: u.completion_tokens ?? 0 };
        return {
          content: [{ type: 'text', text: typeof lua === 'string' ? lua : JSON.stringify(lua) }],
          stop_reason: 'end_turn',
          usage,
          chiPhiUocTinhUSD: tinhChiPhiMoi(p.model, usage),
        };
      },
    },
  };
}

/** Adapter cho Gemini (Google AI). */
function mayKhachGemini(khoa: string): MayKhach {
  return {
    messages: {
      create: async (p: any) => {
        if (p.tools?.length) throw new Error('Gemini chưa hỗ trợ tool-use trực tiếp trong app; dùng chế độ trò chuyện 2 bước hoặc chọn Claude.');
        const sys = vanBanHeThong(p.system);
        const contents = (p.messages ?? []).map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: vanBanTinNhan(m.content) }] }));
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(p.model)}:generateContent?key=${encodeURIComponent(khoa)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(sys ? { system_instruction: { parts: [{ text: sys }] } } : {}),
            contents,
            generationConfig: { maxOutputTokens: p.max_tokens, temperature: 0.7 },
          }),
        });
        const j: any = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error?.message ?? `Lỗi HTTP ${res.status} từ Gemini`);
        const text = (j.candidates?.[0]?.content?.parts ?? []).map((x: any) => x.text ?? '').join('\n').trim();
        const u = j.usageMetadata ?? {};
        const usage = { input_tokens: u.promptTokenCount ?? 0, output_tokens: u.candidatesTokenCount ?? 0 };
        return {
          content: [{ type: 'text', text }],
          stop_reason: 'end_turn',
          usage,
          chiPhiUocTinhUSD: tinhChiPhiMoi(p.model, usage),
        };
      },
    },
  };
}

/** Tạo máy khách theo hãng + khóa. Khóa lấy từ biến môi trường hoặc cấu hình đã lưu. */
export function taoMayKhach(hang: NhaCungCap, khoa: Record<string, string> = {}): MayKhach {
  const lay = (ten: string, bien: string) => khoa[ten] ?? process.env[bien] ?? '';
  switch (hang) {
    case 'taikhoan': return taoMayKhachTaiKhoan();
    case 'claude': {
      const k = lay('claude', 'ANTHROPIC_API_KEY');
      if (!k) throw new Error('Chưa nhập khóa API Anthropic (Claude).');
      return new Anthropic({ apiKey: k }) as unknown as MayKhach;
    }
    case 'openai': {
      const k = lay('openai', 'OPENAI_API_KEY');
      if (!k) throw new Error('Chưa nhập khóa API OpenAI (ChatGPT).');
      return mayKhachOpenAICompatible('openai', k);
    }
    case 'gemini': {
      const k = lay('gemini', 'GEMINI_API_KEY');
      if (!k) throw new Error('Chưa nhập khóa API Google AI (Gemini).');
      return mayKhachGemini(k);
    }
    case 'grok': {
      const k = lay('grok', 'XAI_API_KEY');
      if (!k) throw new Error('Chưa nhập khóa API xAI (Grok).');
      return mayKhachOpenAICompatible('grok', k);
    }
    case 'meta': {
      const k = lay('meta', 'LLAMA_API_KEY');
      if (!k) throw new Error('Chưa nhập khóa Llama API (Meta). Lấy khóa tại trang Llama API của Meta.');
      return mayKhachOpenAICompatible('meta', k);
    }
  }
}

/** Kiểm tra nhanh một hãng có khóa và gọi được không (dùng cho nút "Kiểm tra" trong Cài đặt). */
export async function kiemTraHang(hang: NhaCungCap, khoa: Record<string, string> = {}): Promise<{ ok: boolean; thongBao: string }> {
  try {
    if (hang === 'taikhoan') {
      const { kiemTraDangNhap } = await import('./may-khach-taikhoan.js');
      return kiemTraDangNhap();
    }
    const may = taoMayKhach(hang, khoa);
    const model = hang === 'claude' ? MODEL_THEO_HANG.claude.nhe : chonModel(hang as Exclude<NhaCungCap, 'taikhoan'>, 'tu-vi-ngay');
    await (may as MayKhach).messages.create({ model, max_tokens: 5, messages: [{ role: 'user', content: 'Trả lời đúng một từ: ok' }] } as any);
    return { ok: true, thongBao: `${TEN_NHA_CUNG_CAP[hang]} sẵn sàng (model ${model}).` };
  } catch (e) {
    return { ok: false, thongBao: `${TEN_NHA_CUNG_CAP[hang]}: ${(e as Error).message}` };
  }
}
