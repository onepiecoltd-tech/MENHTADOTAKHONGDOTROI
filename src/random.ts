import { randomInt } from 'node:crypto';

/** Trả về hàm sinh số nguyên [0, n). Có seed thì tái lập được (dùng cho test), không seed thì dùng crypto. */
export function taoNgauNhien(seed?: number): (n: number) => number {
  if (seed == null) return (n) => randomInt(n);
  let s = seed >>> 0;
  return (n) => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return Math.floor((((x ^ (x >>> 14)) >>> 0) / 4294967296) * n);
  };
}
