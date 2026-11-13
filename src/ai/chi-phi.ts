/**
 * Ghi chi phí AI cho trang quản trị.
 *
 * Hai chế độ lưu trữ (tự chọn theo môi trường, không crash nếu thiếu):
 *  1. Postgres — khi có DATABASE_URL (triển khai server). Cần `npm i pg`.
 *     Schema chuẩn nằm ở sql/quan-tri.sql.
 *  2. Local — app Electron desktop: file JSONL trong thư mục userData
 *     (mỗi dòng 1 lượt gọi). Đọc lại để vẽ bảng quản trị.
 *
 * Hook: gọi ghiLuotGoi() sau mỗi lần luanGiai() trong app/main.ts (XU_LY.luan).
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NhaCungCap } from './nha-cung-cap.js';
import type { LoaiLuan } from './prompts.js';
import type { SuDung } from './dinh-tuyen.js';

export interface LuotGoi {
  id?: number;
  thoiGian: string; // ISO
  nhaCungCap: NhaCungCap;
  model: string;
  loaiLuan: LoaiLuan | 'tro-chuyen';
  tenNguoi?: string;
  tokenVao: number;
  tokenRa: number;
  tokenCacheGhi: number;
  tokenCacheDoc: number;
  chiPhiUSD: number;
  thoiGianMs: number;
  thanhCong: boolean;
  loi?: string;
}

export interface TongHop {
  tongLuot: number;
  tongChiPhiUSD: number;
  theoHang: Record<string, { luot: number; chiPhiUSD: number }>;
  theoLoai: Record<string, { luot: number; chiPhiUSD: number }>;
  theoNgay: { ngay: string; luot: number; chiPhiUSD: number }[];
  /** 20 lượt gần nhất, mới nhất trước. */
  ganDay: LuotGoi[];
}

/* ---------------- Chế độ local (JSONL) ---------------- */

let thuMucLocal = '';
export function datThuMucLocal(dir: string) { thuMucLocal = dir; mkdirSync(dir, { recursive: true }); }
const tepLocal = () => join(thuMucLocal || process.cwd(), 'ai-luot-goi.jsonl');

function ghiLocal(l: LuotGoi) {
  try { appendFileSync(tepLocal(), JSON.stringify(l) + '\n', 'utf8'); } catch { /* không chặn luận giải vì lỗi ghi log */ }
}
function docLocal(): LuotGoi[] {
  try {
    const f = tepLocal();
    if (!existsSync(f)) return [];
    return readFileSync(f, 'utf8').split('\n').filter(Boolean).map((d) => JSON.parse(d));
  } catch { return []; }
}

/* ---------------- Chế độ Postgres ---------------- */

async function ghiPostgres(l: LuotGoi): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  try {
    // 'pg' chỉ cần khi triển khai server (npm i pg); tên module để trong biến để bản đóng gói desktop không phụ thuộc.
    const ten = 'pg';
    const { Client } = (await import(ten)) as any;
    const c = new Client({ connectionString: url });
    await c.connect();
    try {
      await c.query(
        `INSERT INTO ai_luot_goi (thoi_gian, nha_cung_cap, model, loai_luan, ten_nguoi, token_vao, token_ra, token_cache_ghi, token_cache_doc, chi_phi_usd, thoi_gian_ms, thanh_cong, loi)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [l.thoiGian, l.nhaCungCap, l.model, l.loaiLuan, l.tenNguoi ?? null, l.tokenVao, l.tokenRa, l.tokenCacheGhi, l.tokenCacheDoc, l.chiPhiUSD, l.thoiGianMs, l.thanhCong, l.loi ?? null],
      );
      return true;
    } finally { await c.end(); }
  } catch { return false; }
}

/** Ghi một lượt gọi. Thử Postgres trước (nếu có DATABASE_URL), luôn ghi local làm dự phòng. */
export async function ghiLuotGoi(l: LuotGoi): Promise<void> {
  const daGhiPg = await ghiPostgres(l);
  if (!daGhiPg) ghiLocal(l);
}

/** Tổng hợp chi phí từ log local (dùng cho màn quản trị khi chạy desktop). */
export function tongHopLocal(tuNgay?: string, denNgay?: string): TongHop {
  const ds = docLocal().filter((l) => {
    const ngay = l.thoiGian.slice(0, 10);
    return (!tuNgay || ngay >= tuNgay) && (!denNgay || ngay <= denNgay);
  });
  const kq: TongHop = { tongLuot: ds.length, tongChiPhiUSD: 0, theoHang: {}, theoLoai: {}, theoNgay: [], ganDay: [] };
  const ngayMap = new Map<string, { luot: number; chiPhiUSD: number }>();
  for (const l of ds) {
    kq.tongChiPhiUSD += l.chiPhiUSD;
    const h = (kq.theoHang[l.nhaCungCap] ??= { luot: 0, chiPhiUSD: 0 });
    h.luot++; h.chiPhiUSD += l.chiPhiUSD;
    const t = (kq.theoLoai[l.loaiLuan] ??= { luot: 0, chiPhiUSD: 0 });
    t.luot++; t.chiPhiUSD += l.chiPhiUSD;
    const n = (ngayMap.get(l.thoiGian.slice(0, 10)) ?? { luot: 0, chiPhiUSD: 0 });
    n.luot++; n.chiPhiUSD += l.chiPhiUSD;
    ngayMap.set(l.thoiGian.slice(0, 10), n);
  }
  kq.theoNgay = [...ngayMap.entries()].map(([ngay, v]) => ({ ngay, ...v })).sort((a, b) => b.ngay.localeCompare(a.ngay));
  kq.tongChiPhiUSD = Math.round(kq.tongChiPhiUSD * 1e6) / 1e6;
  kq.ganDay = ds.slice(-20).reverse();
  return kq;
}

/** Tiện ích: dựng đối tượng LuotGoi từ kết quả luanGiai. */
export function luotGoiTuKetQua(p: {
  nhaCungCap: NhaCungCap; model: string; loaiLuan: LoaiLuan | 'tro-chuyen'; tenNguoi?: string;
  suDung: SuDung; chiPhiUSD: number; thoiGianMs: number; thanhCong: boolean; loi?: string;
}): LuotGoi {
  return {
    thoiGian: new Date().toISOString(),
    nhaCungCap: p.nhaCungCap, model: p.model, loaiLuan: p.loaiLuan, tenNguoi: p.tenNguoi,
    tokenVao: p.suDung.input_tokens ?? 0, tokenRa: p.suDung.output_tokens ?? 0,
    tokenCacheGhi: p.suDung.cache_creation_input_tokens ?? 0,
    tokenCacheDoc: p.suDung.cache_read_input_tokens ?? 0,
    chiPhiUSD: p.chiPhiUSD, thoiGianMs: p.thoiGianMs, thanhCong: p.thanhCong, loi: p.loi,
  };
}
