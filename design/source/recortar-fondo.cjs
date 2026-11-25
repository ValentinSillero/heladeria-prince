// Recorta el fondo liso de una foto (flood fill desde los bordes) y lo vuelve transparente con borde suave.
const sharp = require(require.resolve('sharp', { paths: [process.cwd()] }));
const [,, src, out, tolArg] = process.argv;
const TOL = Number(tolArg || 28);
(async () => {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  // color de fondo: promedio de las 4 esquinas
  const c = [0, 0, 0]; const corners = [[2,2],[W-3,2],[2,H-3],[W-3,H-3]];
  for (const [x,y] of corners) for (let k=0;k<3;k++) c[k]+=data[(y*W+x)*3+k]/4;
  const dist = new Float32Array(N);
  for (let i=0;i<N;i++){const r=data[i*3]-c[0],g=data[i*3+1]-c[1],b=data[i*3+2]-c[2];dist[i]=Math.sqrt(r*r+g*g+b*b);}
  // flood fill del fondo conectado a los bordes
  const bg = new Uint8Array(N); const st=[];
  const push=(i)=>{ if(!bg[i] && dist[i]<TOL){bg[i]=1;st.push(i);} };
  for (let x=0;x<W;x++){push(x);push((H-1)*W+x);} for(let y=0;y<H;y++){push(y*W);push(y*W+W-1);}
  while(st.length){const i=st.pop();const x=i%W,y=(i/W)|0; if(x>0)push(i-1); if(x<W-1)push(i+1); if(y>0)push(i-W); if(y<H-1)push(i+W);}
  // alfa: 0 en fondo; borde suave en el contorno según la distancia de color
  let alpha = new Float32Array(N);
  for (let i=0;i<N;i++) alpha[i] = bg[i] ? 0 : 1;
  // pixeles de primer plano junto al fondo: alfa proporcional a distancia
  for (let i=0;i<N;i++){ if(bg[i]) continue; const x=i%W,y=(i/W)|0; let edge=false;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy; if(nx>=0&&ny>=0&&nx<W&&ny<H&&bg[ny*W+nx]) edge=true;}
    if(edge) alpha[i]=Math.min(1, Math.max(0,(dist[i]-TOL*0.5)/(TOL*1.6)));
  }
  // suavizado 3x3 del alfa
  const a2 = new Float32Array(N);
  for (let y=0;y<H;y++) for (let x=0;x<W;x++){let s=0,n=0; for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy; if(nx>=0&&ny>=0&&nx<W&&ny<H){s+=alpha[ny*W+nx];n++;}} a2[y*W+x]=Math.min(alpha[y*W+x]===1?1:1, s/n);}
  const outBuf = Buffer.alloc(N*4);
  for (let i=0;i<N;i++){
    const a=a2[i];
    // quitar el tinte del fondo en los bordes semitransparentes
    for(let k=0;k<3;k++){ let v=data[i*3+k]; if(a>0&&a<1){ v=(v-c[k]*(1-a))/a; } outBuf[i*4+k]=Math.max(0,Math.min(255,Math.round(v))); }
    outBuf[i*4+3]=Math.round(a*255);
  }
  await sharp(outBuf,{raw:{width:W,height:H,channels:4}}).trim({threshold:0}).webp({quality:88,alphaQuality:90,effort:6}).toFile(out);
  const m = await sharp(out).metadata(); console.log(out, m.width+'x'+m.height, 'bg', c.map(Math.round));
})();
