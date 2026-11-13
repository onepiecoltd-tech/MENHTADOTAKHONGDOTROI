import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import { join } from 'node:path';
import { scryptSync, timingSafeEqual, randomBytes, createHmac } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { lapVeDa, lapBatTu, lapTuVi, lapChiemTinh, gieoQueDongXu, gieoQueMaiHoa, ganLoiQue, rutBai, datLoiQue, DIA_DIEM, type ThongTinSinh } from '../src/index.js';
import { taoMayKhach, kiemTraHang, chonModel, GIA_MOI, TEN_NHA_CUNG_CAP, ghiLuotGoi, luotGoiTuKetQua, tongHopLocal, datThuMucLocal, type NhaCungCap } from '../src/ai/index.js';
import { rutGonBatTu, rutGonTuVi, rutGonQue, rutGonTarot, rutGonChiemTinh, rutGonVeDa, luanGiai, taoMayKhachTaiKhoan, kiemTraDangNhap, type MayKhach, type LoaiLuan } from '../src/ai/index.js';
import loiQue from '../data/kinhdich/loi-que.json';

datLoiQue(loiQue as any);

interface CauHinh {
  ketNoi: 'taikhoan' | 'api';
  nhaCungCap: NhaCungCap; // 'claude' | 'openai' | 'gemini' | 'grok' | 'meta'
  khoa: Record<string, string>; // khóa theo hãng; chỉ nằm trong tiến trình chính, không gửi sang giao diện
  khoaApi: string; // tương thích cấu hình cũ (= khóa Claude)
  ghiNhoQuanTri?: { nonce: string; mac: string }; // dấu ghi nhớ đăng nhập quản trị trên máy này (ký bằng HMAC, sửa tay file sẽ không có tác dụng)
}
const HANG_API: NhaCungCap[] = ['claude', 'openai', 'gemini', 'grok', 'meta'];
const tepCauHinh = () => join(app.getPath('userData'), 'cau-hinh.json');
function docCauHinh(): CauHinh {
  try {
    const cu = JSON.parse(readFileSync(tepCauHinh(), 'utf8').replace(/^\uFEFF/, ''));
    const khoa = { ...(cu.khoaApi ? { claude: cu.khoaApi } : {}), ...(cu.khoa ?? {}) };
    return { ketNoi: 'taikhoan', nhaCungCap: 'claude', khoaApi: '', ...cu, khoa };
  } catch { return { ketNoi: 'taikhoan', nhaCungCap: 'claude', khoa: {}, khoaApi: '' }; }
}
function ghiCauHinh(c: CauHinh) { mkdirSync(app.getPath('userData'), { recursive: true }); writeFileSync(tepCauHinh(), JSON.stringify(c, null, 2)); }
/** Phần cấu hình an toàn gửi cho giao diện: chỉ cho biết hãng nào đã có khóa, không bao giờ gửi khóa. */
function cauHinhChoGiaoDien() {
  const c = docCauHinh();
  return { ketNoi: c.ketNoi, nhaCungCap: c.nhaCungCap, coKhoa: Object.fromEntries(HANG_API.map((h) => [h, Boolean(c.khoa[h])])), quanTri: laQuanTri(c) };
}

/* ---------- Tài khoản quản trị ----------
 * Mật khẩu KHÔNG nằm trong mã nguồn hay trong bản exe: chỉ có muối và giá trị băm scrypt.
 * Đăng nhập đúng thì phiên hiện tại là quản trị viên; tick "ghi nhớ" thì lưu dấu ký HMAC để lần mở sau khỏi nhập lại. */
const QT_ID = 'admin';
const QT_MUOI = Buffer.from('07dfbec2704a12803875b400458aba1a', 'hex');
const QT_BAM = Buffer.from('294b837b7619ceb32806015453ca129f04757e088002ab631d7a9f5366d323d2', 'hex');
let phienQuanTri = false;
let saiLienTiep = 0, khoaDen = 0;
const kyGhiNho = (nonce: string) => createHmac('sha256', QT_BAM).update(`quan-tri|${nonce}`).digest('hex');
function laQuanTri(c: CauHinh): boolean {
  if (phienQuanTri || process.env.MENH_QUAN_TRI === '1') return true;
  const g = c.ghiNhoQuanTri;
  if (!g?.nonce || !g.mac) return false;
  const dung = Buffer.from(kyGhiNho(g.nonce)), co = Buffer.from(String(g.mac));
  return dung.length === co.length && timingSafeEqual(dung, co);
}
function dangNhapQuanTri(d: { id?: string; matKhau?: string; ghiNho?: boolean }) {
  if (Date.now() < khoaDen) throw new Error(`Sai quá nhiều lần, thử lại sau ${Math.ceil((khoaDen - Date.now()) / 1000)} giây.`);
  const bam = scryptSync(String(d.matKhau ?? ''), QT_MUOI, 32, { N: 16384, r: 8, p: 1 });
  const dung = String(d.id ?? '').trim().toLowerCase() === QT_ID && timingSafeEqual(bam, QT_BAM);
  if (!dung) {
    if (++saiLienTiep >= 5) { khoaDen = Date.now() + 60_000; saiLienTiep = 0; }
    throw new Error('Sai ID hoặc mật khẩu.');
  }
  saiLienTiep = 0; phienQuanTri = true;
  const c = docCauHinh();
  if (d.ghiNho) { const nonce = randomBytes(16).toString('hex'); c.ghiNhoQuanTri = { nonce, mac: kyGhiNho(nonce) }; ghiCauHinh(c); }
  return cauHinhChoGiaoDien();
}
function dangXuatQuanTri() {
  phienQuanTri = false;
  const c = docCauHinh(); delete c.ghiNhoQuanTri; ghiCauHinh(c);
  return cauHinhChoGiaoDien();
}
const hangDangDung = (c: CauHinh): NhaCungCap => (c.ketNoi === 'api' ? c.nhaCungCap : 'taikhoan');

function moMayKhach(): MayKhach {
  const c = docCauHinh();
  if (c.ketNoi === 'api') return taoMayKhach(c.nhaCungCap === 'taikhoan' ? 'claude' : c.nhaCungCap, c.khoa);
  const kt = kiemTraDangNhap();
  if (!kt.ok) throw new Error(kt.thongBao);
  return taoMayKhachTaiKhoan();
}

/* Bảng giá: bản mặc định nằm trong GIA_MOI; giá admin đã sửa lưu ở ai-gia.json và nạp lại mỗi lần mở app. */
const tepGia = () => join(app.getPath('userData'), 'ai-gia.json');
const hangCuaModel = (m: string) => (m.startsWith('claude') ? 'claude' : m.startsWith('gpt') ? 'openai' : m.startsWith('gemini') ? 'gemini' : m.startsWith('grok') ? 'grok' : 'meta');
function bangGia() {
  return Object.entries(GIA_MOI).map(([model, g]) => ({ nha_cung_cap: hangCuaModel(model), model, gia_vao_1m: g.vao, gia_ra_1m: g.ra }));
}
function napGiaDaSua() {
  try { for (const g of JSON.parse(readFileSync(tepGia(), 'utf8').replace(/^\uFEFF/, '')) as { model: string; gia_vao_1m: number; gia_ra_1m: number }[]) if (GIA_MOI[g.model]) { GIA_MOI[g.model].vao = g.gia_vao_1m; GIA_MOI[g.model].ra = g.gia_ra_1m; } } catch { /* chưa có file giá */ }
}
function ghiBangGia(ds: { nhaCungCap: string; model: string; giaVao: number; giaRa: number }[]) {
  for (const g of ds) if (GIA_MOI[g.model] && g.giaVao >= 0 && g.giaRa >= 0) { GIA_MOI[g.model].vao = g.giaVao; GIA_MOI[g.model].ra = g.giaRa; }
  mkdirSync(app.getPath('userData'), { recursive: true });
  writeFileSync(tepGia(), JSON.stringify(bangGia(), null, 2));
}

/** Mọi lời gọi từ giao diện đi qua đây. Giao diện chỉ vẽ; tính toán và gọi AI nằm ở tiến trình chính. */
const XU_LY: Record<string, (d: any) => unknown> = {
  diaDiem: () => DIA_DIEM,
  hoSo: (d: { sinh: ThongTinSinh; noiSinh?: { ten: string; viDo: number; kinhDo: number } }) => {
    const tuVi = lapTuVi(d.sinh), batTu = lapBatTu(d.sinh), veDa = lapVeDa(d.sinh, d.noiSinh ?? DIA_DIEM[0]);
    // Mục Chiêm tinh dùng Vệ Đà: vòng 3D vẽ bản đồ sidereal, AI luận theo Jyotish.
    return { tuVi, batTu, chiemTinh: veDa.banDo, veDa, rutGon: { 'tu-vi': rutGonTuVi(tuVi), 'bat-tu': rutGonBatTu(batTu), 'chiem-tinh': rutGonVeDa(veDa) } };
  },
  que: (d: { phuongPhap: 'xu' | 'maihoa'; cauHoi: string }) => {
    const kq = ganLoiQue(d.phuongPhap === 'maihoa' ? gieoQueMaiHoa(d.cauHoi) : gieoQueDongXu(d.cauHoi));
    return { que: kq, rutGon: rutGonQue(kq) };
  },
  tarot: (d: { kieuTrai: any; cauHoi: string }) => { const kq = rutBai(d.kieuTrai, d.cauHoi); return { tarot: kq, rutGon: rutGonTarot(kq) }; },
  luan: async (d: { loai: LoaiLuan; duLieu: string[]; cauHoi?: string; hoSo?: string; hoiDap?: any[]; soLaBai?: number }) => {
    const batDau = Date.now();
    const c = docCauHinh(), hang = hangDangDung(c);
    const ten = hang === 'taikhoan' ? 'Tài khoản Claude' : TEN_NHA_CUNG_CAP[hang];
    // Hãng không phải Claude: chọn model của hãng đó (dinhTuyen chỉ biết model Claude).
    const model = hang === 'taikhoan' || hang === 'claude' ? undefined : chonModel(hang, d.loai, false, d.soLaBai);
    try {
      const kq = await luanGiai(moMayKhach(), { loai: d.loai, duLieu: d.duLieu, cauHoi: d.cauHoi, hoSo: d.hoSo, hoiDap: d.hoiDap, nguCanh: { soLaBai: d.soLaBai }, model });
      await ghiLuotGoi(luotGoiTuKetQua({ nhaCungCap: hang, model: kq.model, loaiLuan: d.loai, tenNguoi: d.hoSo, suDung: kq.suDung, chiPhiUSD: kq.chiPhiUSD, thoiGianMs: Date.now() - batDau, thanhCong: true }));
      return { vanBan: kq.vanBan, model: kq.model, chiPhiUSD: kq.chiPhiUSD, ketNoi: c.ketNoi, nhaCungCap: ten };
    } catch (e) {
      await ghiLuotGoi(luotGoiTuKetQua({ nhaCungCap: hang, model: model ?? '', loaiLuan: d.loai, tenNguoi: d.hoSo, suDung: {}, chiPhiUSD: 0, thoiGianMs: Date.now() - batDau, thanhCong: false, loi: (e as Error).message }));
      throw e;
    }
  },
  kiemTra: () => {
    const c = docCauHinh();
    // Không gọi AI thật ở đây (chạy mỗi lần mở app, sẽ tốn tiền); chỉ kiểm tra đã có khóa. Gọi thử thật nằm ở nút Kiểm tra.
    if (c.ketNoi === 'api') { const co = Boolean(c.khoa[c.nhaCungCap]); return { ok: co, thongBao: co ? `Đã có khóa ${TEN_NHA_CUNG_CAP[c.nhaCungCap]}.` : `Chưa nhập khóa ${TEN_NHA_CUNG_CAP[c.nhaCungCap]}.`, ketNoi: 'api', nhaCungCap: TEN_NHA_CUNG_CAP[c.nhaCungCap] }; }
    return { ...kiemTraDangNhap(), ketNoi: 'taikhoan', nhaCungCap: 'Tài khoản Claude' };
  },
  /** Nút Kiểm tra trong Cài đặt: gọi thật một lượt rất ngắn để biết khóa dùng được không. */
  kiemTraHang: async (d: { nhaCungCap: NhaCungCap }) => kiemTraHang(d.nhaCungCap, docCauHinh().khoa),
  docCauHinh: () => cauHinhChoGiaoDien(),
  dangNhapQuanTri: (d: { id?: string; matKhau?: string; ghiNho?: boolean }) => dangNhapQuanTri(d),
  dangXuatQuanTri: () => dangXuatQuanTri(),
  ghiCauHinh: (d: { ketNoi?: 'taikhoan' | 'api'; nhaCungCap?: NhaCungCap; khoa?: Record<string, string> }) => {
    const c = docCauHinh();
    if (d.ketNoi) c.ketNoi = d.ketNoi;
    if (d.nhaCungCap && HANG_API.includes(d.nhaCungCap)) c.nhaCungCap = d.nhaCungCap;
    for (const [h, k] of Object.entries(d.khoa ?? {})) if (HANG_API.includes(h as NhaCungCap) && k.trim()) c.khoa[h] = k.trim(); // ô trống = giữ khóa cũ
    c.khoaApi = c.khoa.claude ?? '';
    ghiCauHinh(c);
    return cauHinhChoGiaoDien();
  },
  chiPhi: (d: { kieu: 'tongHop' | 'gia' | 'suaGia'; tuNgay?: string; denNgay?: string; ds?: { nhaCungCap: string; model: string; giaVao: number; giaRa: number }[] }) => {
    if (!cauHinhChoGiaoDien().quanTri) throw new Error('Chỉ quản trị viên mới xem được chi phí.');
    if (d.kieu === 'tongHop') return tongHopLocal(d.tuNgay, d.denNgay);
    if (d.kieu === 'gia') return bangGia();
    if (d.kieu === 'suaGia') { ghiBangGia(d.ds ?? []); return { ok: true }; }
    throw new Error('Không có kiểu chiPhi ' + d.kieu);
  },
};

ipcMain.handle('menh', async (_e, ten: string, duLieu: unknown) => {
  try {
    if (!XU_LY[ten]) throw new Error(`Không có lệnh ${ten}`);
    return { ok: true, kq: await XU_LY[ten](duLieu) };
  } catch (e) {
    return { ok: false, loi: (e as Error).message };
  }
});

async function taoCuaSo() {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 1560, height: 940, minWidth: 1180, minHeight: 720, backgroundColor: '#05060f', title: 'Mệnh Lý 3D — Craftbyte', 
    webPreferences: { preload: join(__dirname, '..', 'preload.js'), contextIsolation: true, nodeIntegration: false, backgroundThrottling: false },
  });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  await win.loadFile(join(__dirname, '..', 'web', 'index.html'));

  // Chế độ tự chụp màn hình để kiểm thử: MENH_CHUP_DIR=<thư mục>
  const dir = process.env.MENH_CHUP_DIR;
  if (dir) {
    mkdirSync(dir, { recursive: true });
    win.setContentSize(1560, 940);
    const loi: string[] = [];
    win.webContents.on('console-message', (_e: any, level: any, message: any) => { if (level >= 2 || String(message).startsWith('[thu]')) loi.push(String(message)); });
    const cho = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await cho(1500);
    for (const buoc of (process.env.MENH_CHUP_BUOC ? process.env.MENH_CHUP_BUOC.split(',') : ['gioithieu', 'tuvi', 'tuvi-chon', 'batu', 'chiemtinh', 'cho', 'kinhdich', 'tarot', 'tarot-celtic', 'qt-sai', 'quantri'])) {
      await win.webContents.executeJavaScript(`window.__thu(${JSON.stringify(buoc)})`);
      await cho(buoc === 'tarot-celtic' ? 14000 : buoc === 'chiemtinh' ? 12000 : buoc === 'tarot' || buoc === 'kinhdich' ? 9000 : 2600);
      writeFileSync(join(dir, `${buoc}.png`), (await win.webContents.capturePage()).toPNG());
    }
    writeFileSync(join(dir, 'console.txt'), loi.join('\n'));
    app.quit();
  }
}

app.whenReady().then(() => { datThuMucLocal(app.getPath('userData')); napGiaDaSua(); return taoCuaSo(); });
app.on('window-all-closed', () => app.quit());
