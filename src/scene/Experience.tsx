import type { PartyConfig } from "../config";
import { CameraRig } from "./CameraRig";
import { Cake } from "./Cake";
import { Character } from "./Character";
import {
  Room, Table, Gifts, Balloons, Bunting, FloatingHearts,
  Sparkles, FallingConfetti, ConfettiBurst, Rug,
} from "./Decor";

export function Experience({ config }: { config: PartyConfig }) {
  return (
    <>
      <color attach="background" args={["#ffc9de"]} />
      <fog attach="fog" args={["#ffc9de", 9.5, 22]} />

      <hemisphereLight args={["#ffe9f3", "#e79fbe", 0.95]} />
      <ambientLight intensity={0.4} color="#ffd9e8" />
      <directionalLight position={[4.5, 6.5, 3.5]} intensity={1.0} color="#fff2f6" />
      <directionalLight position={[-5, 3.5, -2]} intensity={0.35} color="#ffc2dc" />

      <CameraRig />

      <Room />
      <Rug />
      <Table />
      <Cake candleCount={config.cake.candles} age={config.recipient.age} />
      <Character bannerText={config.banner.text} bannerSub={config.banner.sub} />

      <Gifts />
      <Balloons />
      <Bunting />
      <FloatingHearts />
      <Sparkles />
      <FallingConfetti />
      <ConfettiBurst />
    </>
  );
}
