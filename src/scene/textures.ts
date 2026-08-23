import * as THREE from "three";

/* All textures are painted on canvas — zero network requests, crisp at any DPR. */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, x: c.getContext("2d")! };
}

function toTexture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

export function toonGradient(): THREE.Texture {
  const { c, x } = makeCanvas(4, 1);
  x.fillStyle = "#8c8c8c"; x.fillRect(0, 0, 1, 1);
  x.fillStyle = "#c9c9c9"; x.fillRect(1, 0, 1, 1);
  x.fillStyle = "#ececec"; x.fillRect(2, 0, 1, 1);
  x.fillStyle = "#ffffff"; x.fillRect(3, 0, 1, 1);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}

export function floorTexture(): THREE.Texture {
  const { c, x } = makeCanvas(1024, 1024);
  const g = x.createRadialGradient(512, 512, 60, 512, 512, 520);
  g.addColorStop(0, "#ffe9f2");
  g.addColorStop(0.55, "#ffd9e8");
  g.addColorStop(1, "#ffbcd6");
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 1024);
  // soft checker rings for depth
  x.strokeStyle = "rgba(255,255,255,0.35)";
  for (let r = 90; r < 560; r += 90) {
    x.lineWidth = r % 180 === 0 ? 26 : 12;
    x.beginPath();
    x.arc(512, 512, r, 0, Math.PI * 2);
    x.stroke();
  }
  x.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 240; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 120 + Math.random() * 380;
    x.beginPath();
    x.arc(512 + Math.cos(a) * r, 512 + Math.sin(a) * r, 2.2, 0, Math.PI * 2);
    x.fill();
  }
  const t = toTexture(c);
  return t;
}

export function wallTexture(): THREE.Texture {
  const { c, x } = makeCanvas(512, 512);
  x.fillStyle = "#ffc6dd";
  x.fillRect(0, 0, 512, 512);
  x.fillStyle = "rgba(255,255,255,0.5)";
  for (let yy = 24; yy < 512; yy += 64) {
    const off = ((yy / 64) % 2) * 32;
    for (let xx = off; xx < 512; xx += 64) {
      x.beginPath();
      x.arc(xx, yy, 7, 0, Math.PI * 2);
      x.fill();
    }
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 2.2);
  return t;
}

export function raysTexture(): THREE.Texture {
  const { c, x } = makeCanvas(1024, 1024);
  x.clearRect(0, 0, 1024, 1024);
  const N = 22;
  for (let i = 0; i < N; i += 2) {
    x.fillStyle = "rgba(255,255,255,0.30)";
    x.beginPath();
    x.moveTo(512, 512);
    x.arc(512, 512, 512, (i / N) * Math.PI * 2, ((i + 1) / N) * Math.PI * 2);
    x.closePath();
    x.fill();
  }
  const g = x.createRadialGradient(512, 512, 40, 512, 512, 512);
  g.addColorStop(0, "rgba(255,244,248,0.9)");
  g.addColorStop(0.35, "rgba(255,244,248,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 1024);
  return toTexture(c);
}

export function blobShadowTexture(): THREE.Texture {
  const { c, x } = makeCanvas(256, 256);
  const g = x.createRadialGradient(128, 128, 10, 128, 128, 126);
  g.addColorStop(0, "rgba(90,21,57,0.42)");
  g.addColorStop(0.6, "rgba(90,21,57,0.20)");
  g.addColorStop(1, "rgba(90,21,57,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  return toTexture(c, false);
}

export function puffTexture(): THREE.Texture {
  const { c, x } = makeCanvas(128, 128);
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.5, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return toTexture(c, false);
}

export function sparkleTexture(): THREE.Texture {
  const { c, x } = makeCanvas(64, 64);
  x.clearRect(0, 0, 64, 64);
  const g = x.createRadialGradient(32, 32, 1, 32, 32, 30);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,240,200,0.8)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return toTexture(c, false);
}

export function candleStripeTexture(base: string): THREE.Texture {
  const { c, x } = makeCanvas(64, 128);
  x.fillStyle = base;
  x.fillRect(0, 0, 64, 128);
  x.strokeStyle = "rgba(255,255,255,0.85)";
  x.lineWidth = 9;
  for (let i = -2; i < 6; i++) {
    x.beginPath();
    x.moveTo(i * 24 - 20, 140);
    x.lineTo(i * 24 + 26, -12);
    x.stroke();
  }
  const t = toTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

function wrapText(
  x: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxW: number,
  lineH: number,
  font: string,
  color: string
) {
  x.font = font;
  x.fillStyle = color;
  x.textAlign = "center";
  x.textBaseline = "middle";
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (x.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  const y0 = cy - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => x.fillText(l, cx, y0 + i * lineH));
}

/** The party banner the character holds — text comes straight from config.json */
export function bannerTexture(text: string, sub: string): THREE.Texture {
  const { c, x } = makeCanvas(1024, 400);
  // cloth
  x.fillStyle = "#e63f85";
  x.fillRect(0, 0, 1024, 400);
  const g = x.createLinearGradient(0, 0, 0, 400);
  g.addColorStop(0, "rgba(255,255,255,0.22)");
  g.addColorStop(0.45, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(90,21,57,0.30)");
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 400);
  // stitched double border
  x.strokeStyle = "#fff4f8";
  x.lineWidth = 14;
  x.strokeRect(26, 26, 1024 - 52, 400 - 52);
  x.setLineDash([4, 16]);
  x.lineWidth = 6;
  x.strokeRect(48, 48, 1024 - 96, 400 - 96);
  x.setLineDash([]);
  // corner hearts
  const heart = (cx: number, cy: number, s: number) => {
    x.fillStyle = "#ffd3e5";
    x.beginPath();
    x.moveTo(cx, cy + s * 0.85);
    x.bezierCurveTo(cx - s * 1.4, cy - s * 0.2, cx - s * 0.7, cy - s * 1.1, cx, cy - s * 0.35);
    x.bezierCurveTo(cx + s * 0.7, cy - s * 1.1, cx + s * 1.4, cy - s * 0.2, cx, cy + s * 0.85);
    x.fill();
  };
  heart(86, 86, 16); heart(1024 - 86, 86, 16);
  heart(86, 400 - 86, 16); heart(1024 - 86, 400 - 86, 16);
  // text
  wrapText(x, text.toUpperCase(), 512, sub ? 178 : 200, 860, 84,
    "800 74px 'Baloo 2', sans-serif", "#fff7ec");
  if (sub) {
    wrapText(x, sub, 512, 292, 860, 46,
      "italic 600 34px 'Be Vietnam Pro', sans-serif", "#ffd3e5");
  }
  return toTexture(c);
}

/** Small "tuổi ..." tag that tops the cake. */
export function ageTagTexture(age: number): THREE.Texture {
  const { c, x } = makeCanvas(256, 128);
  x.clearRect(0, 0, 256, 128);
  x.fillStyle = "#fff4f8";
  x.strokeStyle = "#5a1539";
  x.lineWidth = 10;
  x.beginPath();
  x.moveTo(24, 8); x.lineTo(232, 8); x.lineTo(248, 24); x.lineTo(248, 104);
  x.lineTo(232, 120); x.lineTo(24, 120); x.lineTo(8, 104); x.lineTo(8, 24);
  x.closePath();
  x.fill(); x.stroke();
  x.fillStyle = "#e63f85";
  x.font = "800 58px 'Baloo 2', sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(`${age}`, 128, 70);
  return toTexture(c);
}
