/** Bản đồ sao 3D: vòng hoàng đạo, 12 nhà, hành tinh và các góc chiếu. Cung Mọc đặt bên trái như bản đồ sao truyền thống. */
import * as THREE from 'three';
import type { LaSoChiemTinh, ViTri } from '../../src/chiemtinh/index.js';
import { nhan, ong, huyHieu, FONT_KY_HIEU, type ManHinh } from './ve.js';

const ANH = 'assets/menh-ly-3d/chiem-tinh/';
const FILE_HANH_TINH: Record<string, string> = { 'Mặt Trời': 'sun', 'Mặt Trăng': 'moon', 'Sao Thủy': 'mercury', 'Sao Kim': 'venus', 'Sao Hỏa': 'mars', 'Sao Mộc': 'jupiter', 'Sao Thổ': 'saturn', 'Thiên Vương': 'uranus', 'Hải Vương': 'neptune', 'Diêm Vương': 'pluto', 'La Hầu': 'rahu', 'Kế Đô': 'ketu' };

const MAU_NGUYEN_TO = ['#ff6a55', '#7fbf6a', '#f2d36b', '#55a8ff']; // Lửa, Đất, Khí, Nước
const HANH_TINH: Record<string, { mau: string; r: number }> = {
  'Mặt Trời': { mau: '#ffcc33', r: 0.42 }, 'Mặt Trăng': { mau: '#e3e9f5', r: 0.3 }, 'Sao Thủy': { mau: '#b9a892', r: 0.2 }, 'Sao Kim': { mau: '#f0c987', r: 0.26 },
  'Sao Hỏa': { mau: '#e85b40', r: 0.24 }, 'Sao Mộc': { mau: '#dba36a', r: 0.38 }, 'Sao Thổ': { mau: '#dcc78d', r: 0.33 }, 'Thiên Vương': { mau: '#84dbe9', r: 0.29 },
  'Hải Vương': { mau: '#5583f5', r: 0.29 }, 'Diêm Vương': { mau: '#b58d7c', r: 0.18 }, 'La Hầu': { mau: '#9d8cff', r: 0.26 }, 'Kế Đô': { mau: '#c99a6b', r: 0.26 },
};
const RAD = Math.PI / 180;
const nhoAnh = new Map<string, THREE.Texture>();
const anhNen = (duongDan: string) => {
  let t = nhoAnh.get(duongDan);
  if (!t) { t = new THREE.TextureLoader().load(duongDan); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; nhoAnh.set(duongDan, t); }
  return t;
};

export function manChiemTinh(c: LaSoChiemTinh, khiChon: (h: ViTri) => void): ManHinh {
  const nhom = new THREE.Group();
  const chon: THREE.Object3D[] = [];
  const goc = (lon: number) => Math.PI + (lon - c.cungMoc.kinhDo) * RAD;
  const diem = (lon: number, r: number, y = 0) => new THREE.Vector3(r * Math.cos(goc(lon)), y, -r * Math.sin(goc(lon)));

  // Mặt bản đồ dựng từ 3 ảnh: vòng 12 cung (xoay theo kinh độ thật), mặt 12 nhà, và đĩa góc chiếu ở giữa
  const R_TRONG = 4.53, R_NGOAI = 7.9, R_GOC = 2.38;
  for (let i = 0; i < 12; i++) { // nền màu theo nguyên tố, mờ, nằm dưới ảnh
    const v = new THREE.Mesh(new THREE.RingGeometry(R_TRONG, R_NGOAI, 24, 1, goc(i * 30), 30 * RAD), new THREE.MeshBasicMaterial({ color: MAU_NGUYEN_TO[i % 4], transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }));
    v.rotation.x = -Math.PI / 2; v.position.y = -0.03; nhom.add(v);
  }
  const mam = (file: string, canh: number, y: number, doMo: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(canh, canh), new THREE.MeshBasicMaterial({ map: anhNen(ANH + file), transparent: true, opacity: doMo, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.y = y; return m;
  };
  nhom.add(mam('ban-do-nha.png', 400 * (R_TRONG / 190), -0.02, 0.95)); // mặt 12 nhà
  nhom.add(mam('ban-do-goc.png', 384 * (R_GOC / 188), 0.0, 0.8)); // đĩa góc chiếu
  const cung = mam('ban-do-cung.png', 416 * (R_NGOAI / 206), -0.01, 1); // vòng 12 cung: ảnh đã lật để thuận chiều, xoay sao cho Bạch Dương nằm đúng kinh độ
  const xoay = new THREE.Group(); xoay.rotation.y = goc(15) - Math.PI / 2; xoay.add(cung); nhom.add(xoay);
  // 12 nhà
  c.dinhNha.forEach((lon, i) => {
    const chinh = i % 3 === 0;
    nhom.add(ong(diem(lon, 1.1), diem(lon, R_TRONG), chinh ? '#58d6e8' : '#4b5aa8', chinh ? 0.035 : 0.018, chinh ? 0.95 : 0.7));
    const rong = ((c.dinhNha[(i + 1) % 12] - lon + 360) % 360) / 2;
    const so = nhan(String(i + 1), { cao: 0.44, mau: '#7f8fd0' }); so.position.copy(diem(lon + rong, 1.75, 0.05)); nhom.add(so);
  });
  for (const [ten, lon] of [['ASC', c.cungMoc.kinhDo], ['MC', c.thienDinh.kinhDo], ['DSC', c.cungMoc.kinhDo + 180], ['IC', c.thienDinh.kinhDo + 180]] as const) {
    const n = nhan(ten, { cao: 0.52, mau: '#58d6e8', nen: 'rgba(8,14,40,.85)' }); n.position.copy(diem(lon, 8.45, 0.25)); nhom.add(n);
  }
  // Trái Đất ở tâm
  const dat = new THREE.Mesh(new THREE.SphereGeometry(0.45, 48, 32), new THREE.MeshStandardMaterial({ color: '#2f6fe0', emissive: '#123a9a', emissiveIntensity: 0.6, roughness: 0.6 }));
  nhom.add(dat);

  // Hành tinh: sao gần nhau thì xếp lệch bán kính để khỏi chồng
  const xep = [...c.hanhTinh].sort((a, b) => a.kinhDo - b.kinhDo);
  const banKinh = new Map<string, number>(), thuNho = new Map<string, number>();
  let tang = 0;
  const gan = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180); // khoảng cách góc giữa hai kinh độ
  xep.forEach((h, i) => {
    const truoc = xep[(i + xep.length - 1) % xep.length];
    tang = i > 0 && gan(h.kinhDo, truoc.kinhDo) < 12 ? (tang + 1) % 4 : 0;
    banKinh.set(h.ten, 4.25 - tang * 0.58);
    // cụm đông thì thu nhỏ huy hiệu để khỏi chồng nhau
    const lang = xep.filter((o) => o !== h && gan(o.kinhDo, h.kinhDo) < 12).length;
    thuNho.set(h.ten, lang >= 3 ? 0.74 : lang === 2 ? 0.84 : lang === 1 ? 0.92 : 1);
  });
  const cau: THREE.Mesh[] = [];
  // Nhãn độ nằm ngoài vòng hoàng đạo, rải đều để không chồng chữ; mỗi nhãn nối về đúng hành tinh bằng đường chỉ.
  const R_NHAN = 9.4, RONG_NHAN = 2.15, CAO_NHAN = 0.52;
  const gocNhan = c.hanhTinh.map((h) => goc(h.kinhDo));
  const thuTu = c.hanhTinh.map((_, i) => i).sort((a, b) => gocNhan[a] - gocNhan[b] || a - b);
  const chuan = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
  const lech = new Map<number, number>(thuTu.map((i) => [i, chuan(gocNhan[i])]));
  const yeuCau = (a: number) => Math.min(RONG_NHAN / Math.max(Math.abs(Math.sin(a)), 0.05), CAO_NHAN / Math.max(Math.abs(Math.cos(a)), 0.05)) / R_NHAN;
  const ds = [...thuTu].sort((a, b) => lech.get(a)! - lech.get(b)!);
  for (let lap = 0; lap < 80; lap++) {
    for (let k = 0; k < ds.length; k++) {
      const i = ds[k], j = ds[(k + 1) % ds.length];
      let kc = lech.get(j)! - lech.get(i)!; if (k === ds.length - 1) kc += Math.PI * 2;
      const can = yeuCau((lech.get(i)! + lech.get(j)!) / 2);
      if (kc < can) { const d = (can - kc) / 2 + 1e-4; lech.set(i, lech.get(i)! - d); lech.set(j, lech.get(j)! + d); }
    }
  }
  const nhanKyHieu = (h: ViTri) => `${h.kyHieu} ${Math.floor(h.doTrongCung)}°${String(Math.floor((h.doTrongCung % 1) * 60)).padStart(2, '0')}′${h.nghichHanh ? ' ℞' : ''}`;
  c.hanhTinh.forEach((h, idx) => {
    const t = HANH_TINH[h.ten], p = diem(h.kinhDo, banKinh.get(h.ten)!, 0.5);
    // Huy hiệu hành tinh bằng ảnh thật; kích cỡ tỷ lệ theo bán kính cũ để Mặt Trời, Sao Mộc vẫn to hơn Sao Thủy, Diêm Vương
    const dk = (0.6 + t.r * 1.5) * thuNho.get(h.ten)!;
    const m = huyHieu(`${ANH}planets/${FILE_HANH_TINH[h.ten]}.png`, dk);
    m.position.copy(p); m.renderOrder = 4; m.userData = { bam: () => khiChon(h), pha: h.kinhDo };
    const vien = new THREE.Mesh(new THREE.RingGeometry(dk / 2, dk / 2 + 0.05, 48), new THREE.MeshBasicMaterial({ color: t.mau, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
    vien.position.z = 0.002; m.add(vien);
    nhom.add(m); chon.push(m); cau.push(m);
    nhom.add(ong(diem(h.kinhDo, banKinh.get(h.ten)!, 0.3), diem(h.kinhDo, R_TRONG, 0.02), t.mau, 0.012, 0.6));
    // đường chỉ: xuyên vòng hoàng đạo theo đúng kinh độ, rồi gập về vị trí nhãn
    const a = lech.get(idx)!, diemNhan = new THREE.Vector3(R_NHAN * Math.cos(a), 0.1, -R_NHAN * Math.sin(a));
    const dauChi = new THREE.Vector3((R_NHAN - 1.0) * Math.cos(a), 0.06, -(R_NHAN - 1.0) * Math.sin(a));
    nhom.add(ong(diem(h.kinhDo, R_TRONG, 0.03), diem(h.kinhDo, 8.5, 0.05), t.mau, 0.014, 0.55), ong(diem(h.kinhDo, 8.5, 0.05), dauChi, t.mau, 0.014, 0.55));
    const n = nhan(nhanKyHieu(h), { cao: CAO_NHAN, mau: t.mau, font: FONT_KY_HIEU, nen: 'rgba(8,14,40,.85)' }); n.position.copy(diemNhan); nhom.add(n);
  });
  // Góc chiếu
  const vt = new Map(c.hanhTinh.map((h) => [h.ten, h.kinhDo]));
  for (const g of c.gocChieu.filter((x) => x.loai !== 'trung').slice(0, 22)) {
    const mau = g.loai === 'thuan' ? '#5fd0a0' : '#ff6b5c';
    nhom.add(ong(diem(vt.get(g.a)!, R_GOC, 0.06), diem(vt.get(g.b)!, R_GOC, 0.06), mau, 0.016, Math.max(0.25, 0.9 - g.lech * 0.1)));
  }
  const trong = new THREE.Mesh(new THREE.RingGeometry(R_GOC - 0.03, R_GOC + 0.03, 96), new THREE.MeshBasicMaterial({ color: '#4b5aa8', side: THREE.DoubleSide })); trong.rotation.x = -Math.PI / 2; nhom.add(trong);

  return {
    nhom, chon, mayQuay: { viTri: [0, 31.5, 10.5], nhin: [0, 0, 0.4] },
    capNhat: (dt, t) => { dat.rotation.y += dt * 0.5; for (const m of cau) m.position.y = 0.5 + Math.sin(t * 1.1 + m.userData.pha) * 0.07; },
  };
}
