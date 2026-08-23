import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useParty } from "../store";
import {
  CAKE_TOP_Y, CANDLE_H, CANDLE_R, FLAME_Y, PLATE_Y, TABLE_H, TIER, candlePositions,
  PASTEL, CANDY,
} from "./constants";
import { toonGradient, candleStripeTexture, puffTexture, ageTagTexture } from "./textures";

function heartShape(s: number) {
  const sh = new THREE.Shape();
  sh.moveTo(0, -s);
  sh.bezierCurveTo(s * 1.25, s * 0.25, s * 0.62, s * 1.15, 0, s * 0.52);
  sh.bezierCurveTo(-s * 0.62, s * 1.15, -s * 1.25, s * 0.25, 0, -s);
  return sh;
}

/* ---------------- single candle with staggered lit/out + smoke ---------------- */
function Candle({
  pos, index, stripe, grad,
}: {
  pos: THREE.Vector3; index: number; stripe: string; grad: THREE.Texture;
}) {
  const candlesLit = useParty((s) => s.candlesLit);
  const [lit, setLit] = useState(true);
  const flame = useRef<THREE.Group>(null);
  const smoke = useRef<THREE.Sprite>(null);
  const smokeT = useRef(-1);
  const puff = useMemo(() => puffTexture(), []);
  const seed = useMemo(() => index * 13.7, [index]);

  useEffect(() => {
    const t = setTimeout(() => setLit(candlesLit), 90 + index * 120);
    if (!candlesLit) smokeT.current = 0;
    return () => clearTimeout(t);
  }, [candlesLit, index]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (flame.current) {
      const k = lit ? 1 : 0;
      const cur = flame.current.scale.x;
      const ns = THREE.MathUtils.damp(cur, k, 14, dt);
      flame.current.scale.setScalar(Math.max(ns, 0.0001));
      flame.current.position.y = CANDLE_H / 2 + 0.055 + Math.sin(t * 11 + seed) * 0.006 * k;
      flame.current.rotation.z = Math.sin(t * 9 + seed) * 0.12 * k;
      const sx = 1 + Math.sin(t * 17 + seed) * 0.14;
      flame.current.scale.y = ns * sx;
    }
    if (smoke.current) {
      if (smokeT.current >= 0) {
        smokeT.current += dt;
        const p = smokeT.current / 1.25;
        if (p >= 1) {
          smokeT.current = -1;
          smoke.current.visible = false;
        } else {
          smoke.current.visible = true;
          smoke.current.position.y = CANDLE_H / 2 + 0.1 + p * 0.55;
          smoke.current.position.x = Math.sin(p * 7 + seed) * 0.04 * p;
          const s = 0.12 + p * 0.42;
          smoke.current.scale.set(s, s, 1);
          (smoke.current.material as THREE.SpriteMaterial).opacity = 0.75 * (1 - p);
        }
      }
    }
  });

  return (
    <group position={pos}>
      <mesh>
        <cylinderGeometry args={[CANDLE_R, CANDLE_R, CANDLE_H, 12]} />
        <meshToonMaterial map={stripeTex(stripe)} gradientMap={grad} color="#ffffff" />
      </mesh>
      <mesh position={[0, CANDLE_H / 2 + 0.012, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.045, 6]} />
        <meshToonMaterial color={CANDY.ink} gradientMap={grad} />
      </mesh>
      <group ref={flame} position={[0, CANDLE_H / 2 + 0.055, 0]}>
        <mesh>
          <coneGeometry args={[0.048, 0.15, 10]} />
          <meshBasicMaterial color="#ff9a3d" transparent opacity={0.92} />
        </mesh>
        <mesh position={[0, -0.028, 0]} scale={[1, 1.35, 1]}>
          <sphereGeometry args={[0.026, 10, 10]} />
          <meshBasicMaterial color="#fff3c0" />
        </mesh>
      </group>
      <sprite ref={smoke} position={[0, CANDLE_H / 2 + 0.1, 0]} visible={false} scale={0.2}>
        <spriteMaterial map={puff} transparent opacity={0} depthWrite={false} color="#d8d8e8" />
      </sprite>
    </group>
  );
}

/* cache stripe textures per color */
const stripeCache = new Map<string, THREE.Texture>();
function stripeTex(color: string) {
  let t = stripeCache.get(color);
  if (!t) {
    t = candleStripeTexture(color);
    stripeCache.set(color, t);
  }
  return t;
}

/* ---------------- sprinkles on all frosting tops (1 draw call) ---------------- */
function Sprinkles({ grad }: { grad: THREE.Texture }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const items: { m: THREE.Matrix4; c: THREE.Color }[] = [];
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    TIER.forEach((tier, ti) => {
      const topY = PLATE_Y + TIER.slice(0, ti + 1).reduce((a, t) => a + t.h, 0) + 0.035;
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * (tier.r - 0.1);
        e.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        q.setFromEuler(e);
        const m = new THREE.Matrix4().compose(
          new THREE.Vector3(Math.cos(a) * r, topY, Math.sin(a) * r),
          q,
          new THREE.Vector3(1, 1, 1)
        );
        items.push({ m, c: new THREE.Color(PASTEL[i % PASTEL.length]) });
      }
    });
    return items;
  }, []);

  useEffect(() => {
    if (!mesh.current) return;
    data.forEach((d, i) => {
      mesh.current!.setMatrixAt(i, d.m);
      mesh.current!.setColorAt(i, d.c);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, data.length]} frustumCulled={false}>
      <cylinderGeometry args={[0.014, 0.014, 0.055, 6]} />
      <meshToonMaterial gradientMap={grad} color="#ffffff" />
    </instancedMesh>
  );
}

/* ---------------- drips under each frosting cap (1 draw call per tier) ---------------- */
function Drips({ tier, y, color, grad }: { tier: number; y: number; color: string; grad: THREE.Texture }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const r = TIER[tier].r + 0.005;
  const count = tier === 0 ? 18 : 13;
  const data = useMemo(() => {
    const ms: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (tier * 0.5);
      const len = 0.1 + ((i * 37 + tier * 13) % 10) / 10 * 0.16;
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(Math.cos(a) * r, y - len / 2 + 0.01, Math.sin(a) * r),
        new THREE.Quaternion(),
        new THREE.Vector3(1, len, 1)
      );
      ms.push(m);
    }
    return ms;
  }, [count, r, y, tier]);

  useEffect(() => {
    if (!mesh.current) return;
    data.forEach((m, i) => mesh.current!.setMatrixAt(i, m));
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <cylinderGeometry args={[0.042, 0.052, 1, 8]} />
      <meshToonMaterial color={color} gradientMap={grad} />
    </instancedMesh>
  );
}

/* ---------------- little strawberries on the frosting ---------------- */
function Strawberries({ grad }: { grad: THREE.Texture }) {
  const spots = useMemo(() => {
    const arr: { p: [number, number, number]; s: number; r: number }[] = [];
    // ring on the bottom tier
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      arr.push({
        p: [Math.cos(a) * (TIER[0].r - 0.06), PLATE_Y + TIER[0].h + 0.045, Math.sin(a) * (TIER[0].r - 0.06)],
        s: 0.075 + (i % 3) * 0.008,
        r: a,
      });
    }
    // a few on the middle tier
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.8;
      arr.push({
        p: [
          Math.cos(a) * (TIER[1].r - 0.06),
          PLATE_Y + TIER[0].h + TIER[1].h + 0.04,
          Math.sin(a) * (TIER[1].r - 0.06),
        ],
        s: 0.065,
        r: a,
      });
    }
    return arr;
  }, []);
  return (
    <group>
      {spots.map((sp, i) => (
        <group key={i} position={sp.p} rotation={[0, sp.r, 0]}>
          <mesh scale={[1, 0.88, 1]}>
            <sphereGeometry args={[sp.s, 10, 10]} />
            <meshToonMaterial color="#ff5f7e" gradientMap={grad} />
          </mesh>
          <mesh position={[0, sp.s * 0.82, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[sp.s * 0.55, sp.s * 0.5, 6]} />
            <meshToonMaterial color="#7bc47f" gradientMap={grad} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------- the whole cake ---------------- */
export function Cake({ candleCount, age }: { candleCount: number; age: number }) {
  const grad = useMemo(() => toonGradient(), []);
  const candlesLit = useParty((s) => s.candlesLit);
  const light = useRef<THREE.PointLight>(null);
  const topper = useRef<THREE.Group>(null);
  const positions = useMemo(() => candlePositions(candleCount), [candleCount]);
  const ageTex = useMemo(() => ageTagTexture(age), [age]);
  const heartGeo = useMemo(
    () => new THREE.ExtrudeGeometry(heartShape(0.16), { depth: 0.07, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 12 }),
    []
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (light.current) {
      const target = candlesLit ? 1.35 : 0;
      light.current.intensity = THREE.MathUtils.damp(
        light.current.intensity,
        target * (1 + Math.sin(t * 13) * 0.1 + Math.sin(t * 29 + 2) * 0.06),
        9, dt
      );
    }
    if (topper.current) topper.current.rotation.y = Math.sin(t * 0.6) * 0.16 + 0.45;
  });

  const tierColors = ["#ffe4c9", "#ffd3e5", "#fff0dc"];
  const capColors = [CANDY.punch, "#ffffff", CANDY.punch];

  return (
    <group>
      {/* plate + pedestal */}
      <mesh position={[0, PLATE_Y - 0.02, 0]}>
        <cylinderGeometry args={[1.08, 1.14, 0.07, 42]} />
        <meshToonMaterial color="#ffffff" gradientMap={grad} />
      </mesh>
      <mesh position={[0, (TABLE_H + PLATE_Y) / 2 - 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.22, PLATE_Y - TABLE_H - 0.02, 14]} />
        <meshToonMaterial color="#f3d9e6" gradientMap={grad} />
      </mesh>

      {/* tiers + frosting caps */}
      {TIER.map((t, i) => {
        const baseY = PLATE_Y + TIER.slice(0, i).reduce((a, x) => a + x.h, 0);
        return (
          <group key={i}>
            <mesh position={[0, baseY + t.h / 2, 0]}>
              <cylinderGeometry args={[t.r * 0.96, t.r, t.h, 42]} />
              <meshToonMaterial color={tierColors[i]} gradientMap={grad} />
            </mesh>
            <mesh position={[0, baseY + t.h - 0.005, 0]}>
              <cylinderGeometry args={[t.r + 0.025, t.r + 0.025, 0.07, 42]} />
              <meshToonMaterial color={capColors[i]} gradientMap={grad} />
            </mesh>
            <Drips tier={i} y={baseY + t.h - 0.035} color={capColors[i]} grad={grad} />
          </group>
        );
      })}

      <Sprinkles grad={grad} />
      <Strawberries grad={grad} />

      {/* candles */}
      {positions.map((p, i) => (
        <Candle key={i} pos={p} index={i} stripe={PASTEL[i % PASTEL.length]} grad={grad} />
      ))}

      {/* topper: heart + age tag */}
      <group ref={topper} position={[0, CAKE_TOP_Y + 0.42, 0]} rotation={[0, 0.45, 0]}>
        <mesh geometry={heartGeo} rotation={[Math.PI, 0, Math.PI]} position={[0, 0, -0.035]}>
          <meshToonMaterial color={CANDY.punchDeep} gradientMap={grad} />
        </mesh>
        <mesh position={[0, -0.34, 0.12]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial map={ageTex} transparent />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
          <meshToonMaterial color={CANDY.choco} gradientMap={grad} />
        </mesh>
      </group>

      {/* warm flickering glow of all flames together (single light) */}
      <pointLight
        ref={light}
        position={[0, FLAME_Y + 0.22, 0.1]}
        color="#ffb066"
        intensity={1.2}
        distance={6.5}
        decay={1.8}
      />
    </group>
  );
}
