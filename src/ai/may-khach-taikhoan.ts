/**
 * Máy khách gọi Claude bằng tài khoản đã đăng nhập Claude Code (lệnh `claude -p`), không cần khóa API.
 * Chỉ dùng cho chính chủ tài khoản (thử nghiệm, xem cho người quen). Sản phẩm phục vụ khách phải dùng khóa API.
 * Lượng dùng trừ vào hạn mức Agent SDK của gói thuê bao.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type Anthropic from '@anthropic-ai/sdk';
import type { MayKhach } from './luan-giai.js';

const BIN = () => process.env.CLAUDE_BIN ?? 'claude';
const WIN = process.platform === 'win32';

/** Môi trường cho tiến trình con: bỏ khóa API để Claude Code dùng đăng nhập thuê bao. */
function moiTruong(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  return env;
}

/** Trên Windows `claude` có thể là claude.cmd nên phải chạy qua shell và tự bọc tham số. */
const boc = (a: string) => (a === '' ? '""' : /[\s"&|<>^]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const chay = (args: string[], opts: object) => (WIN ? spawn([BIN(), ...args].map(boc).join(' '), { ...opts, shell: true, windowsHide: true }) : spawn(BIN(), args, opts));

/** Tham số dòng lệnh cho một lượt gọi. Tắt mọi công cụ và tùy biến để Claude chỉ trả lời văn bản. */
export function thamSoClaude(model: string, tepSystem: string): string[] {
  return [
    '-p',
    '--output-format', 'json',
    '--model', model,
    '--system-prompt-file', tepSystem,
    '--tools', '', // không cho dùng công cụ có sẵn (Bash, đọc/ghi tệp...)
    '--disallowedTools', 'mcp__*', // không dùng công cụ MCP
    '--safe-mode', // không nạp CLAUDE.md, skill, plugin, hook; đăng nhập vẫn hoạt động
    '--disable-slash-commands',
    '--no-session-persistence',
  ];
}

/** Gộp hội thoại nhiều lượt thành một prompt văn bản (`claude -p` nhận một prompt qua stdin). */
export function gopHoiThoai(messages: Anthropic.MessageParam[]): string {
  const van = (c: Anthropic.MessageParam['content']) => (typeof c === 'string' ? c : c.map((b: any) => (b.type === 'text' ? b.text : b.type === 'tool_result' ? `[KẾT QUẢ CÔNG CỤ]\n${typeof b.content === 'string' ? b.content : JSON.stringify(b.content)}` : '')).filter(Boolean).join('\n\n'));
  if (messages.length === 1) return van(messages[0].content);
  return messages.map((m) => `${m.role === 'user' ? '### NGƯỜI XEM' : '### BẠN ĐÃ TRẢ LỜI'}\n${van(m.content)}`).join('\n\n') + '\n\n### Hãy trả lời lượt cuối của người xem.';
}

/** Đọc kết quả JSON của `claude -p --output-format json`. */
export function docKetQua(stdout: string) {
  const dong = stdout.trim().split('\n').reverse().find((d) => d.trim().startsWith('{'));
  if (!dong) throw new Error(`Claude Code không trả về JSON: ${stdout.slice(0, 300)}`);
  const j = JSON.parse(dong);
  if (j.is_error || typeof j.result !== 'string') throw new Error(`Claude Code báo lỗi: ${String(j.result ?? j.error ?? stdout).slice(0, 400)}`);
  return { content: [{ type: 'text', text: j.result }], stop_reason: 'end_turn', usage: j.usage ?? {}, chiPhiUocTinhUSD: j.total_cost_usd as number | undefined };
}

export function taoMayKhachTaiKhoan(thoiGianChoMs = 300_000): MayKhach {
  return {
    messages: {
      create: (p) =>
        new Promise((resolve, reject) => {
          if (p.tools?.length) return reject(new Error('Chế độ tài khoản không hỗ trợ tool-use trực tiếp; dùng troChuyenHaiBuoc.'));
          const thuMuc = mkdtempSync(join(tmpdir(), 'menh-'));
          const tepSystem = join(thuMuc, 'system.txt');
          const sys = typeof p.system === 'string' ? p.system : (p.system ?? []).map((s) => s.text).join('\n\n');
          writeFileSync(tepSystem, sys, 'utf8');
          const don = () => { try { rmSync(thuMuc, { recursive: true, force: true }); } catch { /* bỏ qua */ } };
          // cwd là thư mục tạm trống để Claude Code không nạp cấu hình của dự án nào.
          const con = chay(thamSoClaude(p.model, tepSystem), { cwd: thuMuc, env: moiTruong(), stdio: ['pipe', 'pipe', 'pipe'] });
          let out = '', err = '';
          const hen = setTimeout(() => { con.kill(); reject(new Error('Claude Code không phản hồi trong thời gian chờ')); }, thoiGianChoMs);
          con.stdout!.on('data', (d) => (out += d));
          con.stderr!.on('data', (d) => (err += d));
          con.on('error', (e) => { clearTimeout(hen); don(); reject(new Error(`Không chạy được lệnh "${BIN()}". Cài Claude Code và chạy "claude auth login" trước. (${e.message})`)); });
          con.on('close', (ma) => {
            clearTimeout(hen); don();
            try { resolve(docKetQua(out)); } catch (e) { reject(new Error(`${(e as Error).message}${err ? `\n${err.slice(0, 300)}` : ''} (mã thoát ${ma})`)); }
          });
          con.stdin!.end(gopHoiThoai(p.messages), 'utf8');
        }),
    },
  };
}

/** Kiểm tra Claude Code đã cài và đăng nhập bằng tài khoản thuê bao chưa. */
export function kiemTraDangNhap(): { ok: boolean; thongBao: string } {
  const r = WIN ? spawnSync(`${boc(BIN())} auth status`, { shell: true, encoding: 'utf8', env: moiTruong(), windowsHide: true, timeout: 20000 }) : spawnSync(BIN(), ['auth', 'status'], { encoding: 'utf8', env: moiTruong() });
  if (r.error) return { ok: false, thongBao: `Chưa tìm thấy lệnh "${BIN()}". Cài Claude Code rồi chạy: claude auth login` };
  try {
    const j = JSON.parse(r.stdout);
    const pp = j.authMethod ?? 'none';
    if (pp === 'claude.ai' || pp === 'oauth_token') return { ok: true, thongBao: `Đã đăng nhập bằng tài khoản Claude (${pp}).` };
    if (pp === 'none') return { ok: false, thongBao: 'Chưa đăng nhập. Chạy: claude auth login' };
    return { ok: false, thongBao: `Claude Code đang dùng "${pp}" chứ không phải tài khoản thuê bao. Chạy: claude auth login` };
  } catch {
    return { ok: r.status === 0, thongBao: (r.stdout || r.stderr || '').trim().slice(0, 300) || 'Không đọc được trạng thái đăng nhập.' };
  }
}
