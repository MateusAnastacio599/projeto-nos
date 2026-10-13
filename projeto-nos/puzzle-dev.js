import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const ASSETS = {
    table: "assets/puzzle/models/mesa_puzzle_v3.glb",
    core: "assets/puzzle/models/modulo_nucleo_6.glb"
};

const CONTROLLER_SOLUTION = [
    "hit_triangle",
    "hit_left",
    "hit_circle",
    "hit_r1",
    "hit_down",
    "hit_square",
    "hit_r2"
];

const CATCH_SOLUTION = [
    "medallion_catch_1", // legado: mantido apenas para compatibilidade
    "medallion_catch_0",
    "medallion_catch_2",
    "medallion_catch_3"
];

const SYMBOL_SOLUTION = ["game", "coffee", "paw", "house"];
const SYMBOL_NODE_NAMES = {
    game: "symbol_game",
    coffee: "symbol_coffee",
    paw: "symbol_paw",
    house: "symbol_house"
};
const SYMBOL_LABELS = {
    game: "JOGO",
    coffee: "CAFÉ",
    paw: "PATINHA",
    house: "CASA"
};

const ITEM_COPY = {
    photo: ["FOTOGRAFIA RECONSTRUÍDA", "O verso parece importante."],
    disc: ["MEDALHÃO", "Parece feito para repousar em algum encaixe."],
    key: ["CHAVE DA GAVETA", "Uma chave antiga, simples e funcional."],
    uv: ["LANTERNA UV", "Passe a lanterna sobre o cenário. No celular, toque e arraste."],
    none: ["SEM ITEM EQUIPADO", "Examine o ambiente."]
};

const SCENE_INSPECT_COPY = {
    bmo: ["BMO", "COISA QUE A JUJUBA GOSTA. Relevância para a operação: nenhuma. Relevância real: alta."],
    totoro: ["TOTORO", "Objeto afetivo identificado. Nível de aconchego: elevado."],
    cookies: ["POTE DE COOKIES", "Verificação visual autorizada. Consumir o conteúdo continua fora do escopo da investigação."],
    d20: ["D20", "Um dado de vinte faces. Evidência científica de que decisões importantes precisam de aleatoriedade."]
};

const INSPECTION_PRESETS = {
    photo: {
        quaternion: [0.96911, 0.13936, -0.01183, 0.20312],
        camera: [1.825, -7.88, 2.962],
        target: [-0.108, -0.559, 0.296]
    },
    bmo: {
        quaternion: [0.75413, 0.01899, 0.01142, 0.65636],
        camera: [0.275, -14.869, 2.427],
        target: [0.069, 0.035, 1.929]
    },
    cookies: {
        quaternion: [0.41277, 0.35463, -0.51992, 0.65844],
        camera: [1.033, -7.336, -14.513],
        target: [0.227, 0.373, 1.769]
    },
    controller: {
        quaternion: [0.96757, 0.05159, -0.23425, -0.07965],
        camera: [0, -13.861, 0.2],
        target: [0, 0, 0]
    }
};

const state = {
    equipped: null,
    photoRead: false,
    drawerUnlocked: false,
    drawerOpen: false,
    fragmentRead: false,
    controllerSolved: false,
    uvUnlocked: false,
    discInserted: false,
    discRevealed: false,
    discSlotRevealed: false,
    catchSequence: [],
    catchesSolved: false,
    symbolSequence: [],
    symbolsSolved: false,
    coreUnlocked: false,
    controllerSequence: [],
    keyPlaced: false,
    discPlaced: false,
    uvPlaced: false,
    dragging: null,
    pointerWorld: new THREE.Vector3(),
    logKeys: new Set(),
    uvPointerActive: false,
    uvTouchPointerId: null
};

const dom = {
    canvas: document.getElementById("gameCanvas"),
    viewport: document.getElementById("gameViewport"),
    hudItemName: document.getElementById("hudItemName"),
    hudItemHint: document.getElementById("hudItemHint"),
    controllerHud: document.getElementById("controllerHud"),
    controllerDots: document.getElementById("controllerDots"),
    toast: document.getElementById("systemToast"),
    loading: document.getElementById("loadingScreen"),
    loadingBar: document.getElementById("loadingBar"),
    webglError: document.getElementById("webglError"),
    inventoryDock: document.getElementById("inventoryDock"),
    toggleInventory: document.getElementById("toggleInventory"),
    inventorySlots: Array.from(document.querySelectorAll(".inventory-slot")),
    inventoryItemName: document.getElementById("inventoryItemName"),
    inventoryItemHint: document.getElementById("inventoryItemHint"),
    uvSlot: document.getElementById("uvSlot"),
    log: document.getElementById("systemLog"),
    logEntries: document.getElementById("logEntries"),
    toggleLog: document.getElementById("toggleLog"),
    closeLog: document.getElementById("closeLog"),
    resetCameraBtn: document.getElementById("resetCameraBtn"),
    finalReportBtn: document.getElementById("finalReportBtn"),
    photoDialog: document.getElementById("photoDialog"),
    photoInspectViewport: document.getElementById("photoInspectViewport"),
    photoInspectCanvas: document.getElementById("photoInspectCanvas"),
    flipPhoto3D: document.getElementById("flipPhoto3D"),
    closePhoto: document.getElementById("closePhoto"),
    photoHint: document.getElementById("photoHint"),
    fragmentDialog: document.getElementById("fragmentDialog"),
    closeFragment: document.getElementById("closeFragment"),
    inspectItemBtn: document.getElementById("inspectItemBtn"),
    storeItemBtn: document.getElementById("storeItemBtn"),
    itemDialog: document.getElementById("itemDialog"),
    closeItemDialog: document.getElementById("closeItemDialog"),
    itemDialogTitle: document.getElementById("itemDialogTitle"),
    itemDialogHint: document.getElementById("itemDialogHint"),
    itemInspectViewport: document.getElementById("itemInspectViewport"),
    itemInspectCanvas: document.getElementById("itemInspectCanvas"),
    controllerDialog: document.getElementById("controllerDialog"),
    closeControllerDialog: document.getElementById("closeControllerDialog"),
    controllerInspectViewport: document.getElementById("controllerInspectViewport"),
    controllerInspectCanvas: document.getElementById("controllerInspectCanvas"),
    controllerInspectSequence: document.getElementById("controllerInspectSequence"),
    controllerInspectHint: document.getElementById("controllerInspectHint"),
    resetControllerView: document.getElementById("resetControllerView"),
    resetPhotoView: document.getElementById("resetPhotoView"),
    resetItemView: document.getElementById("resetItemView"),
    rollD20Btn: document.getElementById("rollD20Btn"),
    toggleInspectUvBtn: document.getElementById("toggleInspectUvBtn")
};

let renderer;
let scene;
let camera;
let controls;
let raycaster;
let mouse;
let dragPlane;
let activeItemDragPlane = new THREE.Plane();
let uvMovePlane = new THREE.Plane();
let loader;
let textureLoader;
let tableRoot;
let controllerRoot;
let photoRoot;
let keyRoot;
let discRoot;
let uvRoot;
let fragmentRoot;
let coreRoot;
let uvSpot;
let uvTarget;
let drawerNodes = [];
let drawerAssembly = null;
let drawerOpenTarget = null;
let drawerClosedTarget = null;
let bmoRoot = null;
let totoroRoot = null;
let cookieRoot = null;
let d20Root = null;
let chairRoot = null;
let candleRoot = null;
let candleLight = null;
let tableSurfaceZ = 4.16;
let tableBounds = new THREE.Box3();
let corePanel;
let controllerButtons = [];
let catches = [];
let uvSymbols = new Map();
let uvSymbolHitTargets = [];
let lockDrawer;
let lockCore;
let discSlot;
let discSlotMarker = null;
let uvHome = null;
let fragmentClickable = null;
let animationClock = new THREE.Clock();
let toastTimer = null;
let environmentTexture = null;
let secretMeshes = [];
let transientEffects = [];
let photoInspectRenderer;
let photoInspectScene;
let photoInspectCamera;
let photoInspectControls;
let photoInspectModel;
let photoFlipTarget = 0;
let photoBaseRotationY = 0;
let photoInspectBaseQuaternion = new THREE.Quaternion();
let photoInspectorReady = false;
let itemInspectRenderer;
let itemInspectScene;
let itemInspectCamera;
let itemInspectControls;
let itemInspectRoot;
let itemInspectorReady = false;
let itemInspectKey = null;
let controllerInspectRenderer;
let controllerInspectScene;
let controllerInspectCamera;
let controllerInspectControls;
let controllerInspectModel;
let controllerInspectButtons = [];
let controllerInspectorReady = false;
let controllerInspectRaycaster = new THREE.Raycaster();
let controllerInspectMouse = new THREE.Vector2();
let controllerInspectPointerDown = null;
let itemInspectBaseQuaternion = new THREE.Quaternion();
let controllerInspectBaseQuaternion = new THREE.Quaternion();
let d20Rolling = false;
let d20ResultMarker = null;
let itemInspectUvActive = false;
let itemInspectUvSpot = null;
let itemInspectUvTarget = null;
let itemInspectUvRaycaster = new THREE.Raycaster();
let itemInspectUvPointer = new THREE.Vector2();
let itemInspectUvRevealNodes = [];
let itemInspectUvHitPoint = null;
let tableMoveBounds = new THREE.Box3();
let suppressNextSceneClick = false;
let surfaceDrag = {
    candidate: null,
    active: null,
    pointerId: null,
    startX: 0,
    startY: 0,
    plane: new THREE.Plane(),
    offset: new THREE.Vector3(),
    moved: false
};

function supportsWebGL() {
    try {
        const test = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (test.getContext("webgl2") || test.getContext("webgl")));
    } catch {
        return false;
    }
}

function toast(message, duration = 1800) {
    clearTimeout(toastTimer);
    dom.toast.textContent = message;
    dom.toast.classList.remove("hidden");
    toastTimer = setTimeout(() => dom.toast.classList.add("hidden"), duration);
}

function logOnce(key, message) {
    if (state.logKeys.has(key)) return;
    state.logKeys.add(key);
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = message;
    dom.logEntries.prepend(entry);
}

function updateInventoryCopy() {
    if (dom.uvSlot) {
        dom.uvSlot.classList.toggle("hidden", !state.uvUnlocked);
        dom.uvSlot.classList.toggle("locked", !state.uvUnlocked);
        dom.uvSlot.disabled = !state.uvUnlocked;
        dom.uvSlot.setAttribute("aria-hidden", state.uvUnlocked ? "false" : "true");
    }
    const key = state.equipped || "none";
    const [name, hint] = ITEM_COPY[key];
    if (dom.inventoryItemName) dom.inventoryItemName.textContent = name;
    if (dom.inventoryItemHint) dom.inventoryItemHint.textContent = hint;
    if (dom.hudItemName) dom.hudItemName.textContent = name;
    if (dom.hudItemHint) dom.hudItemHint.textContent = hint;

    dom.inventorySlots.forEach(slot => {
        slot.classList.toggle("active", slot.dataset.item === state.equipped);
    });

    const inspectable = Boolean(state.equipped && ["disc", "key", "uv"].includes(state.equipped));
    const storable = Boolean(state.equipped && ["disc", "key", "uv"].includes(state.equipped));
    if (dom.inspectItemBtn) dom.inspectItemBtn.disabled = !inspectable;
    if (dom.storeItemBtn) dom.storeItemBtn.disabled = !storable;
}

function equip(item) {
    if (item === "uv" && !state.uvUnlocked) {
        toast("A lanterna ainda não respondeu.");
        return;
    }
    if (item === "key" && state.drawerUnlocked) {
        toast("A chave já está na fechadura.", 1200);
        return;
    }
    if (item === "disc" && state.discInserted) {
        toast("O medalhão já está encaixado.", 1200);
        return;
    }

    const next = state.equipped === item ? null : item;
    state.equipped = next;
    document.body.classList.toggle("uv-active", next === "uv");

    if (next !== "uv") {
        uvSpot.intensity = 0;
        secretMeshes.forEach(mesh => {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.filter(Boolean).forEach(mat => mat.opacity = 0);
        });
        resetUvSymbols();
        returnUvHome();
    } else if (uvRoot) {
        uvRoot.visible = true;
    }

    updateInventoryCopy();
}

function loadGLB(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, gltf => resolve(gltf.scene), undefined, reject);
    });
}

function ensurePlanarUVXY(mesh, repeat = 1) {
    if (!mesh?.geometry) return;
    const geometry = mesh.geometry;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const pos = geometry.getAttribute("position");
    if (!pos) return;
    const sx = Math.max(box.max.x - box.min.x, 0.0001);
    const sy = Math.max(box.max.y - box.min.y, 0.0001);
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = ((pos.getX(i) - box.min.x) / sx) * repeat;
        uv[i * 2 + 1] = ((pos.getY(i) - box.min.y) / sy) * repeat;
    }
    geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

function applyWoodTextureToTable() {
    if (!tableRoot || !textureLoader) return;
    textureLoader.load("assets/puzzle/textures/wood_dark.png", texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2.0, 1.35);
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy?.() || 1, 8);
        texture.needsUpdate = true;

        ["table_top", "drawer"].forEach(name => {
            const node = findNamed(tableRoot, name);
            if (!node?.isMesh) return;
            ensurePlanarUVXY(node, name === "table_top" ? 2.4 : 1.3);
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                color: 0xffffff,
                roughness: 0.66,
                metalness: 0.015,
                envMapIntensity: 0.95,
                emissive: new THREE.Color(0x160907),
                emissiveIntensity: 0.16
            });
            node.material = material;
            node.material.needsUpdate = true;
        });
    });
}

function normalizeObjectScale(root, targetMax) {
    if (!root) return 1;
    root.scale.set(1, 1, 1);
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = targetMax / maxDim;
    root.scale.setScalar(scale);
    root.userData.normalizedScale = scale;
    root.updateMatrixWorld(true);
    return scale;
}

function cloneMaterialTree(root) {
    root.traverse(node => {
        if (!node.isMesh) return;
        node.castShadow = true;
        node.receiveShadow = true;
        if (Array.isArray(node.material)) {
            node.material = node.material.map(mat => mat?.clone?.() || mat);
        } else if (node.material?.clone) {
            node.material = node.material.clone();
        }
    });
}

function setMeshMaterialTuning(root, { env = 1.0, roughnessBias = 0, metalnessBias = 0 } = {}) {
    root.traverse(node => {
        if (!node.isMesh) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.filter(Boolean).forEach(mat => {
            if ("envMapIntensity" in mat) mat.envMapIntensity = env;
            if (typeof mat.roughness === "number") mat.roughness = THREE.MathUtils.clamp(mat.roughness + roughnessBias, 0.08, 1);
            if (typeof mat.metalness === "number") mat.metalness = THREE.MathUtils.clamp(mat.metalness + metalnessBias, 0, 1);
            mat.needsUpdate = true;
        });
    });
}

function createRoom() {
    // Ambiente aberto. O chão é apenas referência visual e não limita a câmera.
    const floor = new THREE.Mesh(
        new THREE.CircleGeometry(24, 96),
        new THREE.MeshStandardMaterial({ color: 0x120d0c, roughness: 0.98, metalness: 0.0 })
    );
    floor.position.set(0, 0, -3.42);
    floor.receiveShadow = true;
    floor.userData.ignoreRaycast = true;
    scene.add(floor);
}

function setupLighting() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    environmentTexture = pmrem.fromScene(room, 0.03).texture;
    scene.environment = environmentTexture;
    room.dispose();
    pmrem.dispose();

    const ambient = new THREE.AmbientLight(0xffead2, 0.22);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xf7dfbf, 0x12090b, 0.40);
    scene.add(hemi);

    const key = new THREE.SpotLight(0xffd2a5, 70, 24, Math.PI / 4.2, 0.48, 1.8);
    key.position.set(5.0, 4.0, 11.0);
    key.target.position.set(0, 0, 3.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1536, 1536);
    scene.add(key, key.target);

    const rim = new THREE.PointLight(0x6f88a9, 18, 18, 2);
    rim.position.set(-5.4, -3.0, 7.6);
    scene.add(rim);

    uvTarget = new THREE.Object3D();
    uvTarget.position.set(0, 0, 4.05);
    scene.add(uvTarget);

    uvSpot = new THREE.SpotLight(0x7357ff, 0, 8, Math.PI / 4.6, 0.62, 1.2);
    uvSpot.position.set(0, 0, 5.4);
    uvSpot.target = uvTarget;
    scene.add(uvSpot);
}

function setupCandleLight() {
    if (!candleRoot) return;

    // A luz passa a pertencer ao objeto da vela. Assim, se a vela for movida
    // no Blender ou futuramente no cenário, a iluminação acompanha o objeto.
    const box = new THREE.Box3().setFromObject(candleRoot);
    const wickWorld = box.isEmpty()
        ? candleRoot.getWorldPosition(new THREE.Vector3())
        : new THREE.Vector3(
            (box.min.x + box.max.x) * 0.5,
            (box.min.y + box.max.y) * 0.5,
            box.max.z + 0.08
        );

    candleLight = new THREE.PointLight(0xffb36b, 6.0, 7.0, 2.0);
    candleLight.castShadow = true;
    candleLight.shadow.mapSize.set(512, 512);
    scene.add(candleLight);
    candleLight.position.copy(wickWorld);
    candleRoot.attach(candleLight);

    const glow = new THREE.PointLight(0xff8f4a, 1.7, 3.0, 2.0);
    scene.add(glow);
    glow.position.copy(wickWorld);
    candleRoot.attach(glow);
    candleLight.userData.secondary = glow;
}

function updateCandleLight() {
    if (!candleLight) return;
    const t = performance.now() * 0.001;
    const flicker = Math.sin(t * 7.1) * 0.13 + Math.sin(t * 13.7 + 0.8) * 0.07;
    candleLight.intensity = 6.0 + flicker;
    if (candleLight.userData.secondary) {
        candleLight.userData.secondary.intensity = 1.7 + flicker * 0.38;
    }
}

function prepareEmbeddedController() {
    if (!controllerRoot) return;
    // O controle agora vem posicionado no próprio GLB da mesa.
    // Nada de normalizar escala ou reposicionar por JavaScript.
    controllerRoot.updateMatrixWorld(true);
}

const CONTROLLER_BUTTON_NAMES = new Set([
    "hit_triangle", "hit_circle", "hit_x", "hit_square",
    "hit_up", "hit_right", "hit_down", "hit_left",
    "hit_l1", "hit_l2", "hit_r1", "hit_r2"
]);

function prepareControllerHitbox(node) {
    if (!node?.isMesh || !CONTROLLER_BUTTON_NAMES.has(node.name)) return false;

    node.userData.controllerHitbox = true;
    node.userData.controllerButton = node.name;

    // O mesh continua presente e raycastable, mas não aparece no render.
    // Não usamos visible=false porque o Raycaster ignora objetos invisíveis.
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.filter(Boolean).forEach(mat => {
        mat.transparent = true;
        mat.opacity = 0;
        mat.depthWrite = false;
        mat.colorWrite = false;
        mat.needsUpdate = true;
    });

    return true;
}

function buildDualShockHitboxes(parent = controllerRoot) {
    if (!parent) return [];

    const hitboxes = [];
    parent.traverse(node => {
        if (prepareControllerHitbox(node)) hitboxes.push(node);
    });

    return hitboxes;
}

function pulseControllerButton(node) {
    if (!node) return;
    const world = new THREE.Vector3();
    node.getWorldPosition(world);

    const targetScene = dom.controllerDialog?.open && controllerInspectScene
        ? controllerInspectScene
        : scene;

    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 22, 14),
        new THREE.MeshBasicMaterial({
            color: 0x9a79ff,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false
        })
    );
    glow.position.copy(world);
    targetScene.add(glow);
    const started = performance.now();
    glow.userData.animate = () => {
        const t = (performance.now() - started) / 240;
        glow.scale.setScalar(1 + t * 2.0);
        glow.material.opacity = Math.max(0, 0.85 * (1 - t));
        if (t >= 1) {
            targetScene.remove(glow);
            glow.geometry.dispose();
            glow.material.dispose();
            return false;
        }
        return true;
    };
    transientEffects.push(glow);
}

function fitDiscAtCursor(point) {
    if (!discRoot) return;
    discRoot.visible = true;
    setWorldPosition(discRoot, point);
}

function insertDisc() {
    state.discInserted = true;
    // V16: encaixou o medalhão, a ordem já está habilitada.
    // Os símbolos continuam precisando da UV para ficarem visíveis.
    state.discRevealed = true;
    state.symbolSequence = [];
    state.dragging = null;
    discRoot.visible = true;

    const socketVisual = findNamed(tableRoot, "disc_socket") || discSlot;
    const slotWorld = socketVisual ? visualCenterWorld(socketVisual) : tableBounds.getCenter(new THREE.Vector3());

    if (socketVisual) {
        const socketQuat = socketVisual.getWorldQuaternion(new THREE.Quaternion());
        setWorldQuaternion(discRoot, socketQuat);
    }
    moveVisualCenterToWorld(discRoot, slotWorld.clone().add(new THREE.Vector3(0, 0, 0.035)));

    dom.inventorySlots.find(slot => slot.dataset.item === "disc")?.classList.add("locked");
    toast("O medalhão encaixou no plate.");
    logOnce("disc-insert", "O medalhão foi encaixado no plate de madeira.");
    state.equipped = null;
    updateInventoryCopy();
}

function fitKeyAtCursor(point) {
    if (!keyRoot) return;
    keyRoot.visible = true;
    setWorldPosition(keyRoot, point);
}

function fitUvAtCursor(point, tableHit = null) {
    if (!uvRoot || !state.uvUnlocked || state.equipped !== "uv") return;
    uvRoot.visible = true;

    const target = tableHit || point;
    camera.updateMatrixWorld(true);
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

    // A lanterna fica levemente ao lado/abaixo do cursor, como se estivesse
    // sendo segurada, e aponta fisicamente para o ponto iluminado.
    const holder = target.clone()
        .addScaledVector(cameraRight, 0.72)
        .addScaledVector(cameraUp, -0.42)
        .add(new THREE.Vector3(0, 0, 0.34));
    setWorldPosition(uvRoot, holder);

    const forward = target.clone().sub(holder).normalize();
    const worldUp = new THREE.Vector3(0, 0, 1);
    let zAxis = worldUp.clone().sub(forward.clone().multiplyScalar(worldUp.dot(forward)));
    if (zAxis.lengthSq() < 0.001) zAxis = cameraUp.clone();
    zAxis.normalize();
    const yAxis = zAxis.clone().cross(forward).normalize();
    const basis = new THREE.Matrix4().makeBasis(forward, yAxis, zAxis);
    setWorldQuaternion(uvRoot, new THREE.Quaternion().setFromRotationMatrix(basis));

    const worldPos = uvRoot.getWorldPosition(new THREE.Vector3());
    uvSpot.position.copy(worldPos);
    uvTarget.position.copy(target);
}

function createTextTexture(lines, { width = 768, height = 256, color = "#b9a8ff", glow = "#6958ff" } = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 50px monospace";
    ctx.shadowColor = glow;
    ctx.shadowBlur = 22;
    ctx.fillStyle = color;

    const gap = 62;
    const start = height / 2 - ((lines.length - 1) * gap) / 2;
    lines.forEach((line, index) => ctx.fillText(line, width / 2, start + index * gap));

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

function addSecret(name, position, lines, size = [2.6, 0.88], predicate = () => true) {
    const texture = createTextTexture(lines);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), material);
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.renderOrder = 10;
    mesh.userData.revealPredicate = predicate;
    scene.add(mesh);
    secretMeshes.push(mesh);
    return mesh;
}

function createUvSymbolTexture(kind) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 512, 512);
    ctx.strokeStyle = "#c9baff";
    ctx.fillStyle = "#c9baff";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "#6f4cff";
    ctx.shadowBlur = 34;

    if (kind === "house") {
        ctx.beginPath();
        ctx.moveTo(128, 248); ctx.lineTo(256, 132); ctx.lineTo(384, 248);
        ctx.moveTo(162, 224); ctx.lineTo(162, 382); ctx.lineTo(350, 382); ctx.lineTo(350, 224);
        ctx.moveTo(230, 382); ctx.lineTo(230, 300); ctx.lineTo(282, 300); ctx.lineTo(282, 382);
        ctx.stroke();
    } else if (kind === "coffee") {
        ctx.beginPath();
        ctx.roundRect(136, 222, 206, 132, 24);
        ctx.moveTo(342, 250); ctx.bezierCurveTo(418, 246, 418, 332, 342, 328);
        ctx.moveTo(166, 392); ctx.lineTo(366, 392);
        ctx.stroke();
        [[202,172,180,124],[256,176,238,118],[310,172,292,124]].forEach(([x1,y1,x2,y2])=>{
            ctx.beginPath(); ctx.moveTo(x1,y1); ctx.bezierCurveTo(x1-18,y1-24,x2+22,y2+18,x2,y2); ctx.stroke();
        });
    } else if (kind === "paw") {
        const circles = [[256,300,76],[166,214,42],[238,174,40],[318,184,40],[374,238,42]];
        circles.forEach(([x,y,r]) => { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); });
        ctx.beginPath();
        ctx.ellipse(258, 320, 104, 82, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // gamepad
        ctx.beginPath();
        ctx.moveTo(142, 214);
        ctx.bezierCurveTo(104, 226, 88, 332, 116, 370);
        ctx.bezierCurveTo(144, 410, 190, 342, 218, 332);
        ctx.lineTo(294, 332);
        ctx.bezierCurveTo(324, 342, 370, 410, 398, 370);
        ctx.bezierCurveTo(426, 332, 408, 226, 370, 214);
        ctx.bezierCurveTo(336, 202, 304, 222, 278, 226);
        ctx.lineTo(234, 226);
        ctx.bezierCurveTo(208, 222, 176, 202, 142, 214);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(174, 260); ctx.lineTo(174, 314); ctx.moveTo(148, 287); ctx.lineTo(200, 287); ctx.stroke();
        ctx.beginPath(); ctx.arc(340, 267, 13, 0, Math.PI*2); ctx.arc(374, 302, 13, 0, Math.PI*2); ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

function makeUvSymbolMaterial(kind) {
    return new THREE.MeshBasicMaterial({
        map: createUvSymbolTexture(kind),
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false
    });
}

function configureUvSymbol(kind, anchor) {
    if (!anchor) return;
    anchor.updateWorldMatrix(true, false);

    const tableSize = tableBounds.getSize(new THREE.Vector3());
    const side = Math.max(0.58, Math.min(1.05, Math.max(tableSize.x, tableSize.y) * 0.055));

    let visual = null;
    anchor.traverse(node => {
        if (!visual && node.isMesh && node !== anchor) visual = node;
    });
    if (!visual && anchor.isMesh) visual = anchor;

    // Se o SVG veio como nó vazio, o próprio nó continua sendo a âncora e o
    // ícone é desenhado por código na posição definida no Blender.
    if (!visual) {
        const worldPosition = anchor.getWorldPosition(new THREE.Vector3());
        const worldQuaternion = anchor.getWorldQuaternion(new THREE.Quaternion());
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuaternion).normalize();
        visual = new THREE.Mesh(new THREE.PlaneGeometry(side, side), makeUvSymbolMaterial(kind));
        visual.position.copy(worldPosition).addScaledVector(normal, 0.018);
        visual.quaternion.copy(worldQuaternion);
        visual.renderOrder = 14;
        scene.add(visual);
    } else {
        cloneMaterialTree(visual);
        visual.traverse(node => {
            if (!node.isMesh) return;
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.filter(Boolean).forEach(mat => {
                mat.transparent = true;
                mat.opacity = 0;
                mat.depthWrite = false;
                if (mat.color) mat.color.setHex(0xc9baff);
                if ("emissive" in mat) {
                    mat.emissive.setHex(0x6f4cff);
                    mat.emissiveIntensity = 2.2;
                }
                mat.needsUpdate = true;
            });
        });
    }

    visual.name = `uv_visual_${kind}`;
    visual.userData.uvSymbolKind = kind;
    visual.userData.uvReveal = 0;
    visual.userData.uvTargetOpacity = 0;
    visual.userData.uvLastSeenAt = -Infinity;

    // Hitbox esférica generosa: funciona mesmo se o SVG/plane estiver inclinado
    // ou quase de perfil. Corrige especialmente a patinha.
    const hitMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        colorWrite: false
    });
    const hit = new THREE.Mesh(new THREE.SphereGeometry(side * 0.58, 16, 10), hitMaterial);
    hit.name = `hit_uv_symbol_${kind}`;
    hit.position.copy(anchor.getWorldPosition(new THREE.Vector3()));
    hit.userData.uvSymbolKind = kind;
    hit.userData.ignoreVisual = true;
    scene.add(hit);

    uvSymbols.set(kind, { anchor, visual, hit });
    uvSymbolHitTargets.push(hit);
}

function configureUvSymbols() {
    uvSymbols.clear();
    uvSymbolHitTargets = [];
    Object.entries(SYMBOL_NODE_NAMES).forEach(([kind, name]) => {
        configureUvSymbol(kind, findNamed(tableRoot, name));
    });
}

function setUvSymbolOpacity(visual, opacity) {
    if (!visual) return;
    visual.visible = opacity > 0.008;
    visual.traverse(node => {
        if (!node.isMesh) return;
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.filter(Boolean).forEach(mat => {
            mat.transparent = true;
            mat.opacity = opacity;
        });
    });
}

function updateUvSymbols(point, delta = 1 / 60) {
    const uvActive = state.equipped === "uv" && state.uvUnlocked;
    const now = performance.now();
    const revealRadius = 1.45;

    uvSymbols.forEach(({ anchor, visual }) => {
        const pos = anchor.getWorldPosition(new THREE.Vector3());
        const distance = pos.distanceTo(point);
        let target = 0;

        if (uvActive && distance < revealRadius) {
            const strength = THREE.MathUtils.smoothstep(revealRadius - distance, 0, revealRadius);
            target = Math.max(0.18, strength);
            visual.userData.uvLastSeenAt = now;
        } else if (now - (visual.userData.uvLastSeenAt || -Infinity) < 700) {
            // Pequena persistência para o símbolo não piscar quando a mão oscila.
            target = 0.22;
        }

        const current = visual.userData.uvReveal || 0;
        const next = THREE.MathUtils.damp(current, target, target > current ? 10 : 5.5, delta);
        visual.userData.uvReveal = next;
        setUvSymbolOpacity(visual, next * 0.96);
    });
}

function resetUvSymbols() {
    uvSymbols.forEach(({ visual }) => {
        visual.userData.uvReveal = 0;
        visual.userData.uvLastSeenAt = -Infinity;
        setUvSymbolOpacity(visual, 0);
    });
}

function closestRevealedUvSymbolFromPointer(event, maxPixels = 72) {
    const rect = dom.canvas.getBoundingClientRect();
    let best = null;
    let bestDistance = Infinity;

    uvSymbols.forEach(({ anchor, visual }, kind) => {
        if ((visual.userData.uvReveal || 0) < 0.25) return;
        const world = anchor.getWorldPosition(new THREE.Vector3());
        const projected = world.clone().project(camera);
        if (projected.z < -1 || projected.z > 1) return;

        const x = rect.left + (projected.x * 0.5 + 0.5) * rect.width;
        const y = rect.top + (-projected.y * 0.5 + 0.5) * rect.height;
        const d = Math.hypot(event.clientX - x, event.clientY - y);
        if (d < bestDistance && d <= maxPixels) {
            bestDistance = d;
            best = kind;
        }
    });
    return best;
}

function handleUvSymbolClick(kind) {
    const entry = uvSymbols.get(kind);
    if (!entry || (entry.visual.userData.uvReveal || 0) < 0.32) return;

    if (!state.discInserted) {
        toast("O símbolo responde à UV, mas o medalhão ainda não foi encaixado.");
        return;
    }
    if (state.symbolsSolved) return;

    const expected = SYMBOL_SOLUTION[state.symbolSequence.length];
    if (kind !== expected) {
        state.symbolSequence = [];
        toast("SEQUÊNCIA UV INCORRETA // REINICIANDO SÍMBOLOS", 2200);
        return;
    }

    state.symbolSequence.push(kind);
    setHighlight(entry.visual, 0xbba5ff, 3.2);
    toast(`${SYMBOL_LABELS[kind]} // ${state.symbolSequence.length}/4`, 1200);

    if (state.symbolSequence.length === SYMBOL_SOLUTION.length) {
        state.symbolsSolved = true;
        state.catchesSolved = true; // compatibilidade com o mecanismo final existente
        localStorage.setItem("projetoNos_finalPuzzleSolved", "true");
        dom.finalReportBtn?.classList.remove("hidden");
        toast("SINCRONIZAÇÃO CONCLUÍDA // RELATÓRIO DE 6 ANOS LIBERADO", 4200);
        logOnce("uv-symbols-solved", "Os quatro símbolos UV foram ativados na ordem correta: JOGO, CAFÉ, PATINHA, CASA. Relatório liberado.");
    }
}

function nodeCenterWorld(node) {
    if (!node) return null;
    const box = new THREE.Box3().setFromObject(node);
    if (box.isEmpty()) return node.getWorldPosition(new THREE.Vector3());
    return box.getCenter(new THREE.Vector3());
}

function addSecretNearNode(name, node, lines, {
    offset = new THREE.Vector3(),
    size = [2.6, 0.88],
    predicate = () => true,
    billboard = true,
    anchorName = null
} = {}) {
    const anchor = anchorName ? findNamed(tableRoot, anchorName) : null;
    const host = anchor || node;
    const base = nodeCenterWorld(host);
    if (!base) return null;
    const mesh = addSecret(name, [
        base.x + offset.x,
        base.y + offset.y,
        base.z + offset.z
    ], lines, size, predicate);
    mesh.userData.billboard = billboard;
    // Prende a mensagem ao item/âncora. Assim BMO, Totoro, gaveta etc.
    // podem ser movidos sem a mensagem UV ficar para trás.
    host?.attach?.(mesh);
    return mesh;
}


function configureImportedUvTexts() {
    // Textos UV posicionados diretamente no Blender.
    // Qualquer mesh uv_* (exceto a lanterna) fica invisível normalmente e
    // participa do mesmo sistema de revelação pelo feixe da lanterna.
    const imported = [];
    tableRoot?.traverse(node => {
        const name = (node.name || "").toLowerCase();
        if (!node.isMesh) return;
        if (!name.startsWith("uv_")) return;
        if (name.startsWith("uv_flashlight") || name.startsWith("uv_visual_")) return;

        // Evita cadastrar o mesmo mesh duas vezes caso a função seja chamada novamente.
        if (node.userData.isImportedUvText) return;

        if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            node.material = Array.isArray(node.material)
                ? materials.map(mat => mat?.clone?.() || mat)
                : (node.material.clone?.() || node.material);

            const cloned = Array.isArray(node.material) ? node.material : [node.material];
            cloned.filter(Boolean).forEach(mat => {
                mat.transparent = true;
                mat.opacity = 0;
                mat.depthWrite = false;
                mat.side = THREE.DoubleSide;
                if ("toneMapped" in mat) mat.toneMapped = false;
                // Mantém a cor/material definido no Blender. Se houver emissive,
                // apenas reforçamos discretamente para parecer tinta reagindo ao UV.
                if (mat.emissive && mat.color) {
                    mat.emissive.copy(mat.color);
                    mat.emissiveIntensity = Math.max(mat.emissiveIntensity || 0, 1.25);
                }
                mat.needsUpdate = true;
            });
        }

        node.visible = true; // invisibilidade é controlada pela opacidade.
        node.renderOrder = Math.max(node.renderOrder || 0, 12);
        node.userData.isImportedUvText = true;
        node.userData.revealPredicate = () => true;
        node.userData.billboard = false; // respeita exatamente a posição/rotação do Blender.
        secretMeshes.push(node);
        imported.push(node);
    });

    return imported;
}

function hasImportedUvPrefix(prefix) {
    const p = String(prefix || "").toLowerCase();
    return secretMeshes.some(mesh =>
        mesh?.userData?.isImportedUvText && (mesh.name || "").toLowerCase().startsWith(p)
    );
}

function createSecrets() {
    // V15: nenhum texto UV é mais criado pelo JavaScript.
    // Tudo que deve aparecer com a lanterna vem do Blender com prefixo uv_.
    // A lógica do encaixe/medalhão continua sendo detectada por proximidade.
}

function updateSecrets(point) {
    if (!(state.equipped === "uv" && state.uvUnlocked)) {
        secretMeshes.forEach(mesh => {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.filter(Boolean).forEach(mat => mat.opacity = 0);
        });
        if (discSlotMarker?.material) discSlotMarker.material.opacity = 0;
        resetUvSymbols();
        uvSpot.intensity = 0;
        return;
    }

    uvSpot.intensity = 22;
    updateUvSymbols(point);
    if (discSlotMarker?.material) discSlotMarker.material.opacity = 0;

    secretMeshes.forEach(mesh => {
        if (!mesh.userData.revealPredicate()) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.filter(Boolean).forEach(mat => mat.opacity = 0);
            return;
        }

        // Para textos físicos do Blender usamos a bounding box real para que
        // o feixe revele a frase mesmo quando passa pela ponta do texto, não
        // apenas pelo pivô/origin do objeto.
        let distance;
        if (mesh.userData.isImportedUvText) {
            const box = new THREE.Box3().setFromObject(mesh);
            const closest = box.clampPoint(point, new THREE.Vector3());
            distance = closest.distanceTo(point);
        } else {
            const secretWorld = mesh.getWorldPosition(new THREE.Vector3());
            distance = secretWorld.distanceTo(point);
        }
        const opacity = THREE.MathUtils.clamp(1 - (distance - 0.28) / 1.65, 0, 1);
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.filter(Boolean).forEach(mat => mat.opacity = opacity * 0.96);

        if (mesh.userData.billboard && opacity > 0.02) {
            setWorldQuaternion(mesh, camera.quaternion);
        }
    });

    // O plate e o medalhão não precisam mais de texto gerado por código.
    // A própria UV apenas ativa os estados quando o feixe passa perto deles.
    const socketNode = findNamed(tableRoot, "disc_socket") || discSlot;
    if (socketNode) {
        const socketCenter = visualCenterWorld(socketNode);
        if (socketCenter.distanceTo(point) < 1.35) state.discSlotRevealed = true;
    }

    if (state.discInserted && discRoot) {
        const medalionCenter = visualCenterWorld(discRoot);
        if (medalionCenter.distanceTo(point) < 1.45) state.discRevealed = true;
    }

}

function findNamed(root, name) {
    let found = null;
    root.traverse(node => {
        if (!found && node.name === name) found = node;
    });
    return found;
}

function collectNamed(root, prefix) {
    const found = [];
    root.traverse(node => {
        if ((node.name || "").startsWith(prefix)) found.push(node);
    });
    return found;
}

function setHighlight(node, color = 0xd5a25e, intensity = 1.5) {
    if (!node) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.filter(Boolean).forEach(mat => {
        if (!("emissive" in mat)) return;
        const oldColor = mat.emissive.clone();
        const oldIntensity = mat.emissiveIntensity ?? 1;
        mat.emissive.setHex(color);
        mat.emissiveIntensity = intensity;
        setTimeout(() => {
            mat.emissive.copy(oldColor);
            mat.emissiveIntensity = oldIntensity;
        }, 220);
    });
}

function setDrawerOpen(open) {
    if (!state.drawerUnlocked || !drawerAssembly) return;
    state.drawerOpen = Boolean(open);

    const target = state.drawerOpen ? drawerOpenTarget : drawerClosedTarget;
    if (target) drawerAssembly.userData.openTargetPosition = target.clone();

    if (fragmentRoot) fragmentRoot.visible = true;
    toast(state.drawerOpen ? "Gaveta aberta." : "Gaveta fechada.", 1200);
}

function toggleDrawer() {
    if (!state.drawerUnlocked) {
        toast("A gaveta está trancada.", 1200);
        return;
    }
    setDrawerOpen(!state.drawerOpen);
}

function openDrawer() {
    if (!state.drawerUnlocked) {
        state.drawerUnlocked = true;
        logOnce("drawer-unlocked", "A chave destravou a gaveta.");
    }
    setDrawerOpen(true);

    // A chave permanece fisicamente na fechadura para comunicar que a gaveta
    // já foi destrancada.
    state.equipped = null;
    updateInventoryCopy();
}

function readFragment() {
    // O papel nunca é consumido. Pode ser relido sempre que a gaveta estiver aberta.
    if (!state.drawerOpen) return;
    if (!state.fragmentRead) {
        state.fragmentRead = true;
        toast("Três entradas recuperadas.", 1800);
        logOnce("fragment-read", "O fragmento da gaveta completa as três entradas apagadas da fotografia.");
    } else {
        toast("Fragmento reaberto.", 900);
    }
    dom.fragmentDialog?.showModal();
}

function controllerTokenLabel(name) {
    const labels = {
        hit_up: "↑",
        hit_down: "↓",
        hit_left: "←",
        hit_right: "→",
        hit_triangle: "△",
        hit_square: "□",
        hit_circle: "○",
        hit_x: "×",
        hit_l1: "L1",
        hit_l2: "L2",
        hit_r1: "R1",
        hit_r2: "R2"
    };
    return labels[name] || "•";
}

function updateControllerHud() {
    const values = state.controllerSequence.map(controllerTokenLabel);
    while (values.length < CONTROLLER_SOLUTION.length) values.push("—");
    dom.controllerDots.textContent = values.join(" ");
}

function flashControllerFeedback(kind = "error") {
    const dialog = dom.controllerDialog;
    if (!dialog) return;
    dialog.classList.remove("controller-error", "controller-success");
    // força reflow para permitir repetir a animação
    void dialog.offsetWidth;
    dialog.classList.add(kind === "success" ? "controller-success" : "controller-error");
    window.setTimeout(() => dialog.classList.remove("controller-error", "controller-success"), kind === "success" ? 1500 : 360);
}

function revealUvInventorySlot() {
    if (!dom.uvSlot) return;
    dom.uvSlot.disabled = false;
    dom.uvSlot.classList.remove("locked", "hidden");
    dom.uvSlot.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
        dom.uvSlot.classList.remove("hidden", "locked");
        updateInventoryCopy();
        updateInventoryThumbnails();
    });
}

function solveController() {
    state.controllerSolved = true;
    state.uvUnlocked = true;
    sessionStorage.setItem("projetoNos_puzzle_uvUnlocked", "true");
    revealUvInventorySlot();
    dom.controllerHud.classList.add("hidden");
    updateControllerHud();
    updateControllerInspectSequence();

    // A lanterna passa a existir fisicamente na posição definida no Blender.
    if (uvRoot) uvRoot.visible = true;

    flashControllerFeedback("success");
    if (dom.controllerInspectHint) {
        dom.controllerInspectHint.textContent = "SEQUÊNCIA ACEITA. DISPOSITIVO NÃO CATALOGADO DETECTADO // FONTE ULTRAVIOLETA DISPONÍVEL.";
    }
    toast("SEQUÊNCIA ACEITA // FONTE ULTRAVIOLETA DISPONÍVEL", 3600);
    logOnce("uv-unlock", "O controle aceitou a sequência. A lanterna UV apareceu sobre a mesa.");
}

function handleControllerButton(node) {
    if (state.controllerSolved) {
        toast("Sequência já aceita.", 1200);
        return;
    }
    const name = node.userData.controllerButton || node.name;
    if (!CONTROLLER_BUTTON_NAMES.has(name)) return;

    dom.controllerHud.classList.remove("hidden");
    pulseControllerButton(node);
    state.controllerSequence.push(name);
    updateControllerHud();
    updateControllerInspectSequence();

    const currentIndex = state.controllerSequence.length - 1;
    if (name !== CONTROLLER_SOLUTION[currentIndex]) {
        state.controllerSequence = [];
        flashControllerFeedback("error");
        if (dom.controllerInspectHint) dom.controllerInspectHint.textContent = "ENTRADA REJEITADA // A SEQUÊNCIA FOI REINICIADA.";
        toast("Entrada rejeitada.", 1200);
        window.setTimeout(() => {
            if (state.controllerSolved || state.controllerSequence.length) return;
            updateControllerHud();
            updateControllerInspectSequence();
            if (dom.controllerInspectHint && !state.controllerSolved) {
                dom.controllerInspectHint.textContent = "Clique nos botões. Mouse gira/zoom. W/S inclina · A/D gira · Q/E rola · R alinha · Z/C zoom.";
            }
        }, 360);
        return;
    }

    if (state.controllerSequence.length === CONTROLLER_SOLUTION.length) {
        solveController();
    }
}

function handleCatch(node) {
    if (!state.discRevealed || state.catchesSolved) {
        if (!state.discRevealed) toast("Há algo faltando para interpretar essas travas.");
        return;
    }

    setHighlight(node, 0x9d83ff, 1.8);
    state.catchSequence.push(node.name);
    const index = state.catchSequence.length - 1;

    if (node.name !== CATCH_SOLUTION[index]) {
        state.catchSequence = [];
        toast("As travas retornaram à posição inicial.");
        return;
    }

    if (state.catchSequence.length === CATCH_SOLUTION.length) {
        state.catchesSolved = true;
        toast("O painel central destravou.", 2400);
        logOnce("catches-solved", "As quatro travas responderam à sequência revelada pelo disco.");
        if (corePanel) corePanel.userData.openTargetX = corePanel.position.x + 2.5;
        if (lockCore) lockCore.visible = true;
    }
}

function unlockCore() {
    if (state.coreUnlocked) return;
    state.coreUnlocked = true;
    keyRoot.visible = false;
    state.equipped = null;
    updateInventoryCopy();

    coreRoot.visible = true;
    coreRoot.scale.setScalar(0.72);
    coreRoot.position.set(0, 0.50, 3.72);
    coreRoot.rotation.set(0, 0, 0);

    toast("NÚCLEO 6.0 RECUPERADO", 3200);
    logOnce("core-unlock", "A segunda extremidade da chave abriu o núcleo. Módulo 6.0 recuperado.");
}

function rayFromPointer(event) {
    const rect = dom.canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
}

function pointerOnTable(event, target = new THREE.Vector3()) {
    rayFromPointer(event);
    return raycaster.ray.intersectPlane(dragPlane, target);
}

function pointerOnSceneSurface(event, target = new THREE.Vector3()) {
    rayFromPointer(event);
    if (tableRoot) {
        const hits = raycaster.intersectObject(tableRoot, true);
        const hit = hits.find(({ object }) => {
            const name = object?.name || "";
            if (name.startsWith("hit_") || name.startsWith("uv_visual_")) return false;
            if (object?.userData?.ignoreRaycast) return false;
            return object?.visible !== false;
        });
        if (hit?.point) return target.copy(hit.point);
    }
    return pointerOnTable(event, target);
}

function setPlaneFacingCameraThrough(plane, worldPoint) {
    const normal = camera.getWorldDirection(new THREE.Vector3()).normalize();
    plane.setFromNormalAndCoplanarPoint(normal, worldPoint);
    return plane;
}

function pointerOnPlane(event, plane, target = new THREE.Vector3()) {
    rayFromPointer(event);
    return raycaster.ray.intersectPlane(plane, target);
}

function rootForItem(item) {
    if (item === "key") return keyRoot;
    if (item === "disc") return discRoot;
    if (item === "uv") return uvRoot;
    return null;
}

function pointInsideCanvas(event) {
    const rect = dom.canvas.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
}

function screenDistanceToNode(event, node) {
    if (!node) return Infinity;
    const world = node.getWorldPosition(new THREE.Vector3());
    const projected = world.clone().project(camera);
    const rect = dom.canvas.getBoundingClientRect();
    const x = rect.left + (projected.x * 0.5 + 0.5) * rect.width;
    const y = rect.top + (-projected.y * 0.5 + 0.5) * rect.height;
    return Math.hypot(event.clientX - x, event.clientY - y);
}

function setWorldPosition(object, worldPoint) {
    if (!object) return;
    if (!object.parent) {
        object.position.copy(worldPoint);
        return;
    }
    const local = object.parent.worldToLocal(worldPoint.clone());
    object.position.copy(local);
}

function setWorldQuaternion(object, worldQuaternion) {
    if (!object) return;
    if (!object.parent) {
        object.quaternion.copy(worldQuaternion);
        return;
    }
    const parentWorld = object.parent.getWorldQuaternion(new THREE.Quaternion());
    object.quaternion.copy(parentWorld.invert().multiply(worldQuaternion));
}

function visualCenterWorld(object) {
    if (!object) return new THREE.Vector3();
    const box = new THREE.Box3().setFromObject(object);
    if (!box.isEmpty()) return box.getCenter(new THREE.Vector3());
    return object.getWorldPosition(new THREE.Vector3());
}

function moveVisualCenterToWorld(object, desiredCenter) {
    if (!object) return;
    object.updateMatrixWorld(true);
    const currentCenter = visualCenterWorld(object);
    const rootWorld = object.getWorldPosition(new THREE.Vector3());
    const nextRootWorld = rootWorld.add(desiredCenter.clone().sub(currentCenter));
    setWorldPosition(object, nextRootWorld);
    object.updateMatrixWorld(true);
}

function objectContains(root, object) {
    let node = object;
    while (node) {
        if (node === root) return true;
        node = node.parent;
    }
    return false;
}

function isRenderableSceneHit(object) {
    if (!object || object.visible === false) return false;
    const name = object.name || "";
    if (name.startsWith("hit_") || name.startsWith("uv_visual_") || name.startsWith("secret_")) return false;
    if (object.userData?.ignoreRaycast) return false;
    return true;
}

function firstVisibleTableHit(event) {
    if (!tableRoot) return null;
    rayFromPointer(event);
    const hits = raycaster.intersectObject(tableRoot, true);
    return hits.find(hit => isRenderableSceneHit(hit.object)) || null;
}

function frontmostHitBelongsTo(event, root) {
    if (!root) return false;
    const hit = firstVisibleTableHit(event);
    return Boolean(hit && objectContains(root, hit.object));
}

function clampToTableSurface(point, padding = 0.22) {
    if (tableMoveBounds.isEmpty()) return point;
    point.x = THREE.MathUtils.clamp(point.x, tableMoveBounds.min.x + padding, tableMoveBounds.max.x - padding);
    point.y = THREE.MathUtils.clamp(point.y, tableMoveBounds.min.y + padding, tableMoveBounds.max.y - padding);
    return point;
}

function rememberUvHome() {
    if (!uvRoot) return;
    uvHome = {
        position: uvRoot.position.clone(),
        quaternion: uvRoot.quaternion.clone(),
        scale: uvRoot.scale.clone()
    };
}

function returnUvHome() {
    if (!uvRoot || !uvHome) return;
    uvRoot.position.copy(uvHome.position);
    uvRoot.quaternion.copy(uvHome.quaternion);
    uvRoot.scale.copy(uvHome.scale);
    uvRoot.visible = state.uvUnlocked;
    uvRoot.updateMatrixWorld(true);
}

function fitKeyFree(point) {
    if (!keyRoot) return;
    keyRoot.visible = true;
    moveVisualCenterToWorld(keyRoot, clampToTableSurface(point.clone()));
}

function fitDiscFree(point) {
    if (!discRoot) return;
    discRoot.visible = true;
    moveVisualCenterToWorld(discRoot, clampToTableSurface(point.clone()));
}

function makeDragPlaneForItem(item) {
    const root = rootForItem(item);
    const fallback = tableBounds.getCenter(new THREE.Vector3());
    fallback.z = tableSurfaceZ + 0.12;
    const anchor = root?.visible ? visualCenterWorld(root) : fallback;
    activeItemDragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), anchor);
}

function beginDrag(event) {
    if (event.button !== 0) return false;
    if (!state.equipped || !["key", "disc"].includes(state.equipped)) return false;

    const root = rootForItem(state.equipped);
    if (!root?.visible) return false;

    rayFromPointer(event);
    const hits = raycaster.intersectObject(root, true);
    if (!hits.length) return false;

    state.dragging = state.equipped;
    controls.enabled = false;
    makeDragPlaneForItem(state.dragging);
    dom.canvas.setPointerCapture?.(event.pointerId);

    const point = pointerOnPlane(event, activeItemDragPlane, new THREE.Vector3());
    if (point) {
        if (state.dragging === "key") fitKeyFree(point);
        if (state.dragging === "disc" && !state.discInserted) fitDiscFree(point);
    }
    return true;
}

function moveDrag(event) {
    if (!state.dragging) return;
    const point = pointerOnPlane(event, activeItemDragPlane, new THREE.Vector3());
    if (!point) return;
    state.pointerWorld.copy(point);

    if (state.dragging === "key") fitKeyFree(point);
    if (state.dragging === "disc" && !state.discInserted) fitDiscFree(point);
}

function finishDrop(dragged, point, event = null) {
    if (dragged === "key") {
        const nearDrawer = !state.drawerOpen && lockDrawer && event && screenDistanceToNode(event, lockDrawer) < 110;
        const nearCore = state.catchesSolved && !state.coreUnlocked && lockCore && event && screenDistanceToNode(event, lockCore) < 105;

        if (nearDrawer) {
            const snap = visualCenterWorld(lockDrawer);
            const lockQuat = lockDrawer.getWorldQuaternion(new THREE.Quaternion());
            setWorldQuaternion(keyRoot, lockQuat);
            moveVisualCenterToWorld(keyRoot, snap);
            if (drawerAssembly) drawerAssembly.attach(keyRoot);
            keyRoot.userData.lockedInDrawer = true;
            state.keyPlaced = true;
            dom.inventorySlots.find(slot => slot.dataset.item === "key")?.classList.add("locked");
            openDrawer();
            return true;
        }

        if (nearCore) {
            const snap = lockCore.getWorldPosition(new THREE.Vector3());
            fitKeyFree(snap);
            unlockCore();
            return true;
        }

        keyRoot.visible = true;
        return false;
    }

    if (dragged === "disc" && !state.discInserted) {
        const nearDisc = state.discSlotRevealed && discSlot && event && screenDistanceToNode(event, discSlot) < 125;
        if (nearDisc) {
            insertDisc();
            return true;
        }
        discRoot.visible = true;
        return false;
    }

    return false;
}

function endDrag(event) {
    if (!state.dragging) return;
    const dragged = state.dragging;
    const point = pointerOnPlane(event, activeItemDragPlane, new THREE.Vector3()) || state.pointerWorld.clone();
    state.dragging = null;
    controls.enabled = true;
    dom.canvas.releasePointerCapture?.(event.pointerId);
    finishDrop(dragged, point, event);
}

function draggableSceneEntries() {
    // V16: objetos de cenário são apenas inspecionáveis.
    // Somente chave e medalhão podem ser reposicionados sobre a mesa.
    return [
        ["key", state.drawerUnlocked ? null : keyRoot],
        ["disc", state.discInserted ? null : discRoot]
    ].filter(([, root]) => root && root.visible !== false && !root.userData?.lockedInDrawer);
}

function beginSurfacePointer(event) {
    if (event.button !== 0 || state.dragging) return false;
    const first = firstVisibleTableHit(event);
    if (!first) return false;

    const entry = draggableSceneEntries().find(([, root]) => objectContains(root, first.object));
    if (!entry) return false;

    const [kind, root] = entry;
    const center = visualCenterWorld(root);
    surfaceDrag.candidate = { kind, root, hitPoint: first.point.clone() };
    surfaceDrag.active = null;
    surfaceDrag.pointerId = event.pointerId;
    surfaceDrag.startX = event.clientX;
    surfaceDrag.startY = event.clientY;
    surfaceDrag.moved = false;
    surfaceDrag.offset.copy(center).sub(first.point);
    surfaceDrag.plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), first.point);
    controls.enabled = false;
    return true;
}

function moveSurfacePointer(event) {
    if (!surfaceDrag.candidate || surfaceDrag.pointerId !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - surfaceDrag.startX, event.clientY - surfaceDrag.startY);
    if (!surfaceDrag.active && moved < 5) return;

    if (!surfaceDrag.active) {
        surfaceDrag.active = surfaceDrag.candidate;
        surfaceDrag.moved = true;
        dom.canvas.setPointerCapture?.(event.pointerId);
    }

    const point = pointerOnPlane(event, surfaceDrag.plane, new THREE.Vector3());
    if (!point) return;
    const desiredCenter = clampToTableSurface(point.add(surfaceDrag.offset), 0.18);
    moveVisualCenterToWorld(surfaceDrag.active.root, desiredCenter);
}

function endSurfacePointer(event) {
    if (!surfaceDrag.candidate || surfaceDrag.pointerId !== event.pointerId) return;
    const active = surfaceDrag.active;
    const didMove = surfaceDrag.moved;

    if (didMove && active) {
        suppressNextSceneClick = true;
        if (active.kind === "key") finishDrop("key", visualCenterWorld(active.root), event);
        if (active.kind === "disc") finishDrop("disc", visualCenterWorld(active.root), event);
    }

    surfaceDrag.candidate = null;
    surfaceDrag.active = null;
    surfaceDrag.pointerId = null;
    surfaceDrag.moved = false;
    controls.enabled = true;
    dom.canvas.releasePointerCapture?.(event.pointerId);
}

function drawerFrontWasClicked(event) {
    if (!drawerAssembly) return false;
    rayFromPointer(event);
    const hits = raycaster.intersectObject(drawerAssembly, true).filter(hit => isRenderableSceneHit(hit.object));
    if (!hits.length) return false;
    const hit = hits[0];
    const box = new THREE.Box3().setFromObject(drawerAssembly);
    const size = box.getSize(new THREE.Vector3());
    const frontBand = Math.max(0.12, Math.min(0.5, size.y * 0.18));
    // A gaveta abre no sentido -Y; portanto a frente é o lado de menor Y.
    return hit.point.y <= box.min.y + frontBand;
}

function handleCanvasClick(event) {
    if (suppressNextSceneClick) { suppressNextSceneClick = false; return; }
    if (state.dragging || surfaceDrag.active) return;
    rayFromPointer(event);

    // Símbolos UV têm prioridade para não serem "engolidos" pelo controle,
    // BMO ou outros objetos que estejam logo atrás.
    if (uvSymbolHitTargets.length) {
        const symbolHits = raycaster.intersectObjects(uvSymbolHitTargets, true);
        let symbolKind = null;

        for (const hit of symbolHits) {
            let node = hit.object;
            while (node && !node.userData?.uvSymbolKind) node = node.parent;
            const kind = node?.userData?.uvSymbolKind;
            const entry = kind ? uvSymbols.get(kind) : null;
            if (entry && (entry.visual.userData.uvReveal || 0) >= 0.25) {
                symbolKind = kind;
                break;
            }
        }

        if (!symbolKind) symbolKind = closestRevealedUvSymbolFromPointer(event);
        if (symbolKind) {
            handleUvSymbolClick(symbolKind);
            return;
        }
    }

    if (controllerRoot && frontmostHitBelongsTo(event, controllerRoot)) {
        openControllerInspector();
        return;
    }

    if (photoRoot && frontmostHitBelongsTo(event, photoRoot)) {
        openPhotoInspector();
        return;
    }

    // Objetos afetivos/exploratórios.
    const sceneInspectables = [
        ["bmo", bmoRoot],
        ["totoro", totoroRoot],
        ["cookies", cookieRoot],
        ["d20", d20Root]
    ];
    for (const [kind, root] of sceneInspectables) {
        if (!root) continue;
        if (frontmostHitBelongsTo(event, root)) {
            openSceneObjectInspector(kind, root);
            return;
        }
    }

    // A lanterna passa a ser um objeto real da mesa depois de desbloqueada.
    if (state.uvUnlocked && uvRoot?.visible) {
        const uvHits = raycaster.intersectObject(uvRoot, true);
        if (uvHits.length) {
            equip("uv");
            return;
        }
    }

    // Chave e medalhão também são os objetos do GLB da mesa, não duplicatas.
    if (keyRoot?.visible && !state.drawerUnlocked) {
        if (frontmostHitBelongsTo(event, keyRoot)) {
            state.equipped = "key";
            updateInventoryCopy();
            toast("CHAVE SELECIONADA // ARRASTE ATÉ A FECHADURA", 1800);
            return;
        }
    }

    if (discRoot?.visible && !state.discInserted) {
        if (frontmostHitBelongsTo(event, discRoot)) {
            state.equipped = "disc";
            updateInventoryCopy();
            toast("MEDALHÃO SELECIONADO", 1200);
            return;
        }
    }

    // Papel ganha prioridade sobre a gaveta para poder ser relido sempre.
    if (fragmentClickable && state.drawerOpen) {
        const fragHits = raycaster.intersectObject(fragmentClickable, true);
        if (fragHits.length) {
            readFragment();
            return;
        }
    }

    if (drawerAssembly && state.drawerUnlocked && drawerFrontWasClicked(event)) {
        toggleDrawer();
        return;
    }

    const catchHits = raycaster.intersectObjects(catches, true);
    if (catchHits.length) {
        let node = catchHits[0].object;
        while (node && !node.name.startsWith("medallion_catch_")) node = node.parent;
        if (node) handleCatch(node);
    }
}

function animateMechanics(delta) {
    if (drawerAssembly?.userData.openTargetPosition) {
        const target = drawerAssembly.userData.openTargetPosition;
        drawerAssembly.position.x = THREE.MathUtils.damp(drawerAssembly.position.x, target.x, 5.5, delta);
        drawerAssembly.position.y = THREE.MathUtils.damp(drawerAssembly.position.y, target.y, 5.5, delta);
        drawerAssembly.position.z = THREE.MathUtils.damp(drawerAssembly.position.z, target.z, 5.5, delta);
    }

    if (corePanel && typeof corePanel.userData.openTargetX === "number") {
        corePanel.position.x = THREE.MathUtils.damp(corePanel.position.x, corePanel.userData.openTargetX, 5.5, delta);
    }

    updateCandleLight();
    transientEffects = transientEffects.filter(effect => effect.userData.animate?.() !== false);
}

function resize() {
    if (!renderer) return;
    const rect = dom.viewport.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function hideRaycastHitbox(node) {
    if (!node?.isMesh) return;
    node.userData.ignoreVisual = true;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.filter(Boolean).forEach(mat => {
        mat.transparent = true;
        mat.opacity = 0;
        mat.depthWrite = false;
        mat.colorWrite = false;
        mat.needsUpdate = true;
    });
}

function configureNewTable() {
    if (!tableRoot) return;

    // O GLB novo vem Y-up. O puzzle existente trabalha em Z-up, então
    // rotacionamos o conjunto inteiro sem alterar o arquivo/modelo original.
    tableRoot.rotation.x += Math.PI / 2;
    tableRoot.scale.setScalar(6.0);
    tableRoot.updateMatrixWorld(true);

    tableBounds.setFromObject(tableRoot);
    const deskBody = findNamed(tableRoot, "desk.001") || findNamed(tableRoot, "Table_17") || tableRoot;
    tableMoveBounds.setFromObject(deskBody);

    controllerRoot = findNamed(tableRoot, "controller");
    photoRoot = findNamed(tableRoot, "photo");
    keyRoot = findNamed(tableRoot, "key");
    discRoot = findNamed(tableRoot, "medalion");
    drawerAssembly = findNamed(tableRoot, "drawer_lock");
    fragmentRoot = findNamed(tableRoot, "paper_fragment");
    uvRoot = findNamed(tableRoot, "uv_flashlight");
    bmoRoot = findNamed(tableRoot, "bmo");
    totoroRoot = findNamed(tableRoot, "totoro");
    cookieRoot = findNamed(tableRoot, "cookie_jar");
    d20Root = findNamed(tableRoot, "d20");
    chairRoot = findNamed(tableRoot, "chair");
    candleRoot = findNamed(tableRoot, "Wax_8") || findNamed(tableRoot, "Candlestick_7");
    lockDrawer = findNamed(tableRoot, "hit_drawer_lock") || drawerAssembly;
    hideRaycastHitbox(lockDrawer);
    hideRaycastHitbox(findNamed(tableRoot, "hit_uv"));

    // Os quatro símbolos ficam deitados sobre a mesa. O SVG da casa veio com
    // orientação diferente; copiamos a orientação world-space do símbolo JOGO.
    const symbolGameNode = findNamed(tableRoot, "symbol_game");
    const symbolHouseNode = findNamed(tableRoot, "symbol_house");
    if (symbolGameNode && symbolHouseNode) {
        tableRoot.updateMatrixWorld(true);
        setWorldQuaternion(symbolHouseNode, symbolGameNode.getWorldQuaternion(new THREE.Quaternion()));
    }

    // Hitboxes do controle vêm do Blender e ficam presos ao próprio controle.
    controllerButtons = buildDualShockHitboxes(controllerRoot);

    const lockWorld = new THREE.Vector3();
    lockDrawer?.getWorldPosition(lockWorld);

    // A altura do tampo fica pouco acima do centro da fechadura da gaveta.
    tableSurfaceZ = lockDrawer ? lockWorld.z + 0.34 : tableBounds.max.z * 0.69;
    dragPlane.set(new THREE.Vector3(0, 0, 1), -tableSurfaceZ);

    // A frente da mesa aponta para -Y depois da conversão Y-up -> Z-up.
    // Calculamos o alvo em world-space e convertemos para o parent da gaveta.
    if (drawerAssembly?.parent) {
        drawerClosedTarget = drawerAssembly.position.clone();
        const startWorld = drawerAssembly.getWorldPosition(new THREE.Vector3());
        const targetWorld = startWorld.clone().add(new THREE.Vector3(0, -1.75, 0));
        drawerOpenTarget = drawerAssembly.parent.worldToLocal(targetWorld.clone());
    }
}

function frameWholeTable() {
    if (!tableRoot || !camera || !controls) return;
    const top = findNamed(tableRoot, "table_top");
    const box = top ? new THREE.Box3().setFromObject(top) : new THREE.Box3().setFromObject(tableRoot);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const target = new THREE.Vector3(center.x, center.y * 0.45, tableSurfaceZ + 0.75);
    const span = Math.max(size.x, size.y);
    const distance = Math.max(12.4, span * 1.08);

    camera.position.set(target.x, target.y - distance * 0.92, target.z + distance * 0.74);
    controls.target.copy(target);
    controls.minDistance = Math.max(0.72, span * 0.055);
    controls.maxDistance = Math.max(42, span * 3.8);
    controls.minPolarAngle = 0.14;
    controls.maxPolarAngle = Math.PI - 0.10;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.update();
}

function simplifyTableScene() {
    [
        "uv_lamp_housing",
        "secret_panel_control",
        "controller_dock",
        "medallion_slot",
        "core_cavity",
        "core_panel",
        "lock_core"
    ].forEach(name => {
        const node = findNamed(tableRoot, name);
        if (node) node.visible = false;
    });

    catches.forEach(node => node.visible = false);

    // O plate real vem do Blender. Criamos apenas um aro UV visual em cima dele.
    const socketVisual = findNamed(tableRoot, "disc_socket") || discSlot;
    const marker = new THREE.Mesh(
        new THREE.RingGeometry(0.62, 0.72, 64),
        new THREE.MeshBasicMaterial({
            color: 0xbba5ff,
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            toneMapped: false
        })
    );
    marker.name = "disc_drop_marker";
    marker.userData.ignoreRaycast = true;

    if (socketVisual) {
        const wp = socketVisual.getWorldPosition(new THREE.Vector3());
        const wq = socketVisual.getWorldQuaternion(new THREE.Quaternion());
        marker.position.copy(wp);
        marker.quaternion.copy(wq);
        marker.translateZ(0.025);
    } else {
        const tc = tableBounds.getCenter(new THREE.Vector3());
        marker.position.set(tc.x, tc.y, tableSurfaceZ + 0.03);
    }

    scene.add(marker);
    discSlotMarker = marker;
}

function renderInventoryThumbnail(source, { size = 180, target = 2.8 } = {}) {
    if (!source) return null;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1);
    r.setSize(size, size, false);
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.15;
    r.setClearColor(0x000000, 0);

    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
    cam.up.set(0, 0, 1);
    cam.position.set(3.2, -5.8, 3.2);
    cam.lookAt(0, 0, 0);

    const model = source.clone(true);
    cloneMaterialTree(model);
    model.visible = true;
    model.position.set(0, 0, 0);
    model.quaternion.identity();
    model.scale.set(1, 1, 1);
    model.traverse(node => {
        const n = (node.name || "").toLowerCase();
        if (n.startsWith("uv_") || n.startsWith("hit_")) node.visible = false;
    });
    normalizeObjectScale(model, target);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    sc.add(model);

    sc.add(new THREE.HemisphereLight(0xfff2dd, 0x241a20, 2.3));
    const key = new THREE.DirectionalLight(0xffddb4, 3.0);
    key.position.set(4, -4, 7);
    sc.add(key);
    const fill = new THREE.DirectionalLight(0x9aa9ff, 1.1);
    fill.position.set(-4, 2, 4);
    sc.add(fill);

    r.render(sc, cam);
    const url = canvas.toDataURL("image/png");
    r.dispose();
    model.traverse(node => {
        if (!node.isMesh) return;
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach(mat => mat?.dispose?.());
    });
    return url;
}

function updateInventoryThumbnails() {
    const sources = {
        disc: discRoot,
        key: keyRoot,
        uv: uvRoot
    };

    Object.entries(sources).forEach(([item, source]) => {
        const slot = dom.inventorySlots.find(entry => entry.dataset.item === item);
        const img = slot?.querySelector("img");
        if (!img || !source) return;
        const dataUrl = renderInventoryThumbnail(source, { target: item === "key" ? 2.35 : 2.8 });
        if (dataUrl) img.src = dataUrl;
    });
}

async function buildScene() {
    // Chave e medalhão agora pertencem ao próprio GLB da mesa. Isso elimina
    // duplicação e preserva exatamente as posições definidas no Blender.
    const assetUrls = [ASSETS.table, ASSETS.core];
    let loadedCount = 0;

    const loadTracked = async url => {
        const root = await loadGLB(url);
        loadedCount += 1;
        dom.loadingBar.style.width = `${Math.round((loadedCount / assetUrls.length) * 100)}%`;
        cloneMaterialTree(root);
        return root;
    };

    [tableRoot, coreRoot] = await Promise.all([
        loadTracked(ASSETS.table),
        loadTracked(ASSETS.core)
    ]);

    setMeshMaterialTuning(tableRoot, { env: 0.92, roughnessBias: 0.04 });
    setMeshMaterialTuning(coreRoot, { env: 1.08 });

    scene.add(tableRoot, coreRoot);

    configureNewTable();
    rememberUvHome();
    prepareEmbeddedController();
    configureUvSymbols();

    if (!controllerRoot) throw new Error('Objeto "controller" não encontrado em mesa_puzzle_v3.glb');
    if (!keyRoot) throw new Error('Objeto "key" não encontrado em mesa_puzzle_v3.glb');
    if (!discRoot) throw new Error('Objeto "medalion" não encontrado em mesa_puzzle_v3.glb');
    if (!drawerAssembly) throw new Error('Objeto "drawer_lock" não encontrado em mesa_puzzle_v3.glb');
    if (!lockDrawer) throw new Error('Objeto "hit_drawer_lock" não encontrado em mesa_puzzle_v3.glb');

    if (controllerRoot) setMeshMaterialTuning(controllerRoot, { env: 0.98, roughnessBias: 0.02 });
    if (photoRoot) setMeshMaterialTuning(photoRoot, { env: 0.45 });
    if (keyRoot) setMeshMaterialTuning(keyRoot, { env: 1.18, roughnessBias: -0.03 });
    if (discRoot) setMeshMaterialTuning(discRoot, { env: 1.15, roughnessBias: 0.02 });
    if (uvRoot) setMeshMaterialTuning(uvRoot, { env: 0.95 });
    if (fragmentRoot) setMeshMaterialTuning(fragmentRoot, { env: 0.5 });

    // Chave e medalhão começam exatamente onde foram posicionados no Blender.
    keyRoot.visible = true;
    discRoot.visible = true;
    coreRoot.visible = false;

    // A lanterna existe na cena, mas só fica visível após resolver o controle.
    if (uvRoot) uvRoot.visible = false;
    if (fragmentRoot) fragmentRoot.visible = true;

    lockCore = findNamed(tableRoot, "lock_core");
    discSlot = findNamed(tableRoot, "hit_disc_socket") || findNamed(tableRoot, "disc_socket");
    hideRaycastHitbox(findNamed(tableRoot, "hit_disc_socket"));
    corePanel = findNamed(tableRoot, "core_panel");
    drawerNodes = drawerAssembly ? [drawerAssembly] : [];
    catches = collectNamed(tableRoot, "medallion_catch_");
    fragmentClickable = fragmentRoot;

    simplifyTableScene();
    setupCandleLight();
    frameWholeTable();
    configureImportedUvTexts();
    createSecrets();
    if (localStorage.getItem("projetoNos_finalPuzzleSolved") === "true") {
        dom.finalReportBtn?.classList.remove("hidden");
    }
    updateInventoryThumbnails();
    dom.loading.classList.add("hidden");
}

async function ensurePhotoInspector() {
    if (photoInspectorReady) {
        resizePhotoInspector();
        return;
    }

    photoInspectScene = new THREE.Scene();
    photoInspectScene.background = new THREE.Color(0x080606);

    photoInspectCamera = new THREE.PerspectiveCamera(34, 1, 0.05, 40);
    photoInspectCamera.position.set(0, -0.15, 7.0);

    photoInspectRenderer = new THREE.WebGLRenderer({
        canvas: dom.photoInspectCanvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    photoInspectRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    photoInspectRenderer.outputColorSpace = THREE.SRGBColorSpace;
    photoInspectRenderer.toneMapping = THREE.NeutralToneMapping;
    photoInspectRenderer.toneMappingExposure = 1.0;

    photoInspectControls = new OrbitControls(photoInspectCamera, dom.photoInspectCanvas);
    photoInspectControls.enablePan = true;
    photoInspectControls.enableDamping = true;
    photoInspectControls.rotateSpeed = 0.85;
    photoInspectControls.zoomSpeed = 1.15;
    photoInspectControls.dampingFactor = 0.08;
    photoInspectControls.minDistance = 0.75;
    photoInspectControls.maxDistance = 18;
    photoInspectControls.target.set(0, 0, 0);
    photoInspectControls.minPolarAngle = 0.01;
    photoInspectControls.maxPolarAngle = Math.PI - 0.01;

    const ambient = new THREE.AmbientLight(0xffffff, 1.6);
    const key = new THREE.DirectionalLight(0xffead4, 2.2);
    key.position.set(3, 4, 6);
    photoInspectScene.add(ambient, key);

    if (!photoRoot) throw new Error('Objeto "photo" não encontrado na mesa integrada.');
    const model = photoRoot.clone(true);
    cloneMaterialTree(model);
    model.traverse(node => {
        if (!node.isMesh) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.filter(Boolean).forEach(mat => {
            if (mat.map) {
                mat.map.colorSpace = THREE.SRGBColorSpace;
                mat.map.needsUpdate = true;
            }
            if ("envMapIntensity" in mat) mat.envMapIntensity = 0.35;
            mat.needsUpdate = true;
        });
    });

    // Remove apenas a transformação usada para posicionar a foto na mesa.
    model.position.set(0, 0, 0);
    model.quaternion.identity();
    model.scale.set(1, 1, 1);
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 5.0 / maxDim;
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);

    // Usa o mesh frontal como referência: largura fica horizontal, altura vertical
    // e a face aponta para a câmera. Isso elimina o roll herdado do Blender.
    alignPlanarInspectionModel(model, "photo_front");
    model.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(model);
    const center = box2.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.updateMatrixWorld(true);

    photoInspectModel = model;
    photoInspectBaseQuaternion.copy(model.quaternion);
    photoBaseRotationY = 0;
    photoFlipTarget = 0;
    photoInspectScene.add(model);

    photoInspectorReady = true;
    resizePhotoInspector();
}

function resizePhotoInspector() {
    if (!photoInspectRenderer || !photoInspectCamera || !dom.photoInspectViewport) return;
    const rect = dom.photoInspectViewport.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    photoInspectRenderer.setSize(width, height, false);
    photoInspectCamera.aspect = width / height;
    photoInspectCamera.updateProjectionMatrix();
    
}

function resetPhotoInspectorView() {
    if (!photoInspectCamera || !photoInspectControls) return;
    photoFlipTarget = 0;
    const preset = INSPECTION_PRESETS.photo;
    if (photoInspectModel && preset) photoInspectModel.quaternion.set(...preset.quaternion).normalize();
    else if (photoInspectModel) photoInspectModel.quaternion.copy(photoInspectBaseQuaternion);
    photoInspectCamera.position.set(...(preset?.camera || [0, 0, 7.0]));
    photoInspectCamera.up.set(0, 1, 0);
    photoInspectControls.target.set(...(preset?.target || [0, 0, 0]));
    photoInspectControls.update();
}

async function openPhotoInspector() {
    dom.photoDialog.showModal();
    await ensurePhotoInspector();
    requestAnimationFrame(() => {
        resizePhotoInspector();
        resetPhotoInspectorView();
    });
}

function flipPhotoInspector() {
    if (!photoInspectModel) return;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    photoInspectModel.quaternion.multiply(q);
    if (!state.photoRead) {
        state.photoRead = true;
        toast("Quatro entradas estão legíveis.", 1900);
        logOnce("photo-read", "O verso da fotografia mostra quatro entradas; três continuam ilegíveis.");
    }
}

function updatePhotoInspector(delta) {
    if (!photoInspectorReady || !dom.photoDialog.open) return;
    photoInspectControls?.update();
    photoInspectRenderer?.render(photoInspectScene, photoInspectCamera);
}

async function ensureControllerInspector() {
    if (controllerInspectorReady) {
        resizeControllerInspector();
        return;
    }

    controllerInspectScene = new THREE.Scene();
    controllerInspectScene.background = new THREE.Color(0x070606);

    controllerInspectCamera = new THREE.PerspectiveCamera(34, 1, 0.05, 120);
    controllerInspectCamera.up.set(0, 0, 1);

    controllerInspectRenderer = new THREE.WebGLRenderer({
        canvas: dom.controllerInspectCanvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    controllerInspectRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    controllerInspectRenderer.outputColorSpace = THREE.SRGBColorSpace;
    controllerInspectRenderer.toneMapping = THREE.NeutralToneMapping;
    controllerInspectRenderer.toneMappingExposure = 1.24;

    controllerInspectControls = new OrbitControls(controllerInspectCamera, dom.controllerInspectCanvas);
    controllerInspectControls.enablePan = true;
    controllerInspectControls.enableDamping = true;
    controllerInspectControls.rotateSpeed = 0.82;
    controllerInspectControls.zoomSpeed = 1.12;
    controllerInspectControls.dampingFactor = 0.08;
    controllerInspectControls.minDistance = 0.85;
    controllerInspectControls.maxDistance = 28.0;
    controllerInspectControls.minPolarAngle = 0.01;
    controllerInspectControls.maxPolarAngle = Math.PI - 0.01;

    const ambient = new THREE.AmbientLight(0xffffff, 2.05);
    const key = new THREE.DirectionalLight(0xffedd8, 4.1);
    key.position.set(5, -7, 12);
    const fill = new THREE.DirectionalLight(0xb8c8ff, 1.9);
    fill.position.set(-5, -3, 7);
    const rim = new THREE.DirectionalLight(0xffc98e, 1.25);
    rim.position.set(-7, 6, 6);
    controllerInspectScene.add(ambient, key, fill, rim);

    if (!controllerRoot) throw new Error('Controle integrado não encontrado.');
    controllerInspectModel = controllerRoot.clone(true);
    cloneMaterialTree(controllerInspectModel);
    controllerInspectModel.position.set(0, 0, 0);
    controllerInspectModel.quaternion.identity();
    controllerInspectModel.scale.set(1, 1, 1);
    normalizeObjectScale(controllerInspectModel, 6.9);
    controllerInspectModel.updateMatrixWorld(true);

    // Alinha pela posição real dos botões. Assim o controle abre de frente,
    // independentemente da rotação usada para pousá-lo na mesa no Blender.
    alignControllerInspectionModel(controllerInspectModel);
    controllerInspectModel.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(controllerInspectModel);
    const center = box.getCenter(new THREE.Vector3());
    controllerInspectModel.position.sub(center);
    controllerInspectModel.updateMatrixWorld(true);
    controllerInspectBaseQuaternion.copy(controllerInspectModel.quaternion);

    controllerInspectButtons = buildDualShockHitboxes(controllerInspectModel);
    controllerInspectScene.add(controllerInspectModel);

    dom.controllerInspectCanvas.addEventListener("click", handleControllerInspectorClick);
    dom.controllerInspectCanvas.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;
        controllerInspectPointerDown = { x: event.clientX, y: event.clientY };
    });

    controllerInspectorReady = true;
    resetControllerInspectorView();
    resizeControllerInspector();
}

function resizeControllerInspector() {
    if (!controllerInspectRenderer || !controllerInspectCamera || !dom.controllerInspectViewport) return;
    const rect = dom.controllerInspectViewport.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    controllerInspectRenderer.setSize(width, height, false);
    controllerInspectCamera.aspect = width / height;
    controllerInspectCamera.updateProjectionMatrix();
    
}

function resetControllerInspectorView() {
    if (!controllerInspectCamera || !controllerInspectControls) return;
    const preset = INSPECTION_PRESETS.controller;
    if (controllerInspectModel && preset) controllerInspectModel.quaternion.set(...preset.quaternion).normalize();
    else if (controllerInspectModel) controllerInspectModel.quaternion.copy(controllerInspectBaseQuaternion);
    controllerInspectCamera.position.set(...(preset?.camera || [0, -10.4, 0.15]));
    controllerInspectCamera.up.set(0, 0, 1);
    controllerInspectControls.target.set(...(preset?.target || [0, 0, 0]));
    controllerInspectControls.update();
}

function updateControllerInspectSequence() {
    if (!dom.controllerInspectSequence) return;
    const tokens = state.controllerSequence.map(controllerTokenLabel);
    while (tokens.length < CONTROLLER_SOLUTION.length) tokens.push("—");
    dom.controllerInspectSequence.textContent = tokens.join("  ");
}

async function openControllerInspector() {
    await ensureControllerInspector();
    updateControllerInspectSequence();
    if (dom.controllerInspectHint) {
        dom.controllerInspectHint.textContent = state.controllerSolved
            ? "SEQUÊNCIA ACEITA // LANTERNA UV DISPONÍVEL NO INVENTÁRIO."
            : "Clique nos botões. Mouse gira/zoom. W/S inclina · A/D gira · Q/E rola · R alinha · Z/C zoom.";
    }
    dom.controllerDialog?.showModal();
    requestAnimationFrame(() => {
        resizeControllerInspector();
        resetControllerInspectorView();
    });
}

function handleControllerInspectorClick(event) {
    if (!controllerInspectModel || !controllerInspectCamera || !dom.controllerInspectCanvas) return;
    if (controllerInspectPointerDown) {
        const moved = Math.hypot(
            event.clientX - controllerInspectPointerDown.x,
            event.clientY - controllerInspectPointerDown.y
        );
        controllerInspectPointerDown = null;
        if (moved > 7) return;
    }
    const rect = dom.controllerInspectCanvas.getBoundingClientRect();
    controllerInspectMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    controllerInspectMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    controllerInspectRaycaster.setFromCamera(controllerInspectMouse, controllerInspectCamera);
    const hits = controllerInspectRaycaster.intersectObjects(controllerInspectButtons, true);
    if (!hits.length) return;

    let node = hits[0].object;
    while (node && !CONTROLLER_BUTTON_NAMES.has(node.name)) node = node.parent;
    if (!node) return;

    handleControllerButton(node);
    updateControllerInspectSequence();
}

async function ensureItemInspector() {
    if (itemInspectorReady) {
        resizeItemInspector();
        return;
    }

    itemInspectScene = new THREE.Scene();
    itemInspectScene.background = new THREE.Color(0x080606);
    itemInspectCamera = new THREE.PerspectiveCamera(34, 1, 0.05, 60);
    itemInspectCamera.position.set(0, -6.4, 3.2);
    itemInspectCamera.up.set(0, 0, 1);

    itemInspectRenderer = new THREE.WebGLRenderer({
        canvas: dom.itemInspectCanvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    itemInspectRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    itemInspectRenderer.outputColorSpace = THREE.SRGBColorSpace;
    itemInspectRenderer.toneMapping = THREE.NeutralToneMapping;
    itemInspectRenderer.toneMappingExposure = 1.08;

    itemInspectControls = new OrbitControls(itemInspectCamera, dom.itemInspectCanvas);
    itemInspectControls.enablePan = true;
    itemInspectControls.enableDamping = true;
    itemInspectControls.rotateSpeed = 0.82;
    itemInspectControls.zoomSpeed = 1.15;
    itemInspectControls.dampingFactor = 0.08;
    itemInspectControls.minDistance = 0.28;
    itemInspectControls.maxDistance = 18;
    itemInspectControls.target.set(0, 0, 0);
    itemInspectControls.minPolarAngle = 0.01;
    itemInspectControls.maxPolarAngle = Math.PI - 0.01;

    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    const key = new THREE.DirectionalLight(0xffe1bd, 2.5);
    key.position.set(4, -3, 7);
    const rim = new THREE.DirectionalLight(0x7e89b8, 1.2);
    rim.position.set(-4, 2, 3);
    itemInspectScene.add(ambient, key, rim);

    // UV independente para a inspeção. O feixe segue o ponto sob o mouse
    // e revela somente os meshes uv_* importados do Blender.
    itemInspectUvTarget = new THREE.Object3D();
    itemInspectUvTarget.position.set(0, 0, 0);
    itemInspectScene.add(itemInspectUvTarget);
    itemInspectUvSpot = new THREE.SpotLight(0x7357ff, 0, 18, Math.PI / 5.2, 0.58, 1.25);
    itemInspectUvSpot.position.set(0, -4.5, 4.8);
    itemInspectUvSpot.target = itemInspectUvTarget;
    itemInspectScene.add(itemInspectUvSpot);

    dom.itemInspectCanvas.addEventListener("pointermove", updateItemInspectionUvPointer);
    dom.itemInspectCanvas.addEventListener("pointerleave", () => {
        itemInspectUvHitPoint = null;
        updateItemInspectionUvVisibility();
    });

    itemInspectorReady = true;
    resizeItemInspector();
}

function inspectionUvCompanionNames(inspectKey) {
    const aliases = {
        bmo: ["uv_bmo"],
        totoro: ["uv_totoro"],
        cookies: ["uv_cookies", "uv_cookie"],
        d20: ["uv_d20"],
        disc: ["uv_medalion", "uv_medallion", "uv_disc"],
        key: ["uv_key"],
        uv: [],
        photo: ["uv_photo"]
    };
    return aliases[inspectKey] || [`uv_${inspectKey}`];
}

function attachExternalInspectionUvCompanions(model, source, inspectKey) {
    if (!model || !source || !tableRoot) return;
    source.updateMatrixWorld(true);
    tableRoot.updateMatrixWorld(true);
    const sourceInv = source.matrixWorld.clone().invert();
    const names = inspectionUvCompanionNames(inspectKey).map(name => name.toLowerCase());

    tableRoot.traverse(node => {
        if (!node.isMesh || objectContains(source, node)) return;
        const lower = (node.name || "").toLowerCase();
        if (!names.some(name => lower === name || lower.startsWith(`${name}.`) || lower.startsWith(`${name}_`))) return;

        const companion = node.clone(true);
        cloneMaterialTree(companion);
        companion.userData.inspectionUvCompanion = true;
        const relative = sourceInv.clone().multiply(node.matrixWorld);
        relative.decompose(companion.position, companion.quaternion, companion.scale);
        model.add(companion);
    });
}

function collectInspectionUvNodes() {
    itemInspectUvRevealNodes = [];
    itemInspectRoot?.traverse(node => {
        if (!node.isMesh) return;
        const name = (node.name || "").toLowerCase();
        if (!name.startsWith("uv_")) return;

        // Os textos uv_* da cena principal têm opacity = 0 até receberem o feixe.
        // Ao clonar um objeto para a inspeção essa opacidade vinha junto, então
        // uv_bmo podia ficar invisível mesmo com a lanterna ligada. Na inspeção
        // usamos visible para revelar/esconder e restauramos a opacidade do material.
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.filter(Boolean).forEach(mat => {
            mat.transparent = true;
            mat.opacity = 1;
            mat.depthWrite = false;
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
        });

        node.visible = false;
        node.userData.inspectionUvNode = true;
        itemInspectUvRevealNodes.push(node);
    });
}

function setItemInspectionUv(active) {
    itemInspectUvActive = Boolean(active && state.uvUnlocked);
    if (itemInspectUvSpot) itemInspectUvSpot.intensity = itemInspectUvActive ? 20 : 0;
    if (dom.toggleInspectUvBtn) {
        dom.toggleInspectUvBtn.classList.toggle("active", itemInspectUvActive);
        dom.toggleInspectUvBtn.textContent = itemInspectUvActive ? "[ UV: ON ]" : "[ LIGAR UV ]";
    }
    if (!itemInspectUvActive) itemInspectUvHitPoint = null;
    updateItemInspectionUvVisibility();
}

function updateItemInspectionUvPointer(event) {
    if (!itemInspectUvActive || !itemInspectRoot || !itemInspectCamera) return;
    const rect = dom.itemInspectCanvas.getBoundingClientRect();
    itemInspectUvPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    itemInspectUvPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    itemInspectUvRaycaster.setFromCamera(itemInspectUvPointer, itemInspectCamera);

    const hits = itemInspectUvRaycaster.intersectObject(itemInspectRoot, true)
        .filter(hit => !hit.object.userData?.inspectionUvNode && !hit.object.userData?.d20ResultMarker);
    if (!hits.length) {
        itemInspectUvHitPoint = null;
        updateItemInspectionUvVisibility();
        return;
    }

    itemInspectUvHitPoint = hits[0].point.clone();
    const cameraPos = itemInspectCamera.getWorldPosition(new THREE.Vector3());
    const dir = itemInspectUvHitPoint.clone().sub(cameraPos).normalize();
    const holder = cameraPos.clone().addScaledVector(dir, 0.75);
    itemInspectUvSpot.position.copy(holder);
    itemInspectUvTarget.position.copy(itemInspectUvHitPoint);
    itemInspectUvTarget.updateMatrixWorld(true);
    updateItemInspectionUvVisibility();
}

function updateItemInspectionUvVisibility() {
    if (!itemInspectUvRevealNodes.length) return;
    if (!itemInspectUvActive || !itemInspectUvHitPoint) {
        itemInspectUvRevealNodes.forEach(node => node.visible = false);
        return;
    }
    const modelBox = new THREE.Box3().setFromObject(itemInspectRoot);
    const radius = Math.max(0.42, modelBox.getSize(new THREE.Vector3()).length() * 0.22);
    itemInspectUvRevealNodes.forEach(node => {
        // Temporariamente liga para obter o bounding box real do texto.
        const previous = node.visible;
        node.visible = true;
        const box = new THREE.Box3().setFromObject(node);
        const center = box.isEmpty() ? node.getWorldPosition(new THREE.Vector3()) : box.getCenter(new THREE.Vector3());
        node.visible = previous;
        node.visible = center.distanceTo(itemInspectUvHitPoint) <= radius;
    });
}

function clearD20ResultMarker() {
    if (!d20ResultMarker) return;
    d20ResultMarker.parent?.remove(d20ResultMarker);
    d20ResultMarker.material?.map?.dispose?.();
    d20ResultMarker.material?.dispose?.();
    d20ResultMarker.geometry?.dispose?.();
    d20ResultMarker = null;
}

function createD20NumberTexture(value) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 512, 512);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 300px Georgia, serif";
    ctx.lineWidth = 34;
    ctx.strokeStyle = "rgba(25, 10, 4, .96)";
    ctx.fillStyle = "#f2cf72";
    ctx.shadowColor = "rgba(255, 196, 75, .55)";
    ctx.shadowBlur = 18;
    ctx.strokeText(String(value), 256, 276);
    ctx.fillText(String(value), 256, 276);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function placeD20ResultOnTopFace(value) {
    clearD20ResultMarker();
    if (!itemInspectRoot) return;
    itemInspectRoot.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(itemInspectRoot);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const ray = new THREE.Raycaster(
        new THREE.Vector3(center.x, center.y, box.max.z + Math.max(2, size.z)),
        new THREE.Vector3(0, 0, -1),
        0,
        Math.max(8, size.z * 4)
    );
    const hits = ray.intersectObject(itemInspectRoot, true).filter(hit => !hit.object.userData?.d20ResultMarker);
    if (!hits.length) return;
    const hit = hits[0];
    const normal = hit.face?.normal?.clone() || new THREE.Vector3(0, 0, 1);
    normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)).normalize();

    const texture = createD20NumberTexture(value);
    const faceSize = Math.max(0.38, Math.min(size.x, size.y, size.z) * 0.30);
    const marker = new THREE.Mesh(
        new THREE.PlaneGeometry(faceSize, faceSize),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })
    );
    marker.name = "d20_result_marker";
    marker.userData.d20ResultMarker = true;
    marker.position.copy(hit.point).addScaledVector(normal, 0.025);
    marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    itemInspectScene.add(marker);
    itemInspectRoot.attach(marker); // acompanha o dado se ele for girado depois.
    d20ResultMarker = marker;
}

function resizeItemInspector() {
    if (!itemInspectRenderer || !itemInspectCamera || !dom.itemInspectViewport) return;
    const rect = dom.itemInspectViewport.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    itemInspectRenderer.setSize(width, height, false);
    itemInspectCamera.aspect = width / height;
    itemInspectCamera.updateProjectionMatrix();
    
}

function resetItemInspectorView() {
    if (!itemInspectCamera || !itemInspectControls) return;
    const preset = INSPECTION_PRESETS[itemInspectKey];
    if (itemInspectRoot && preset?.quaternion) itemInspectRoot.quaternion.set(...preset.quaternion).normalize();
    else if (itemInspectRoot) itemInspectRoot.quaternion.copy(itemInspectBaseQuaternion);
    itemInspectCamera.position.set(...(preset?.camera || [0, -5.8, 3.0]));
    itemInspectCamera.up.set(0, 0, 1);
    itemInspectControls.target.set(...(preset?.target || [0, 0, 0]));
    itemInspectControls.update();
}

function prepareInspectionClone(source, targetSize = 4.0) {
    if (!source) return null;
    const model = source.clone(true);
    cloneMaterialTree(model);
    model.visible = true;

    // A inspeção não herda a inclinação usada para posicionar o item na mesa.
    // Usa a orientação nativa do asset; o usuário pode ajustar com WASD/QE.
    model.position.set(0, 0, 0);
    model.quaternion.identity();
    model.scale.set(1, 1, 1);
    normalizeObjectScale(model, targetSize);
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.updateMatrixWorld(true);
    return model;
}

async function showItemInspection(source, title, hint, inspectKey = "scene", targetSize = 4.0) {
    if (!source) return;
    await ensureItemInspector();

    if (itemInspectRoot) itemInspectScene.remove(itemInspectRoot);
    clearD20ResultMarker();
    itemInspectRoot = prepareInspectionClone(source, targetSize);
    itemInspectKey = inspectKey;
    attachExternalInspectionUvCompanions(itemInspectRoot, source, inspectKey);
    collectInspectionUvNodes();
    itemInspectBaseQuaternion.copy(itemInspectRoot.quaternion);
    itemInspectScene.add(itemInspectRoot);
    setItemInspectionUv(false);

    dom.itemDialogTitle.textContent = title;
    dom.itemDialogHint.textContent = hint;
    if (dom.rollD20Btn) {
        const isD20 = inspectKey === "d20";
        dom.rollD20Btn.classList.toggle("hidden", !isD20);
        dom.rollD20Btn.disabled = false;
    }
    if (dom.toggleInspectUvBtn) {
        dom.toggleInspectUvBtn.classList.toggle("hidden", !state.uvUnlocked);
        dom.toggleInspectUvBtn.disabled = !state.uvUnlocked;
        dom.toggleInspectUvBtn.textContent = "[ LIGAR UV ]";
    }
    dom.itemDialog.showModal();

    requestAnimationFrame(() => {
        resizeItemInspector();
        resetItemInspectorView();
    });
}

async function openItemInspector() {
    const key = state.equipped;
    if (!key || !["disc", "key", "uv"].includes(key)) return;
    if (key === "uv" && !state.uvUnlocked) return;

    const source = key === "disc" ? discRoot : key === "key" ? keyRoot : uvRoot;
    if (!source) return;

    const title = ITEM_COPY[key]?.[0] || "ITEM";
    const hint = "Mouse gira/zoom. W/S inclina · A/D gira · Q/E rola · Shift+WASD move · R alinha · Z/C zoom.";

    await showItemInspection(source, title, hint, key, key === "disc" ? 4.5 : 4.0);
}

function rollInspectedD20() {
    if (d20Rolling || itemInspectKey !== "d20" || !itemInspectRoot) return;
    d20Rolling = true;
    if (dom.rollD20Btn) dom.rollD20Btn.disabled = true;
    if (itemInspectControls) itemInspectControls.enabled = false;
    dom.itemDialogHint.textContent = "ROLANDO D20...";

    clearD20ResultMarker();
    const result = Math.floor(Math.random() * 20) + 1;
    const weirdMessages = [
        "O dado quicou numa trajetória que não parece aprovada pela física.",
        "A face escolhida parece ter discutido com a gravidade e vencido.",
        "O resultado foi registrado. O caminho até ele continua cientificamente suspeito.",
        "A rolagem terminou, mas o sistema se recusa a explicar como o dado parou desse jeito.",
        "Resultado válido. Movimento do dado: absolutamente questionável."
    ];
    const weirdMessage = weirdMessages[Math.floor(Math.random() * weirdMessages.length)];
    const start = performance.now();
    const duration = 1450;
    let last = start;
    const basePosition = itemInspectRoot.position.clone();

    const tick = now => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const t = Math.min(1, (now - start) / duration);
        const easeOut = 1 - Math.pow(1 - t, 3);
        const speed = (1 - easeOut * 0.86) * 18;
        itemInspectRoot.rotateX(dt * speed * 1.17);
        itemInspectRoot.rotateY(dt * speed * 0.91);
        itemInspectRoot.rotateZ(dt * speed * 1.29);
        itemInspectRoot.position.z = basePosition.z + Math.abs(Math.sin(t * Math.PI * 5)) * (1 - t) * 0.34;

        if (t < 1) {
            requestAnimationFrame(tick);
            return;
        }

        itemInspectRoot.position.copy(basePosition);
        itemInspectRoot.updateMatrixWorld(true);
        d20Rolling = false;
        if (dom.rollD20Btn) dom.rollD20Btn.disabled = false;
        if (itemInspectControls) itemInspectControls.enabled = true;
        dom.itemDialogHint.textContent = `RESULTADO: ${result} // ${weirdMessage}`;
    };
    requestAnimationFrame(tick);
}

async function openSceneObjectInspector(kind, source) {
    const copy = SCENE_INSPECT_COPY[kind];
    if (!copy || !source) return;
    await showItemInspection(source, copy[0], copy[1], kind, kind === "bmo" ? 4.2 : 4.0);
}

function storeEquippedItem() {
    const key = state.equipped;
    if (!key || !["disc", "key", "uv"].includes(key)) return;

    if (key === "key" && keyRoot) {
        keyRoot.visible = false;
        state.keyPlaced = false;
    }
    if (key === "disc" && discRoot) {
        discRoot.visible = false;
        state.discPlaced = false;
        state.discInserted = false;
        dom.inventorySlots.find(slot => slot.dataset.item === "disc")?.classList.remove("locked");
    }
    if (key === "uv" && uvRoot) {
        uvRoot.visible = false;
        state.uvPlaced = false;
        uvSpot.intensity = 0;
        secretMeshes.forEach(mesh => {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.filter(Boolean).forEach(mat => mat.opacity = 0);
        });
    }

    state.equipped = null;
    document.body.classList.remove("uv-active");
    updateInventoryCopy();
    toast("Item guardado no inventário.");
}

function updateUvPointer(event) {
    if (!(state.equipped === "uv" && state.uvUnlocked)) return;
    if (event.pointerType === "touch") {
        if (event.pointerId !== state.uvTouchPointerId) return;
    } else if (event.buttons !== 0 || state.uvTouchPointerId !== null) return;

    const current = uvRoot?.visible
        ? uvRoot.getWorldPosition(new THREE.Vector3())
        : tableBounds.getCenter(new THREE.Vector3()).setZ(tableSurfaceZ + 1.35);
    setPlaneFacingCameraThrough(uvMovePlane, current);
    const freePoint = pointerOnPlane(event, uvMovePlane, new THREE.Vector3());
    const tableHit = pointerOnSceneSurface(event, new THREE.Vector3());
    if (!freePoint || !tableHit) return;

    state.pointerWorld.copy(freePoint);
    fitUvAtCursor(freePoint, tableHit);
    updateSecrets(tableHit);
}

function beginUvTouch(event) {
    if (event.pointerType !== "touch" || state.equipped !== "uv" || !state.uvUnlocked) return false;
    if (state.uvTouchPointerId !== null) return true;
    state.uvTouchPointerId = event.pointerId;
    controls.enabled = false;
    dom.canvas.setPointerCapture?.(event.pointerId);
    updateUvPointer(event);
    return true;
}

function endUvTouch(event) {
    if (event.pointerId !== state.uvTouchPointerId) return false;
    if (event.type !== "pointercancel") updateUvPointer(event);
    state.uvTouchPointerId = null;
    controls.enabled = true;
    if (dom.canvas.hasPointerCapture?.(event.pointerId)) dom.canvas.releasePointerCapture(event.pointerId);
    return true;
}

function beginInventoryDrag(event, item) {
    if (!["key", "disc"].includes(item)) return;
    if (item === "uv" && !state.uvUnlocked) {
        event.preventDefault();
        toast("A lanterna ainda não respondeu.");
        return;
    }
    if (item === "disc" && state.discInserted) {
        event.preventDefault();
        return;
    }

    state.equipped = item;
    state.dragging = item;
    document.body.classList.toggle("uv-active", item === "uv");
    controls.enabled = false;
    makeDragPlaneForItem(item);
    updateInventoryCopy();
    event.dataTransfer?.setData("text/plain", item);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function dragInventoryOverScene(event) {
    if (!state.dragging || !["key", "disc", "uv"].includes(state.dragging)) return;
    event.preventDefault();
    if (!activeItemDragPlane.normal.lengthSq()) makeDragPlaneForItem(state.dragging);
    const point = pointerOnPlane(event, activeItemDragPlane, new THREE.Vector3());
    if (!point) return;
    state.pointerWorld.copy(point);

    if (state.dragging === "key") {
        state.keyPlaced = true;
        fitKeyFree(point);
    }
    if (state.dragging === "disc" && !state.discInserted) {
        state.discPlaced = true;
        fitDiscFree(point);
    }

}

function dropInventoryItem(event) {
    if (!state.dragging) return;
    event.preventDefault();
    const dragged = state.dragging;
    const point = pointerOnPlane(event, activeItemDragPlane, new THREE.Vector3()) || state.pointerWorld.clone();
    state.dragging = null;
    controls.enabled = true;
    finishDrop(dragged, point, event);
}

function cancelInventoryDrag() {
    if (!state.dragging) return;
    const dragged = state.dragging;
    state.dragging = null;
    controls.enabled = true;
    if (dragged === "key" && !state.keyPlaced) keyRoot.visible = false;
    if (dragged === "disc" && !state.discPlaced && !state.discInserted) discRoot.visible = false;

}

function findObjectInClone(root, name) {
    let found = null;
    root?.traverse(node => {
        if (!found && node.name === name) found = node;
    });
    return found;
}

function alignPlanarInspectionModel(model, childName) {
    const child = findObjectInClone(model, childName) || model;
    child.updateWorldMatrix(true, false);
    if (!child.geometry) return;
    child.geometry.computeBoundingBox();
    const bb = child.geometry.boundingBox;
    if (!bb) return;
    const dims = bb.getSize(new THREE.Vector3());
    const axes = [
        { key: "x", size: dims.x, v: new THREE.Vector3(1, 0, 0) },
        { key: "y", size: dims.y, v: new THREE.Vector3(0, 1, 0) },
        { key: "z", size: dims.z, v: new THREE.Vector3(0, 0, 1) }
    ].sort((a, b) => b.size - a.size);
    const widthLocal = axes[0].v.clone();
    const heightLocal = axes[1].v.clone();
    const qChild = child.getWorldQuaternion(new THREE.Quaternion());
    const width = widthLocal.applyQuaternion(qChild).normalize();
    const height = heightLocal.applyQuaternion(qChild).normalize();
    const normal = width.clone().cross(height).normalize();
    const sourceBasis = new THREE.Matrix4().makeBasis(width, height, normal);
    const targetBasis = new THREE.Matrix4().makeBasis(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1)
    );
    const rotation = targetBasis.clone().multiply(sourceBasis.clone().invert());
    model.quaternion.premultiply(new THREE.Quaternion().setFromRotationMatrix(rotation));
}

function alignControllerInspectionModel(model) {
    model.updateMatrixWorld(true);
    const triangle = findObjectInClone(model, "hit_triangle");
    const cross = findObjectInClone(model, "hit_x");
    const circle = findObjectInClone(model, "hit_circle");
    const square = findObjectInClone(model, "hit_square");
    if (!triangle || !cross || !circle || !square) return;
    const pTri = triangle.getWorldPosition(new THREE.Vector3());
    const pCross = cross.getWorldPosition(new THREE.Vector3());
    const pCircle = circle.getWorldPosition(new THREE.Vector3());
    const pSquare = square.getWorldPosition(new THREE.Vector3());
    const right = pCircle.clone().sub(pSquare).normalize();
    const up = pTri.clone().sub(pCross).normalize();
    const front = right.clone().cross(up).normalize();
    if (!Number.isFinite(front.lengthSq()) || front.lengthSq() < 0.5) return;

    const sourceBasis = new THREE.Matrix4().makeBasis(right, up, front);
    const targetBasis = new THREE.Matrix4().makeBasis(
        new THREE.Vector3(1, 0, 0),      // direita na tela
        new THREE.Vector3(0, 0, 1),      // topo na tela
        new THREE.Vector3(0, -1, 0)      // face voltada para a câmera
    );
    const rotation = targetBasis.clone().multiply(sourceBasis.clone().invert());
    model.quaternion.premultiply(new THREE.Quaternion().setFromRotationMatrix(rotation));
}

function rotateInspectionModel(model, cameraRef, mode, amount = THREE.MathUtils.degToRad(7)) {
    if (!model || !cameraRef) return;
    cameraRef.updateMatrixWorld(true);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.quaternion).normalize();
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cameraRef.quaternion).normalize();
    const forward = new THREE.Vector3();
    cameraRef.getWorldDirection(forward).normalize();
    let axis = up;
    let angle = amount;
    if (mode === "left") { axis = up; angle = amount; }
    if (mode === "right") { axis = up; angle = -amount; }
    if (mode === "up") { axis = right; angle = amount; }
    if (mode === "down") { axis = right; angle = -amount; }
    if (mode === "roll-left") { axis = forward; angle = amount; }
    if (mode === "roll-right") { axis = forward; angle = -amount; }
    const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    model.quaternion.premultiply(q);
}

function panInspection(cameraRef, controlsRef, dx, dy) {
    if (!cameraRef || !controlsRef) return;
    cameraRef.updateMatrixWorld(true);
    const distance = cameraRef.position.distanceTo(controlsRef.target);
    const scale = Math.max(0.02, distance * 0.035);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.quaternion).multiplyScalar(dx * scale);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cameraRef.quaternion).multiplyScalar(dy * scale);
    const delta = right.add(up);
    cameraRef.position.add(delta);
    controlsRef.target.add(delta);
    controlsRef.update();
}

function zoomInspection(cameraRef, controlsRef, factor) {
    if (!cameraRef || !controlsRef) return;
    const offset = cameraRef.position.clone().sub(controlsRef.target);
    const distance = offset.length();
    const min = controlsRef.minDistance || 0.15;
    const max = controlsRef.maxDistance || 30;
    const next = THREE.MathUtils.clamp(distance * factor, min, max);
    offset.setLength(next);
    cameraRef.position.copy(controlsRef.target).add(offset);
    controlsRef.update();
}

function openInspectorContext() {
    if (dom.controllerDialog?.open) return {
        model: controllerInspectModel, camera: controllerInspectCamera, controls: controllerInspectControls,
        reset: resetControllerInspectorView, flip: null
    };
    if (dom.photoDialog?.open) return {
        model: photoInspectModel, camera: photoInspectCamera, controls: photoInspectControls,
        reset: resetPhotoInspectorView, flip: flipPhotoInspector
    };
    if (dom.itemDialog?.open) return {
        model: itemInspectRoot, camera: itemInspectCamera, controls: itemInspectControls,
        reset: resetItemInspectorView, flip: null
    };
    return null;
}


function inspectorValuesElement() {
    if (dom.controllerDialog?.open) return document.querySelector('[data-inspect-values="controller"]');
    if (dom.photoDialog?.open) return document.querySelector('[data-inspect-values="photo"]');
    if (dom.itemDialog?.open) return document.querySelector('[data-inspect-values="item"]');
    return null;
}

function inspectorAlignmentSnapshot(ctx) {
    if (!ctx?.model || !ctx?.camera || !ctx?.controls) return null;
    const e = new THREE.Euler().setFromQuaternion(ctx.model.quaternion, 'XYZ');
    const deg = THREE.MathUtils.radToDeg;
    const distance = ctx.camera.position.distanceTo(ctx.controls.target);
    return {
        rotation: {
            x: +deg(e.x).toFixed(2),
            y: +deg(e.y).toFixed(2),
            z: +deg(e.z).toFixed(2)
        },
        quaternion: {
            x: +ctx.model.quaternion.x.toFixed(5),
            y: +ctx.model.quaternion.y.toFixed(5),
            z: +ctx.model.quaternion.z.toFixed(5),
            w: +ctx.model.quaternion.w.toFixed(5)
        },
        camera: {
            x: +ctx.camera.position.x.toFixed(3),
            y: +ctx.camera.position.y.toFixed(3),
            z: +ctx.camera.position.z.toFixed(3),
            zoomDistance: +distance.toFixed(3)
        },
        target: {
            x: +ctx.controls.target.x.toFixed(3),
            y: +ctx.controls.target.y.toFixed(3),
            z: +ctx.controls.target.z.toFixed(3)
        }
    };
}

function updateInspectorValues(forceVisible = false) {
    const ctx = openInspectorContext();
    const el = inspectorValuesElement();
    if (!ctx || !el) return;
    if (forceVisible) el.classList.add('visible');
    if (!el.classList.contains('visible')) return;
    const v = inspectorAlignmentSnapshot(ctx);
    if (!v) return;
    el.textContent = `ROT X ${v.rotation.x}°  Y ${v.rotation.y}°  Z ${v.rotation.z}°\n` +
        `QUAT ${v.quaternion.x}, ${v.quaternion.y}, ${v.quaternion.z}, ${v.quaternion.w}\n` +
        `CAM ${v.camera.x}, ${v.camera.y}, ${v.camera.z}  ZOOM ${v.camera.zoomDistance}\n` +
        `TARGET ${v.target.x}, ${v.target.y}, ${v.target.z}`;
}

function toggleInspectorValues() {
    const el = inspectorValuesElement();
    if (!el) return;
    el.classList.toggle('visible');
    updateInspectorValues();
}

function handleInspectorKeyboard(event) {
    const ctx = openInspectorContext();
    if (!ctx) return;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
    const key = event.key.toLowerCase();
    const rotateMap = { a: "left", d: "right", w: "up", s: "down", q: "roll-left", e: "roll-right" };
    if (event.shiftKey && ["w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
        const dirs = { a: [-1,0], d: [1,0], w: [0,1], s: [0,-1] };
        panInspection(ctx.camera, ctx.controls, ...dirs[key]);
        updateInspectorValues();
        return;
    }
    if (rotateMap[key]) {
        event.preventDefault();
        rotateInspectionModel(ctx.model, ctx.camera, rotateMap[key]);
        updateInspectorValues();
        return;
    }
    if (key === "z" || key === "c") {
        event.preventDefault();
        zoomInspection(ctx.camera, ctx.controls, key === "z" ? 0.88 : 1.14);
        updateInspectorValues();
        return;
    }
    if (key === "r") {
        event.preventDefault();
        ctx.reset?.();
        requestAnimationFrame(() => updateInspectorValues());
        return;
    }
    if (key === "p") {
        event.preventDefault();
        toggleInspectorValues();
        return;
    }
    if (key === "f" && ctx.flip) {
        event.preventDefault();
        ctx.flip();
    }
}

function nudgeInspectorCamera(cameraRef, controlsRef, direction) {
    if (!cameraRef || !controlsRef) return;
    const offset = cameraRef.position.clone().sub(controlsRef.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    const step = THREE.MathUtils.degToRad(12);
    if (direction === "left") spherical.theta -= step;
    if (direction === "right") spherical.theta += step;
    if (direction === "up") spherical.phi = Math.max(0.03, spherical.phi - step);
    if (direction === "down") spherical.phi = Math.min(Math.PI - 0.03, spherical.phi + step);
    offset.setFromSpherical(spherical);
    cameraRef.position.copy(controlsRef.target).add(offset);
    cameraRef.lookAt(controlsRef.target);
    controlsRef.update();
}

function bindOrbitPad(selector, modelGetter, cameraGetter) {
    document.querySelectorAll(`${selector} [data-orbit]`).forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            rotateInspectionModel(modelGetter(), cameraGetter(), button.dataset.orbit);
        });
    });
}

function bindUI() {
    dom.inventorySlots.forEach(slot => {
        const item = slot.dataset.item;
        if (["key", "disc"].includes(item)) {
            slot.draggable = true;
            slot.addEventListener("dragstart", event => beginInventoryDrag(event, item));
            slot.addEventListener("dragend", cancelInventoryDrag);
        }

        slot.addEventListener("click", () => {
            if (item === "photo") {
                openPhotoInspector();
                state.equipped = null;
                updateInventoryCopy();
                return;
            }
            equip(item);
        });
    });

    dom.toggleInventory.addEventListener("click", () => {
        const collapsed = dom.inventoryDock.classList.toggle("collapsed");
        dom.toggleInventory.setAttribute("aria-expanded", String(!collapsed));
        dom.toggleInventory.querySelector("b").textContent = collapsed ? "⌃" : "⌄";
    });

    dom.resetCameraBtn?.addEventListener("click", frameWholeTable);
    dom.toggleLog.addEventListener("click", () => dom.log.classList.toggle("hidden"));
    dom.closeLog.addEventListener("click", () => dom.log.classList.add("hidden"));

    dom.closePhoto.addEventListener("click", () => dom.photoDialog.close());
    dom.flipPhoto3D?.addEventListener("click", flipPhotoInspector);
    dom.closeFragment?.addEventListener("click", () => dom.fragmentDialog?.close());
    dom.canvas.addEventListener("pointerdown", event => {
        if (beginUvTouch(event)) return;
        beginSurfacePointer(event);
    }, { capture: true });
    dom.canvas.addEventListener("pointermove", event => {
        if (state.uvTouchPointerId !== null) return;
        moveSurfacePointer(event);
        moveDrag(event);
    });
    dom.canvas.addEventListener("pointerup", event => {
        if (endUvTouch(event)) return;
        endSurfacePointer(event);
        endDrag(event);
    });
    dom.canvas.addEventListener("pointercancel", event => {
        if (endUvTouch(event)) return;
        endSurfacePointer(event);
        endDrag(event);
    });
    dom.canvas.addEventListener("click", handleCanvasClick);

    dom.canvas.addEventListener("dragover", dragInventoryOverScene);
    dom.canvas.addEventListener("drop", dropInventoryItem);


    dom.closeControllerDialog?.addEventListener("click", () => dom.controllerDialog?.close());
    dom.resetControllerView?.addEventListener("click", resetControllerInspectorView);
    dom.inspectItemBtn?.addEventListener("click", openItemInspector);
    dom.storeItemBtn?.addEventListener("click", storeEquippedItem);
    dom.closeItemDialog?.addEventListener("click", () => {
        setItemInspectionUv(false);
        clearD20ResultMarker();
        dom.itemDialog?.close();
    });
    dom.resetItemView?.addEventListener("click", resetItemInspectorView);
    dom.toggleInspectUvBtn?.addEventListener("click", () => setItemInspectionUv(!itemInspectUvActive));
    dom.rollD20Btn?.addEventListener("click", rollInspectedD20);
    dom.canvas.addEventListener("pointermove", updateUvPointer);

    document.addEventListener("keydown", handleInspectorKeyboard);

    window.addEventListener("resize", () => {
        resize();
        resizePhotoInspector();
        resizeItemInspector();
        resizeControllerInspector();
    });
}

async function init() {
    if (!supportsWebGL()) {
        dom.loading.classList.add("hidden");
        dom.webglError.classList.remove("hidden");
        return;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070505);
    scene.fog = new THREE.FogExp2(0x090707, 0.012);

    camera = new THREE.PerspectiveCamera(42, 1, 0.05, 100);
    camera.up.set(0, 0, 1);
    camera.position.set(0, 13.5, 13.0);

    renderer = new THREE.WebGLRenderer({
        canvas: dom.canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -4.16);
    loader = new GLTFLoader();
    textureLoader = new THREE.TextureLoader();

    setupLighting();
    createRoom();

    controls = new OrbitControls(camera, dom.canvas);
    controls.target.set(0, 0, 3.45);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 1.65;
    controls.maxDistance = 45.0;
    controls.minPolarAngle = 0.14;
    controls.maxPolarAngle = Math.PI - 0.10;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.update();

    dom.uvSlot?.classList.add("hidden", "locked");
    dom.uvSlot.disabled = true;
    bindUI();
    updateInventoryCopy();
    resize();

    try {
        await buildScene();
        if (sessionStorage.getItem("projetoNos_puzzle_uvUnlocked") === "true") {
            state.controllerSolved = true;
            state.uvUnlocked = true;
            if (uvRoot) uvRoot.visible = true;
            revealUvInventorySlot();
            dom.controllerHud?.classList.add("hidden");
        }
    } catch (error) {
        console.error("[PUZZLE] Falha ao montar a cena:", error);
        dom.loading.classList.add("hidden");
        dom.webglError.classList.remove("hidden");
        dom.webglError.querySelector("strong").textContent = "ERRO DE ASSET";
        dom.webglError.querySelector("p").textContent = "Um dos modelos 3D não pôde ser carregado. Confira o console e os caminhos em assets/puzzle/models.";
    }

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(animationClock.getDelta(), 0.05);
    controls?.update();
    animateMechanics(delta);
    renderer?.render(scene, camera);
    updatePhotoInspector(delta);
    if (itemInspectorReady && dom.itemDialog?.open) {
        itemInspectControls?.update();
        if (itemInspectUvActive) updateItemInspectionUvVisibility();
        itemInspectRenderer?.render(itemInspectScene, itemInspectCamera);
    }
    if (controllerInspectorReady && dom.controllerDialog?.open) {
        controllerInspectControls?.update();
        controllerInspectRenderer?.render(controllerInspectScene, controllerInspectCamera);
    }
}

init();
