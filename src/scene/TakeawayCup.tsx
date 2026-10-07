import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Decal } from '@react-three/drei';
import { TAKEAWAY_CUP } from '../geometry/cupGeometry';
import { useSimulationStore } from '../store/useSimulationStore';

const LOGO_TEXTURE_PATH = '/textures/starbucks-logo.png';

const OptionalCupLogo: React.FC = () => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let mounted = true;
    let loadedTexture: THREE.Texture | null = null;
    new THREE.TextureLoader().load(
      LOGO_TEXTURE_PATH,
      (nextTexture) => {
        loadedTexture = nextTexture;
        nextTexture.colorSpace = THREE.SRGBColorSpace;
        if (mounted) setTexture(nextTexture);
      },
      undefined,
      () => {
        // Branding is optional. A missing asset intentionally leaves the cup plain.
      },
    );
    return () => {
      mounted = false;
      loadedTexture?.dispose();
    };
  }, []);

  if (!texture) return null;
  const image = texture.image as { width?: number; height?: number } | undefined;
  const aspect = image?.width && image?.height ? image.width / image.height : 1;
  const height = 0.038;

  return (
    <Decal
      position={[0, -0.004, TAKEAWAY_CUP.cupOuterRadius - 0.0008]}
      rotation={[0, 0, 0]}
      scale={[height * aspect, height, 0.01]}
      map={texture}
      transparent
      depthTest
      polygonOffset
      polygonOffsetFactor={-4}
    />
  );
};

export const TakeawayCup: React.FC = () => {
  const streamProgress = useSimulationStore((state) => state.streamProgress);
  const isTeachingCup = useSimulationStore((state) => state.isTeachingCup);
  const isPresentationMode = useSimulationStore((state) => state.isPresentationMode);
  const guidedStep = useSimulationStore((state) => state.guidedStep);
  const highlightHole = isPresentationMode && guidedStep === 6;

  const centerRecessRadius = TAKEAWAY_CUP.lidRadius * 0.32;
  const lidShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, TAKEAWAY_CUP.lidRadius - 0.0014, 0, Math.PI * 2, false);

    const centerRecess = new THREE.Path();
    centerRecess.absarc(0, 0, centerRecessRadius, 0, Math.PI * 2, true);
    shape.holes.push(centerRecess);

    const drinkingHole = new THREE.Path();
    drinkingHole.absarc(
      TAKEAWAY_CUP.drinkingHoleCenter.x,
      TAKEAWAY_CUP.drinkingHoleCenter.z,
      TAKEAWAY_CUP.drinkingHoleRadius,
      0,
      Math.PI * 2,
      true,
    );
    shape.holes.push(drinkingHole);
    return shape;
  }, [centerRecessRadius]);

  // Rendering-only fill approximation. Physics continues to use cupGeometry.ts.
  const fillProgress = THREE.MathUtils.clamp(streamProgress, 0, 1);
  const fillHeight = 0.006 + fillProgress * (TAKEAWAY_CUP.coffeeSurfaceY - 0.006);
  const innerRadiusAtFill = THREE.MathUtils.lerp(
    TAKEAWAY_CUP.bottomOuterRadius,
    TAKEAWAY_CUP.cupOuterRadius,
    fillHeight / TAKEAWAY_CUP.height,
  ) - TAKEAWAY_CUP.wallThickness;
  const coffeeTopRadius = Math.min(TAKEAWAY_CUP.coffeeSurfaceRadius, innerRadiusAtFill - 0.001);
  const coffeeBottomRadius = TAKEAWAY_CUP.bottomOuterRadius - TAKEAWAY_CUP.wallThickness - 0.001;
  const lidBaseY = TAKEAWAY_CUP.height;
  const lidShoulderY = lidBaseY + TAKEAWAY_CUP.lidRimHeight;
  const lidTopY = TAKEAWAY_CUP.lidPlaneY;

  return (
    <group position={[0, 0, 0]}>
      {/* Paper shell: all dimensions remain tied to the protected cup constants. */}
      <mesh position={[0, TAKEAWAY_CUP.height / 2, 0]} castShadow receiveShadow renderOrder={2}>
        <cylinderGeometry args={[TAKEAWAY_CUP.cupOuterRadius, TAKEAWAY_CUP.bottomOuterRadius, TAKEAWAY_CUP.height, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#f4f1e9"
          roughness={0.68}
          metalness={0}
          clearcoat={0.04}
          clearcoatRoughness={0.8}
          transparent={isTeachingCup}
          opacity={isTeachingCup ? 0.7 : 1}
          depthWrite={!isTeachingCup}
          side={THREE.FrontSide}
        />
        <OptionalCupLogo />
      </mesh>

      {isTeachingCup && (
        <mesh position={[0, TAKEAWAY_CUP.height / 2, 0]} renderOrder={1}>
          <cylinderGeometry args={[TAKEAWAY_CUP.cupOuterRadius - 0.001, TAKEAWAY_CUP.bottomOuterRadius - 0.001, TAKEAWAY_CUP.height - 0.002, 48, 1, true]} />
          <meshStandardMaterial color="#d6d0c5" roughness={0.78} transparent opacity={0.16} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      )}

      {/* Restrained bottom seam and foot give the paper shell a manufactured finish. */}
      <mesh position={[0, 0.0012, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <circleGeometry args={[TAKEAWAY_CUP.bottomOuterRadius, 48]} />
        <meshStandardMaterial color="#ded9cf" roughness={0.76} transparent={isTeachingCup} opacity={isTeachingCup ? 0.82 : 1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.003, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow renderOrder={4}>
        <torusGeometry args={[TAKEAWAY_CUP.bottomOuterRadius - 0.0015, 0.00115, 8, 48]} />
        <meshStandardMaterial color="#d7d2c8" roughness={0.72} />
      </mesh>

      {/* A faint interior tint supports the fill approximation without reading as a solid plug. */}
      <mesh position={[0, fillHeight / 2, 0]} renderOrder={4}>
        <cylinderGeometry args={[coffeeTopRadius, coffeeBottomRadius, fillHeight, 48]} />
        <meshPhysicalMaterial
          color="#35160c"
          roughness={0.34}
          metalness={0}
          transparent
          opacity={isTeachingCup ? 0.34 : 0.72}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, fillHeight + 0.0001, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
        <circleGeometry args={[coffeeTopRadius, 48]} />
        <meshPhysicalMaterial
          color="#32140b"
          roughness={0.2}
          metalness={0}
          clearcoat={0.32}
          clearcoatRoughness={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rolled paper lip, seated directly at the protected cup-top reference. */}
      <mesh position={[0, lidBaseY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow renderOrder={5}>
        <torusGeometry args={[TAKEAWAY_CUP.cupOuterRadius - 0.0002, 0.00135, 10, 64]} />
        <meshStandardMaterial color="#e2ddd3" roughness={0.6} />
      </mesh>

      {/* One clean locking skirt sits over the rolled paper lip. */}
      <mesh position={[0, lidBaseY + TAKEAWAY_CUP.lidRimHeight / 2, 0]} castShadow receiveShadow renderOrder={5}>
        <cylinderGeometry args={[TAKEAWAY_CUP.lidRadius - 0.0004, TAKEAWAY_CUP.lidRadius, TAKEAWAY_CUP.lidRimHeight, 48, 1, true]} />
        <meshStandardMaterial color="#e1e2df" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* A restrained sloped shoulder lifts the molded upper lid without forming a dome. */}
      <mesh position={[0, lidShoulderY + TAKEAWAY_CUP.lidDeckHeight / 2, 0]} castShadow receiveShadow renderOrder={5}>
        <cylinderGeometry args={[TAKEAWAY_CUP.cupInnerRadius, TAKEAWAY_CUP.lidRadius - 0.0006, TAKEAWAY_CUP.lidDeckHeight, 48, 1, true]} />
        <meshStandardMaterial color="#e7e7e3" roughness={0.44} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, lidTopY - 0.0004, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow renderOrder={6}>
        <torusGeometry args={[TAKEAWAY_CUP.lidRadius - 0.0022, 0.0009, 8, 64]} />
        <meshStandardMaterial color="#ecece8" roughness={0.42} />
      </mesh>

      {/* Upper deck retains an exact visual opening at the protected hole reference. */}
      <mesh position={[0, lidTopY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow renderOrder={6}>
        <shapeGeometry args={[lidShape, 48]} />
        <meshStandardMaterial color="#eeeeea" roughness={0.43} side={THREE.DoubleSide} />
      </mesh>

      {/* Shallow central depression adds molded depth without changing collision geometry. */}
      <mesh position={[0, lidTopY - 0.0011, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow renderOrder={5}>
        <circleGeometry args={[centerRecessRadius, 40]} />
        <meshStandardMaterial color="#dfe1df" roughness={0.52} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, lidTopY - 0.00055, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={6}>
        <torusGeometry args={[centerRecessRadius, 0.0005, 8, 48]} />
        <meshStandardMaterial color="#d6d8d6" roughness={0.5} />
      </mesh>

      {/* Recessed sipping well: visual depth only, centered on the protected circle. */}
      <mesh position={[TAKEAWAY_CUP.drinkingHoleCenter.x, lidTopY - 0.0015, TAKEAWAY_CUP.drinkingHoleCenter.z]} renderOrder={6}>
        <cylinderGeometry args={[TAKEAWAY_CUP.drinkingHoleRadius, TAKEAWAY_CUP.drinkingHoleRadius, 0.003, 32, 1, true]} />
        <meshStandardMaterial color="#3b3029" roughness={0.72} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[TAKEAWAY_CUP.drinkingHoleCenter.x, lidTopY - 0.0031, TAKEAWAY_CUP.drinkingHoleCenter.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
        <circleGeometry args={[TAKEAWAY_CUP.drinkingHoleRadius, 32]} />
        <meshBasicMaterial color="#17120f" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[TAKEAWAY_CUP.drinkingHoleCenter.x, lidTopY + 0.00015, TAKEAWAY_CUP.drinkingHoleCenter.z]} rotation={[Math.PI / 2, 0, 0]} renderOrder={7}>
        <torusGeometry args={[TAKEAWAY_CUP.drinkingHoleRadius + 0.00045, 0.0007, 8, 40]} />
        <meshStandardMaterial
          color={highlightHole ? '#facc15' : '#d2d4d1'}
          emissive={highlightHole ? '#ca8a04' : '#000000'}
          emissiveIntensity={highlightHole ? 0.5 : 0}
          roughness={0.48}
        />
      </mesh>

      {highlightHole && (
        <pointLight position={[TAKEAWAY_CUP.drinkingHoleCenter.x, lidTopY + 0.014, TAKEAWAY_CUP.drinkingHoleCenter.z]} color="#facc15" intensity={1.2} distance={0.09} />
      )}
    </group>
  );
};

export default TakeawayCup;
