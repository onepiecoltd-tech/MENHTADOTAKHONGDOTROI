import type { LoaiLuan } from './prompts.js';

/** Ba bậc model. Đổi bằng biến môi trường, không cần sửa code. */
export const MODEL = {
  nhe: process.env.MODEL_NHE ?? 'claude-haiku-5-5',
  chinh: process.env.MODEL_CHINH ?? 'claude-sonnet-5-5',
  sau: process.env.MODEL_SAU ?? 'claude-sonnet-5-5', // đặt 'claude-opus-5-5' cho gói luận chuyên sâu
};

/** Giá USD cho 1 triệu token (bảng giá API tháng 11/2026; Haiku tính mức prompt dưới 100K token). */
export const GIA: Record<string, { vao: number; ra: number; ghiCache: number; docCache: number }> = {
  'claude-haiku-5-5': { vao: 0.1, ra: 0.5, ghiCache: 0.125, docCache: 0.01 },
  'claude-sonnet-5-5': { vao: 2, ra: 10, ghiCache: 2.5, docCache: 0.1 },
  'claude-opus-5-5': { vao: 4, ra: 20, ghiCache: 5, docCache: 0.2 },
};

export interface NguCanh { soLaBai?: number; chuyenSau?: boolean }

/** Chọn model và giới hạn độ dài theo loại yêu cầu. */
export function dinhTuyen(loai: LoaiLuan, nc: NguCanh = {}): { model: string; maxTokens: number } {
  if (nc.chuyenSau) return { model: MODEL.sau, maxTokens: 6000 };
  switch (loai) {
    case 'tu-vi-ngay': return { model: MODEL.nhe, maxTokens: 700 };
    case 'tarot':
      if ((nc.soLaBai ?? 3) <= 1) return { model: MODEL.nhe, maxTokens: 900 };
      return { model: MODEL.chinh, maxTokens: (nc.soLaBai ?? 3) > 3 ? 3600 : 2200 };
    case 'kinh-dich': return { model: MODEL.chinh, maxTokens: 2400 };
    case 'bat-tu': return { model: MODEL.chinh, maxTokens: 3200 };
    case 'tu-vi': return { model: MODEL.chinh, maxTokens: 3600 };
    case 'chiem-tinh': return { model: MODEL.chinh, maxTokens: 3600 };
    case 'luan-cheo': return { model: MODEL.sau, maxTokens: 4200 };
  }
}

export interface SuDung { input_tokens?: number; output_tokens?: number; cache_creation_input_tokens?: number | null; cache_read_input_tokens?: number | null }

/** Chi phí USD của một lượt gọi, tính từ usage mà API trả về. */
export function tinhChiPhi(model: string, u: SuDung): number {
  const g = GIA[model];
  if (!g) return NaN;
  return ((u.input_tokens ?? 0) * g.vao + (u.output_tokens ?? 0) * g.ra + (u.cache_creation_input_tokens ?? 0) * g.ghiCache + (u.cache_read_input_tokens ?? 0) * g.docCache) / 1e6;
}

export function congSuDung(a: SuDung, b: SuDung): SuDung {
  const c = (x?: number | null, y?: number | null) => (x ?? 0) + (y ?? 0);
  return {
    input_tokens: c(a.input_tokens, b.input_tokens), output_tokens: c(a.output_tokens, b.output_tokens),
    cache_creation_input_tokens: c(a.cache_creation_input_tokens, b.cache_creation_input_tokens),
    cache_read_input_tokens: c(a.cache_read_input_tokens, b.cache_read_input_tokens),
  };
}
