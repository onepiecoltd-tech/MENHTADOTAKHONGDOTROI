/** Quẻ Kinh Dịch 3D: sáu hào hiện dần từ dưới lên, hào động phát sáng, quẻ biến đứng bên cạnh. */
import * as THREE from 'three';
import type { KetQuaGieoQue, Que } from '../../src/kinhdich/index.js';
import { nhan, huyHieu, ketCauTron, type ManHinh } from './ve.js';

const ANH = 'assets/menh-ly-3d/kinh-dich/';
/** Tên quái tiếng Việt -> tên tệp ảnh bát quái. */
const FILE_QUAI: Record<string, string> = { Càn: 'qian', Khôn: 'kun', Khảm: 'kan', Chấn: 'zhen', Cấn: 'gen', Tốn: 'xun', Ly: 'li', Đoài: 'dui' };

function veQue(q: Que, x0: number, haoDong: number[], tre: number, mau: string, ben: 1 | -1): { nhom: THREE.Group; hao: THREE.Object3D[] } {
  const nhom = new THREE.Group(), hao: THREE.Object3D[] = [];
  q.hao.forEach((duong, i) => {
    const dong = haoDong.includes(i + 1);
    const mat = new THREE.MeshStandardMaterial({ color: dong ? '#ff9d3c' : mau, emissive: dong ? '#ff7a1a' : mau, emissiveIntensity: dong ? 0.9 : 0.22, metalness: 0.55, roughness: 0.3 });
    const g = new THREE.Group();
    if (duong) g.add(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.46, 0.8), mat));
    else for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.46, 0.8), mat); m.position.x = s * 1.325; g.add(m); }
    g.position.set(x0, 0.5 + i * 0.86, 0);
    g.userData = { xuat: tre + i * 0.42, dong, mat };
    g.scale.setScalar(0.001);
    nhom.add(g); hao.push(g);
  });
  const ten = nhan(`${q.so}. ${q.ten}`, { cao: 0.56, mau: '#f5c451' }); ten.position.set(x0, 6.35, 0); nhom.add(ten);
  // Nền: bát quái (ảnh) đứng sau sáu hào; hai huy hiệu quái (ảnh) ở hai bên, đúng quái trên và quái dưới của quẻ
  const bq = huyHieu(`${ANH.replace('kinh-dich/', '')}kinh-dich-bagua.png`, 7.6, 0.47);
  bq.rotation.x = 0; bq.position.set(x0, 2.95, -1.2); (bq.material as THREE.MeshBasicMaterial).opacity = 0.42; nhom.add(bq);
  const huyQuai = (quai: string, y: number, vt: string) => {
    const f = FILE_QUAI[quai]; if (!f) return;
    const h = huyHieu(`${ANH}trigrams/${f}.png`, 1.7, 0.47); h.rotation.x = 0; h.position.set(x0 + ben * 3.7, y, 0.2); nhom.add(h);
    const t = nhan(`${quai} ${vt}`, { cao: 0.34, mau: '#aab6e6', dam: false }); t.position.set(x0 + ben * 3.7, y - 1.13, 0.2); nhom.add(t);
  };
  huyQuai(q.thuongQuai, 3.95, 'trên'); huyQuai(q.haQuai, 1.36, 'dưới');
  return { nhom, hao };
}

export function manKinhDich(k: KetQuaGieoQue): ManHinh {
  const nhom = new THREE.Group();
  const coBien = Boolean(k.queBien);
  const x1 = coBien ? -3.9 : 0;
  const chu = veQue(k.queChu, x1, k.haoDong, 0.2, '#e8ecff', -1);
  nhom.add(chu.nhom);
  const tatCa = [...chu.hao];
  const n1 = nhan('QUẺ CHỦ', { cao: 0.3, mau: '#58d6e8' }); n1.position.set(x1, 7.0, 0); nhom.add(n1);
  if (k.queBien) {
    const bien = veQue(k.queBien, 4.3, [], 3.1, '#8fd3ff', 1);
    nhom.add(bien.nhom); tatCa.push(...bien.hao);
    const n2 = nhan('QUẺ BIẾN', { cao: 0.3, mau: '#58d6e8' }); n2.position.set(4.3, 7.0, 0); nhom.add(n2);
    const mt = nhan('→', { cao: 0.9, mau: '#f5c451' }); mt.position.set(0.2, 2.7, 0); nhom.add(mt);
  }
  // Ba đồng xu quay khi gieo
  const xu: THREE.Mesh[] = [];
  if (k.phuongPhap === 'ba-dong-xu') for (let i = 0; i < 3; i++) {
    // Đồng xu: hai mặt dùng ảnh đồng tiền thật cắt từ kinh-dich-coins.png, cạnh vàng
    const mat = new THREE.MeshStandardMaterial({ map: ketCauTron(`${ANH}kinh-dich-coins.png`, 0.5, [134, 348, 76, 76]), emissive: '#ffffff', emissiveIntensity: 0.4, emissiveMap: null, metalness: 0.5, roughness: 0.4 });
    mat.emissiveMap = mat.map;
    const canh = new THREE.MeshStandardMaterial({ color: '#d9a437', emissive: '#b8791a', emissiveIntensity: 0.5, metalness: 0.9, roughness: 0.25 });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 48), [canh, mat, mat]);
    m.position.set(x1 + (i - 1) * 1.3, 8.2, 0.6); nhom.add(m); xu.push(m);
  }
  const de = new THREE.Mesh(new THREE.BoxGeometry(coBien ? 15 : 7, 0.12, 2), new THREE.MeshStandardMaterial({ color: '#0d1440', emissive: '#f5c451', emissiveIntensity: 0.18, metalness: 0.7, roughness: 0.3 }));
  de.position.set(coBien ? 0.2 : 0, -0.1, 0); nhom.add(de);

  let tg = 0;
  const xong = 0.2 + 6 * 0.42 + 0.4;
  return {
    nhom, chon: [], mayQuay: { viTri: [0, 4.6, coBien ? 26 : 19], nhin: [coBien ? 0.2 : 0, 3.6, 0] },
    capNhat: (dt, t) => {
      tg += dt;
      for (const h of tatCa) {
        const p = Math.min(1, Math.max(0, (tg - h.userData.xuat) / 0.32));
        const e = 1 - Math.pow(1 - p, 3);
        h.scale.set(Math.max(0.001, e), Math.max(0.001, e), Math.max(0.001, e));
        if (h.userData.dong) h.userData.mat.emissiveIntensity = 0.7 + Math.sin(t * 4) * 0.35;
      }
      for (const [i, m] of xu.entries()) {
        const con = tg < xong;
        m.visible = tg < xong + 0.5;
        m.rotation.x += dt * (con ? 16 + i * 3 : 0); m.rotation.z += dt * (con ? 7 : 0);
        m.position.y = 8.2 + Math.abs(Math.sin(tg * 7.4 + i)) * 0.5 - Math.max(0, tg - xong) * 3;
      }
    },
  };
}
