"use client";
/* Three.js render objects are intentionally mutable inside the render loop. */
/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Sky, useGLTF, useTexture } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { scrollState } from "@/lib/store";

const SUN = new THREE.Vector3(-30, 18, -55).normalize();

function Ocean() {
  const normals = useTexture("/assets/water-normals.jpg");
  const water = useMemo(() => {
    const waterNormals = normals.clone();
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    const surface = new Water(new THREE.PlaneGeometry(1800, 1800), {
      textureWidth: 512, textureHeight: 512, waterNormals,
      sunDirection: SUN, sunColor: 0xffe6c4, waterColor: 0x073f47,
      distortionScale: 2.2, fog: true,
    });
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = -0.48;
    surface.material.uniforms.size.value = 5;
    return surface;
  }, [normals]);
  useEffect(() => () => {
    water.geometry.dispose();
    (water.material.uniforms.normalSampler.value as THREE.Texture).dispose();
    water.material.dispose();
    // Water owns a reflection target, which is otherwise private to its closure.
    const reflection = water.material.uniforms.mirrorSampler.value as THREE.Texture | null;
    reflection?.dispose();
  }, [water]);
  useFrame((_, delta) => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      water.material.uniforms.time.value += Math.min(delta, 0.05) * 0.35;
  });
  return <primitive object={water} />;
}

function Yacht() {
  const { scene } = useGLTF("/assets/aquarama.glb");
  const boat = useMemo(() => {
    const copy = scene.clone(true);
    const box = new THREE.Box3().setFromObject(copy);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    copy.position.sub(center);
    const normalized = new THREE.Group();
    normalized.add(copy);
    normalized.scale.setScalar(10 / Math.max(size.x, size.z));
    // Keep the authored wood, upholstery and chrome instead of repainting meshes.
    return normalized;
  }, [scene]);
  return <primitive object={boat} />;
}

// Each chapter has a composed shot. The vessel stays anchored; only the camera travels.
const SHOTS: { camera: [number, number, number]; target: [number, number, number] }[] = [
  { camera: [11, 5.4, 13], target: [-3.2, 0, 0] },
  { camera: [-9, 3.4, 11], target: [3.2, 0, 0] },
  { camera: [8, 2.5, 10], target: [-3.2, 0, 0] },
  { camera: [-3, 14, 7], target: [4, 0, 0] },
  { camera: [14, 5.5, 20], target: [0, 0.8, 0] },
];

function Cinematography() {
  const vessel = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const look = useRef(new THREE.Vector3(...SHOTS[0].target));
  const desiredCamera = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);
  const reduced = useRef(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reduced.current = query.matches; };
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useFrame(({ camera, clock, size }, delta) => {
    const ease = reduced.current ? 1 : 1 - Math.exp(-delta * 5);
    progress.current = THREE.MathUtils.lerp(progress.current, scrollState.progress, ease);
    const chapter = THREE.MathUtils.clamp(progress.current, 0, 1) * 4;
    const index = Math.min(3, Math.floor(chapter));
    const blend = THREE.MathUtils.smoothstep(chapter - index, 0, 1);
    const a = SHOTS[index], b = SHOTS[index + 1];
    desiredCamera.set(...a.camera).lerp(new THREE.Vector3(...b.camera), blend);
    desiredLook.set(...a.target).lerp(new THREE.Vector3(...b.target), blend);
    if (size.width < 768) {
      desiredCamera.multiplyScalar(1.4);
      desiredLook.set(0, -1.3, desiredLook.z);
    }
    camera.position.copy(desiredCamera);
    look.current.lerp(desiredLook, ease);
    camera.lookAt(look.current);
    if (vessel.current) {
      const time = reduced.current ? 0 : clock.elapsedTime;
      vessel.current.position.y = Math.sin(time * 0.65) * 0.025;
      vessel.current.rotation.z = Math.sin(time * 0.48) * 0.006;
      vessel.current.rotation.x = Math.sin(time * 0.57) * 0.004;
    }
  });
  return <group ref={vessel} rotation={[0, Math.PI / 2, 0]}><Yacht /></group>;
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function Scene() {
  return (
    <div className="ocean-scene" aria-hidden="true">
      <div className="scene-poster" />
      <SceneBoundary>
        <Canvas camera={{ position: [11, 5.4, 13], fov: 36, near: 0.1, far: 2200 }}
          dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }}>
          <fog attach="fog" args={["#a7bec0", 80, 700]} />
          <hemisphereLight args={["#dcebf3", "#324c50", 0.8]} />
          <directionalLight position={[-30, 18, -55]} intensity={2} color="#ffe6c4" />
          <Sky distance={2000} sunPosition={[-30, 18, -55]} turbidity={2.5} rayleigh={1.5} mieCoefficient={0.003} mieDirectionalG={0.8} />
          <Suspense fallback={null}>
            <Environment resolution={128} frames={1}>
              <Sky sunPosition={[-30, 18, -55]} turbidity={2.5} rayleigh={1.5} />
            </Environment>
            <Cinematography />
            <Ocean />
          </Suspense>
        </Canvas>
      </SceneBoundary>
      <div className="scene-grade" />
    </div>
  );
}
