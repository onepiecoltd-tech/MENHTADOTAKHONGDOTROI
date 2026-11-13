/** Trải bài tarot 3D: lá bài bay từ bộ bài ra vị trí và lật mặt. Mặt bài dùng ảnh thật 78 lá, mặt sau dùng tarot-card.png. Nhãn vị trí là sprite luôn nằm ngang, không xoay theo lá ngược. */
import * as THREE from 'three';
import type { KetQuaTarot } from '../../src/tarot/index.js';
import { nhan, type ManHinh } from './ve.js';
import { fileBai } from './anh-bai.js';

const H = 3.95, W = H * (2 / 3); // ảnh lá bài có tỉ lệ 2:3
const GOC = 'assets/menh-ly-3d/tarot/';
const MAT_SAU = 'assets/menh-ly-3d/tarot-card.png';
const nap = new THREE.TextureLoader();
const boNho = new Map<string, THREE.Texture>();
/** Nạp ảnh một lần, dùng lại cho các lần rút sau (không bị huy() giải phóng vì giữ ở đây). */
function anh(duongDan: string): THREE.Texture {
  let t = boNho.get(duongDan);
  if (!t) { t = nap.load(duongDan); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; boNho.set(duongDan, t); }
  return t;
}
function matBai(map: THREE.Texture): THREE.MeshStandardMaterial {
  // emissive cùng ảnh để màu bài không bị ánh sáng cảnh làm tối
  return new THREE.MeshStandardMaterial({ map, emissive: '#ffffff', emissiveMap: map, emissiveIntensity: 0.55, roughness: 0.6 });
}
/** Mặt trước = ảnh thật theo tên tiếng Anh của lá (fileBai). Không có ảnh thì dùng tấm nền tối để không vỡ cảnh. */
function matTruoc(tenAnh: string): THREE.MeshStandardMaterial {
  const f = fileBai(tenAnh);
  return f ? matBai(anh(GOC + f)) : new THREE.MeshStandardMaterial({ color: '#1a2150', roughness: 0.7 });
}

const VI_TRI: Record<string, [number, number, number?][]> = {
  'mot-la': [[0, 0.4]],
  'ba-la': [[-3.1, 0.4], [0, 0.4], [3.1, 0.4]],
  'tinh-huong': [[-3.1, 0.4], [0, 0.4], [3.1, 0.4]],
  'celtic-cross': [[-2.4, 0], [-2.4, 0, 1], [-2.4, -5.3], [-5.9, 0], [-2.4, 5.3], [1.1, 0], [5.7, -6.975], [5.7, -2.325], [5.7, 2.325], [5.7, 6.975]],
};

export function manTarot(k: KetQuaTarot, khiChon: (i: number) => void): ManHinh {
  const nhom = new THREE.Group(), chon: THREE.Object3D[] = [];
  const celtic = k.kieuTrai === 'celtic-cross';
  const vt = VI_TRI[k.kieuTrai];
  const vien = new THREE.MeshStandardMaterial({ color: '#c99a2e', metalness: 0.8, roughness: 0.3 });
  const la: THREE.Mesh[] = [];
  k.cacLa.forEach((c, i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.035), [vien, vien, vien, vien, matTruoc(c.la.tenAnh), matBai(anh(MAT_SAU))]);
    const [x, y, ngang] = vt[i];
    m.userData = { tu: new THREE.Vector3(celtic ? -11 : 0, celtic ? -8 : -7.5, 0.3 + i * 0.04), den: new THREE.Vector3(x, y, ngang ? 0.16 : 0), tre: 0.25 + i * 0.42, xoayZ: (ngang ? Math.PI / 2 : 0) + (c.nguoc ? Math.PI : 0), bam: () => khiChon(i) };
    m.position.copy(m.userData.tu); m.rotation.y = Math.PI;
    nhom.add(m); la.push(m); chon.push(m);
    const n = nhan(`${i + 1}. ${c.viTri}${c.nguoc ? ' · ngược' : ''}`, { cao: celtic ? 0.34 : 0.36, mau: c.nguoc ? '#ff9a8a' : '#f5c451', nen: 'rgba(6,9,28,.8)' });
    n.position.set(x, y - H / 2 - (ngang ? 0.82 : celtic && x > 4 ? 0.3 : 0.36), 0.3); n.material.opacity = 0; n.userData.tre = m.userData.tre + 0.9;
    nhom.add(n); m.userData.nhan = n;
  });
  let tg = 0;
  return {
    nhom, chon, anSan: true, mayQuay: celtic ? { viTri: [0.4, -0.6, 33.5], nhin: [0.4, 0, 0] } : { viTri: [0, 0.2, k.cacLa.length === 1 ? 11 : 14.5], nhin: [0, 0.2, 0] },
    capNhat: (dt, t) => {
      tg += dt;
      la.forEach((m, i) => {
        const u = m.userData, p = Math.min(1, Math.max(0, (tg - u.tre) / 0.95)), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        m.position.lerpVectors(u.tu, u.den, e); m.position.z += Math.sin(e * Math.PI) * 2.2;
        m.rotation.y = Math.PI * (1 - e); m.rotation.z = u.xoayZ * e;
        if (p >= 1) m.position.z = u.den.z + Math.sin(t * 1.3 + i) * 0.04;
        u.nhan.material.opacity = Math.min(1, Math.max(0, (tg - u.nhan.userData.tre) / 0.4));
      });
    },
  };
}
