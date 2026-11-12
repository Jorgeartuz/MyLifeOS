const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const directory = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(directory, { recursive: true });
const points = [[144,352],[144,164],[256,284],[368,164],[368,352]];
function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) { value ^= byte; for (let i=0;i<8;i++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0); }
  return (value ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type); const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length); name.copy(result,4); data.copy(result,8);
  result.writeUInt32BE(crc32(Buffer.concat([name,data])), data.length+8); return result;
}
function distance(x,y,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
for (const size of [180,192,512]) {
  const pixels=Buffer.alloc(size*(size*3+1));
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
    const px=(x+0.5)*512/size,py=(y+0.5)*512/size;
    const gradient=(px+py)/1024;
    let color=[29+(15-29)*gradient,78+(23-78)*gradient,216+(42-216)*gradient];
    const line=Math.min(...points.slice(1).map((p,i)=>distance(px,py,points[i],p)));
    const alpha=Math.min(1,Math.max(0,(23-line)*size/512+0.5));
    color=color.map(c=>c+(255-c)*alpha);
    const dot=Math.min(1,Math.max(0,(17-Math.hypot(px-384,py-116))*size/512+0.5));
    color=color.map((c,i)=>Math.round(c+([94,234,212][i]-c)*dot));
    const offset=y*(size*3+1)+1+x*3;
    color.forEach((c,i)=>pixels[offset+i]=c);
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=2;
  const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
  fs.writeFileSync(path.join(directory,`app-${size}.png`),png);
}
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#1d4ed8"/><stop offset="1" stop-color="#0f172a"/></linearGradient></defs><path fill="url(#bg)" d="M0 0h512v512H0z"/><path d="M144 352V164l112 120 112-120v188" fill="none" stroke="#fff" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/><circle cx="384" cy="116" r="17" fill="#5eead4"/></svg>';
fs.writeFileSync(path.join(directory,'app.svg'),svg);
fs.writeFileSync(path.join(directory,'..','favicon.svg'),svg);
