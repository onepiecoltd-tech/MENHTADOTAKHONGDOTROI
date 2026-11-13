/** Lá số tử vi 3D: 12 cung xếp quanh thiên bàn, bấm vào cung để xem tam phương tứ chính. */
import * as THREE from 'three';
import type { LaSoTuVi } from '../../src/tuvi/index.js';
import type { CungTuVi } from '../../src/tuvi/an-sao.js';
import { ketCau, khungTron, ong, huyHieu, taiAnh, anhSan, veTronAnh, FONT, MAU_HANH, type ManHinh } from './ve.js';
import { khoaSao } from './ui-anh.js';

const ANH = 'assets/menh-ly-3d/';
const anhSaoUrl = (ten: string) => { const k = khoaSao(ten); return k ? `${ANH}tu-vi/stars/${k}.png` : ''; };

const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
/** Vị trí 12 chi trên địa bàn 4x4: [cột, hàng], hàng 0 ở phía xa. */
const O: Record<string, [number, number]> = { Tỵ: [0, 0], Ngọ: [1, 0], Mùi: [2, 0], Thân: [3, 0], Dậu: [3, 1], Tuất: [3, 2], Hợi: [3, 3], Tý: [2, 3], Sửu: [1, 3], Dần: [0, 3], Mão: [0, 2], Thìn: [0, 1] };
const HANH_SAO: Record<string, string> = {
  'Tử Vi': 'Thổ', 'Thiên Phủ': 'Thổ', 'Thái Dương': 'Hỏa', 'Liêm Trinh': 'Hỏa', 'Thiên Cơ': 'Mộc', 'Thiên Lương': 'Mộc', 'Vũ Khúc': 'Kim', 'Thất Sát': 'Kim',
  'Thiên Đồng': 'Thủy', 'Thái Âm': 'Thủy', 'Tham Lang': 'Thủy', 'Cự Môn': 'Thủy', 'Thiên Tướng': 'Thủy', 'Phá Quân': 'Thủy',
};
const MAU_HOA: Record<string, string> = { 'Hóa Lộc': '#5fe08f', 'Hóa Quyền': '#c79bff', 'Hóa Khoa': '#6cc4ff', 'Hóa Kỵ': '#ff7a6b' };
const BUOC = 2.16;

/** Nền cung hơi trong suốt (alpha) để đường tam hợp vẽ phía dưới vẫn thấp thoáng; chữ luôn đặc nên không bị đè. */
function veCung(c: CungTuVi): THREE.CanvasTexture {
  return ketCau(512, 512, (x) => {
    const laMenh = c.ten === 'Mệnh';
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, laMenh ? 'rgba(42,34,16,.80)' : 'rgba(16,26,68,.80)'); g.addColorStop(1, laMenh ? 'rgba(21,17,10,.80)' : 'rgba(8,13,38,.80)');
    x.fillStyle = g; khungTron(x, 0, 0, 512, 512, 30); x.fill();
    x.lineWidth = 8; x.strokeStyle = laMenh ? '#f5c451' : c.laCungThan ? '#58d6e8' : '#3a4da0'; khungTron(x, 6, 6, 500, 500, 26); x.stroke();

    x.textBaseline = 'alphabetic';
    x.fillStyle = '#f5c451'; x.font = `700 56px ${FONT}`; x.textAlign = 'left'; x.fillText(c.ten.toUpperCase(), 24, 66);
    x.fillStyle = '#c3cff5'; x.font = `600 36px ${FONT}`; x.textAlign = 'right'; x.fillText(`${c.can} ${c.chi}`, 490, 50);
    x.fillStyle = '#a3b2e8'; x.font = `600 30px ${FONT}`; x.fillText(`${c.daiHan[0]}–${c.daiHan[1]}`, 490, 88);
    if (c.laCungThan) { x.fillStyle = '#58d6e8'; x.font = `700 26px ${FONT}`; x.textAlign = 'left'; x.fillText('THÂN CƯ', 24, 100); }

    let y = 166;
    x.textAlign = 'left';
    if (!c.chinhTinh.length) { x.fillStyle = '#a3b2e8'; x.font = `italic 600 40px ${FONT}`; x.fillText('Vô chính diệu', 24, y); y += 56; }
    for (const s of c.chinhTinh) {
      const img = anhSan(anhSaoUrl(s.ten));
      const tx = img ? 92 : 24;
      if (img) { x.strokeStyle = MAU_HANH[HANH_SAO[s.ten]] ?? '#fff'; x.lineWidth = 3; veTronAnh(x, img, 24 + 31, y - 19, 31, 0.47); x.beginPath(); x.arc(24 + 31, y - 19, 31, 0, Math.PI * 2); x.stroke(); }
      // cỡ chữ tự thu nhỏ nếu cả dòng (tên + độ sáng + hóa) vượt bề rộng cung
      let co = img ? 52 : 58;
      const ds = `(${s.doSang[0]})`, hoa = s.tuHoa ? s.tuHoa.replace('Hóa ', '') : '';
      for (; co > 40; co -= 3) { x.font = `700 ${co}px ${FONT}`; const w = x.measureText(s.ten).width; x.font = `700 34px ${FONT}`; if (tx + w + 12 + x.measureText(ds).width + (hoa ? 12 + x.measureText(hoa).width : 0) <= 500) break; }
      x.fillStyle = MAU_HANH[HANH_SAO[s.ten]] ?? '#fff'; x.font = `700 ${co}px ${FONT}`;
      x.shadowColor = 'rgba(0,0,0,.9)'; x.shadowBlur = 6; x.fillText(s.ten, tx, y); x.shadowBlur = 0;
      const w = x.measureText(s.ten).width;
      x.fillStyle = '#cfd8ff'; x.font = `600 34px ${FONT}`; x.fillText(ds, tx + 10 + w, y);
      if (s.tuHoa) { const w2 = x.measureText(ds).width; x.fillStyle = MAU_HOA[s.tuHoa]; x.font = `700 34px ${FONT}`; x.fillText(hoa, tx + 22 + w + w2, y); }
      y += 66;
    }
    // Phụ tinh: cát bên trái, sát bên phải; chỉ đủ chỗ cho vài sao, phần còn lại ghi "+n sao" (đầy đủ ở khung Chi tiết)
    const uuTien = (n: string) => (n.startsWith('Hóa ') ? 0 : 1);
    const trai = c.phuTinh.filter((s) => s.nhom !== 'sát tinh').sort((a, b) => uuTien(a.ten) - uuTien(b.ten)), phai = c.phuTinh.filter((s) => s.nhom === 'sát tinh');
    const tu = y - 14, dong = 40, toiDa = Math.max(1, Math.floor((452 - tu) / dong));
    const cot = (ds: typeof trai, x0: number, can: CanvasTextAlign) => {
      x.textAlign = can; x.font = `600 33px ${FONT}`;
      let yy = tu;
      ds.slice(0, toiDa).forEach((s, i) => {
        if (i === toiDa - 1 && ds.length > toiDa) { x.fillStyle = '#a3b2e8'; x.fillText(`+${ds.length - toiDa + 1} sao`, x0, yy); return; }
        x.fillStyle = s.ten.startsWith('Hóa ') ? MAU_HOA[s.ten] : s.nhom === 'cát tinh' ? '#86efb0' : s.nhom === 'sát tinh' ? '#ff9d90' : '#d5dcf5';
        x.fillText(s.ten, x0, yy); yy += dong;
      });
    };
    cot(trai, 24, 'left'); cot(phai, 490, 'right');

    x.textAlign = 'left'; x.fillStyle = '#a3b2e8'; x.font = `600 28px ${FONT}`; x.fillText(c.vongTrangSinh, 24, 494);
    let bx = 490;
    for (const [co, chu, mau] of [[c.triet, 'TRIỆT', '#8a93b8'], [c.tuan, 'TUẦN', '#e05a4c']] as const) {
      if (!co) continue;
      x.font = `700 24px ${FONT}`; const w = x.measureText(chu).width + 20;
      x.fillStyle = mau; khungTron(x, bx - w, 464, w, 34, 8); x.fill();
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(chu, bx - w / 2, 489); bx -= w + 8;
    }
  });
}

function veThienBan(l: LaSoTuVi, ten: string): THREE.CanvasTexture {
  return ketCau(1024, 1024, (x) => {
    const g = x.createRadialGradient(512, 512, 60, 512, 512, 720);
    g.addColorStop(0, 'rgba(26,36,96,.82)'); g.addColorStop(1, 'rgba(7,11,34,.82)');
    x.fillStyle = g; khungTron(x, 0, 0, 1024, 1024, 44); x.fill();
    x.lineWidth = 6; x.strokeStyle = '#f5c451'; khungTron(x, 10, 10, 1004, 1004, 38); x.stroke();
    const banh = anhSan(`${ANH}tu-vi-wheel.png`);
    if (banh) { x.save(); x.globalAlpha = 0.2; x.beginPath(); x.arc(512, 512, 470, 0, Math.PI * 2); x.clip(); x.drawImage(banh, 512 - 480, 512 - 480, 960, 960); x.restore(); }
    x.textAlign = 'center';
    x.fillStyle = '#f5c451'; x.font = `700 74px ${FONT}`; x.fillText('LÁ SỐ TỬ VI', 512, 150);
    x.fillStyle = '#fff'; x.font = `600 46px ${FONT}`; x.fillText(ten || 'Người xem', 512, 222);
    const dong: [string, string][] = [
      ['Âm lịch', `${l.gioSinh}, ngày ${l.amLich.ngay} tháng ${l.amLich.thang}${l.amLich.nhuan ? ' nhuận' : ''}`],
      ['Năm', l.amLich.canChiNam], ['Âm dương', `${l.amDuong} · ${l.thuanNghich.replace('Âm dương ', '')}`], ['Bản mệnh', l.banMenh], ['Cục', l.cuc],
      ['Mệnh tại', `${l.cungMenhTai} · Thân cư ${l.thanCu}`], ['Mệnh chủ', l.menhChu], ['Thân chủ', l.thanChu],
    ];
    let y = 330;
    for (const [a, b] of dong) {
      x.textAlign = 'right'; x.fillStyle = '#93a0c8'; x.font = `500 40px ${FONT}`; x.fillText(a, 380, y);
      x.textAlign = 'left'; x.fillStyle = '#eef1ff'; x.font = `600 42px ${FONT}`; x.fillText(b, 412, y);
      y += 76;
    }
    x.textAlign = 'center'; x.fillStyle = '#58d6e8'; x.font = `500 32px ${FONT}`; x.fillText('Tử vi Việt Nam · Craftbyte', 512, 965);
  });
}

export function manTuVi(l: LaSoTuVi, ten: string, khiChon: (c: CungTuVi | null, lienQuan: CungTuVi[]) => void): ManHinh & { chonCung: (ten: string) => void } {
  const nhom = new THREE.Group();
  const o: Record<string, THREE.Mesh> = {};
  const canh = new THREE.MeshStandardMaterial({ color: '#16204f', metalness: 0.6, roughness: 0.35 });
  const viTri = (chi: string) => new THREE.Vector3((O[chi][0] - 1.5) * BUOC, 0, (O[chi][1] - 1.5) * BUOC);

  const veLai: (() => void)[] = [];
  for (const c of l.cung) {
    const mat = new THREE.MeshStandardMaterial({ map: veCung(c), transparent: true, roughness: 0.55, metalness: 0.1 });
    veLai.push(() => { mat.map?.dispose(); mat.map = veCung(c); mat.needsUpdate = true; });
    const m = new THREE.Mesh(new THREE.BoxGeometry(2, 0.24, 2), [canh, canh, mat, canh, canh, canh]);
    m.position.copy(viTri(c.chi)); m.renderOrder = 2;
    m.userData = { cung: c, yDich: 0, bam: () => chon(c.ten) };
    o[c.chi] = m; nhom.add(m);
  }
  const matGiua = new THREE.MeshStandardMaterial({ map: veThienBan(l, ten), transparent: true, roughness: 0.6 });
  veLai.push(() => { matGiua.map?.dispose(); matGiua.map = veThienBan(l, ten); matGiua.needsUpdate = true; });
  const giua = new THREE.Mesh(new THREE.BoxGeometry(BUOC * 2 - 0.16, 0.16, BUOC * 2 - 0.16), [canh, canh, matGiua, canh, canh, canh]);
  giua.position.y = -0.04; giua.renderOrder = 2; nhom.add(giua);
  // Đế phát sáng
  const de = new THREE.Mesh(new THREE.BoxGeometry(BUOC * 4 + 0.3, 0.1, BUOC * 4 + 0.3), new THREE.MeshStandardMaterial({ color: '#0b1136', emissive: '#f5c451', emissiveIntensity: 0.25, metalness: 0.8, roughness: 0.3 }));
  de.position.y = -0.22; nhom.add(de);

  // Ảnh sao + bánh xe thiên bàn: tải xong thì vẽ lại các cung (lần vẽ đầu chưa có ảnh vẫn đọc được)
  void Promise.all([...new Set(l.cung.flatMap((c) => c.chinhTinh.map((t) => anhSaoUrl(t.ten))).filter(Boolean)), `${ANH}tu-vi-wheel.png`].map(taiAnh)).then(() => veLai.forEach((f) => f()));
  void taiAnh(`${ANH}tu-vi/tam-hop-emblem.png`);

  const duong = new THREE.Group(); nhom.add(duong);
  let dangChon: string | null = null;

  function chon(tenCung: string) {
    const c = l.cung.find((x) => x.ten === tenCung);
    while (duong.children.length) { const d = duong.children.pop()! as THREE.Mesh; d.geometry.dispose(); }
    for (const m of Object.values(o)) { m.userData.yDich = 0; }
    if (!c || dangChon === tenCung) { dangChon = null; khiChon(null, []); return; }
    dangChon = tenCung;
    const i = CHI.indexOf(c.chi);
    const tam = [CHI[(i + 4) % 12], CHI[(i + 8) % 12]], xung = CHI[(i + 6) % 12];
    o[c.chi].userData.yDich = 0.12;
    for (const k of [...tam, xung]) o[k].userData.yDich = 0.05;
    // Tam giác và đường nối nằm TRÊN mặt cung; vẽ mỏng và hơi trong để chữ phía dưới vẫn đọc được.
    const p = (chi: string) => viTri(chi).setY(0.3);
    const dg = [ong(p(c.chi), p(tam[0]), '#ffd45e', 0.03, 0.5), ong(p(tam[0]), p(tam[1]), '#ffd45e', 0.03, 0.5), ong(p(tam[1]), p(c.chi), '#ffd45e', 0.03, 0.5), ong(p(c.chi), p(xung), '#58d6e8', 0.03, 0.5)];
    dg.forEach((d) => { d.renderOrder = 6; duong.add(d); });
    // Tam giác tam hợp bằng ảnh (kéo giãn theo 3 cung, nằm dưới nền cung) + huy hiệu ở 3 đỉnh vàng và đỉnh xung chiếu xanh
    const dinh = [c.chi, tam[0], tam[1]].map((k) => viTri(k));
    const tamDiem = dinh.reduce((a, b) => a.clone().add(b), new THREE.Vector3()).multiplyScalar(1 / 3);
    const gianRa = dinh.map((d) => d.clone().sub(tamDiem).multiplyScalar(1.12).add(tamDiem).setY(0.28));
    const hinh = new THREE.BufferGeometry();
    hinh.setAttribute('position', new THREE.Float32BufferAttribute(gianRa.flatMap((v) => [v.x, v.y, v.z]), 3));
    hinh.setAttribute('uv', new THREE.Float32BufferAttribute([0.51, 0.88, 0.07, 0.12, 0.93, 0.12], 2));
    hinh.setIndex([0, 2, 1]); hinh.computeVertexNormals();
    const tex = new THREE.TextureLoader().load(`${ANH}tu-vi/tam-hop-emblem.png`); tex.colorSpace = THREE.SRGBColorSpace;
    const tg = new THREE.Mesh(hinh, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    tg.renderOrder = 5; duong.add(tg);
    const ngoai = (k: string, mau: 'vang' | 'xanh') => {
      const [cot, hang] = O[k], dx = cot === 0 ? -1 : cot === 3 ? 1 : 0, dz = hang === 0 ? -1 : hang === 3 ? 1 : 0;
      const hh = huyHieu(`${ANH}tu-vi/${mau === 'vang' ? 'tam-hop-vertex' : 'xung-chieu-vertex'}.png`, 0.85, 0.5);
      hh.position.copy(viTri(k)).add(new THREE.Vector3(dx * 1.38, 0.3, dz * 1.38)); hh.renderOrder = 5; duong.add(hh);
    };
    [c.chi, ...tam].forEach((k) => ngoai(k, 'vang')); ngoai(xung, 'xanh');
    khiChon(c, [...tam, xung].map((k) => l.cung.find((x) => x.chi === k)!));
  }

  return {
    nhom, chon: Object.values(o), chonCung: chon,
    mayQuay: { viTri: [0, 16.8, 3.6], nhin: [0, 0, 0.7] },
    capNhat: (dt, t) => {
      for (const m of Object.values(o)) m.position.y += (m.userData.yDich - m.position.y) * Math.min(1, dt * 9);
      nhom.position.y = Math.sin(t * 0.7) * 0.06;
    },
  };
}
