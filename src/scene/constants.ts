import * as THREE from "three";

/* Shared scene metrics — camera rig, cake and character all read from here
   so the framing math always matches the actual geometry. */

export const TABLE_H = 0.92;
export const PLATE_Y = TABLE_H + 0.035;

export const TIER = [
  { r: 0.85, h: 0.5 },
  { r: 0.62, h: 0.42 },
  { r: 0.42, h: 0.34 },
];

export const CAKE_TOP_Y = PLATE_Y + TIER.reduce((a, t) => a + t.h, 0); // ≈ 2.24
export const CANDLE_H = 0.34;
export const CANDLE_R = 0.036;
export const CANDLE_RING_R = 0.24;
export const FLAME_Y = CAKE_TOP_Y + CANDLE_H + 0.09; // ≈ 2.67

export const TABLE_R = 1.18;

/* character */
export const CHAR_STAND = new THREE.Vector3(-1.12, 0, 1.32);   // prays here
export const CHAR_LIGHT_SPOT = new THREE.Vector3(-1.02, 0, 0.58); // relights here
export const CHAR_OFFSCREEN = new THREE.Vector3(-7.6, 0, 2.3);
export const CHAR_SPEED = 1.75;

/* candles positions on top tier */
export function candlePositions(count: number): THREE.Vector3[] {
  const n = Math.min(7, Math.max(3, Math.round(count)));
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.PI / 2;
    pts.push(
      new THREE.Vector3(
        Math.cos(a) * CANDLE_RING_R,
        CAKE_TOP_Y + CANDLE_H / 2,
        Math.sin(a) * CANDLE_RING_R
      )
    );
  }
  return pts;
}

export const PASTEL = ["#ff8fc0", "#ffd166", "#8fd9ff", "#b79cff", "#7ee0c3", "#ff9d7e"];
export const CANDY = {
  ink: "#5a1539",
  punch: "#ff5c9e",
  punchDeep: "#e63f85",
  candy: "#ff8fc0",
  blush: "#ffd3e5",
  paper: "#fff4f8",
  cream: "#fff7ec",
  choco: "#8a5a3b",
  white: "#ffffff",
  mint: "#7ee0c3",
  butter: "#ffd166",
  skin: "#ffe4d2",
  hair: "#7c4a2e",
  dress: "#ff6fae",
  dressDeep: "#e85596",
  shoe: "#c93f7d",
};
