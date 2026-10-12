import { useParty } from "../store";
import { scrollState } from "./CameraRig";

/** True when a press on the cake should do something right now. */
export function cakeIsClickable(): boolean {
  const s = useParty.getState();
  if (s.phase === "party") return scrollState.y < 0.3; // only while the 3D hero is on screen
  if (s.phase === "approach") return s.charReady;
  return s.phase === "blown";
}

/** True when balloons may be popped (free browsing of the hero only). */
export function balloonsPoppable(): boolean {
  const s = useParty.getState();
  return s.phase === "party" && scrollState.y < 0.3;
}

/**
 * Written by the character while she blows, read by the candle flames
 * so they lean away from her breath. (dx, dz) points from her to the cake.
 */
export const breath = { active: false, dx: 0, dz: -1 };
