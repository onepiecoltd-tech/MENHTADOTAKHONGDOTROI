/** Hàm vẽ dùng chung: kết cấu từ canvas, nhãn chữ, bảng màu. */
import * as THREE from 'three';

export const MAU_HANH: Record<string, string> = { Mộc: '#3fbf73', Hỏa: '#ff5d4f', Thổ: '#e8b84a', Kim: '#cfd6e4', Thủy: '#4da3ff' };
export const FONT = '"Segoe UI", "Noto Sans", "DejaVu Sans", system-ui, sans-serif';
export const FONT_KY_HIEU = '"Segoe UI Symbol", "Noto Sans Symbols2", "Noto Sans Symbols", "DejaVu Sans", sans-serif';

export function ketCau(w: number, h: number, ve: (c: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  ve(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function khungTron(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

/** Nhãn chữ luôn quay về phía người xem. `cao` là chiều cao trong không gian 3D. */
export function nhan(chu: string, o: { cao?: number; mau?: string; dam?: boolean; nen?: string; font?: string } = {}): THREE.Sprite {
  const co = 64, le = 18, font = `${o.dam === false ? 500 : 700} ${co}px ${o.font ?? FONT}`;
  const do_ = document.createElement('canvas').getContext('2d')!;
  do_.font = font;
  const w = Math.ceil(do_.measureText(chu).width) + le * 2, h = co + le * 2;
  const tex = ketCau(w, h, (c) => {
    if (o.nen) { c.fillStyle = o.nen; khungTron(c, 0, 0, w, h, 22); c.fill(); }
    c.font = font; c.textBaseline = 'middle'; c.textAlign = 'center';
    c.shadowColor = 'rgba(0,0,0,.85)'; c.shadowBlur = 8;
    c.fillStyle = o.mau ?? '#ffffff'; c.fillText(chu, w / 2, h / 2 + 3);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  const cao = o.cao ?? 0.5;
  s.scale.set((w / h) * cao, cao, 1);
  return s;
}

/** Ghi chữ tự xuống dòng; trả về tọa độ y sau dòng cuối. */
export function chuNhieuDong(c: CanvasRenderingContext2D, chu: string, x: number, y: number, rong: number, caoDong: number, toiDa = 99): number {
  const tu = chu.split(' ');
  let dong = '', n = 0;
  for (const t of tu) {
    if (c.measureText(dong + t).width > rong && dong) {
      c.fillText(dong.trim(), x, y); y += caoDong; dong = '';
      if (++n >= toiDa) return y;
    }
    dong += t + ' ';
  }
  if (dong.trim()) { c.fillText(dong.trim(), x, y); y += caoDong; }
  return y;
}

export function ong(a: THREE.Vector3, b: THREE.Vector3, mau: number | string, r = 0.035, doMo = 1): THREE.Mesh {
  const g = new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, r, 8, false);
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: mau, transparent: doMo < 1, opacity: doMo }));
}

export interface ManHinh {
  nhom: THREE.Group;
  /** Vị trí máy quay và điểm nhìn. */
  mayQuay: { viTri: [number, number, number]; nhin: [number, number, number] };
  /** Vật thể bấm được; userData.bam() được gọi khi bấm. */
  chon: THREE.Object3D[];
  /** true: ẩn đĩa/vòng sáng nền (tránh che các vật thể thấp). */
  anSan?: boolean;
  capNhat?: (dt: number, t: number) => void;
}

export function huy(o: THREE.Object3D) {
  o.traverse((x: any) => {
    x.geometry?.dispose?.();
    for (const m of Array.isArray(x.material) ? x.material : x.material ? [x.material] : []) { m.map?.dispose?.(); m.dispose?.(); }
  });
}

const cacheHuyHieu = new Map<string, THREE.CanvasTexture>();
/** Kết cấu tròn (nền trong suốt) cắt từ ảnh; `cat` là bán kính phần giữ lại so với cạnh ảnh, `vung` là vùng cắt [x, y, rộng, cao] nếu muốn tự chọn. */
export function ketCauTron(duongDan: string, cat = 0.46, vung?: [number, number, number, number]): THREE.CanvasTexture {
  const khoa = `${duongDan}#${cat}${vung ? ',' + vung.join(',') : ''}`;
  let tex = cacheHuyHieu.get(khoa);
  if (!tex) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const img = new Image();
    img.onload = () => {
      const cx = cv.getContext('2d')!, c = 128, canh = img.width * cat * 2;
      cx.clearRect(0, 0, 256, 256); cx.save(); cx.beginPath(); cx.arc(c, c, c - 1, 0, Math.PI * 2); cx.clip();
      if (vung) cx.drawImage(img, vung[0], vung[1], vung[2], vung[3], 0, 0, 256, 256);
      else cx.drawImage(img, (img.width - canh) / 2, (img.height - canh) / 2, canh, canh, 0, 0, 256, 256);
      cx.restore(); tex!.needsUpdate = true;
    };
    img.src = duongDan;
    cacheHuyHieu.set(khoa, tex);
  }
  return tex;
}
/**
 * Huy hiệu tròn dựng từ ảnh (cắt tròn, nền trong suốt), mặc định nằm phẳng trên mặt bản đồ để nhìn từ trên xuống thấy thẳng
 * (muốn đứng thẳng thì đặt rotation.x = 0).
 */
export function huyHieu(duongDan: string, duongKinh: number, cat = 0.46, vung?: [number, number, number, number]): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CircleGeometry(duongKinh / 2, 48), new THREE.MeshBasicMaterial({ map: ketCauTron(duongDan, cat, vung), transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

/* ---- Ảnh dùng để vẽ vào canvas: tải trước, vẽ lại khi ảnh về ---- */
const nhoImg = new Map<string, Promise<HTMLImageElement | null>>();
const anhXong = new Map<string, HTMLImageElement>();
/** Tải ảnh (có nhớ); không có ảnh thì trả null chứ không báo lỗi để màn hình vẫn dựng được. */
export function taiAnh(duongDan: string): Promise<HTMLImageElement | null> {
  let p = nhoImg.get(duongDan);
  if (!p) {
    p = new Promise((xong) => { const i = new Image(); i.onload = () => { anhXong.set(duongDan, i); xong(i); }; i.onerror = () => xong(null); i.src = duongDan; });
    nhoImg.set(duongDan, p);
  }
  return p;
}
/** Ảnh đã tải xong thì trả về, chưa thì undefined (lần vẽ đầu bỏ qua, sau khi tải sẽ vẽ lại). */
export const anhSan = (duongDan: string): HTMLImageElement | undefined => anhXong.get(duongDan);
/** Vẽ ảnh cắt tròn vào canvas: tâm (cx, cy), bán kính r; `cat` là phần ảnh giữ lại so với cạnh ảnh. */
export function veTronAnh(c: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, r: number, cat = 0.46) {
  const canh = img.width * cat * 2;
  c.save(); c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip();
  c.drawImage(img, (img.width - canh) / 2, (img.height - canh) / 2, canh, canh, cx - r, cy - r, r * 2, r * 2);
  c.restore();
}
