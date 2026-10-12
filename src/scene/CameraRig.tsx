import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useParty, Phase } from "../store";
import { useQuality } from "./quality";
import { clamp01, easeOutCubic, sinceEntered } from "./anim";
import { DEBUG } from "../dom";

interface Pose {
  tgt: [number, number, number];
  rv: number;   // required vertical half-extent
  rh: number;   // required horizontal half-extent
  fov: number;
  dir: [number, number, number];
  topPx: number;
  bottomPx: number;
  parallax: number;
}

const POSES: Record<string, Pose> = {
  overview: { tgt: [0, 2.15, 0.1], rv: 3.0, rh: 4.1, fov: 42, dir: [0.55, 0.3, 1], topPx: 0, bottomPx: 0, parallax: 1 },
  approach: { tgt: [-0.6, 1.75, 0.4], rv: 1.9, rh: 2.4, fov: 40, dir: [-0.2, 0.28, 1], topPx: 40, bottomPx: 128, parallax: 0.3 },
  // one-press blow: the camera zooms in while the girl inhales, then she blows
  blowing: { tgt: [-0.85, 2.15, 0.3], rv: 1.45, rh: 2.1, fov: 34, dir: [-0.18, 0.2, 1], topPx: 46, bottomPx: 130, parallax: 0.15 },
  blown: { tgt: [-0.85, 1.8, 0.5], rv: 2.0, rh: 2.45, fov: 38, dir: [-0.15, 0.24, 1], topPx: 34, bottomPx: 140, parallax: 0.22 },
};

function poseFor(phase: Phase): Pose {
  switch (phase) {
    case "approach":
    case "relight":
      return POSES.approach;
    case "blowing":
      return POSES.blowing;
    case "blown":
      return POSES.blown;
    default:
      return POSES.overview;
  }
}

/* shared with the DOM scroll container (updated without re-render) */
export const scrollState = { y: 0 };

/**
 * Frames the subject so the cake is never cropped — on any aspect ratio.
 * Distance is solved from the required vertical AND horizontal extents;
 * on narrow (portrait) screens we relax the horizontal demand so the cake
 * stays fully visible, and shift the target up to clear the bottom dock.
 *
 * Extras: an opening fly-in when the party starts, a slight push-in while the pointer
 * is over the cake, and (unless the visitor prefers reduced motion) idle breathing + parallax.
 */
export function CameraRig() {
  const phase = useParty((s) => s.phase);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const pointer = useThree((s) => s.pointer);
  const reduce = useQuality((s) => s.reduceMotion);

  const cur = useRef({
    pos: new THREE.Vector3(-3.2, 5.6, 11),
    tgt: new THREE.Vector3(0, 1.85, 0.1),
    fov: 44,
    hover: 0,
    placed: false,
    cut: false,
  });
  const tmpPos = useRef(new THREE.Vector3());
  const tmpTgt = useRef(new THREE.Vector3());
  const tmpDir = useRef(new THREE.Vector3());

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const pose = poseFor(phase);
    const aspect = size.width / Math.max(size.height, 1);

    const vRad = (pose.fov * Math.PI) / 180;
    const hRad = 2 * Math.atan(Math.tan(vRad / 2) * aspect);
    // portrait screens: relax horizontal demand, never the vertical one
    const rhEff = pose.rh * THREE.MathUtils.clamp(aspect, 0.6, 1.5);

    // page scroll pulls the overview camera back so the scene "settles"
    const sp = phase === "party" ? THREE.MathUtils.clamp(scrollState.y, 0, 1.2) : 0;

    // the opening fly-in: starts wide, high and from the left, then glides to the resting view
    const e = sinceEntered();
    const intro = e < 0 ? 1 : 1 - easeOutCubic(clamp01(e / 3.4));

    const c = cur.current;
    c.hover = THREE.MathUtils.damp(c.hover, useParty.getState().cakeHover ? 1 : 0, 6, dt);

    const dist =
      Math.max(pose.rv / Math.tan(vRad / 2), rhEff / Math.tan(hRad / 2)) *
      1.14 *
      (1 + sp * 0.3) *
      (1 + intro * 0.5) *
      (1 - c.hover * 0.035);

    tmpTgt.current.set(pose.tgt[0], pose.tgt[1] + sp * 0.55 + intro * 0.5, pose.tgt[2]);
    // keep content clear of the HUD dock / top stickers
    const shiftPx = pose.bottomPx - pose.topPx;
    tmpTgt.current.y += (shiftPx / Math.max(size.height, 1)) * dist * Math.tan(vRad / 2) * 0.9;

    const dir = tmpDir.current.set(
      THREE.MathUtils.lerp(pose.dir[0], -0.75, intro),
      THREE.MathUtils.lerp(pose.dir[1], 0.55, intro),
      pose.dir[2]
    ).normalize();
    const pos = tmpPos.current.copy(dir).multiplyScalar(dist).add(tmpTgt.current);

    // living camera: idle breathing + pointer parallax
    const px = reduce ? 0 : pose.parallax;
    pos.x += pointer.x * 0.38 * px + Math.sin(t * 0.4) * 0.07 * px;
    pos.y += pointer.y * 0.16 * px + Math.sin(t * 0.55 + 1) * 0.04 * px;

    if (!c.placed) {
      // first frame: begin exactly on the fly-in start so there is no jump
      c.pos.copy(pos);
      c.tgt.copy(tmpTgt.current);
      c.fov = pose.fov;
      c.placed = true;
    }

    // reduced motion: no fly-in — cut straight to the resting view once the party opens
    if (reduce && !c.cut && phase !== "loading" && phase !== "intro") {
      c.pos.copy(pos);
      c.tgt.copy(tmpTgt.current);
      c.fov = pose.fov;
      c.cut = true;
    }

    // test hook (?debug): jump straight to the resting view — software GL runs the damping at a crawl
    if (DEBUG && (window as unknown as { __camSnap?: boolean }).__camSnap) {
      c.pos.copy(pos);
      c.tgt.copy(tmpTgt.current);
      c.fov = pose.fov;
    }

    const k = intro > 0.02 ? 1.6 : 1; // slower damping during the fly-in = longer glide
    const f = reduce ? 3 : 1; // reduced motion: short settles between poses instead of long glides
    c.pos.x = THREE.MathUtils.damp(c.pos.x, pos.x, (2.3 * f) / k, dt);
    c.pos.y = THREE.MathUtils.damp(c.pos.y, pos.y, (2.3 * f) / k, dt);
    c.pos.z = THREE.MathUtils.damp(c.pos.z, pos.z, (2.3 * f) / k, dt);
    c.tgt.x = THREE.MathUtils.damp(c.tgt.x, tmpTgt.current.x, 2.7 * f, dt);
    c.tgt.y = THREE.MathUtils.damp(c.tgt.y, tmpTgt.current.y, 2.7 * f, dt);
    c.tgt.z = THREE.MathUtils.damp(c.tgt.z, tmpTgt.current.z, 2.7 * f, dt);
    c.fov = THREE.MathUtils.damp(c.fov, pose.fov, 3 * f, dt);

    camera.position.copy(c.pos);
    camera.fov = c.fov;
    camera.updateProjectionMatrix();
    camera.lookAt(c.tgt);
  });

  return null;
}
