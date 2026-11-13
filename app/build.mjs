// Đóng gói mã: tiến trình chính (Node, gồm cả bộ máy menh-engine) và giao diện (trình duyệt, gồm three.js).
import { build } from 'esbuild';
await build({ entryPoints: ['main.ts'], outfile: 'dist/main.js', bundle: true, platform: 'node', format: 'cjs', target: 'node20', external: ['electron', 'pg'], loader: { '.json': 'json' }, logLevel: 'warning', define: { 'import.meta.url': '"file:///app/"' } });
await build({ entryPoints: ['web-src/main.ts'], outfile: 'web/app.js', bundle: true, platform: 'browser', format: 'iife', target: 'chrome120', minify: true, logLevel: 'warning' });
console.log('Đã đóng gói dist/main.js và web/app.js');
