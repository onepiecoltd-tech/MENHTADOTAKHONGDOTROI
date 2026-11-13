import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lapChiemTinh, DIA_DIEM } from '../src/index.js';
import { kinhDoHoangDao, gocChinh, nhaPlacidus } from '../src/chiemtinh/index.js';
import { rutGonChiemTinh, rutGonVeDa, taoYeuCau } from '../src/ai/index.js';

const gan = (a: number, b: number, sai: number, ten: string) => assert.ok(Math.abs(((a - b + 540) % 360) - 180) <= sai, `${ten}: ${a.toFixed(2)} so với ${b}`);

test('chiêm tinh: vị trí hành tinh lúc 12:00 UTC ngày 1/1/2000 (mốc J2000 đã biết)', () => {
  const t = new Date(Date.UTC(2000, 0, 1, 12, 0));
  gan(kinhDoHoangDao('Sun', t), 280.4, 0.3, 'Mặt Trời'); // 10° Ma Kết
  gan(kinhDoHoangDao('Moon', t), 223.3, 1.0, 'Mặt Trăng'); // 13° Bọ Cạp
  gan(kinhDoHoangDao('Mercury', t), 271.9, 1.0, 'Sao Thủy');
  gan(kinhDoHoangDao('Venus', t), 241.6, 1.0, 'Sao Kim');
  gan(kinhDoHoangDao('Mars', t), 327.9, 1.0, 'Sao Hỏa');
  gan(kinhDoHoangDao('Jupiter', t), 25.3, 1.0, 'Sao Mộc');
  gan(kinhDoHoangDao('Saturn', t), 40.4, 1.0, 'Sao Thổ');
});

test('chiêm tinh: Mặt Trời ở 0° Bạch Dương lúc xuân phân, trăng non trùng Mặt Trời', () => {
  gan(kinhDoHoangDao('Sun', new Date(Date.UTC(2026, 2, 20, 14, 46))), 0, 0.05, 'xuân phân 2026');
  const trangNon = new Date(Date.UTC(2026, 1, 17, 12, 1)); // sóc ngày Tết Bính Ngọ
  gan(kinhDoHoangDao('Moon', trangNon), kinhDoHoangDao('Sun', trangNon), 0.5, 'trăng non');
});

test('chiêm tinh: cung Mọc, Thiên Đỉnh và nhà Placidus nhất quán', () => {
  // Tại xích đạo, giờ sao 0h: MC = 0° Bạch Dương, ASC = 0° Cự Giải
  const e = 23.44 * Math.PI / 180;
  const nha0 = nhaPlacidus(0, 90, 0, e, 0)!;
  gan(nha0[10], 32.2, 0.5, 'đỉnh nhà 11 tại xích đạo'); // xích kinh 30° -> hoàng kinh ~32,2°
  for (const noi of [DIA_DIEM[0], DIA_DIEM[1], { ten: 'London', viDo: 51.5, kinhDo: -0.1 }]) {
    for (let gio = 0; gio < 24; gio += 5) {
      const g = gocChinh(new Date(Date.UTC(1990, 4, 15, gio, 30)), noi.viDo, noi.kinhDo);
      const nha = nhaPlacidus(g.ramc, g.asc, g.mc, g.e, g.p)!;
      assert.ok(nha, 'tính được Placidus');
      gan(nha[0], g.asc, 1e-6, 'nhà 1 = ASC'); gan(nha[9], g.mc, 1e-6, 'nhà 10 = MC'); gan(nha[6], g.asc + 180, 1e-6, 'nhà 7 đối ASC');
      let tong = 0;
      for (let i = 0; i < 12; i++) { const rong = (nha[(i + 1) % 12] - nha[i] + 360) % 360; assert.ok(rong > 5 && rong < 80, `nhà ${i + 1} rộng ${rong.toFixed(1)}°`); tong += rong; }
      gan(tong, 360, 1e-6, 'tổng 12 nhà');
      const lechAscMc = (g.asc - g.mc + 360) % 360;
      assert.ok(lechAscMc > 40 && lechAscMc < 140, `ASC cách MC ${lechAscMc.toFixed(1)}°`);
    }
  }
  assert.equal(nhaPlacidus(100, 200, 100, e, 80 * Math.PI / 180), null); // vùng cực
});

test('chiêm tinh: lá số đầy đủ, rút gọn và prompt', () => {
  const c = lapChiemTinh({ nam: 1990, thang: 5, ngay: 15, gio: 14, phut: 30, gioiTinh: 'nam' }, DIA_DIEM[0]);
  assert.equal(c.gioUTC, '1990-05-15 07:30');
  assert.equal(c.hanhTinh.length, 10);
  assert.equal(c.hanhTinh[0].cung, 'Kim Ngưu'); // 15/5: Mặt Trời ở Kim Ngưu
  assert.ok(c.hanhTinh.every((h) => h.nha >= 1 && h.nha <= 12));
  assert.equal(Object.values(c.nguyenTo).reduce((a, b) => a + b, 0), 10);
  assert.ok(!c.hanhTinh[0].nghichHanh && !c.hanhTinh[1].nghichHanh); // Mặt Trời, Mặt Trăng không nghịch hành
  assert.equal(c.cungMoc.cung, 'Thiên Bình'); // 14:30 giữa tháng 5 tại TP.HCM: cung Mọc đầu Thiên Bình, Mặt Trời đã qua Thiên Đỉnh nên ở nhà 8
  assert.equal(c.hanhTinh[0].nha, 8);
  assert.ok(c.hanhTinh[2].nghichHanh && c.hanhTinh[6].nghichHanh); // Sao Thủy, Sao Thổ nghịch hành giữa tháng 5/1990
  const r = rutGonChiemTinh(c);
  for (const s of ['BẢN ĐỒ SAO', 'Cung Mọc:', 'Mặt Trời:', 'Góc chiếu']) assert.ok(r.includes(s), s);
  assert.ok((taoYeuCau({ loai: 'chiem-tinh', duLieu: [r] }).system as any[])[1].text.includes('VỆ ĐÀ'));
});

test('Vệ Đà: ayanamsa Lahiri, Mesha Sankranti, nút Bắc, nakshatra, Navamsa và Vimshottari', async () => {
  const { ayanamsaLahiri, nutBacTrungBinh, nakshatraCua, navamsaCua, lapVeDa, kinhDoHoangDao: _k } = { ...(await import('../src/chiemtinh/veda.js')), kinhDoHoangDao };
  gan(ayanamsaLahiri(new Date(Date.UTC(2000, 0, 1, 12))), 23.853, 0.01, 'Lahiri J2000');
  gan(ayanamsaLahiri(new Date(Date.UTC(1956, 2, 21))), 23.25, 0.02, 'Lahiri 1956 (23°15′)');
  // Mesha Sankranti 2026 rơi vào sáng 14/4 giờ Ấn Độ: Mặt Trời sidereal quanh 0° Mesha
  const ms = new Date(Date.UTC(2026, 3, 14, 4, 0));
  gan(_k('Sun', ms) - ayanamsaLahiri(ms), 0, 0.7, 'Mặt Trời sidereal ngày Mesha Sankranti');
  gan(nutBacTrungBinh(new Date(Date.UTC(2000, 0, 1, 12))), 125.04, 0.01, 'nút Bắc J2000');
  assert.deepEqual([nakshatraCua(0).ten, nakshatraCua(13.34).ten, nakshatraCua(359.9).ten, nakshatraCua(199).chu], ['Ashwini', 'Bharani', 'Revati', 'Rahu']);
  assert.equal(nakshatraCua(3.4).pada, 2);
  assert.deepEqual([navamsaCua(0), navamsaCua(30), navamsaCua(60), navamsaCua(90), navamsaCua(119.9)], [0, 9, 6, 3, 11]);
  const v = lapVeDa({ nam: 1995, thang: 12, ngay: 23, gio: 2, phut: 30, gioiTinh: 'nam' }, DIA_DIEM[0], new Date(Date.UTC(2026, 10, 13)));
  const rahu = v.graha.find((g) => g.ma === 'Rahu')!, ketu = v.graha.find((g) => g.ma === 'Ketu')!;
  gan(ketu.kinhDo, rahu.kinhDo + 180, 1e-6, 'Kế Đô đối La Hầu');
  assert.equal(v.graha.find((g) => g.ma === 'Sun')!.rashi, 8, 'Mặt Trời 23/12/1995 ở Dhanu (sidereal)');
  assert.equal(v.dasha.maha.slice(0, 9).reduce((s, m) => s + (Number(m.ketThuc.slice(0, 4)) - Number(m.batDau.slice(0, 4))), 0) <= 121, true);
  assert.equal(v.dasha.antar.length, 9);
  assert.equal(v.banDo.hanhTinh.length, 9);
  for (const g of v.graha) assert.equal(g.nha, ((g.rashi - v.lagna.rashi + 12) % 12) + 1, 'nhà cung trọn');
  assert.ok(rutGonVeDa(v).includes('Vimshottari') && rutGonVeDa(v).includes('Lagna'));
});
