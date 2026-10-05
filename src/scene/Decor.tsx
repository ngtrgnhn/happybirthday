import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useParty } from "../store";
import { TABLE_H, TABLE_R, PASTEL, CANDY, FLAME_Y } from "./constants";
import {
  floorTexture, wallTexture, raysTexture, blobShadowTexture,
  sparkleTexture, puffTexture, toonGradient,
} from "./textures";

function heartShape(s: number) {
  const sh = new THREE.Shape();
  sh.moveTo(0, -s);
  sh.bezierCurveTo(s * 1.25, s * 0.25, s * 0.62, s * 1.15, 0, s * 0.52);
  sh.bezierCurveTo(-s * 0.62, s * 1.15, -s * 1.25, s * 0.25, 0, -s);
  return sh;
}

export function BlobShadow({ position, scale = 1, opacity = 1 }: { position: [number, number, number]; scale?: number; opacity?: number }) {
  const tex = useMemo(() => blobShadowTexture(), []);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/* ---------------- room: floor, wall, rotating rays ---------------- */
export function Room() {
  const floorTex = useMemo(() => floorTexture(), []);
  const wallTex = useMemo(() => wallTexture(), []);
  const rayTex = useMemo(() => raysTexture(), []);
  const rays = useRef<THREE.Mesh>(null);
  const grad = useMemo(() => toonGradient(), []);

  useFrame((state, dt) => {
    if (rays.current) rays.current.rotation.z += dt * 0.045;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[14, 48]} />
        <meshBasicMaterial map={floorTex} />
      </mesh>
      <mesh position={[0, 4.6, -6.6]}>
        <planeGeometry args={[34, 13]} />
        <meshBasicMaterial map={wallTex} />
      </mesh>
      <mesh ref={rays} position={[0, 2.6, -5.4]}>
        <circleGeometry args={[6.2, 48]} />
        <meshBasicMaterial map={rayTex} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      
      {/* Curtains on sides */}
      <mesh position={[-5.5, 4, -6.2]}>
        <boxGeometry args={[1.2, 8, 0.1]} />
        <meshToonMaterial color={CANDY.punch} gradientMap={grad} />
      </mesh>
      <mesh position={[5.5, 4, -6.2]}>
        <boxGeometry args={[1.2, 8, 0.1]} />
        <meshToonMaterial color={CANDY.punch} gradientMap={grad} />
      </mesh>
      
      {/* Curtain rods */}
      <mesh position={[0, 8.1, -6.1]}>
        <cylinderGeometry args={[0.08, 0.08, 12, 12]} />
        <meshToonMaterial color={CANDY.choco} gradientMap={grad} />
      </mesh>
      <mesh position={[-6.1, 8.1, -6.1]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshToonMaterial color={CANDY.choco} gradientMap={grad} />
      </mesh>
      <mesh position={[6.1, 8.1, -6.1]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshToonMaterial color={CANDY.choco} gradientMap={grad} />
      </mesh>
      
      {/* Window frame (decorative) */}
      <mesh position={[0, 5.5, -6.5]}>
        <boxGeometry args={[4, 4, 0.15]} />
        <meshToonMaterial color="#ffffff" gradientMap={grad} />
      </mesh>
      <mesh position={[0, 5.5, -6.45]}>
        <boxGeometry args={[3.6, 3.6, 0.1]} />
        <meshBasicMaterial color="#ffe9f3" />
      </mesh>
      <mesh position={[0, 5.5, -6.4]}>
        <boxGeometry args={[0.1, 3.6, 0.08]} />
        <meshToonMaterial color="#ffffff" gradientMap={grad} />
      </mesh>
      <mesh position={[0, 5.5, -6.4]}>
        <boxGeometry args={[3.6, 0.1, 0.08]} />
        <meshToonMaterial color="#ffffff" gradientMap={grad} />
      </mesh>
    </group>
  );
}

/* ---------------- hanging lights ---------------- */
export function HangingLights() {
  const grad = useMemo(() => toonGradient(), []);
  const lights = useMemo(() => [
    { pos: [-2.5, 6, -2] as [number, number, number], color: CANDY.butter },
    { pos: [2.5, 6.2, -2] as [number, number, number], color: CANDY.mint },
    { pos: [-1.5, 5.8, 1.5] as [number, number, number], color: CANDY.candy },
    { pos: [1.5, 6.1, 1.5] as [number, number, number], color: "#b79cff" },
  ], []);

  return (
    <group>
      {lights.map((l, i) => (
        <group key={i} position={l.pos}>
          {/* string */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 1, 6]} />
            <meshBasicMaterial color={CANDY.ink} />
          </mesh>
          {/* bulb */}
          <mesh>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshToonMaterial color={l.color} gradientMap={grad} />
          </mesh>
          {/* glow */}
          <pointLight position={[0, 0, 0]} color={l.color} intensity={0.5} distance={3} decay={2} />
        </group>
      ))}
    </group>
  );
}

/* ---------------- table with cloth ---------------- */
export function Table() {
  const grad = useMemo(() => toonGradient(), []);
  return (
    <group>
      <mesh position={[0, TABLE_H - 0.03, 0]}>
        <cylinderGeometry args={[TABLE_R + 0.06, TABLE_R + 0.06, 0.06, 40]} />
        <meshToonMaterial color="#fff7ec" gradientMap={grad} />
      </mesh>
      <mesh position={[0, TABLE_H / 2, 0]}>
        <cylinderGeometry args={[TABLE_R, TABLE_R + 0.3, TABLE_H, 40, 1, true]} />
        <meshToonMaterial color={CANDY.punch} gradientMap={grad} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[TABLE_R + 0.28, 0.05, 8, 40]} />
        <meshToonMaterial color={CANDY.punchDeep} gradientMap={grad} />
      </mesh>
      <BlobShadow position={[0, 0.008, 0]} scale={3.4} opacity={0.8} />
    </group>
  );
}

/* ---------------- gift boxes (body + lid + cross ribbon + bow) ---------------- */
function GiftBox({
  position, size, box, ribbon, rot,
}: {
  position: [number, number, number];
  size: number;
  box: string;
  ribbon: string;
  rot: number;
}) {
  const grad = useMemo(() => toonGradient(), []);
  const s = size;
  const h = s * 0.72;
  const lidH = s * 0.16;
  return (
    <group position={position} rotation={[0, rot, 0]}>
      {/* body */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[s, h, s]} />
        <meshToonMaterial color={box} gradientMap={grad} />
      </mesh>
      {/* ribbon cross on body */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[s * 0.2, h + 0.004, s + 0.006]} />
        <meshToonMaterial color={ribbon} gradientMap={grad} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[s + 0.006, h + 0.004, s * 0.2]} />
        <meshToonMaterial color={ribbon} gradientMap={grad} />
      </mesh>
      {/* lid */}
      <mesh position={[0, h + lidH / 2, 0]}>
        <boxGeometry args={[s * 1.1, lidH, s * 1.1]} />
        <meshToonMaterial color={box} gradientMap={grad} />
      </mesh>
      <mesh position={[0, h + lidH / 2, 0]}>
        <boxGeometry args={[s * 0.2, lidH + 0.004, s * 1.11]} />
        <meshToonMaterial color={ribbon} gradientMap={grad} />
      </mesh>
      <mesh position={[0, h + lidH / 2, 0]}>
        <boxGeometry args={[s * 1.11, lidH + 0.004, s * 0.2]} />
        <meshToonMaterial color={ribbon} gradientMap={grad} />
      </mesh>
      {/* bow: two loops + knot */}
      <group position={[0, h + lidH + 0.02, 0]}>
        <mesh position={[0.07, 0.03, 0]} rotation={[Math.PI / 2, 0, 0.5]}>
          <torusGeometry args={[0.065, 0.026, 8, 16]} />
          <meshToonMaterial color={ribbon} gradientMap={grad} />
        </mesh>
        <mesh position={[-0.07, 0.03, 0]} rotation={[Math.PI / 2, 0, -0.5]}>
          <torusGeometry args={[0.065, 0.026, 8, 16]} />
          <meshToonMaterial color={ribbon} gradientMap={grad} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshToonMaterial color={ribbon} gradientMap={grad} />
        </mesh>
      </group>
      <BlobShadow position={[0, 0.006, 0]} scale={s * 2.4} opacity={0.7} />
    </group>
  );
}

export function Gifts() {
  return (
    <group>
      <GiftBox position={[1.75, 0, 1.05]} size={0.5} box="#ffd9e8" ribbon="#fff4f8" rot={0.35} />
      <GiftBox position={[2.25, 0, 0.4]} size={0.36} box="#ffd166" ribbon="#ff8fc0" rot={-0.55} />
      <GiftBox position={[-2.0, 0, 0.9]} size={0.44} box="#8fe3c6" ribbon="#fff7ec" rot={0.8} />
      <GiftBox position={[-2.45, 0, 0.15]} size={0.3} box="#ff9ec6" ribbon="#ffd166" rot={-0.25} />
    </group>
  );
}

/* ---------------- soft round rug under the table ---------------- */
function rugTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(256, 256, 30, 256, 256, 256);
  g.addColorStop(0, "#fff0f6");
  g.addColorStop(1, "#ffd3e5");
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 512);
  x.strokeStyle = "rgba(255,255,255,0.8)";
  x.lineWidth = 16;
  x.setLineDash([2, 26]);
  for (const r of [90, 150, 210]) {
    x.beginPath();
    x.arc(256, 256, r, 0, Math.PI * 2);
    x.stroke();
  }
  x.setLineDash([]);
  x.strokeStyle = "rgba(230,63,133,0.35)";
  x.lineWidth = 8;
  x.beginPath();
  x.arc(256, 256, 244, 0, Math.PI * 2);
  x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function Rug() {
  const tex = useMemo(() => rugTexture(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.35]}>
      <circleGeometry args={[2.7, 48]} />
      <meshToonMaterial map={tex} color="#ffffff" />
    </mesh>
  );
}

/* ---------------- swaying balloons ---------------- */
export function Balloons() {
  const grad = useMemo(() => toonGradient(), []);
  const group = useRef<THREE.Group>(null);
  const data = useMemo(
    () => [
      { p: [-3.1, 2.9, -1.2], c: CANDY.punch, s: 1 },
      { p: [-2.5, 3.5, -2.4], c: "#8fd9ff", s: 0.85 },
      { p: [3.0, 3.1, -1.5], c: CANDY.butter, s: 1.05 },
      { p: [2.4, 3.7, -2.8], c: CANDY.candy, s: 0.8 },
      { p: [-3.7, 2.4, 0.4], c: "#b79cff", s: 0.75 },
      { p: [3.7, 2.5, 0.2], c: "#7ee0c3", s: 0.78 },
      { p: [0.6, 4.1, -3.4], c: CANDY.punchDeep, s: 0.9 },
    ],
    []
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((b, i) => {
      b.rotation.z = Math.sin(t * 0.7 + i * 1.7) * 0.07;
      b.rotation.x = Math.sin(t * 0.5 + i) * 0.05;
      b.position.y = data[i].p[1] + Math.sin(t * 0.9 + i * 2.1) * 0.12;
    });
  });
  return (
    <group ref={group}>
      {data.map((b, i) => (
        <group key={i} position={b.p as [number, number, number]} scale={b.s}>
          <mesh scale={[1, 1.16, 1]}>
            <sphereGeometry args={[0.3, 20, 16]} />
            <meshToonMaterial color={b.c} gradientMap={grad} />
          </mesh>
          <mesh position={[0.09, 0.2, 0.2]} scale={[1, 1.5, 0.6]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
          </mesh>
          <mesh position={[0, -0.36, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.05, 0.09, 8]} />
            <meshToonMaterial color={b.c} gradientMap={grad} />
          </mesh>
          <mesh position={[0, -0.92, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 1.05, 4]} />
            <meshBasicMaterial color="#c98aa8" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------- bunting flag strands ---------------- */
function BuntingStrand({ x0, x1, y0, y1, z, sag, count }: {
  x0: number; x1: number; y0: number; y1: number; z: number; sag: number; count: number;
}) {
  const grad = useMemo(() => toonGradient(), []);
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-0.15, 0);
    sh.lineTo(0.15, 0);
    sh.lineTo(0, -0.34);
    sh.closePath();
    return new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false });
  }, []);
  const mesh = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!mesh.current) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const colors = [CANDY.punch, CANDY.butter, "#8fd9ff", "#ffffff", "#b79cff", "#7ee0c3"];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const x = THREE.MathUtils.lerp(x0, x1, t);
      const y = THREE.MathUtils.lerp(y0, y1, t) - Math.sin(Math.PI * t) * sag;
      const t2 = (i + 0.56) / count;
      const x2 = THREE.MathUtils.lerp(x0, x1, t2);
      const y2 = THREE.MathUtils.lerp(y0, y1, t2) - Math.sin(Math.PI * t2) * sag;
      e.set(0, 0, Math.atan2(y2 - y, x2 - x));
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1));
      mesh.current.setMatrixAt(i, m);
      mesh.current.setColorAt(i, new THREE.Color(colors[i % colors.length]));
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [count, x0, x1, y0, y1, z, sag]);

  return (
    <instancedMesh ref={mesh} args={[geo, undefined, count]} frustumCulled={false}>
      <meshToonMaterial gradientMap={grad} color="#ffffff" />
    </instancedMesh>
  );
}

export function Bunting() {
  return (
    <group>
      <BuntingStrand x0={-6} x1={6} y0={3.7} y1={3.5} z={-2.7} sag={0.75} count={15} />
      <BuntingStrand x0={-9} x1={9} y0={5.1} y1={4.9} z={-5.0} sag={1.1} count={20} />
    </group>
  );
}

/* ---------------- floating hearts ---------------- */
export function FloatingHearts() {
  const grad = useMemo(() => toonGradient(), []);
  const geo = useMemo(
    () => new THREE.ExtrudeGeometry(heartShape(0.11), { depth: 0.045, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1, curveSegments: 8 }),
    []
  );
  const mesh = useRef<THREE.InstancedMesh>(null);
  const COUNT = 20;
  const base = useMemo(() => {
    const arr: { p: THREE.Vector3; ph: number; sp: number; sc: number; rot: number }[] = [];
    for (let i = 0; i < COUNT; i++) {
      let x = (Math.random() * 2 - 1) * 4.4;
      const z = -3.2 + Math.random() * 3.4;
      if (Math.abs(x) < 1.4 && z > -1.4) x += x >= 0 ? 1.6 : -1.6;
      arr.push({
        p: new THREE.Vector3(x, 0.9 + Math.random() * 3, z),
        ph: Math.random() * Math.PI * 2,
        sp: 0.5 + Math.random() * 0.7,
        sc: 0.6 + Math.random() * 0.9,
        rot: Math.random() * 0.6 - 0.3,
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!mesh.current) return;
    const colors = [CANDY.punch, CANDY.candy, CANDY.punchDeep, "#ffffff", "#ff9db8"];
    base.forEach((_, i) => mesh.current!.setColorAt(i, new THREE.Color(colors[i % colors.length])));
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [base]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!mesh.current) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    base.forEach((b, i) => {
      e.set(0, b.rot + Math.sin(t * b.sp + b.ph) * 0.35, Math.sin(t * b.sp * 0.7 + b.ph) * 0.25);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(b.p.x, b.p.y + Math.sin(t * b.sp + b.ph) * 0.18, b.p.z),
        q,
        new THREE.Vector3(b.sc, b.sc, b.sc)
      );
      mesh.current!.setMatrixAt(i, m);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geo, undefined, COUNT]} frustumCulled={false}>
      <meshToonMaterial gradientMap={grad} color="#ffffff" />
    </instancedMesh>
  );
}

/* ---------------- twinkling sparkles around the cake ---------------- */
export function Sparkles() {
  const tex = useMemo(() => sparkleTexture(), []);
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 130;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.7 + Math.random() * 1.9;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = 1.2 + Math.random() * 2.4;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (points.current) points.current.rotation.y += dt * 0.05;
    if (mat.current) mat.current.opacity = 0.45 + Math.sin(t * 2.4) * 0.22;
  });
  return (
    <points ref={points} geometry={geo}>
      <pointsMaterial
        ref={mat}
        map={tex}
        size={0.09}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#fff2d9"
        sizeAttenuation
      />
    </points>
  );
}

/* ---------------- continuously falling confetti ---------------- */
export function FallingConfetti() {
  const COUNT = 130;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() * 2 - 1) * 5.5,
        y: Math.random() * 6.5,
        z: -3.5 + Math.random() * 6,
        sp: 0.35 + Math.random() * 0.55,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        sx: 1.5 + Math.random() * 3,
        sy: 1.5 + Math.random() * 3,
        ph: Math.random() * Math.PI * 2,
      })),
    []
  );
  useEffect(() => {
    if (!mesh.current) return;
    data.forEach((_, i) =>
      mesh.current!.setColorAt(i, new THREE.Color(PASTEL[i % PASTEL.length]))
    );
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame((state, dt) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    data.forEach((d, i) => {
      d.y -= d.sp * dt;
      if (d.y < -0.2) d.y = 6.5;
      e.set(d.rx + t * d.sx, d.ry + t * d.sy, 0);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(d.x + Math.sin(t * 0.8 + d.ph) * 0.35, d.y, d.z),
        q,
        new THREE.Vector3(1, 1, 1)
      );
        mesh.current!.setMatrixAt(i, m);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.075, 0.11]} />
      <meshBasicMaterial side={THREE.DoubleSide} color="#ffffff" />
    </instancedMesh>
  );
}

/* ---------------- confetti cannon burst (on events) ---------------- */
const BURST_COUNT = 220;
export function ConfettiBurst() {
  const burst = useParty((s) => s.burst);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const puffTex = useMemo(() => puffTexture(), []);
  const parts = useMemo(
    () =>
      Array.from({ length: BURST_COUNT }, () => ({
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Euler(),
        spin: new THREE.Vector3(),
        life: -1,
        color: new THREE.Color(),
      })),
    []
  );
  const active = useRef(false);

  useEffect(() => {
    if (burst === 0 || !mesh.current) return;
    const colors = [CANDY.punch, CANDY.butter, "#8fd9ff", "#ffffff", "#b79cff", "#7ee0c3", CANDY.punchDeep];
    parts.forEach((p) => {
      p.life = 0;
      p.pos.set((Math.random() - 0.5) * 0.5, FLAME_Y + 0.2, (Math.random() - 0.5) * 0.5);
      const a = Math.random() * Math.PI * 2;
      const up = 1.6 + Math.random() * 3.2;
      const out = 0.6 + Math.random() * 2.6;
      p.vel.set(Math.cos(a) * out, up, Math.sin(a) * out);
      p.rot.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      p.spin.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
      p.color.set(colors[Math.floor(Math.random() * colors.length)]);
      mesh.current!.setColorAt(0, p.color); // ensure instanceColor buffer exists
    });
    for (let i = 0; i < BURST_COUNT; i++) mesh.current.setColorAt(i, parts[i].color);
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    active.current = true;
  }, [burst, parts]);

  useFrame((_, rawDt) => {
    if (!active.current || !mesh.current) return;
    const dt = Math.min(rawDt, 0.05);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let any = false;
    parts.forEach((p, i) => {
      if (p.life < 0) {
        m.compose(p.pos, q.identity(), new THREE.Vector3(0.0001, 0.0001, 0.0001));
        mesh.current!.setMatrixAt(i, m);
        return;
      }
      any = true;
      p.life += dt;
      p.vel.y -= 4.6 * dt;
      p.pos.addScaledVector(p.vel, dt);
      if (p.pos.y < 0.03) { p.pos.y = 0.03; p.vel.y *= -0.25; p.vel.x *= 0.7; p.vel.z *= 0.7; }
      p.rot.x += p.spin.x * dt;
      p.rot.y += p.spin.y * dt;
      const k = Math.max(1 - p.life / 2.4, 0.0001);
      q.setFromEuler(p.rot);
      m.compose(p.pos, q, new THREE.Vector3(k, k, k));
      mesh.current!.setMatrixAt(i, m);
      if (p.life > 2.4) p.life = -1;
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (!any) active.current = false;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, BURST_COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.09, 0.13]} />
      <meshBasicMaterial side={THREE.DoubleSide} color="#ffffff" transparent opacity={0.95} />
    </instancedMesh>
  );
}

/* ---------------- flower decorations around table ---------------- */
function Flower({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const grad = useMemo(() => toonGradient(), []);
  return (
    <group position={position} scale={scale}>
      {/* petals */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 5) * 0.08, 0, Math.sin((i * Math.PI * 2) / 5) * 0.08]} rotation={[Math.PI / 2, 0, (i * Math.PI * 2) / 5]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshToonMaterial color={color} gradientMap={grad} />
        </mesh>
      ))}
      {/* center */}
      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshToonMaterial color={CANDY.butter} gradientMap={grad} />
      </mesh>
    </group>
  );
}

export function FlowerDecorations() {
  const flowers = useMemo(() => [
    { pos: [1.5, 0.05, 1.2] as [number, number, number], color: CANDY.candy, scale: 1.2 },
    { pos: [-1.6, 0.05, 1.0] as [number, number, number], color: CANDY.punch, scale: 1.0 },
    { pos: [1.8, 0.05, -0.5] as [number, number, number], color: "#b79cff", scale: 0.9 },
    { pos: [-1.9, 0.05, -0.3] as [number, number, number], color: CANDY.mint, scale: 1.1 },
    { pos: [0.8, 0.05, 1.8] as [number, number, number], color: CANDY.butter, scale: 0.8 },
    { pos: [-0.9, 0.05, 1.7] as [number, number, number], color: "#ff9d7e", scale: 1.0 },
  ], []);

  return (
    <group>
      {flowers.map((f, i) => (
        <Flower key={i} position={f.pos} color={f.color} scale={f.scale} />
      ))}
    </group>
  );
}

/* ---------------- table settings: plates and utensils ---------------- */
export function TableSettings() {
  const grad = useMemo(() => toonGradient(), []);
  const plates = useMemo(() => [
    { pos: [0.85, TABLE_H + 0.01, 0.7] as [number, number, number], rot: 0.3 },
    { pos: [-0.85, TABLE_H + 0.01, 0.7] as [number, number, number], rot: -0.3 },
    { pos: [0.95, TABLE_H + 0.01, -0.6] as [number, number, number], rot: 0.5 },
    { pos: [-0.95, TABLE_H + 0.01, -0.6] as [number, number, number], rot: -0.5 },
  ], []);

  return (
    <group>
      {plates.map((p, i) => (
        <group key={i} position={p.pos} rotation={[0, p.rot, 0]}>
          {/* plate */}
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
            <meshToonMaterial color="#ffffff" gradientMap={grad} />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.015, 24]} />
            <meshToonMaterial color={CANDY.blush} gradientMap={grad} />
          </mesh>
          {/* fork */}
          <mesh position={[0.28, 0.015, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.015, 0.18, 0.008]} />
            <meshToonMaterial color="#d4d4d4" gradientMap={grad} />
          </mesh>
          {/* knife */}
          <mesh position={[-0.28, 0.015, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.015, 0.2, 0.008]} />
            <meshToonMaterial color="#d4d4d4" gradientMap={grad} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------- small decorative candles ---------------- */
export function SmallCandles() {
  const grad = useMemo(() => toonGradient(), []);
  const candles = useMemo(() => [
    { pos: [1.3, TABLE_H + 0.08, 0.2] as [number, number, number], color: CANDY.candy },
    { pos: [-1.3, TABLE_H + 0.08, 0.2] as [number, number, number], color: CANDY.mint },
    { pos: [0.5, TABLE_H + 0.08, -1.0] as [number, number, number], color: CANDY.butter },
    { pos: [-0.5, TABLE_H + 0.08, -1.0] as [number, number, number], color: "#b79cff" },
  ], []);

  return (
    <group>
      {candles.map((c, i) => (
        <group key={i} position={c.pos}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.16, 12]} />
            <meshToonMaterial color={c.color} gradientMap={grad} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <coneGeometry args={[0.02, 0.06, 8]} />
            <meshBasicMaterial color="#ffb066" />
          </mesh>
          <pointLight position={[0, 0.12, 0]} color="#ffb066" intensity={0.3} distance={1.5} decay={2} />
        </group>
      ))}
    </group>
  );
}

/* ---------------- floating bubbles ---------------- */
export function Bubbles() {
  const COUNT = 25;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() * 2 - 1) * 4,
        y: Math.random() * 5,
        z: (Math.random() * 2 - 1) * 4,
        sp: 0.2 + Math.random() * 0.3,
        size: 0.08 + Math.random() * 0.12,
        ph: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame((state, dt) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const m = new THREE.Matrix4();
    data.forEach((d, i) => {
      d.y += d.sp * dt;
      if (d.y > 6) d.y = -0.5;
      const x = d.x + Math.sin(t * 0.5 + d.ph) * 0.3;
      m.compose(
        new THREE.Vector3(x, d.y, d.z),
        new THREE.Quaternion(),
        new THREE.Vector3(d.size, d.size, d.size)
      );
      mesh.current!.setMatrixAt(i, m);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
    </instancedMesh>
  );
}

/* ---------------- twinkling stars ---------------- */
export function TwinklingStars() {
  const COUNT = 40;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() * 2 - 1) * 6,
        y: 2 + Math.random() * 4,
        z: (Math.random() * 2 - 1) * 6,
        ph: Math.random() * Math.PI * 2,
        sp: 1 + Math.random() * 2,
      })),
    []
  );

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const m = new THREE.Matrix4();
    data.forEach((d, i) => {
      const scale = 0.03 + Math.abs(Math.sin(t * d.sp + d.ph)) * 0.04;
      m.compose(
        new THREE.Vector3(d.x, d.y, d.z),
        new THREE.Quaternion(),
        new THREE.Vector3(scale, scale, scale)
      );
      mesh.current!.setMatrixAt(i, m);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#fff4d6" />
    </instancedMesh>
  );
}
