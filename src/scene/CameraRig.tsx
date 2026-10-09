import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useParty, Phase } from "../store";

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
  overview: { tgt: [0, 1.45, 0.15], rv: 2.75, rh: 3.7, fov: 42, dir: [0.6, 0.42, 1], topPx: 0, bottomPx: 0, parallax: 1 },
  approach: { tgt: [-0.15, 1.66, 0.3], rv: 1.72, rh: 2.15, fov: 40, dir: [-0.36, 0.3, 1], topPx: 40, bottomPx: 128, parallax: 0.3 },
  // one-press blow: the camera zooms in while the girl inhales, then she blows
  blowing: { tgt: [-0.05, 2.4, 0.05], rv: 1.02, rh: 1.58, fov: 33, dir: [-0.3, 0.16, 1], topPx: 46, bottomPx: 130, parallax: 0.15 },
  blown: { tgt: [-0.3, 1.86, 0.5], rv: 1.85, rh: 1.95, fov: 38, dir: [-0.22, 0.26, 1], topPx: 34, bottomPx: 140, parallax: 0.22 },
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
 * Scrolling the page gently dollies the overview camera back.
 */
export function CameraRig() {
  const phase = useParty((s) => s.phase);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const pointer = useThree((s) => s.pointer);

  const cur = useRef({
    pos: new THREE.Vector3(4.2, 3.4, 7),
    tgt: new THREE.Vector3(0, 1.45, 0.15),
    fov: 42,
  });
  const tmpPos = useRef(new THREE.Vector3());
  const tmpTgt = useRef(new THREE.Vector3());

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

    const dist =
      Math.max(pose.rv / Math.tan(vRad / 2), rhEff / Math.tan(hRad / 2)) *
      1.14 *
      (1 + sp * 0.3);

    tmpTgt.current.set(pose.tgt[0], pose.tgt[1] + sp * 0.55, pose.tgt[2]);
    // keep content clear of the HUD dock / top stickers
    const shiftPx = pose.bottomPx - pose.topPx;
    tmpTgt.current.y += (shiftPx / Math.max(size.height, 1)) * dist * Math.tan(vRad / 2) * 0.9;

    const dir = tmpPos.current
      .set(pose.dir[0], pose.dir[1], pose.dir[2])
      .normalize();
    const pos = tmpPos.current.multiplyScalar(dist).add(tmpTgt.current);

    // living camera: idle breathing + pointer parallax
    const px = pose.parallax;
    pos.x += pointer.x * 0.38 * px + Math.sin(t * 0.4) * 0.07 * px;
    pos.y += pointer.y * 0.16 * px + Math.sin(t * 0.55 + 1) * 0.04 * px;

    const c = cur.current;
    c.pos.x = THREE.MathUtils.damp(c.pos.x, pos.x, 2.3, dt);
    c.pos.y = THREE.MathUtils.damp(c.pos.y, pos.y, 2.3, dt);
    c.pos.z = THREE.MathUtils.damp(c.pos.z, pos.z, 2.3, dt);
    c.tgt.x = THREE.MathUtils.damp(c.tgt.x, tmpTgt.current.x, 2.7, dt);
    c.tgt.y = THREE.MathUtils.damp(c.tgt.y, tmpTgt.current.y, 2.7, dt);
    c.tgt.z = THREE.MathUtils.damp(c.tgt.z, tmpTgt.current.z, 2.7, dt);
    c.fov = THREE.MathUtils.damp(c.fov, pose.fov, 3, dt);

    camera.position.copy(c.pos);
    camera.fov = c.fov;
    camera.updateProjectionMatrix();
    camera.lookAt(c.tgt);
  });

  return null;
}
