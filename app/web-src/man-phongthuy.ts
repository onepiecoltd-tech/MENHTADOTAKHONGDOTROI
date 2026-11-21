/** Phong thủy 3D: bảng chín cung Huyền Không (Bắc ở trên) hoặc bảng lưu niên khi chưa nhập hướng nhà. */
import * as THREE from 'three';
import type { KetQuaPhongThuy } from '../../src/phongthuy/index.js';
import { ketCau, khungTron, nhan, anhSan, taiAnh, FONT, type ManHinh } from './ve.js';

const ANH = 'assets/menh-ly-3d/phong-thuy/';

type O = { id: 'T' | number; x: number; y: number; ten: string };
/** Bố trí la bàn: Tốn, Ly, Khôn / Chấn, Trung, Đoài / Cấn, Khảm, Càn (Nam ở trên theo lối la bàn Trung Hoa là ngược; ở đây Bắc ở trên như bản đồ). */
const LUOI: O[] = [
  { id: 8, x: -1, y: 1, ten: 'Đông Bắc' }, { id: 1, x: 0, y: 1, ten: 'Bắc' }, { id: 6, x: 1, y: 1, ten: 'Tây Bắc' },
  { id: 3, x: -1, y: 0, ten: 'Đông' }, { id: 'T', x: 0, y: 0, ten: 'Trung cung' }, { id: 7, x: 1, y: 0, ten: 'Tây' },
  { id: 4, x: -1, y: -1, ten: 'Đông Nam' }, { id: 9, x: 0, y: -1, ten: 'Nam' }, { id: 2, x: 1, y: -1, ten: 'Tây Nam' },
];
const mauSao = (s: number, van: number) => (s === van || s === ((van) % 9) + 1 ? '#3fbf73' : s === 5 || s === 2 ? '#ff6b5e' : '#aab6e6');

export function manPhongThuy(r: KetQuaPhongThuy, khiChon: (huong?: string) => void): ManHinh {
  const nhom = new THREE.Group(), chon: THREE.Object3D[] = [];
  const hk = r.huyenKhong;
  const cungHuong = hk?.cungHuong, cungToa = hk?.cungToa;
  const veLai: (() => void)[] = [];
  // La bàn làm nền dưới bảng chín cung
  const laban = new THREE.Mesh(new THREE.PlaneGeometry(17, 17), new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`${ANH}laban.png`, (t) => { t.colorSpace = THREE.SRGBColorSpace; }), transparent: true, opacity: 0.2, depthWrite: false }));
  laban.position.set(0, 3.6, -0.6); nhom.add(laban);
  for (const o of LUOI) {
    const c = hk && o.id !== 'T' ? hk.cung.find((x) => x.huong === o.ten) : undefined;
    const trung = hk && o.id === 'T' ? hk.trung : undefined;
    const lnien = r.luuNien.bay.find((x) => x.huong === o.ten)?.sao ?? r.luuNien.saoTrung;
    const la = o.ten === cungHuong ? 'HƯỚNG' : o.ten === cungToa ? 'TỌA' : '';
    const ve = (g: CanvasRenderingContext2D) => {
      const khung = anhSan(`${ANH}card.png`);
      if (khung) { g.drawImage(khung, 0, 0, 300, 300); if (la === 'HƯỚNG') { g.fillStyle = 'rgba(245,196,81,.20)'; g.fillRect(40, 40, 220, 220); } }
      else { g.fillStyle = la === 'HƯỚNG' ? 'rgba(245,196,81,.22)' : 'rgba(13,20,64,.92)'; khungTron(g, 6, 6, 288, 288, 26); g.fill(); g.strokeStyle = la ? '#f5c451' : 'rgba(170,182,230,.45)'; g.lineWidth = la ? 5 : 2; g.stroke(); }
      if (la && khung) { g.strokeStyle = '#f5c451'; g.lineWidth = 4; g.strokeRect(8, 8, 284, 284); }
      g.textAlign = 'center'; g.fillStyle = '#aab6e6'; g.font = `600 22px ${FONT}`; g.fillText(o.ten, 150, 76);
      if (la) { g.fillStyle = '#f5c451'; g.font = `700 15px ${FONT}`; g.textAlign = 'left'; g.fillText(la, 52, 64); g.textAlign = 'center'; }
      if (c || trung) {
        const d = c ?? { son: trung!.son, huongTinh: trung!.huongTinh, van: trung!.van };
        const orb = (n: number, cx: number) => {
          const im = anhSan(`${ANH}sao/${n}.png`);
          if (im) { g.drawImage(im, cx - 38, 92, 76, 76); g.save(); g.font = `700 40px ${FONT}`; g.textAlign = 'center'; g.lineWidth = 7; g.strokeStyle = 'rgba(0,0,0,.85)'; g.fillStyle = '#fff'; g.strokeText(String(n), cx, 144); g.fillText(String(n), cx, 144); g.restore(); }
          else { g.font = `700 78px ${FONT}`; g.fillStyle = mauSao(n, r.van); g.textAlign = 'center'; g.fillText(String(n), cx, 150); }
        };
        orb(d.son, 100); orb(d.huongTinh, 200);
        g.textAlign = 'center'; g.fillStyle = '#c9d2ff'; g.font = `600 34px ${FONT}`; g.fillText(String(d.van), 150, 212);
        g.font = `500 15px ${FONT}`; g.fillText('sơn · vận · hướng', 150, 236);
      } else {
        const im = anhSan(`${ANH}sao/${lnien}.png`);
        if (im) { g.drawImage(im, 95, 100, 110, 110); g.save(); g.font = `700 64px ${FONT}`; g.textAlign = 'center'; g.lineWidth = 9; g.strokeStyle = 'rgba(0,0,0,.85)'; g.fillStyle = '#fff'; g.strokeText(String(lnien), 150, 168); g.fillText(String(lnien), 150, 168); g.restore(); }
        else { g.font = `700 96px ${FONT}`; g.fillStyle = mauSao(lnien, 9); g.textAlign = 'center'; g.fillText(String(lnien), 150, 175); }
        g.font = `500 18px ${FONT}`; g.fillStyle = "#c9d2ff"; g.fillText(`lưu niên ${r.luuNien.nam}`, 150, 236);
      }
    };
    const tex = ketCau(300, 300, ve);
    veLai.push(() => { const t2 = ketCau(300, 300, ve); mat.map?.dispose(); mat.map = t2; mat.needsUpdate = true; });
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 3.3), mat);
    m.position.set(o.x * 3.55, o.y * 3.55 + 3.6, 0);
    m.userData = { bam: () => khiChon(o.id === 'T' ? undefined : o.ten) };
    nhom.add(m); chon.push(m);
  }
  const t = nhan(hk ? `Tọa ${hk.toaSon} · Hướng ${hk.huongSon} · Vận ${hk.van}` : `Lưu niên ${r.luuNien.nam} (${r.luuNien.chiNam})`, { cao: 0.55, mau: '#f5c451' });
  t.position.set(0, 9.0, 0); nhom.add(t);
  const n = nhan('Bắc ở trên · sao tốt xanh · Ngũ Hoàng, Nhị Hắc đỏ', { cao: 0.3, mau: '#8f9bd0' }); n.position.set(0, -2.2, 0); nhom.add(n);
  void Promise.all([`${ANH}card.png`, ...Array.from({ length: 9 }, (_, i) => `${ANH}sao/${i + 1}.png`)].map(taiAnh)).then(() => veLai.forEach((f) => f()));
  return { nhom, chon, anSan: true, mayQuay: { viTri: [0, 3.4, 20], nhin: [0, 3.4, 0] } };
}
