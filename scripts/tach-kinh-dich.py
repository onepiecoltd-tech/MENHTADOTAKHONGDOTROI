#!/usr/bin/env python3
"""Tách lời quẻ, Thoán, Tượng, lời hào (dịch âm + dịch nghĩa) từ bản text của sách Kinh Dịch (Ngô Tất Tố).
Cách dùng:  pdftotext sach.pdf sach.txt && python3 -I scripts/tach-kinh-dich.py sach.txt data/kinhdich/loi-que.json
Chỉ lấy phần kinh văn (LỜI KINH: dịch âm, dịch nghĩa); không lấy phần GIẢI NGHĨA của Trình Di, Chu Hy."""
import json, re, sys, unicodedata

src, dst = sys.argv[1], sys.argv[2]
lines = unicodedata.normalize('NFC', open(src, encoding='utf8').read()).replace('\f', '\n').split('\n')

QUE = json.loads(sys.argv[3]) if len(sys.argv) > 3 else None  # [[ten, thuong, ha, hao[6]], ...] để đối chiếu
dau = [i for i, l in enumerate(lines) if re.fullmatch(r'QUẺ [A-ZÀ-ỸĐ ]+', l.strip()) and i > 1000]
assert len(dau) == 64, f'Tìm thấy {len(dau)} chương quẻ, cần 64'

def khong_dau(t):
    t = unicodedata.normalize('NFD', t.lower().replace('đ', 'd'))
    return re.sub(r'\s+', ' ', ''.join(c for c in t if unicodedata.category(c) != 'Mn'))

VI_TRI = {'so': 1, 'nhi': 2, 'tam': 3, 'tu': 4, 'ngu': 5, 'thuong': 6}
HAN_VT = {'初': 1, '二': 2, '三': 3, '四': 4, '五': 5, '上': 6}
HAO = re.compile(r'^(so|thuong) (cuu|luc)\b|^(cuu|luc) (nhi|tam|tu|ngu)\b')
sach = lambda s: re.sub(r'\s+', ' ', re.sub(r'\[\d+\]', '', s)).strip(' -.–:,;').strip()
DA = re.compile(r'D\S{1,2}ch\s+[âaăÂ]m\s*[.,:;]?\s*[-–]?', re.I)
DN = re.compile(r'D\S{1,2}ch\s+ngh\S{1,2}a\s*[.,:;]?\s*[-–]?', re.I)
HET = re.compile(r'G\S{2,4}\s*\S?GH\S{1,3}A|Truyện của Trình Di|Bản nghĩa của Chu Hy|Lời bàn của Tiên Nho')

def loai_khoi(am, han):
    """-> ('hao', vị trí) | ('thoan',) | ('tuong',) | ('dung',) | ('khac',)"""
    k = khong_dau(am)
    h = re.sub(r'\s+', '', unicodedata.normalize('NFKC', han))
    m = HAO.match(k)
    if m:
        return ('hao', VI_TRI[m.group(1) or m.group(4)])
    if k.startswith('dung cuu') or k.startswith('dung luc'):
        return ('dung',)
    if k.startswith('thoan viet'):
        return ('thoan',)
    if k.startswith('tuong viet'):
        return ('tuong',)
    # Dịch âm bị lỗi đánh máy hoặc thiếu: nhận diện theo dòng chữ Hán
    m = re.match(r'([初上])[九六]|[九六#]([二三四五])', h)
    if m:
        return ('hao', HAN_VT[m.group(1) or m.group(2)])
    if h.startswith('用九') or h.startswith('用六'):
        return ('dung',)
    if h.startswith('彖'):
        return ('thoan',)
    if re.match(r'象[曰日]', h):
        return ('tuong',)
    return ('khac',)

MOC = re.compile(r'^[ \t]*(LỜI KINH)[ \t]*$|^[ \t]*D\S{1,2}ch\s*(âm|am|ăm|ngh\S{1,3})\s*[.,:;]?\s*[-–]?', re.M | re.I)

def cac_khoi(doan):
    """Mỗi khối kinh văn -> (chữ Hán, dịch âm, dịch nghĩa).
    Chịu được lỗi của ebook: thiếu tiêu đề LỜI KINH, thiếu dòng Dịch âm, gõ sai chữ 'Dịch nghĩa'."""
    text = '\n'.join(doan)
    khoi_ds, cur = [], None
    for m in MOC.finditer(text):
        if m.group(1):
            cur = {'bd': m.end(), 'moc': []}; khoi_ds.append(cur)
        else:
            if cur is None or len(cur['moc']) >= 2:
                cur = {'bd': m.start(), 'moc': []}; khoi_ds.append(cur)
            cur['moc'].append((m.start(), m.end(), 'ngh' in m.group(2).lower()))
    for i, k in enumerate(khoi_ds):
        kt = len(text)
        if i + 1 < len(khoi_ds):
            nxt = khoi_ds[i + 1]
            kt = text.rfind('LỜI KINH', k['bd'], nxt['bd']) if text.rfind('LỜI KINH', k['bd'], nxt['bd']) > 0 else nxt['bd']
        het = HET.search(text, k['bd'], kt)
        if het:
            kt = het.start()
        moc = [x for x in k['moc'] if x[0] < kt]
        han = text[k['bd']:moc[0][0] if moc else kt]
        am = nghia = ''
        if len(moc) >= 2:
            am, nghia = text[moc[0][1]:moc[1][0]], text[moc[1][1]:kt]
        elif len(moc) == 1:
            if moc[0][2]: nghia = text[moc[0][1]:kt]
            else: am = text[moc[0][1]:kt]
        yield han.strip(), sach(am), sach(nghia)

# Quẻ mà ebook làm mất chữ "Thoán viết": số khối đầu thuộc lời quẻ, phần sau là Thoán.
SO_KHOI_LOI_QUE = {62: 2}
# Quẻ mà ebook làm mất hẳn nhãn hào: {số quẻ: vị trí hào}; khối ngay sau tiểu tượng của hào trước là lời hào đó.
HAO_MAT_NHAN = {53: 2}

kq, canh_bao = [], []
for n, bd in enumerate(dau):
    kt = dau[n + 1] if n + 1 < 64 else len(lines)
    doan = lines[bd:kt]
    q = {'so': n + 1, 'tenTrongSach': lines[bd].strip().title(), 'quaiTrongSach': doan[1].strip() if len(doan) > 1 else '',
         'loiQueAm': '', 'loiQue': '', 'thoanAm': '', 'thoan': '', 'loiTuongAm': '', 'loiTuong': '',
         'haoAm': [''] * 6, 'hao': [''] * 6, 'tieuTuongAm': [''] * 6, 'tieuTuong': [''] * 6}
    truoc, hao_truoc = None, None
    so_khoi = 0
    for han, am, nghia in cac_khoi(doan):
        so_khoi += 1
        loai = loai_khoi(am, han)
        han_g = re.sub(r'\s+', '', unicodedata.normalize('NFKC', han))
        # Ebook ghi nhầm "Tượng viết" cho Thoán truyện (dòng Hán là 彖)
        if loai[0] == 'tuong' and han_g.startswith('彖') and not q['thoan'] and truoc == 'que':
            loai = ('thoan',)
        # Ebook mất nhãn hào (vd Tiệm hào 2): khối lạ ngay sau hào trước, dịch nghĩa mở đầu bằng "Hào"
        if loai[0] == 'khac' and hao_truoc and hao_truoc < 6 and not q['hao'][hao_truoc] and ((truoc == 'tieutuong' and HAO_MAT_NHAN.get(n + 1) == hao_truoc + 1) or (truoc in ('hao', 'tieutuong') and khong_dau(nghia).startswith('hao '))):
            loai = ('hao', hao_truoc + 1)
        # Ebook mất chữ "Thoán viết": số khối thuộc lời quẻ được chỉ định tay trong SO_KHOI_LOI_QUE
        if loai[0] == 'khac' and truoc == 'que' and (n + 1) in SO_KHOI_LOI_QUE and so_khoi > SO_KHOI_LOI_QUE[n + 1]:
            loai = ('thoan',)
        if loai[0] == 'hao':
            vt = loai[1]
            if not q['hao'][vt - 1] and not q['haoAm'][vt - 1]:
                q['haoAm'][vt - 1], q['hao'][vt - 1] = am, nghia
                truoc, hao_truoc = 'hao', vt
            else:
                truoc = 'khac'
        elif loai[0] == 'dung':
            if 'dung' not in q:
                q['dungAm'], q['dung'] = am, nghia
                truoc, hao_truoc = 'dung', None
            else:
                truoc = 'khac'
        elif loai[0] == 'thoan':
            if not q['thoan']:
                q['thoanAm'], q['thoan'] = am, nghia
                truoc = 'thoan'
            else:
                truoc = 'khac'
        elif loai[0] == 'tuong':
            if truoc == 'hao' and hao_truoc and not q['tieuTuong'][hao_truoc - 1]:
                q['tieuTuongAm'][hao_truoc - 1], q['tieuTuong'][hao_truoc - 1] = am, nghia
                truoc = 'tieutuong'
            elif not q['loiTuong'] and truoc in ('thoan', 'que', None):
                q['loiTuongAm'], q['loiTuong'] = am, nghia
                truoc = 'tuong'
            else:
                truoc = 'khac'
        elif not q['loiQue'] and truoc is None:
            q['loiQueAm'], q['loiQue'] = am, nghia
            truoc = 'que'
        elif truoc == 'que':
            q['loiQueAm'] += ' ' + am; q['loiQue'] += ' ' + nghia
        elif truoc == 'thoan':
            q['thoanAm'] += ' ' + am; q['thoan'] += ' ' + nghia
        elif n == 0 and truoc in ('tuong', 'kien') and '' in q['tieuTuong']:
            i = q['tieuTuong'].index('')
            q['tieuTuongAm'][i], q['tieuTuong'][i] = am, nghia
            truoc = 'kien'
        else:
            truoc = 'khac'
    thieu = [k for k in ('loiQue', 'thoan', 'loiTuong') if not q[k]] + [f'hào {i+1}' for i in range(6) if not q['hao'][i]] + [f'tiểu tượng {i+1}' for i in range(6) if not q['tieuTuong'][i]]
    if thieu:
        canh_bao.append(f"{n+1}. {q['tenTrongSach']}: thiếu {', '.join(thieu)}")
    if QUE:
        ten, thuong, ha, hao = QUE[n]
        q['ten'] = ten
        doi = {'Kiền': 'Càn', 'Đoái': 'Đoài'}
        q['quaiTrongSach'] = re.sub(r'[\u2630-\u2637]', '', q['quaiTrongSach']).strip()
        m2 = re.match(r'(\S+?) trên\s*[;,]\s*(\S+) dưới', q['quaiTrongSach'])
        if m2 and (doi.get(m2.group(1), m2.group(1)), doi.get(m2.group(2), m2.group(2))) != (thuong, ha):
            canh_bao.append(f"{n+1}. {ten}: sách ghi '{q['quaiTrongSach']}', bảng là {thuong} trên {ha} dưới")
        vt = ['Sơ', 'Nhị', 'Tam', 'Tứ', 'Ngũ', 'Thượng']
        q['tenHao'] = [(f"{vt[i]} {'Cửu' if hao[i] else 'Lục'}" if i in (0, 5) else f"{'Cửu' if hao[i] else 'Lục'} {vt[i]}") for i in range(6)]
    kq.append(q)

json.dump({'nguon': 'Kinh Dịch — Ngô Tất Tố dịch và chú giải (NXB Văn Học); chỉ gồm kinh văn: dịch âm và dịch nghĩa',
           'ghiChu': 'Tách tự động bằng scripts/tach-kinh-dich.py. Tên quẻ, tên hào trong sách dùng lối cũ: Kiền = Càn, Đoái = Đoài, Chín = Cửu (hào dương), Sáu = Lục (hào âm).',
           'que': kq}, open(dst, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
du = sum(1 for q in kq if q['loiQue'] and all(q['hao']))
print(f'Đã ghi {dst}: {du}/64 quẻ đủ lời quẻ và 6 hào; {sum(1 for q in kq if q["loiTuong"])}/64 có Đại Tượng; {sum(1 for q in kq if q["thoan"])}/64 có Thoán; tiểu tượng {sum(sum(1 for t in q["tieuTuong"] if t) for q in kq)}/384')
print('Cảnh báo:' if canh_bao else 'Không có cảnh báo.')
for c in canh_bao: print('  ' + c)
