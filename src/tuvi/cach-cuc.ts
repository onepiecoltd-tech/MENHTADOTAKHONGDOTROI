// Đánh giá 51 cách cục tử vi. Bộ điều kiện lấy từ TuViMCP (Apache-2.0, Manh Ha Nguyen,
// github.com/nmhaaa3218/TuViMCP); bộ đánh giá được viết lại bằng TypeScript trên lá số của MenhEngine.
import { LUAT_CACH_CUC } from './cach-cuc-du-lieu.js';
import type { LaSoTuVi } from './index.js';
import type { CungTuVi } from './an-sao.js';

type Cung = CungTuVi | undefined;
interface DkCung { branches_in?: string[]; stars_all?: string[]; stars_any?: string[]; stars_none?: string[]; not_both?: string[] }
interface DkSao { stars_required?: string[]; min_count?: number }
type DieuKien = {
  cung_menh?: DkCung; cung_quan?: DkCung; cung_tai?: DkCung; cung_dien?: DkCung; cung_ty?: DkCung; cung_dau?: DkCung; luc_hop?: DkCung;
  giap_cung?: DkSao; giap_cung_pairs?: [string, string][]; stem_contains?: string; any_of?: DieuKien[];
} & Partial<Record<'tam_phuong_tu_chinh' | 'tam_phuong_tu_chinh_aux' | 'tam_phuong_tu_chinh_loc' | 'tam_phuong_sat' | 'tam_phuong_loc' | 'tam_phuong_ma' | 'tam_phuong_tuong', DkSao>>;

export interface LuatCachCuc { id: number; ten: string; loai: string; moTa: string; lyDo: string; cổCa: string; binhChu: string; uuKhuyetDiem: string; dieuKien: DieuKien }
export interface CachCucTuVi { id: number; ten: string; loai: string; moTa: string; lyDo: string; uuKhuyetDiem: string; coCa: string }

const docLuat = () => LUAT_CACH_CUC as LuatCachCuc[];

const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const LUC_HOP = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]; // Tý–Sửu, Dần–Hợi, Mão–Tuất, Thìn–Dậu, Tỵ–Thân, Ngọ–Mùi
const chuan = (s: string) => s.trim().toLowerCase();
const coSao = (c: Cung, ten: string) => !!c && [...c.chinhTinh, ...c.phuTinh].some((s) => chuan(s.ten) === chuan(ten));

function khopCung(c: Cung, r: DkCung): boolean {
  if (!c) return false;
  if (r.branches_in && !r.branches_in.includes(c.chi)) return false;
  if (r.stars_all && !r.stars_all.every((s) => coSao(c, s))) return false;
  if (r.stars_any && !r.stars_any.some((s) => coSao(c, s))) return false;
  if (r.stars_none && r.stars_none.some((s) => coSao(c, s))) return false;
  if (r.not_both && r.not_both.every((s) => coSao(c, s))) return false;
  return true;
}
const demSao = (cs: Cung[], ten: string[]) => ten.filter((t) => cs.some((c) => coSao(c, t))).length;

function khopDieuKien(dk: DieuKien, la: LaSoTuVi): boolean {
  const idx = (i: number) => la.cung.find((c) => c.chi === CHI[((i % 12) + 12) % 12]);
  const menh = la.cung[0];
  const m = CHI.indexOf(menh.chi);
  const tamPhuong = [idx(m), idx(m + 6), idx(m + 4), idx(m + 8)];
  const giap = [idx(m - 1), idx(m + 1)];
  const chu = (ten: string) => la.cung.find((c) => c.ten === ten);
  if (dk.any_of) return dk.any_of.some((x) => khopDieuKien(x, la));
  if (dk.cung_menh && !khopCung(menh, dk.cung_menh)) return false;
  for (const k of ['tam_phuong_tu_chinh', 'tam_phuong_tu_chinh_aux', 'tam_phuong_tu_chinh_loc', 'tam_phuong_sat', 'tam_phuong_loc', 'tam_phuong_ma', 'tam_phuong_tuong'] as const) {
    const r = dk[k]; if (!r) continue;
    const can = r.stars_required ?? [];
    if (demSao(tamPhuong, can) < (r.min_count ?? can.length)) return false;
  }
  if (dk.giap_cung && demSao(giap, dk.giap_cung.stars_required ?? []) < (dk.giap_cung.min_count ?? 2)) return false;
  if (dk.giap_cung_pairs && !dk.giap_cung_pairs.some(([a, b]) => (coSao(giap[0], a) && coSao(giap[1], b)) || (coSao(giap[0], b) && coSao(giap[1], a)))) return false;
  if (dk.luc_hop && !khopCung(idx(LUC_HOP[m]), dk.luc_hop)) return false;
  if (dk.cung_quan && !khopCung(chu('Quan Lộc'), dk.cung_quan)) return false;
  if (dk.cung_tai && !khopCung(chu('Tài Bạch'), dk.cung_tai)) return false;
  if (dk.cung_dien && !khopCung(chu('Điền Trạch'), dk.cung_dien)) return false;
  if (dk.cung_ty && !khopCung(idx(5), dk.cung_ty)) return false;
  if (dk.cung_dau && !khopCung(idx(9), dk.cung_dau)) return false;
  if (dk.stem_contains && !la.amLich.canChiNam.split(' ')[0].includes(dk.stem_contains)) return false;
  return true;
}

/** Danh sách cách cục mà lá số thỏa điều kiện. Chỉ tra cứu, không đổi lá số. */
export function danhCachCuc(la: LaSoTuVi): CachCucTuVi[] {
  return docLuat().filter((l) => khopDieuKien(l.dieuKien, la)).map((l) => ({ id: l.id, ten: l.ten, loai: l.loai, moTa: l.moTa, lyDo: l.lyDo, uuKhuyetDiem: l.uuKhuyetDiem, coCa: l.cổCa }));
}
export const soLuatCachCuc = () => docLuat().length;
