"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Preload, Sky, Clouds, Cloud } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { scrollState } from "@/lib/store";

/* ═══════════════════════════════════════════════════════════
   FIXED MODEL URL
═══════════════════════════════════════════════════════════ */
const MODEL_URL =
  "https://raw.githubusercontent.com/Abdullah-AlKabbani/Simulating-Boat-Three-JS/main/public/riva_aquarama_lamborghini_board.glb";

const WATER_NORMALS_URL =
  "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg";

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_URL);
}

/* ═══════════════════════════════════════════════════════════
   OCEAN — Gerstner wave ShaderMaterial
   PlaneGeometry lies in XY, rotated -90°X → local Z = world Y
═══════════════════════════════════════════════════════════ */
function OceanWater() {
  const normalMap = useMemo(() => {
    const tex = new THREE.TextureLoader().load(WATER_NORMALS_URL);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime:        { value: 0 },
          uNormalMap:   { value: normalMap },
          uSunDir:      { value: new THREE.Vector3(0.7, 0.3, 0.6).normalize() },
          uSunColor:    { value: new THREE.Color("#ffd580") },         // warm gold sun
          uWaterDeep:   { value: new THREE.Color("#0d4e8a") },         // vivid deep blue
          uWaterShallow:{ value: new THREE.Color("#39a7c4") },         // Mediterranean teal
          uFoamColor:   { value: new THREE.Color("#e8f4f8") },
        },
        vertexShader: /* glsl */`
          uniform float uTime;
          varying vec2  vUv;
          varying vec3  vWorldNormal;
          varying vec3  vViewDir;
          varying float vWaveHeight;

          // Gerstner wave — displacement in local-Z (world-Y after -90°X rotation)
          vec3 gerstner(vec3 p, vec2 d, float A, float Q, float w, float spd) {
            float ph = w * dot(d, p.xy) + spd * uTime;
            float C = cos(ph), S = sin(ph);
            return vec3(Q*A*d.x*C, Q*A*d.y*C, A*S);
          }

          void main() {
            vUv = uv;
            vec3 p = position;

            p += gerstner(p, normalize(vec2( 1.0,  0.25)), 0.22, 0.5, 0.35, 1.1);
            p += gerstner(p, normalize(vec2( 0.35, 1.0 )), 0.15, 0.5, 0.55, 0.9);
            p += gerstner(p, normalize(vec2(-0.5,  0.9 )), 0.09, 0.4, 1.1,  1.35);
            p += gerstner(p, normalize(vec2( 0.8, -0.45)), 0.05, 0.3, 1.9,  1.7);
            p += gerstner(p, normalize(vec2( 0.2,  0.6 )), 0.03, 0.3, 3.0,  2.2); // chop

            vWaveHeight = p.z;

            // FD normals for lighting
            float e = 0.06;
            vec3 px = p + vec3(e,0,0);
            vec3 py = p + vec3(0,e,0);
            vWorldNormal = normalize(vec3(-(px.z-p.z)/e, -(py.z-p.z)/e, 1.0));

            vec4 wp = modelMatrix * vec4(p, 1.0);
            vViewDir = normalize(cameraPosition - wp.xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */`
          uniform float     uTime;
          uniform sampler2D uNormalMap;
          uniform vec3      uSunDir;
          uniform vec3      uSunColor;
          uniform vec3      uWaterDeep;
          uniform vec3      uWaterShallow;
          uniform vec3      uFoamColor;
          varying vec2      vUv;
          varying vec3      vWorldNormal;
          varying vec3      vViewDir;
          varying float     vWaveHeight;

          void main() {
            // Two normal-map layers scrolling in different directions
            vec2 uv1 = vUv * 9.0 + vec2( uTime * 0.038, uTime * 0.022);
            vec2 uv2 = vUv * 4.5 + vec2(-uTime * 0.026, uTime * 0.040);
            vec3 n1  = texture2D(uNormalMap, uv1).rgb * 2.0 - 1.0;
            vec3 n2  = texture2D(uNormalMap, uv2).rgb * 2.0 - 1.0;
            vec3 N   = normalize(vWorldNormal + (n1 + n2) * 0.55);

            // Fresnel
            float VdotN  = clamp(dot(vViewDir, N), 0.0, 1.0);
            float fresnel = pow(1.0 - VdotN, 4.0);

            // Diffuse + tight specular
            float diff = max(dot(N, uSunDir), 0.0);
            float spec = pow(max(dot(reflect(-uSunDir, N), vViewDir), 0.0), 160.0);

            // Depth-based water colour blend
            float t = clamp((vWaveHeight + 0.35) * 1.6, 0.0, 1.0);
            vec3 waterBase = mix(uWaterDeep, uWaterShallow, t);

            // Sky colour reflected at grazing angles
            vec3 skyRefl = vec3(0.45, 0.72, 0.98);

            vec3 col = waterBase
              + diff  * uSunColor * 0.28
              + spec  * uSunColor * 1.8         // strong sun sparkle
              + fresnel * skyRefl * 0.75;        // bright sky at edges

            // White foam caps
            float foam = smoothstep(0.14, 0.24, vWaveHeight);
            col = mix(col, uFoamColor, foam * 0.22);

            // Subtle subsurface scatter — green-cyan tint in the body
            col += vec3(0.0, 0.06, 0.1) * (1.0 - fresnel) * 0.5;

            gl_FragColor = vec4(col, 0.97);
          }
        `,
        transparent: true,
        side: THREE.FrontSide,
      }),
    [normalMap]
  );

  useFrame((s) => { mat.uniforms.uTime.value = s.clock.getElapsedTime(); });

  return (
    <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat}>
      <planeGeometry args={[500, 500, 96, 96]} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   YACHT with organic bobbing
═══════════════════════════════════════════════════════════ */
function OnlineYacht() {
  const bobRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  const clonedScene = useMemo(() => {
    const c = scene.clone();
    c.traverse((ch) => {
      if (!(ch as THREE.Mesh).isMesh) return;
      const m = ch as THREE.Mesh;
      if (!m.material) return;
      const mat = Array.isArray(m.material)
        ? (m.material[0] as THREE.MeshStandardMaterial)
        : (m.material as THREE.MeshStandardMaterial);
      const name = m.name.toLowerCase();
      if (name.includes("hull") || name.includes("body")) {
        mat.color.set("#08152a");
        mat.roughness = 0.04;
        mat.metalness = 0.98;
        mat.envMapIntensity = 3;
      }
    });
    return c;
  }, [scene]);

  useFrame((s) => {
    if (!bobRef.current) return;
    const t = s.clock.getElapsedTime();
    // Multi-frequency irregular bob
    bobRef.current.position.y =
      Math.sin(t * 0.82) * 0.09 +
      Math.sin(t * 1.53) * 0.035 +
      Math.sin(t * 2.31) * 0.012;
    bobRef.current.rotation.x =
      Math.sin(t * 0.64) * 0.018 + Math.sin(t * 1.28) * 0.007;
    bobRef.current.rotation.z =
      Math.sin(t * 0.51) * 0.013 + Math.sin(t * 1.07) * 0.005;
  });

  return (
    <group ref={bobRef} scale={1.5}>
      <primitive object={clonedScene} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   RIG — drives camera + yacht from scrollState.progress
   HorizontalScroll sets progress 0→1 via GSAP onUpdate.
   We read it every frame and lerp to the nearest section.
═══════════════════════════════════════════════════════════ */
interface SectionConfig {
  pos:  [number, number, number];
  rot:  [number, number, number];
  cam:  [number, number, number];
  look: [number, number, number];
}

const NUM_SECTIONS = 5;

const SECTION_CONFIGS: SectionConfig[] = [
  // 0 — Hero: boat slightly left of center, low-angle cinematic establishing shot
  //     Camera far enough to show ~70% of boat with sky + water framing it
  { pos: [-3.5, 0,   0],   rot: [0,  Math.PI / 2.2,  0],   cam: [3,  2.2, 16],   look: [-2.5, 0.3,  0] },
  // 1 — Exterior: camera sweeps to port side, parallel to hull at eye level
  //     Boat centred-right, generous sky above, waterline accent below
  { pos: [ 1,   0,   0],   rot: [0,  Math.PI / 2.8,  0],   cam: [-7, 2.8, 14],   look: [ 1,   0.2, -1] },
  // 2 — Power: dramatic front-quarter bow shot from elevated starboard
  //     Boat centred in upper-third, water stretches to horizon, stat cards below
  { pos: [ 2,   0,  -1],   rot: [0, -Math.PI / 4.5,  0],   cam: [ 8, 4.5, 15],   look: [ 1.5, 0,   -1] },
  // 3 — Interior: gentle 3/4 elevated shot — deck detail + sunset horizon
  //     Camera low enough that horizon is visible, but elevated enough to show deck
  { pos: [-1,   0,   1],   rot: [0,  Math.PI / 1.6,  0],   cam: [ 5, 3.8, 15],   look: [-0.5, 0,    1] },
  // 4 — Contact: wide pull-back establishing shot — full yacht + ocean + sky
  //     Centred, water-level, cinematic breathe room for CTA overlay
  { pos: [ 0,  -0.2,  1],  rot: [-0.02, Math.PI / 8, 0],   cam: [ 0, 2,   20],   look: [ 0,   0,    1] },
];

// Smooth lerp helper that stays below a speed cap
function sl(from: number, to: number, alpha: number) {
  return from + (to - from) * alpha;
}

function Rig() {
  const groupRef  = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Working vectors — reused every frame
  const camTarget  = useRef(new THREE.Vector3(...SECTION_CONFIGS[0]!.cam));
  const lookTarget = useRef(new THREE.Vector3(...SECTION_CONFIGS[0]!.look));
  const posTarget  = useRef(new THREE.Vector3(...SECTION_CONFIGS[0]!.pos));
  const rotTarget  = useRef(new THREE.Euler(...SECTION_CONFIGS[0]!.rot));

  const prevSection = useRef(-1);
  const bankAngle   = useRef(0);
  const bankDecay   = useRef(0);

  // Initialise
  useEffect(() => {
    if (!groupRef.current) return;
    const s = SECTION_CONFIGS[0]!;
    groupRef.current.position.set(...s.pos);
    groupRef.current.rotation.set(...s.rot);
    camera.position.set(...s.cam);
  }, [camera]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // ── Which section are we on? ──────────────────────────────
    const p = scrollState.progress;                          // 0 → 1
    const rawIndex = p * (NUM_SECTIONS - 1);
    const sectionIndex = Math.round(rawIndex);
    const t = rawIndex - Math.floor(rawIndex);              // 0→1 blend within pair
    const loIdx = Math.floor(rawIndex);
    const hiIdx = Math.min(loIdx + 1, NUM_SECTIONS - 1);
    const A = SECTION_CONFIGS[loIdx]!;
    const B = SECTION_CONFIGS[hiIdx]!;

    // ── Banking on section change ─────────────────────────────
    if (sectionIndex !== prevSection.current) {
      const dir = sectionIndex > prevSection.current ? 1 : -1;
      bankAngle.current = -dir * 0.1;   // lean into motion
      bankDecay.current = 1.0;
      prevSection.current = sectionIndex;
    }

    // Decay bank back to neutral
    bankDecay.current = Math.max(0, bankDecay.current - delta * 0.9);
    const liveBank = bankAngle.current * bankDecay.current;

    // ── Interpolated targets ──────────────────────────────────
    posTarget.current.set(
      sl(A.pos[0], B.pos[0], t),
      sl(A.pos[1], B.pos[1], t),
      sl(A.pos[2], B.pos[2], t),
    );
    rotTarget.current.set(
      sl(A.rot[0], B.rot[0], t),
      sl(A.rot[1], B.rot[1], t),
      sl(A.rot[2], B.rot[2], t) + liveBank,
    );
    camTarget.current.set(
      sl(A.cam[0], B.cam[0], t),
      sl(A.cam[1], B.cam[1], t),
      sl(A.cam[2], B.cam[2], t),
    );
    lookTarget.current.set(
      sl(A.look[0], B.look[0], t),
      sl(A.look[1], B.look[1], t),
      sl(A.look[2], B.look[2], t),
    );

    // ── Apply with spring smoothing ───────────────────────────
    const ease = Math.min(delta * 3.5, 1);
    groupRef.current.position.lerp(posTarget.current, ease);
    groupRef.current.rotation.x = sl(groupRef.current.rotation.x, rotTarget.current.x, ease);
    groupRef.current.rotation.y = sl(groupRef.current.rotation.y, rotTarget.current.y, ease);
    groupRef.current.rotation.z = sl(groupRef.current.rotation.z, rotTarget.current.z, ease);
    camera.position.lerp(camTarget.current, ease);
    camera.lookAt(lookTarget.current);
  });

  return (
    <group ref={groupRef}>
      <OnlineYacht />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   BIRDS — Procedural animated seagulls
═══════════════════════════════════════════════════════════ */
interface BirdConfig {
  startX: number;
  startZ: number;
  height: number;
  speed: number;
  flapSpeed: number;
  scale: number;
  direction: number;
}

const BIRD_CONFIGS: BirdConfig[] = [
  { startX: -15, startZ: -18, height: 11,  speed: 1.8, flapSpeed: 4.5, scale: 0.3, direction: 1 },
  { startX: -8,  startZ: -22, height: 13,  speed: 1.5, flapSpeed: 5.2, scale: 0.25, direction: 1 },
  { startX:  12, startZ: -25, height: 15,  speed: 1.2, flapSpeed: 3.8, scale: 0.35, direction: -1 },
  { startX:  5,  startZ: -15, height: 9,   speed: 2.0, flapSpeed: 4.0, scale: 0.2, direction: 1 },
  { startX: -20, startZ: -30, height: 17,  speed: 1.0, flapSpeed: 4.8, scale: 0.28, direction: 1 },
];

function Bird({ config }: { config: BirdConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || !leftWingRef.current || !rightWingRef.current) return;
    const t = state.clock.getElapsedTime();

    // Slow drift across the sky
    const drift = ((t * config.speed * config.direction + config.startX + 60) % 120) - 60;
    groupRef.current.position.set(
      drift,
      config.height + Math.sin(t * 0.5 + config.startX) * 0.8,
      config.startZ + Math.sin(t * 0.3) * 2,
    );

    // Gentle banking
    groupRef.current.rotation.z = Math.sin(t * 0.4 + config.startX) * 0.08;
    groupRef.current.rotation.y = config.direction > 0 ? 0 : Math.PI;

    // Wing flap
    const flap = Math.sin(t * config.flapSpeed) * 0.5;
    leftWingRef.current.rotation.z = flap;
    rightWingRef.current.rotation.z = -flap;
  });

  const bodyGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([
      0, 0, -0.5,    0, 0.05, 0,    0, 0, 0.5,
    ], 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  const wingGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([
      0, 0, 0,    0.8, 0.05, 0.15,    0, 0, 0.4,
    ], 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group ref={groupRef} scale={config.scale}>
      <mesh geometry={bodyGeo}>
        <meshBasicMaterial color="#1a1a1a" side={THREE.DoubleSide} />
      </mesh>
      {/* Left wing */}
      <mesh ref={leftWingRef} geometry={wingGeo} position={[0, 0, 0]}>
        <meshBasicMaterial color="#222" side={THREE.DoubleSide} />
      </mesh>
      {/* Right wing (mirror) */}
      <mesh ref={rightWingRef} geometry={wingGeo} position={[0, 0, 0]} scale={[-1, 1, 1]}>
        <meshBasicMaterial color="#222" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Birds() {
  return (
    <>
      {BIRD_CONFIGS.map((cfg, i) => (
        <Bird key={i} config={cfg} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCENE ROOT
═══════════════════════════════════════════════════════════ */

/* ─── Preloader Fallback ─────────────────────────────────── */
function Preloader() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0e14]">
      {/* Animated ring */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        className="animate-spin"
        style={{ animationDuration: "2.5s" }}
      >
        <circle
          cx="32" cy="32" r="28"
          fill="none"
          stroke="rgba(201,169,110,0.15)"
          strokeWidth="2"
        />
        <circle
          cx="32" cy="32" r="28"
          fill="none"
          stroke="#C9A96E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="50 126"
        />
      </svg>
      <p className="mt-6 text-[10px] tracking-[0.5em] uppercase text-primary/70 font-medium">
        Loading Experience
      </p>
    </div>
  );
}

import { Suspense } from "react";

export default function Scene() {
  return (
    <Suspense fallback={<Preloader />}>
      <Canvas
        camera={{ position: [3, 2.2, 16], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        {/* Atmospheric fog — blends distant ocean into sky */}
        <fog attach="fog" args={["#8aafbf", 30, 180]} />

        {/* Warm golden-hour lighting */}
        <ambientLight intensity={0.5} color="#d4b97a" />
        <directionalLight position={[80, 20, 50]} intensity={2.8} color="#ffe0a0" castShadow />
        <directionalLight position={[-20,  8, -20]} intensity={0.6} color="#7abcdf" />
        <directionalLight position={[  0, -4,   0]} intensity={0.3} color="#5aadcc" />

        {/* Vivid afternoon / golden-hour sky */}
        <Sky
          distance={450000}
          sunPosition={[60, 12, 50]}
          turbidity={7}
          rayleigh={2.0}
          mieCoefficient={0.006}
          mieDirectionalG={0.88}
        />

        {/* Soft volumetric clouds */}
        <Clouds material={THREE.MeshBasicMaterial}>
          <Cloud segments={40} bounds={[35, 5, 5]}  volume={14} color="#ffe4b0" position={[  0, 18, -40]} opacity={0.38} />
          <Cloud segments={28} bounds={[22, 4, 22]} volume={10} color="#ffd89a" position={[-28, 10, -18]} opacity={0.28} />
          <Cloud segments={22} bounds={[22, 5,  6]} volume={11} color="#fff0d8" position={[ 28, 14, -25]} opacity={0.30} />
        </Clouds>

        <Rig />
        <OceanWater />
        <Birds />

        <Preload all />
      </Canvas>
    </Suspense>
  );
}

