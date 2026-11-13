/** Bát tự 3D: bốn trụ, mỗi trụ gồm khối thiên can và khối địa chi tô màu theo ngũ hành. */
import * as THREE from 'three';
import type { LaSoBatTu, Tru } from '../../src/batu/index.js';
import { ketCau, nhan, huyHieu, taiAnh, anhSan, veTronAnh, FONT, MAU_HANH, type ManHinh } from './ve.js';
import { khoaCan, khoaChi } from './ui-anh.js';

const ANH = 'assets/menh-ly-3d/';
/** Vị trí hai ô trống (thiên can ở trên, địa chi ở dưới) trong từng ảnh khung trụ 256×512: [x0, y0, x1, y1]. */
const O_TRU: Record<string, [[number, number, number, number], [number, number, number, number]]> = {
  'tru-gio': [[71, 95, 180, 232], [69, 305, 182, 442]],
  'tru-ngay': [[80, 171, 175, 278], [80, 342, 175, 454]],
  'tru-thang': [[85, 99, 171, 222], [84, 310, 171, 436]],
  'tru-nam': [[91, 117, 162, 232], [91, 325, 161, 441]],
};
/** Vị trí x (px) của 5 biểu tượng Mộc, Hỏa, Thổ, Kim, Thủy trong ngu-hanh-icons.png (512×205). */
const NGU_HANH_X = [18, 118, 217, 315, 413];
const FILE_TRU: Record<string, string> = { 'Trụ Giờ': 'tru-gio', 'Trụ Ngày': 'tru-ngay', 'Trụ Tháng': 'tru-thang', 'Trụ Năm': 'tru-nam' };

/** Mặt trụ: ảnh khung có 2 ô trống, trong mỗi ô đặt huy hiệu Can/Chi bằng ảnh thật kèm tên và thông tin do bộ máy tính. */
function veTru(khung: string, can: { ten: string; khoa?: string; hanh: string; phu: string }, chi: { ten: string; khoa?: string; hanh: string; phu: string }): THREE.CanvasTexture {
  return ketCau(512, 1024, (x) => {
    const nen = anhSan(`${ANH}${khung}.png`);
    if (nen) x.drawImage(nen, 0, 0, 512, 1024); else { x.fillStyle = '#0a1030'; x.fillRect(0, 0, 512, 1024); }
    const [o1, o2] = O_TRU[khung];
    for (const [o, d, loai] of [[o1, can, 'can'], [o2, chi, 'chi']] as const) {
      const x0 = o[0] * 2, y0 = o[1] * 2, w = (o[2] - o[0]) * 2, h = (o[3] - o[1]) * 2;
      x.save(); x.beginPath(); x.rect(x0, y0, w, h); x.clip();
      const r = Math.min(w * 0.36, h * 0.25), cx = x0 + w / 2, cy = y0 + r + h * 0.05;
      const img = d.khoa ? anhSan(`${ANH}can-chi/${loai}/${d.khoa}.png`) : undefined;
      if (img) veTronAnh(x, img, cx, cy, r, 0.47); else { x.fillStyle = MAU_HANH[d.hanh]; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }
      x.lineWidth = 5; x.strokeStyle = MAU_HANH[d.hanh]; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
      x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      x.shadowColor = 'rgba(0,0,0,.95)'; x.shadowBlur = 8;
      x.fillStyle = '#ffffff'; x.font = `700 ${Math.round(h * 0.21)}px ${FONT}`; x.fillText(d.ten, cx, cy + r + h * 0.25);
      x.fillStyle = MAU_HANH[d.hanh]; x.font = `600 ${Math.round(h * 0.115)}px ${FONT}`; x.fillText(d.phu, cx, y0 + h - h * 0.035, w - 6);
      x.restore();
    }
  });
}

export function manBatTu(b: LaSoBatTu, khiChon: (ten: string, t: Tru) => void): ManHinh {
  const nhom = new THREE.Group();
  const chon: THREE.Object3D[] = [];
  const ds: [string, Tru][] = [['Trụ Giờ', b.tuTru.gio], ['Trụ Ngày', b.tuTru.ngay], ['Trụ Tháng', b.tuTru.thang], ['Trụ Năm', b.tuTru.nam]];
  const khoi: THREE.Mesh[] = [];
  const veLai: (() => void)[] = [];
  const anhCan = new Set<string>(), anhChi = new Set<string>();
  ds.forEach(([ten, t], i) => {
    const x0 = (i - 1.5) * 3.22, nhatChu = ten === 'Trụ Ngày', khung = FILE_TRU[ten];
    const can = { ten: t.can, khoa: khoaCan(t.can), hanh: t.hanhCan, phu: t.thapThan };
    const chi = { ten: t.chi, khoa: khoaChi(t.chi), hanh: t.hanhChi, phu: `Tàng ${t.tangCan.map((c) => c.can).join(' ')}` };
    if (can.khoa) anhCan.add(can.khoa); if (chi.khoa) anhChi.add(chi.khoa);
    const mat = new THREE.MeshBasicMaterial({ map: veTru(khung, can, chi), transparent: true });
    veLai.push(() => { mat.map?.dispose(); mat.map = veTru(khung, can, chi); mat.needsUpdate = true; });
    const cao = nhatChu ? 6.3 : 5.8, rong = cao / 2;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(rong, cao), mat);
    m.position.set(x0, 3.35, 0);
    if (nhatChu) {
      const vien = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(rong, cao)), new THREE.LineBasicMaterial({ color: '#f5c451' }));
      vien.position.z = 0.01; m.add(vien);
    }
    m.userData = { bam: () => khiChon(ten, t), goc: 3.35, pha: i * 0.7 };
    nhom.add(m); chon.push(m); khoi.push(m);
    const n = nhan(ten + (nhatChu ? ' · Nhật chủ' : ''), { cao: nhatChu ? 0.5 : 0.42, mau: nhatChu ? '#1b1305' : '#cfd8ff', nen: nhatChu ? '#f5c451' : undefined });
    n.position.set(x0, 7.0, 0); nhom.add(n);
    if (nhatChu) {
      // quầng sáng vàng phía sau trụ ngày
      const qua = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 7.8), new THREE.MeshBasicMaterial({ map: ketCau(64, 128, (c) => { const g = c.createRadialGradient(32, 64, 4, 32, 64, 64); g.addColorStop(0, 'rgba(245,196,81,.55)'); g.addColorStop(1, 'rgba(245,196,81,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 128); }), transparent: true, depthWrite: false }));
      qua.position.set(x0, 3.35, -0.9); nhom.add(qua);
    }
  });
  // Tải ảnh khung + huy hiệu Can Chi xong thì vẽ lại mặt các trụ
  void Promise.all([...Object.values(FILE_TRU).map((f) => `${ANH}${f}.png`), ...[...anhCan].map((k) => `${ANH}can-chi/can/${k}.png`), ...[...anhChi].map((k) => `${ANH}can-chi/chi/${k}.png`)].map(taiAnh)).then(() => veLai.forEach((f) => f()));

  // Ngũ hành: năm cột cao theo số lượng trong 8 chữ
  const hanh = Object.entries(b.nguHanh);
  hanh.forEach(([ten, so], i) => {
    const cao = 0.3 + so * 0.55;
    const cot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, cao, 32), new THREE.MeshStandardMaterial({ color: MAU_HANH[ten], emissive: MAU_HANH[ten], emissiveIntensity: so ? 0.35 : 0.05, metalness: 0.3, roughness: 0.4, transparent: true, opacity: so ? 1 : 0.35 }));
    cot.position.set((i - 2) * 2.1, -2.3 + cao / 2, 3.6); nhom.add(cot);
    const n = nhan(`${ten} ${so}`, { cao: 0.44, mau: MAU_HANH[ten] }); n.position.set((i - 2) * 2.1, -1.8 + cao, 3.6); nhom.add(n);
    // Huy hiệu ngũ hành (ảnh thật) làm chân đế dưới cột; cắt từ ảnh 5 biểu tượng nằm ngang
    const bieuTuong = huyHieu(`${ANH}ngu-hanh-icons.png`, 1.0, 0.5, [NGU_HANH_X[i] - 1, 63, 83, 83]);
    bieuTuong.rotation.x = 0; bieuTuong.position.set((i - 2) * 2.1, -1.7, 4.5); nhom.add(bieuTuong);
  });
  const de = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.14, 2.2), new THREE.MeshStandardMaterial({ color: '#0d1440', emissive: '#58d6e8', emissiveIntensity: 0.18, metalness: 0.7, roughness: 0.3 }));
  de.position.set(0, 0.1, 0); nhom.add(de);

  return {
    nhom, chon, mayQuay: { viTri: [0, 5.0, 23.5], nhin: [0, 1.8, 1.2] },
    capNhat: (_dt, t) => { for (const m of khoi) m.position.y = m.userData.goc + Math.sin(t * 0.9 + m.userData.pha) * 0.05; },
  };
}
