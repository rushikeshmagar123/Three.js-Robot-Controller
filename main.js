import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 5);
camera.lookAt(0, 1, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(ambientLight, dirLight);

// Night light
const pointLight = new THREE.PointLight(0xffffff, 2, 10);
pointLight.visible = false;
scene.add(pointLight);

// UI
const loaderDiv = document.getElementById("loader");
const nightBtn = document.getElementById("nightBtn");

// Loading manager
const manager = new THREE.LoadingManager();
manager.onProgress = (url, loaded, total) => {
  loaderDiv.innerText = "Loading: " + Math.round((loaded/total)*100) + "%";
};
manager.onLoad = () => {
  loaderDiv.style.display = "none";
};

const loader = new GLTFLoader(manager);

// State
let robot, mixer, actions = {}, currentAction;
let isWalking = false;
let nightMode = false;

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const targetLightPos = new THREE.Vector3();

// Load model
loader.load(
  'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
  (gltf) => {
    robot = gltf.scene;
    scene.add(robot);

    mixer = new THREE.AnimationMixer(robot);

    gltf.animations.forEach(clip => {
      actions[clip.name] = mixer.clipAction(clip);
    });

    playAction("Idle");
  }
);

// Animation control
function playAction(name, loop = true) {
  const next = actions[name];
  if (!next) return;

  next.reset();
  next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, 1);
  next.clampWhenFinished = true;

  if (currentAction !== next) {
    currentAction && currentAction.fadeOut(0.3);
    next.fadeIn(0.3).play();
    currentAction = next;
  }
}

// Raycasting interaction
window.addEventListener("click", (event) => {
  if (!robot) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(robot, true);

  if (!intersects.length) return;

  let obj = intersects[0].object;

  while (obj) {
    const name = obj.name;

    // Head → Jump once
    if (name.includes("Head")) {
      const action = actions["Jump"];
      if (!action) return;

      playAction("Jump", false);

      const duration = action.getClip().duration * 1000;

      setTimeout(() => {
        if (!isWalking) playAction("Idle");
      }, duration);

      return;
    }

    // Torso → Toggle walking
    if (
      name.includes("Spine") ||
      name.includes("Chest") ||
      name.includes("Body")
    ) {
      isWalking = !isWalking;
      playAction(isWalking ? "Walking" : "Idle");
      return;
    }

    obj = obj.parent;
  }
});

// Night mode button (SAFE)
if (nightBtn) {
  nightBtn.addEventListener("click", () => {
    nightMode = !nightMode;

    ambientLight.visible = !nightMode;
    dirLight.visible = !nightMode;
    pointLight.visible = nightMode;

    nightBtn.innerText = nightMode ? "☀️ Day Mode" : "🌙 Night Mode";
  });
}

// Mouse-follow light
window.addEventListener("mousemove", (e) => {
  if (!nightMode) return;

  targetLightPos.x = (e.clientX / window.innerWidth) * 5 - 2.5;
  targetLightPos.y = -(e.clientY / window.innerHeight) * 5 + 2.5;
  targetLightPos.z = 2;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  mixer && mixer.update(delta);

  pointLight.position.lerp(targetLightPos, 0.1);

  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Cleanup (important for SPA / efficiency)
window.addEventListener("beforeunload", () => {
  renderer.dispose();

  if (robot) {
    robot.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }

  Object.values(actions).forEach(action => action.stop());
});