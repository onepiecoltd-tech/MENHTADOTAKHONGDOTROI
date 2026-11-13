-- Bảng quản trị chi phí AI cho Mệnh Lý 3D (Postgres).
-- Chạy 1 lần trên database của admin:  psql "$DATABASE_URL" -f sql/quan-tri.sql
-- Khi chạy app Electron desktop (chưa có server), chi phí ghi vào file JSONL
-- local (xem src/ai/chi-phi.ts); schema dưới đây dùng khi triển khai server.

-- Bảng giá theo (nhà cung cấp, model). Đơn vị: USD / 1 triệu token.
CREATE TABLE IF NOT EXISTS ai_gia (
  nha_cung_cap TEXT NOT NULL,
  model        TEXT NOT NULL,
  gia_vao_1m   NUMERIC(10,4) NOT NULL,
  gia_ra_1m    NUMERIC(10,4) NOT NULL,
  gia_cache_ghi_1m NUMERIC(10,4) NOT NULL DEFAULT 0,
  gia_cache_doc_1m NUMERIC(10,4) NOT NULL DEFAULT 0,
  cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (nha_cung_cap, model)
);

-- Một dòng cho mỗi lượt luận giải AI.
CREATE TABLE IF NOT EXISTS ai_luot_goi (
  id               BIGSERIAL PRIMARY KEY,
  thoi_gian        TIMESTAMPTZ NOT NULL DEFAULT now(),
  nha_cung_cap     TEXT NOT NULL,          -- claude | openai | gemini | grok | meta | taikhoan
  model            TEXT NOT NULL,
  loai_luan        TEXT NOT NULL,          -- tu-vi | bat-tu | chiem-tinh | kinh-dich | tarot | luan-cheo | tu-vi-ngay | tro-chuyen
  ten_nguoi        TEXT,
  token_vao        INTEGER NOT NULL DEFAULT 0,
  token_ra         INTEGER NOT NULL DEFAULT 0,
  token_cache_ghi  INTEGER NOT NULL DEFAULT 0,
  token_cache_doc  INTEGER NOT NULL DEFAULT 0,
  chi_phi_usd      NUMERIC(12,6) NOT NULL DEFAULT 0,
  thoi_gian_ms     INTEGER NOT NULL DEFAULT 0,
  thanh_cong       BOOLEAN NOT NULL DEFAULT TRUE,
  loi              TEXT
);
CREATE INDEX IF NOT EXISTS idx_luot_goi_ngay ON ai_luot_goi (date(thoi_gian));
CREATE INDEX IF NOT EXISTS idx_luot_goi_hang ON ai_luot_goi (nha_cung_cap, date(thoi_gian));

-- Giá tham khảo tháng 11/2026. KIỂM TRA LẠI trên trang giá từng hãng trước khi
-- dùng cho khách; sửa bằng UPDATE ai_gia ... trong màn quản trị.
INSERT INTO ai_gia (nha_cung_cap, model, gia_vao_1m, gia_ra_1m, gia_cache_ghi_1m, gia_cache_doc_1m) VALUES
  ('claude', 'claude-haiku-5-5',   0.10,  0.50, 0.125, 0.01),
  ('claude', 'claude-sonnet-5-5',  2.00, 10.00, 2.50,  0.10),
  ('claude', 'claude-opus-5-5',    4.00, 20.00, 5.00,  0.20),
  ('openai', 'gpt-5-mini',          0.25,  2.00, 0, 0),
  ('openai', 'gpt-5',               1.25, 10.00, 0, 0),
  ('gemini', 'gemini-2.5-flash',    0.30,  2.50, 0, 0),
  ('gemini', 'gemini-2.5-pro',      1.25, 10.00, 0, 0),
  ('grok',   'grok-4',              3.00, 15.00, 0, 0),
  ('meta',   'llama-4-maverick',    0.20,  0.60, 0, 0)
ON CONFLICT (nha_cung_cap, model) DO NOTHING;

-- View: chi phí theo ngày.
CREATE OR REPLACE VIEW v_chi_phi_ngay AS
SELECT date(thoi_gian) AS ngay,
       count(*) AS so_luot,
       sum(token_vao) AS token_vao,
       sum(token_ra) AS token_ra,
       sum(chi_phi_usd) AS chi_phi_usd
FROM ai_luot_goi GROUP BY date(thoi_gian) ORDER BY ngay DESC;

-- View: chi phí theo nhà cung cấp.
CREATE OR REPLACE VIEW v_chi_phi_nha_cung_cap AS
SELECT nha_cung_cap,
       count(*) AS so_luot,
       sum(token_vao + token_ra) AS tong_token,
       sum(chi_phi_usd) AS chi_phi_usd,
       avg(thoi_gian_ms) AS thoi_gian_ms_tb,
       sum(CASE WHEN thanh_cong THEN 0 ELSE 1 END) AS so_loi
FROM ai_luot_goi GROUP BY nha_cung_cap ORDER BY chi_phi_usd DESC;

-- View: chi phí theo loại luận.
CREATE OR REPLACE VIEW v_chi_phi_loai_luan AS
SELECT loai_luan,
       count(*) AS so_luot,
       sum(chi_phi_usd) AS chi_phi_usd,
       avg(chi_phi_usd) AS chi_phi_tb_luot
FROM ai_luot_goi GROUP BY loai_luan ORDER BY chi_phi_usd DESC;

-- Ví dụ truy vấn nhanh cho admin:
-- SELECT * FROM v_chi_phi_ngay LIMIT 30;
-- SELECT * FROM v_chi_phi_nha_cung_cap;
-- SELECT date(thoi_gian) ngay, nha_cung_cap, sum(chi_phi_usd) FROM ai_luot_goi
--   WHERE thoi_gian >= now() - interval '30 days' GROUP BY 1,2 ORDER BY 1 DESC;
