import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { taoMayKhach, chonModel, luanGiai, ghiLuotGoi, luotGoiTuKetQua, tongHopLocal, datThuMucLocal, tinhChiPhiMoi } from '../src/ai/index.js';

/** Giả lập máy chủ OpenAI/Gemini/xAI/Llama: ghi lại request, trả usage cố định. */
function giaFetch() {
  const goi: { url: string; body: any; auth?: string }[] = [];
  const that = globalThis.fetch;
  globalThis.fetch = (async (url: any, init: any) => {
    goi.push({ url: String(url), body: JSON.parse(init.body), auth: init.headers?.Authorization });
    const gemini = String(url).includes('generativelanguage');
    const j = gemini
      ? { candidates: [{ content: { parts: [{ text: 'Luận giải thử' }] } }], usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 500 } }
      : { choices: [{ message: { content: 'Luận giải thử' } }], usage: { prompt_tokens: 1000, completion_tokens: 500 } };
    return new Response(JSON.stringify(j), { status: 200 });
  }) as typeof fetch;
  return { goi, tra: () => { globalThis.fetch = that; } };
}

for (const [hang, host] of [['openai', 'api.openai.com'], ['grok', 'api.x.ai'], ['meta', 'api.llama.com'], ['gemini', 'generativelanguage.googleapis.com']] as const) {
  test(`luận giải qua ${hang}: đúng địa chỉ, đúng model của hãng, có chi phí > 0, ghi đúng 1 dòng`, async () => {
    const f = giaFetch();
    try {
      const dir = mkdtempSync(join(tmpdir(), 'menh-cp-'));
      datThuMucLocal(dir);
      const model = chonModel(hang, 'bat-tu');
      const t0 = Date.now();
      const kq = await luanGiai(taoMayKhach(hang, { [hang]: 'khoa-gia' }), { loai: 'bat-tu', duLieu: ['dữ liệu thử'], cauHoi: 'thử', model });
      assert.equal(f.goi.length, 1);
      assert.ok(f.goi[0].url.includes(host));
      assert.equal(kq.model, model);
      assert.ok(!/claude/.test(kq.model), 'không được gửi model Claude cho hãng khác');
      assert.ok(kq.chiPhiUSD > 0, 'chi phí phải > 0');
      assert.equal(kq.chiPhiUSD, tinhChiPhiMoi(model, { input_tokens: 1000, output_tokens: 500 }));
      await ghiLuotGoi(luotGoiTuKetQua({ nhaCungCap: hang, model: kq.model, loaiLuan: 'bat-tu', suDung: kq.suDung, chiPhiUSD: kq.chiPhiUSD, thoiGianMs: Date.now() - t0, thanhCong: true }));
      const th = tongHopLocal();
      assert.equal(th.tongLuot, 1);
      assert.equal(th.ganDay[0].nhaCungCap, hang);
      assert.equal(th.ganDay[0].model, model);
      assert.ok(th.tongChiPhiUSD > 0);
      assert.equal(readFileSync(join(dir, 'ai-luot-goi.jsonl'), 'utf8').trim().split('\n').length, 1);
    } finally { f.tra(); }
  });
}

test('hãng không phải Claude báo rõ khi gọi tool, và thiếu khóa thì báo lỗi', async () => {
  await assert.rejects(() => taoMayKhach('openai', { openai: 'k' }).messages.create({ model: 'gpt-5', max_tokens: 5, messages: [], tools: [{ name: 'x', input_schema: { type: 'object' } }] } as any), /tool-use/);
  assert.throws(() => taoMayKhach('gemini', {}), /Chưa nhập khóa/);
});
