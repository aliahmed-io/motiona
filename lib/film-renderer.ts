import * as THREE from "three";

// One full-screen compositor keeps both shots on the same camera plane.
// The feathered reveal avoids showing two complete boats on top of one another.
const fragmentShader = /* glsl */ `
  uniform sampler2D outgoing;
  uniform sampler2D incoming;
  uniform vec2 viewport;
  uniform vec2 outgoingSize;
  uniform vec2 incomingSize;
  uniform vec2 outgoingFocus;
  uniform vec2 incomingFocus;
  uniform float transition;
  uniform float outgoingTravel;
  uniform float incomingTravel;
  varying vec2 vUv;

  vec2 cover(vec2 uv, vec2 imageSize, vec2 focus, float travel) {
    float screenAspect = viewport.x / viewport.y;
    float imageAspect = imageSize.x / imageSize.y;
    vec2 ratio = vec2(min(screenAspect / imageAspect, 1.0), min(imageAspect / screenAspect, 1.0));
    // Both cameras drift in the direction of the horizontal journey.
    uv = (uv - 0.5) / (1.035 + travel * 0.035) + 0.5;
    uv.x += (travel - 0.5) * 0.018;
    return uv * ratio + (1.0 - ratio) * focus;
  }

  vec4 exposure(sampler2D shot, vec2 uv, float blur) {
    vec2 offset = vec2(blur, blur * 0.18);
    return texture2D(shot, uv) * 0.4
      + texture2D(shot, uv + offset) * 0.24
      + texture2D(shot, uv - offset) * 0.24
      + texture2D(shot, uv + offset * 2.0) * 0.06
      + texture2D(shot, uv - offset * 2.0) * 0.06;
  }

  void main() {
    float p = transition;
    float envelope = sin(p * 3.14159265);
    // Broad, irregular feather: no hard wipe edge, flash, or dip to black.
    float current = sin(vUv.y * 7.0 + p * 1.8) * 0.025
      + sin(vUv.y * 17.0 - p * 2.0) * 0.008;
    float front = mix(1.24, -0.24, p);
    float reveal = smoothstep(front - 0.18, front + 0.18, vUv.x + current * envelope);
    float seam = reveal * (1.0 - reveal) * 4.0 * envelope;
    vec2 refraction = vec2(sin(vUv.y * 8.0 + p) * 0.009, sin(vUv.x * 7.0 - p) * 0.003) * seam;
    vec2 a = cover(vUv + refraction, outgoingSize, outgoingFocus, outgoingTravel);
    vec2 b = cover(vUv - refraction, incomingSize, incomingFocus, incomingTravel);
    vec4 first = exposure(outgoing, a, seam * 0.003);
    vec4 second = exposure(incoming, b, seam * 0.003);
    gl_FragColor = mix(first, second, reveal);
    #include <colorspace_fragment>
  }
`;

export async function createFilmRenderer(root: HTMLElement, sources: string[]) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.className = "film-compositor";
  const loader = new THREE.TextureLoader();
  const textures: THREE.Texture[] = [];
  const results = await Promise.allSettled(sources.map(async source => {
    const texture = await loader.loadAsync(source);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    textures.push(texture);
    return texture;
  }));
  if (results.some(result => result.status === "rejected")) {
    textures.forEach(texture => texture.dispose());
    renderer.dispose();
    throw new Error("Film assets unavailable");
  }
  const shots = results.map(result => (result as PromiseFulfilledResult<THREE.Texture>).value);
  const imageSize = (texture: THREE.Texture) => {
    const image = texture.image as HTMLImageElement;
    return new THREE.Vector2(image.width, image.height);
  };
  const sizes = shots.map(imageSize);
  const material = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      outgoing: { value: shots[0] }, incoming: { value: shots[1] },
      viewport: { value: new THREE.Vector2() },
      outgoingSize: { value: imageSize(shots[0]) }, incomingSize: { value: imageSize(shots[1]) },
      outgoingFocus: { value: new THREE.Vector2(0.5, 0.5) }, incomingFocus: { value: new THREE.Vector2(0.5, 0.5) },
      transition: { value: 0 }, outgoingTravel: { value: 0.5 }, incomingTravel: { value: 0 },
    },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.Camera();
  let width = 0, height = 0;
  let previous = -1;
  let lost = false;
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    delete root.dataset.compositor;
  };
  const onRestored = () => { lost = false; previous = -1; };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  root.prepend(canvas);

  return {
    render(position: number, blend: number, reduced: boolean) {
      if (lost) return;
      const resized = root.clientWidth !== width || root.clientHeight !== height;
      if (resized) {
        width = root.clientWidth; height = root.clientHeight;
        renderer.setSize(width, height);
        material.uniforms.viewport.value.set(width, height);
      }
      const key = position + (reduced ? 100 : 0);
      if (previous === key && !resized) return;
      const index = Math.min(shots.length - 2, Math.floor(position));
      material.uniforms.outgoing.value = shots[index];
      material.uniforms.incoming.value = shots[index + 1];
      material.uniforms.outgoingSize.value.copy(sizes[index]);
      material.uniforms.incomingSize.value.copy(sizes[index + 1]);
      const focus = (i: number) => width < 768 ? (i === 1 || i === 3 ? 0.3 : i === 4 ? 0.73 : 0.65) : 0.5;
      material.uniforms.outgoingFocus.value.set(focus(index), 0.5);
      material.uniforms.incomingFocus.value.set(focus(index + 1), 0.5);
      material.uniforms.transition.value = reduced ? Number(blend >= 0.5) : blend;
      const travel = (i: number) => reduced ? 0 : Math.max(0, Math.min(1, (position - i + 1) / 2));
      material.uniforms.outgoingTravel.value = travel(index);
      material.uniforms.incomingTravel.value = travel(index + 1);
      renderer.render(scene, camera);
      root.dataset.compositor = "ready";
      previous = key;
    },
    dispose() {
      delete root.dataset.compositor;
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      canvas.remove();
      geometry.dispose(); material.dispose();
      shots.forEach(texture => texture.dispose());
      renderer.dispose();
    },
  };
}
