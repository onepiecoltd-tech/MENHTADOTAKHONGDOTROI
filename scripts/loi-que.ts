/** npm run loi-que : kiểm tra mức hoàn thành của data/kinhdich/loi-que.json */
import { kiemLoiQue } from '../src/index.js';
const k = kiemLoiQue();
console.log(`Nguồn: ${k.nguon}\nĐủ lời quẻ và 6 hào: ${k.daDuLoiQueVaHao}/${k.tongQue} quẻ`);
if (k.thieu.length) console.log('Còn thiếu:\n  ' + k.thieu.join('\n  '));
