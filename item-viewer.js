import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const params = new URLSearchParams(window.location.search);
const item = params.get("item") || "memories";

const ITEMS = {
  memories: {
    storage: "projetoNos_item_memories",
    model: "assets/puzzle/models/fotografia_reconstruida.glb",
    kicker: "ITEM 01 / ORIGEM: MEMÓRIAS",
    title: "FOTOGRAFIA RECONSTRUÍDA",
    copy: "A fotografia recuperada no encerramento do arquivo de memórias. O modelo exibido aqui é o mesmo objeto usado no protocolo final.",
    meta: "OBJETO 3D ORIGINAL · FRENTE / VERSO"
  },
  features: {
    storage: "projetoNos_item_features",
    model: "assets/puzzle/models/nordic_medalion.glb",
    kicker: "ITEM 02 / ORIGEM: EXPERIÊNCIAS",
    title: "MOEDA / MEDALHÃO ANTIGO",
    copy: "Um disco antigo e gasto. Parece simples demais para explicar sua função sozinho; o formato sugere que ele foi feito para encaixar em algum lugar.",
    meta: "OBJETO 3D ORIGINAL · FUNÇÃO DESCONHECIDA"
  },
  failures: {
    storage: "projetoNos_item_failures",
    model: "assets/puzzle/models/key.glb",
    kicker: "ITEM 03 / ORIGEM: FALHAS",
    title: "CHAVE",
    copy: "Uma chave comum. Nada nela parece extraordinário — o importante provavelmente é descobrir qual fechadura ela abre.",
    meta: "OBJETO 3D ORIGINAL · CHAVE MECÂNICA"
  }
};

const config = ITEMS[item] || ITEMS.memories;
const stage = document.getElementById("viewerStage");
const canvas = document.getElementById("viewerCanvas");
const loading = document.getElementById("viewerLoading");
const kicker = document.getElementById("viewerKicker");
const title = document.getElementById("viewerTitle");
const copy = document.getElementById("viewerCopy");
const meta = document.getElementById("viewerMeta");
const resetBtn = document.getElementById("resetViewer");

kicker.textContent = config.kicker;
title.textContent = config.title;
copy.textContent = config.copy;
meta.textContent = config.meta;

if (localStorage.getItem(config.storage) !== "true") {
  loading.textContent = "OBJETO AINDA NÃO RECUPERADO.";
  resetBtn.disabled = true;
  throw new Error("Item ainda não adquirido.");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030303);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.minDistance = 2.0;
controls.maxDistance = 14;

scene.add(new THREE.HemisphereLight(0xfff2df, 0x20151e, 2.4));
const keyLight = new THREE.DirectionalLight(0xffddba, 3.2);
keyLight.position.set(5, -5, 7);
scene.add(keyLight);
const fill = new THREE.DirectionalLight(0x8ea7ff, 1.25);
fill.position.set(-5, 3, 4);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffd9b5, 0.9);
rim.position.set(0, 4, -5);
scene.add(rim);

let itemRoot = null;
let defaultCamera = null;
let defaultTarget = null;

function findNamed(root, names) {
  const lowered = names.map(n => n.toLowerCase());
  let exact = null;
  root.traverse(node => {
    if (exact) return;
    const name = (node.name || "").toLowerCase();
    if (lowered.includes(name)) exact = node;
  });
  if (exact) return exact;
  let fuzzy = null;
  root.traverse(node => {
    if (fuzzy) return;
    const name = (node.name || "").toLowerCase();
    if (lowered.some(n => name.startsWith(n))) fuzzy = node;
  });
  return fuzzy;
}

function cloneFromWorld(source) {
  source.updateWorldMatrix(true, true);
  const clone = source.clone(true);
  source.matrixWorld.decompose(clone.position, clone.quaternion, clone.scale);
  clone.visible = true;
  clone.traverse(node => {
    node.visible = true;
    if (!node.isMesh) return;
    const fixMaterial = material => {
      const m = material?.clone?.() || material;
      if (!m) return m;
      m.visible = true;
      if (typeof m.opacity === "number" && m.opacity <= 0.001) m.opacity = 1;
      m.side = THREE.DoubleSide;
      m.needsUpdate = true;
      return m;
    };
    if (Array.isArray(node.material)) node.material = node.material.map(fixMaterial);
    else node.material = fixMaterial(node.material);
    node.frustumCulled = false;
  });
  return clone;
}

function normalizeAndFrame(model) {
  model.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) throw new Error(`Objeto ${item} encontrado, mas sem geometria renderizável.`);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.updateMatrixWorld(true);

  box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const targetSize = item === "memories" ? 4.4 : item === "features" ? 3.7 : 4.3;
  model.scale.multiplyScalar(targetSize / maxDim);
  model.updateMatrixWorld(true);

  box = new THREE.Box3().setFromObject(model);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const radius = Math.max(sphere.radius, 1);
  const distance = radius / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * 1.38;

  // Os três itens são relativamente planos. A câmera anterior olhava quase
  // ao longo do eixo Y e deixava a chave/medalhão praticamente de perfil.
  // Aqui cada objeto recebe uma vista frontal levemente inclinada.
  const direction = item === "memories"
    ? new THREE.Vector3(0.10, -0.12, 1.0)
    : item === "features"
      ? new THREE.Vector3(0.14, -0.10, 1.0)
      : new THREE.Vector3(0.12, -0.07, 1.0);
  direction.normalize();
  camera.position.copy(direction.multiplyScalar(distance));
  controls.target.set(0, 0, 0);
  controls.minDistance = Math.max(radius * 0.65, 1.1);
  controls.maxDistance = radius * 8;
  controls.update();

  defaultCamera = camera.position.clone();
  defaultTarget = controls.target.clone();
}

function resetView() {
  if (!defaultCamera || !defaultTarget) return;
  camera.position.copy(defaultCamera);
  controls.target.copy(defaultTarget);
  controls.update();
}
resetBtn.addEventListener("click", resetView);

function resize() {
  const rect = stage.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

const loader = new GLTFLoader();
loader.load(
  config.model,
  gltf => {
    const source = gltf.scene;
    try {
      itemRoot = cloneFromWorld(source);

      // A chave original foi modelada no eixo vertical. Para o inventário,
      // abrimos numa orientação mais natural sem alterar o GLB usado no puzzle.
      if (item === "failures") {
        itemRoot.rotation.z += Math.PI / 2;
      }

      scene.add(itemRoot);
      normalizeAndFrame(itemRoot);
      loading.classList.add("hidden");
      resize();
    } catch (error) {
      console.error(error);
      loading.textContent = `FALHA AO PREPARAR O OBJETO 3D: ${error.message}`;
    }
  },
  undefined,
  error => {
    console.error(error);
    loading.textContent = "FALHA AO CARREGAR O MODELO 3D ORIGINAL.";
  }
);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
resize();
animate();
