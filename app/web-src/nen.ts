/** Khung cảnh 3D chung: bầu trời sao, sàn vòng sáng, máy quay, bấm chọn. */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ketCau, huy, type ManHinh } from './ve.js';

export class KhungCanh {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);
  dieuKhien: OrbitControls;
  hienTai: ManHinh | null = null;
  private sao: THREE.Points;
  private vong: THREE.Group;
  private dongHo = new THREE.Clock();
  private tia = new THREE.Raycaster();
  private dichMayQuay: { viTri: THREE.Vector3; nhin: THREE.Vector3; t: number } | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene.background = new THREE.Color('#04050d');
    this.scene.fog = new THREE.FogExp2('#04050d', 0.004);

    this.scene.add(new THREE.AmbientLight('#8fa2ff', 1.5));
    const mt = new THREE.DirectionalLight('#fff3d6', 2.2); mt.position.set(6, 14, 10); this.scene.add(mt);
    const vang = new THREE.PointLight('#f5c451', 60, 60); vang.position.set(-8, 6, 6); this.scene.add(vang);
    const lam = new THREE.PointLight('#4dd6ff', 50, 60); lam.position.set(9, 4, -6); this.scene.add(lam);

    // Bầu trời sao
    const n = 3200, vt = new Float32Array(n * 3), mau = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const r = 120 + Math.random() * 160, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
      vt.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], i * 3);
      c.setHSL(0.55 + Math.random() * 0.15, 0.5, 0.6 + Math.random() * 0.4); mau.set([c.r, c.g, c.b], i * 3);
    }
    const gs = new THREE.BufferGeometry();
    gs.setAttribute('position', new THREE.BufferAttribute(vt, 3)); gs.setAttribute('color', new THREE.BufferAttribute(mau, 3));
    this.sao = new THREE.Points(gs, new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true, fog: false }));
    this.scene.add(this.sao);

    // Tinh vân
    for (const [x, y, z, s, m] of [[-70, 30, -120, 150, '80,110,255'], [90, -10, -140, 170, '190,90,220'], [10, 60, -160, 140, '245,196,81']] as const) {
      const tex = ketCau(256, 256, (cx) => { const g = cx.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, `rgba(${m},.34)`); g.addColorStop(1, `rgba(${m},0)`); cx.fillStyle = g; cx.fillRect(0, 0, 256, 256); });
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
      sp.position.set(x, y, z); sp.scale.set(s, s, 1); this.scene.add(sp);
    }

    // Sàn: các vòng sáng đồng tâm
    this.vong = new THREE.Group();
    for (const [r, m, o] of [[9, '#f5c451', 0.55], [12.5, '#58d6e8', 0.3], [17, '#f5c451', 0.2], [23, '#58d6e8', 0.12]] as const) {
      const v = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.06, 128), new THREE.MeshBasicMaterial({ color: m, transparent: true, opacity: o, side: THREE.DoubleSide }));
      v.rotation.x = -Math.PI / 2; this.vong.add(v);
    }
    const dia = new THREE.Mesh(new THREE.CircleGeometry(23, 96), new THREE.MeshBasicMaterial({ color: '#0a1030', transparent: true, opacity: 0.55 }));
    dia.rotation.x = -Math.PI / 2; dia.position.y = -0.02; this.vong.add(dia);
    this.vong.position.y = -2.4;
    this.scene.add(this.vong);

    this.dieuKhien = new OrbitControls(this.camera, canvas);
    this.dieuKhien.enableDamping = true; this.dieuKhien.dampingFactor = 0.08;
    this.dieuKhien.minDistance = 4; this.dieuKhien.maxDistance = 60; this.dieuKhien.maxPolarAngle = Math.PI * 0.62;
    this.camera.position.set(0, 10, 14);

    let xuong = { x: 0, y: 0 };
    canvas.addEventListener('pointerdown', (e) => (xuong = { x: e.clientX, y: e.clientY }));
    canvas.addEventListener('pointerup', (e) => { if (Math.hypot(e.clientX - xuong.x, e.clientY - xuong.y) < 5) this.bam(e.clientX, e.clientY); });
    canvas.addEventListener('pointermove', (e) => { canvas.style.cursor = this.tim(e.clientX, e.clientY) ? 'pointer' : 'grab'; });
    window.addEventListener('resize', () => this.doiCo());
    this.doiCo();
    this.renderer.setAnimationLoop(() => this.khungHinh());
  }

  private lechX = (384 - 318) / 2; private lechY = -20;
  /** Chế độ Live bỏ hai khung bên nên tâm nhìn về giữa màn hình. */
  datLech(x: number, y: number) { this.lechX = x; this.lechY = y; this.doiCo(); }

  private doiCo() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Hai khung bên che bớt màn hình: dời tâm nhìn về giữa vùng trống.
    this.camera.setViewOffset(w, h, this.lechX, this.lechY, w, h);
    this.camera.updateProjectionMatrix();
  }

  private tim(x: number, y: number): THREE.Object3D | null {
    if (!this.hienTai?.chon.length) return null;
    const p = new THREE.Vector2(((x + this.lechX) / window.innerWidth) * 2 - 1, -((y + this.lechY) / window.innerHeight) * 2 + 1);
    this.tia.setFromCamera(p, this.camera);
    const hit = this.tia.intersectObjects(this.hienTai.chon, true)[0];
    if (!hit) return null;
    let o: THREE.Object3D | null = hit.object;
    while (o && !o.userData.bam) o = o.parent;
    return o;
  }
  private bam(x: number, y: number) { this.tim(x, y)?.userData.bam(); }

  /** Thay màn hình đang hiển thị. */
  dat(m: ManHinh, giuGocNhin = false) {
    if (this.hienTai) { this.scene.remove(this.hienTai.nhom); huy(this.hienTai.nhom); }
    this.hienTai = m;
    this.vong.visible = !m.anSan;
    this.scene.add(m.nhom);
    if (!giuGocNhin) this.dichMayQuay = { viTri: new THREE.Vector3(...m.mayQuay.viTri), nhin: new THREE.Vector3(...m.mayQuay.nhin), t: 0 };
  }

  private khungHinh() {
    const dt = Math.min(this.dongHo.getDelta(), 0.25), t = this.dongHo.elapsedTime;
    this.sao.rotation.y += dt * 0.006;
    this.vong.rotation.y -= dt * 0.03;
    if (this.dichMayQuay) {
      const d = this.dichMayQuay; d.t += dt;
      const k = 1 - Math.exp(-dt * 5);
      this.camera.position.lerp(d.viTri, k); this.dieuKhien.target.lerp(d.nhin, k);
      if (d.t > 1.4) this.dichMayQuay = null;
    }
    this.hienTai?.capNhat?.(dt, t);
    this.dieuKhien.update();
    this.renderer.render(this.scene, this.camera);
  }
}
