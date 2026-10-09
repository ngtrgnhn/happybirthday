import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { PartyConfig } from "../config";
import { useParty } from "../store";
import { CameraRig } from "./CameraRig";
import { Cake } from "./Cake";
import { Character } from "./Character";
import {
  Room, Table, Gifts, Balloons, Bunting, FloatingHearts,
  Sparkles, FallingConfetti, ConfettiBurst, Rug,
  FlowerDecorations, TableSettings, SmallCandles, Bubbles, TwinklingStars,
  HangingLights,
} from "./Decor";

function CakeHitArea() {
  const gl = useThree((s) => s.gl);
  const phase = useParty((s) => s.phase);
  const charReady = useParty((s) => s.charReady);
  const startApproach = useParty((s) => s.startApproach);
  const requestBlow = useParty((s) => s.requestBlow);
  const requestRelight = useParty((s) => s.requestRelight);
  const cursorRef = useRef(false);

  const handleClick = () => {
    if (phase === "party") {
      startApproach();
    } else if (phase === "approach" && charReady) {
      requestBlow();
    } else if (phase === "blown") {
      requestRelight();
    }
  };

  const handlePointerOver = () => {
    const clickable = phase === "party" || (phase === "approach" && charReady) || phase === "blown";
    if (clickable && !cursorRef.current) {
      gl.domElement.style.cursor = "pointer";
      cursorRef.current = true;
    }
  };

  const handlePointerOut = () => {
    if (cursorRef.current) {
      gl.domElement.style.cursor = "";
      cursorRef.current = false;
    }
  };

  return (
    <mesh
      position={[0, 1.5, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <cylinderGeometry args={[1.2, 1.2, 2.5, 16]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

export function Experience({ config }: { config: PartyConfig }) {
  return (
    <>
      <color attach="background" args={["#ffc9de"]} />
      <fog attach="fog" args={["#ffc9de", 9.5, 22]} />

      {/* Enhanced lighting setup */}
      <hemisphereLight args={["#ffe9f3", "#e79fbe", 1.1]} />
      <ambientLight intensity={0.5} color="#ffd9e8" />
      <directionalLight position={[4.5, 6.5, 3.5]} intensity={1.2} color="#fff2f6" castShadow={false} />
      <directionalLight position={[-5, 3.5, -2]} intensity={0.4} color="#ffc2dc" />
      <directionalLight position={[0, 8, 0]} intensity={0.3} color="#ffffff" />
      <pointLight position={[0, 3, 2]} intensity={0.6} color="#ff9ec6" distance={8} decay={2} />
      <pointLight position={[-3, 2, -1]} intensity={0.4} color="#ffd166" distance={6} decay={2} />

      <CameraRig />

      <Room />
      <Rug />
      <Table />
      <TableSettings />
      <SmallCandles />
      <FlowerDecorations />
      <Cake candleCount={config.cake.candles} age={config.recipient.age} />
      <CakeHitArea />
      <Character bannerText={config.banner.text} bannerSub={config.banner.sub} />

      <Gifts />
      <Balloons />
      <Bunting />
      <FloatingHearts />
      <Sparkles />
      <FallingConfetti />
      <ConfettiBurst />
      <Bubbles />
      <TwinklingStars />
      <HangingLights />
    </>
  );
}
