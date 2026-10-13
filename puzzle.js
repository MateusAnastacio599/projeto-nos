const DEBUG_MODE = new URLSearchParams(window.location.search).get("debug") === "1";

const itemState = {
    photo: DEBUG_MODE || localStorage.getItem("projetoNos_item_memories") === "true",
    medallion: DEBUG_MODE || localStorage.getItem("projetoNos_item_features") === "true",
    key: DEBUG_MODE || localStorage.getItem("projetoNos_item_failures") === "true"
};

const puzzleLocked = document.getElementById("puzzleLocked");
const puzzleReady = document.getElementById("puzzleReady");
const itemCounter = document.getElementById("puzzleItemCounter");
const missingItems = document.getElementById("missingItems");
const dialog = document.getElementById("inspectDialog");
const inspectVisual = document.getElementById("inspectVisual");
const inspectKicker = document.getElementById("inspectKicker");
const inspectTitle = document.getElementById("inspectTitle");
const inspectCopy = document.getElementById("inspectCopy");
const inspectMeta = document.getElementById("inspectMeta");
const inspectAction = document.getElementById("inspectAction");
const closeInspect = document.getElementById("closeInspect");
const threeStage = document.getElementById("threeStage");
const prototypeBox = document.getElementById("prototypeBox");

let medallionRotation = 0;
let photoBack = false;
let currentItem = null;
let inspectRotation = { x: 0, y: 0 };
let boxRotation = { x: 58, y: 0, z: -4 };

const ITEM_COPY = {
    photo: {
        kicker: "ITEM 01 / ORIGEM: MEMÓRIAS",
        title: "FOTOGRAFIA RECONSTRUÍDA",
        copy: "Uma memória visual que não deveria existir foi reconstruída. O verso apresenta marcas que ainda não foram decodificadas.",
        meta: "PROPRIEDADE: DOIS LADOS · FUNÇÃO PROVÁVEL: PISTA",
        action: "[ VIRAR FOTOGRAFIA ]"
    },
    medallion: {
        kicker: "ITEM 02 / ORIGEM: EXPERIÊNCIAS",
        title: "MEDALHÃO DE EXPERIÊNCIAS",
        copy: "Um disco circular com quatro símbolos recorrentes: jogo, café, companheiro e casa. O centro gira em posições discretas.",
        meta: "PROPRIEDADE: ROTACIONAL · FUNÇÃO PROVÁVEL: MECANISMO",
        action: "[ GIRAR DISCO ]"
    },
    key: {
        kicker: "ITEM 03 / ORIGEM: FALHAS",
        title: "CHAVE",
        copy: "Uma chave que parece ter sido fabricada incorretamente. Seus dentes não seguem um padrão normal, mas o núcleo a reconhece como válida.",
        meta: "PROPRIEDADE: IMPERFEITA · FUNÇÃO PROVÁVEL: ABERTURA",
        action: null
    }
};

function setupGate() {
    const entries = Object.entries(itemState);
    const count = entries.filter(([, value]) => value).length;
    itemCounter.textContent = `${count} / 3`;

    puzzleLocked.classList.add("hidden");
    puzzleReady.classList.add("hidden");

    if (count === 3) {
        puzzleReady.classList.remove("hidden");
        return;
    }

    puzzleLocked.classList.remove("hidden");
    const labels = {
        photo: "FOTOGRAFIA RECONSTRUÍDA",
        medallion: "MEDALHÃO DE EXPERIÊNCIAS",
        key: "CHAVE"
    };
    missingItems.innerHTML = entries
        .map(([key, value]) => `<div>${value ? "[OK]" : "[--]"} ${labels[key]}</div>`)
        .join("");
}

function openInspect(type) {
    const info = ITEM_COPY[type];
    if (!info) return;

    currentItem = type;
    photoBack = false;
    inspectRotation = { x: 0, y: 0 };

    inspectKicker.textContent = info.kicker;
    inspectTitle.textContent = info.title;
    inspectCopy.textContent = info.copy;
    inspectMeta.textContent = `${info.meta} · ARRASTE O OBJETO PARA INSPECIONAR`;
    inspectAction.classList.toggle("hidden", !info.action);
    inspectAction.textContent = info.action || "";
    inspectAction.dataset.item = type;
    renderVisual(type);
    dialog.showModal();
}

function objectTransform(extraZ = 0) {
    return `--inspect-rx:${inspectRotation.x}deg;--inspect-ry:${inspectRotation.y}deg;--inspect-rz:${extraZ}deg`;
}

function renderVisual(type) {
    if (type === "photo") {
        inspectVisual.innerHTML = photoBack
            ? `<img class="inspect-object inspect-photo-object back" style="${objectTransform(2)}" src="assets/itens/fotografia-verso.svg" alt="Verso da fotografia reconstruída">`
            : `<img class="inspect-object inspect-photo-object front" style="${objectTransform(-2)}" src="assets/imagens/memoria-001.jpg" alt="Fotografia reconstruída">`;
    }

    if (type === "medallion") {
        inspectVisual.innerHTML = `<img class="inspect-object inspect-medallion-object" style="${objectTransform(medallionRotation)}" src="assets/itens/medalhao-experiencias.svg" alt="Medalhão de experiências">`;
    }

    if (type === "key") {
        inspectVisual.innerHTML = `<img class="inspect-object inspect-key-object" style="${objectTransform(-6)}" src="assets/itens/chave-antiga.svg" alt="Chave">`;
    }
}

function attachDragRotation(surface, onMove, onReset) {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    surface.addEventListener("pointerdown", event => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        surface.classList.add("dragging");
        surface.setPointerCapture?.(event.pointerId);
    });

    surface.addEventListener("pointermove", event => {
        if (!dragging) return;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        onMove(dx, dy);
    });

    const end = event => {
        if (!dragging) return;
        dragging = false;
        surface.classList.remove("dragging");
        if (event?.pointerId != null) surface.releasePointerCapture?.(event.pointerId);
    };

    surface.addEventListener("pointerup", end);
    surface.addEventListener("pointercancel", end);
    surface.addEventListener("dblclick", () => onReset?.());
}

document.querySelectorAll(".puzzle-item").forEach(button => {
    button.addEventListener("click", () => openInspect(button.dataset.item));
});

inspectAction.addEventListener("click", () => {
    const type = inspectAction.dataset.item;
    if (type === "photo") {
        photoBack = !photoBack;
        inspectAction.textContent = photoBack ? "[ VER FRENTE ]" : "[ VIRAR FOTOGRAFIA ]";
        renderVisual(type);
    }
    if (type === "medallion") {
        medallionRotation = (medallionRotation + 90) % 360;
        renderVisual(type);
    }
});

attachDragRotation(
    inspectVisual,
    (dx, dy) => {
        if (!currentItem) return;
        inspectRotation.y += dx * 0.45;
        inspectRotation.x = Math.max(-55, Math.min(55, inspectRotation.x - dy * 0.35));
        renderVisual(currentItem);
    },
    () => {
        inspectRotation = { x: 0, y: 0 };
        if (currentItem) renderVisual(currentItem);
    }
);

attachDragRotation(
    threeStage,
    (dx, dy) => {
        boxRotation.y += dx * 0.35;
        boxRotation.x = Math.max(20, Math.min(78, boxRotation.x - dy * 0.25));
        prototypeBox.style.setProperty("--box-rx", `${boxRotation.x}deg`);
        prototypeBox.style.setProperty("--box-ry", `${boxRotation.y}deg`);
    },
    () => {
        boxRotation = { x: 58, y: 0, z: -4 };
        prototypeBox.style.setProperty("--box-rx", "58deg");
        prototypeBox.style.setProperty("--box-ry", "0deg");
        prototypeBox.style.setProperty("--box-rz", "-4deg");
    }
);

closeInspect.addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => { currentItem = null; });
dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
});

setupGate();

/* =========================================================
   LABORATÓRIO 3D — VISÍVEL SOMENTE EM ?debug=1
========================================================= */
const puzzleDevLabLink = document.getElementById("puzzleDevLabLink");
if (puzzleDevLabLink && DEBUG_MODE) {
    puzzleDevLabLink.classList.remove("hidden");
    puzzleDevLabLink.href = "puzzle-dev.html?debug=1";
}
