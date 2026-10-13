/* =========================================================
   PROJETO: NÓS — JS V4
   Estrutura modular + fluxo guiado + evolução visual
========================================================= */

/* =========================================================
   ELEMENTOS GERAIS
========================================================= */
const splash = document.getElementById("splash");
const systemScreen = document.getElementById("systemScreen");
const decryptScreen = document.getElementById("decryptScreen");
const homeScreen = document.getElementById("homeScreen");
const memoriesScreen = document.getElementById("memoriesScreen");
const featuresScreen = document.getElementById("featuresScreen");
const failuresScreen = document.getElementById("failuresScreen");
const reportScreen = document.getElementById("reportScreen");
const updateScreen = document.getElementById("updateScreen");
const glitchScreen = document.getElementById("glitchScreen");
const memoryScreen = document.getElementById("memoryScreen");
const readerScreen = document.getElementById("readerScreen");

const systemNav = document.getElementById("systemNav");
const navButtons = [...document.querySelectorAll(".module-nav-btn")];

const MODULE_SCREENS = {
    home: homeScreen,
    memories: memoriesScreen,
    features: featuresScreen,
    failures: failuresScreen,
    report: reportScreen,
    update: updateScreen
};

const MODULE_PHASES = {
    home: "cold",
    memories: "memory",
    features: "unlocking",
    failures: "corrupt",
    report: "human",
    update: "human"
};


/* Integração da carta: não exige editar o index.html atual. */
const NOS_BASE_URL = new URL(".", document.currentScript?.src || window.location.href);
// Registra a tipografia que o style.css original aplica ANTES de carregar esta camada.
function captureNosOriginalFont(selector, variable, fallbackSelector) {
    const el = document.querySelector(selector) || document.querySelector(fallbackSelector || selector);
    const family = el && window.getComputedStyle?.(el)?.fontFamily;
    if (family && family !== "inherit") document.documentElement.style.setProperty(variable, family);
}
function captureNosOriginalTypography() {
    const previousBodyClass = document.body.className;
    const stage = document.querySelector(".report-letter-stage");
    const previousStageClass = stage?.className;
    // Algumas fontes originais são aplicadas só durante a fase humana ou com a carta aberta.
    const disabledSheets = [...(document.styleSheets || [])].filter(sheet =>
        sheet.href?.includes("carta-futuro.css") && !sheet.disabled);
    try {
        disabledSheets.forEach(sheet => { sheet.disabled = true; });
        document.body.classList.remove("phase-cold", "phase-memory", "phase-unlocking", "phase-corrupt", "phase-update");
        document.body.classList.add("phase-human");
        stage?.classList.add("is-open");
        captureNosOriginalFont("#reportText", "--nos-letter-font", "#reportLetter");
        captureNosOriginalFont("#reportLetterSignature", "--nos-signature-font", "#reportLetter");
    } finally {
        document.body.className = previousBodyClass;
        if (stage) stage.className = previousStageClass;
        disabledSheets.forEach(sheet => { sheet.disabled = false; });
    }
}
captureNosOriginalTypography();

const nosStyles = document.createElement("link");
nosStyles.rel = "stylesheet";
nosStyles.href = new URL("carta-futuro.css?v=5", NOS_BASE_URL).href;
document.head.appendChild(nosStyles);
function prepareNosLetterMarkup() {
 if (reportScreen) {
  reportScreen.classList.add("nos-paper-screen");
  reportScreen.innerHTML = `<div class="terminal"><div class="nos-floaters" aria-hidden="true"></div><div class="report-letter-stage"><button id="reportEnvelope" class="nos-envelope" aria-label="Abrir a carta de seis anos"><span class="nos-envelope-flap"></span><span class="nos-envelope-label">para o amor da minha vida</span><span class="nos-envelope-seal" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></span><small>uma carta, seis anos de nós.<br>[ ABRIR CARTA ]</small></button><div class="nos-skip-bar" hidden><button id="skipReportLetter" class="nos-paper-button">[ EXIBIR CARTA COMPLETA ]</button></div><article id="reportLetter" class="nos-letter" aria-hidden="true"><header class="nos-letter-heading"><small>ARQUIVO PESSOAL / 12.10.2020 — 6 ANOS</small></header><div class="nos-letter-decoration" aria-hidden="true"></div><div class="nos-reading-copy"><div id="reportTextReserve" class="nos-copy-reserve" aria-hidden="true"></div><div id="reportText"></div></div><div id="reportLetterSignature" class="hidden">Com amor,<br>Mateusinho Colorado.</div><div id="reportLetterControls" class="hidden"><button id="aboutUpdateButton" class="nos-paper-button">[ SOBRE A ATUALIZAÇÃO → ]</button></div></article></div></div>`;
 }
 if (updateScreen) {
  updateScreen.classList.add("nos-paper-screen");
  updateScreen.innerHTML = `<div class="terminal"><div class="nos-floaters" aria-hidden="true"></div><article class="nos-update-paper"><header class="nos-letter-heading"><small>PROJETO: NÓS / UMA NOVA VERSÃO</small><h2>Só falta uma coisa.</h2></header><div class="nos-letter-decoration" aria-hidden="true"></div><div class="nos-reading-copy"><div id="updateTextReserve" class="nos-copy-reserve" aria-hidden="true"></div><div id="updateText"></div></div><div id="proposalWaiting" class="nos-waiting" hidden><span class="nos-cursor" aria-hidden="true"></span><div><button id="confirmProposalTouch" class="nos-paper-button nos-confirm-touch" aria-label="Registrar confirmação depois do pedido pessoalmente">[ RECEBI A CONFIRMAÇÃO ]</button></div></div><h2 id="proposalAcceptedTitle" class="nos-accepted-title" hidden>6.0 → Noivos.</h2><div id="proposalPixelArt" hidden></div><a id="openFutureButton" class="nos-paper-button nos-future-link" hidden>[ ABRIR NOVO ARQUIVO → ]</a></article></div>`;
 }
}
prepareNosLetterMarkup();

/* =========================================================
   PRÓLOGO
========================================================= */
const bootText = document.getElementById("bootText");
const bootProgress = document.getElementById("bootProgress");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const bootSkipButton = document.getElementById("bootSkipButton");

const dateInput = document.getElementById("dateInput");
const keyError = document.getElementById("keyError");

const decryptText = document.getElementById("decryptText");
const decryptFill = document.getElementById("decryptFill");
const decryptPercent = document.getElementById("decryptPercent");
const decryptBackButton = document.getElementById("decryptBackButton");
const decryptSkipButton = document.getElementById("decryptSkipButton");
const decryptContinueButton = document.getElementById("decryptContinueButton");

/* =========================================================
   MEMÓRIA 001
========================================================= */
const memoryBackButton = document.getElementById("memoryBackButton");
const memorySkipButton = document.getElementById("memorySkipButton");
const memoryNextButton = document.getElementById("memoryNextButton");

const memoryStep1 = document.getElementById("memoryStep1");
const memoryStep2 = document.getElementById("memoryStep2");
const memoryStep3 = document.getElementById("memoryStep3");
const memoryStep4 = document.getElementById("memoryStep4");
const memoryStep5 = document.getElementById("memoryStep5");
const memoryStep6 = document.getElementById("memoryStep6");
const memoryStep7 = document.getElementById("memoryStep7");
const memoryStep8 = document.getElementById("memoryStep8");

const subjectATitle = document.getElementById("subjectATitle");
const subjectBTitle = document.getElementById("subjectBTitle");
const memorySubjectsText = document.getElementById("memorySubjectsText");
const memoryBehaviorText = document.getElementById("memoryBehaviorText");
const memoryMotivationText = document.getElementById("memoryMotivationText");
const photoChoiceText = document.getElementById("photoChoiceText");
const photoAnalysisText = document.getElementById("photoAnalysisText");
const photoLoadText = document.getElementById("photoLoadText");
const photoLoadProgress = document.getElementById("photoLoadProgress");
const photoLoadFill = document.getElementById("photoLoadFill");
const photoLoadPercent = document.getElementById("photoLoadPercent");
const photoWarningText = document.getElementById("photoWarningText");
const memoryFinalText = document.getElementById("memoryFinalText");

const photoChoiceButtons = document.getElementById("photoChoiceButtons");
const photoContainer = document.getElementById("photoContainer");
const memoryPhoto = document.getElementById("memoryPhoto");
const showPhoto = document.getElementById("showPhoto");
const hidePhoto = document.getElementById("hidePhoto");

/* =========================================================
   LEITOR 002–006
========================================================= */
const readerTitle = document.getElementById("readerTitle");
const readerText = document.getElementById("readerText");
const readerContent = document.getElementById("readerContent");
const readerFxLayer = document.getElementById("readerFxLayer");
const readerStatus = document.getElementById("readerStatus");
const readerBackButton = document.getElementById("readerBackButton");
const readerSkipButton = document.getElementById("readerSkipButton");
const readerNextButton = document.getElementById("readerNextButton");

/* =========================================================
   PUZZLE
========================================================= */
const glitchLeadText = document.getElementById("glitchLeadText");
const glitchProtocolText = document.getElementById("glitchProtocolText");
const glitchQuestionCard = document.getElementById("glitchQuestionCard");
const glitchQuestionCounter = document.getElementById("glitchQuestionCounter");
const glitchQuestionText = document.getElementById("glitchQuestionText");
const glitchInputContainer = document.getElementById("glitchInputContainer");
const glitchInput = document.getElementById("glitchInput");
const glitchError = document.getElementById("glitchError");
const glitchBackButton = document.getElementById("glitchBackButton");
const glitchSkipButton = document.getElementById("glitchSkipButton");

/* =========================================================
   PÁGINAS / GALERIA
========================================================= */
const failuresText = document.getElementById("failuresText");
const failureCards = document.getElementById("failureCards");
const failureConclusion = document.getElementById("failureConclusion");
const failureStepControls = document.getElementById("failureStepControls");
const failureNextButton = document.getElementById("failureNextButton");
const failureRewardCard = document.getElementById("failureRewardCard");
const failureFinalPanel = document.getElementById("failureFinalPanel");
const failureReturnHome = document.getElementById("failureReturnHome");
const failurePageControls = document.getElementById("failurePageControls");
const reportText = document.getElementById("reportText");
const updateText = document.getElementById("updateText");
const memoryWall = document.getElementById("memoryWall");

const photoLightbox = document.getElementById("photoLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

const homeSystemStatus = document.getElementById("homeSystemStatus");
const homeMemoryCount = document.getElementById("homeMemoryCount");
const homeMemoryDetail = document.getElementById("homeMemoryDetail");
const homeIntegrity = document.getElementById("homeIntegrity");
const homeIntegrityDetail = document.getElementById("homeIntegrityDetail");
const homeState = document.getElementById("homeState");
const homeStateDetail = document.getElementById("homeStateDetail");
const memoryArchiveStatus = document.getElementById("memoryArchiveStatus");
const inventoryCounter = document.getElementById("inventoryCounter");
const finalPuzzleButton = document.getElementById("finalPuzzleButton");
const completeExperiencesButton = document.getElementById("completeExperiencesButton");
const completeFailuresButton = document.getElementById("completeFailuresButton");
const completeReportButton = document.getElementById("completeReportButton");
const reportLetterStage = document.querySelector(".report-letter-stage");
const reportEnvelope = document.getElementById("reportEnvelope");
const reportLetter = document.getElementById("reportLetter");
const reportLetterSignature = document.getElementById("reportLetterSignature");
const reportLetterControls = document.getElementById("reportLetterControls");

const moduleItemOverlay = document.getElementById("moduleItemOverlay");
const moduleItemKicker = document.getElementById("moduleItemKicker");
const moduleItemVisual = document.getElementById("moduleItemVisual");
const moduleItemTitle = document.getElementById("moduleItemTitle");
const moduleItemDescription = document.getElementById("moduleItemDescription");
const moduleItemMeta = document.getElementById("moduleItemMeta");
const storeModuleItemButton = document.getElementById("storeModuleItemButton");

const inventoryInspectOverlay = document.getElementById("inventoryInspectOverlay");
const inventoryInspectStage = document.getElementById("inventoryInspectStage");
const inventoryInspectKicker = document.getElementById("inventoryInspectKicker");
const inventoryInspectTitle = document.getElementById("inventoryInspectTitle");
const inventoryInspectCopy = document.getElementById("inventoryInspectCopy");
const inventoryInspectMeta = document.getElementById("inventoryInspectMeta");
const inventoryInspectAction = document.getElementById("inventoryInspectAction");
const closeInventoryInspect = document.getElementById("closeInventoryInspect");

/* =========================================================
   CONFIGURAÇÃO
========================================================= */
const DATA_CORRETA = "12/10/2020";

// O fluxo normal respeita todos os bloqueios.
// Para testar páginas futuras sem alterar progresso, abra o site com ?debug=1.
const DEBUG_MODE = new URLSearchParams(window.location.search).get("debug") === "1";

let currentModule = "home";
let currentPhase = "cold";

function getProgressState() {
    const highestUnlockedMemory = Math.max(
        1,
        Math.min(6, parseInt(localStorage.getItem("projetoNos_progress"), 10) || 1)
    );

    let completedMemories = Math.max(0, highestUnlockedMemory - 1);
    const memoriesComplete = localStorage.getItem("projetoNos_memoriesComplete") === "true";
    if (memoriesComplete) completedMemories = 6;

    const experiencesComplete = localStorage.getItem("projetoNos_experiencesComplete") === "true";
    const failuresComplete = localStorage.getItem("projetoNos_failuresComplete") === "true";
    const finalPuzzleSolved = localStorage.getItem("projetoNos_finalPuzzleSolved") === "true";
    const reportComplete = localStorage.getItem("projetoNos_reportComplete") === "true";

    let integrity = 18;
    const memoryIntegrity = [18, 27, 38, 49, 61, 70, 78];
    integrity = memoryIntegrity[completedMemories] ?? 18;
    if (experiencesComplete) integrity = Math.max(integrity, 86);
    if (failuresComplete) integrity = Math.max(integrity, 92);
    if (finalPuzzleSolved) integrity = Math.max(integrity, 97);
    if (reportComplete) integrity = 100;

    return {
        highestUnlockedMemory,
        completedMemories,
        memoriesComplete,
        experiencesComplete,
        failuresComplete,
        finalPuzzleSolved,
        reportComplete,
        integrity
    };
}

function getModuleAccess(moduleName) {
    if (DEBUG_MODE) return true;
    const state = getProgressState();

    return {
        home: true,
        memories: true,
        features: state.memoriesComplete,
        failures: state.experiencesComplete,
        report: state.finalPuzzleSolved,
        update: state.reportComplete
    }[moduleName] ?? false;
}

function getSystemStateCopy(state) {
    if (state.reportComplete) return {
        state: "SISTEMA ESTÁVEL",
        detail: "processo de recuperação concluído",
        integrityDetail: "nenhum dado pendente"
    };
    if (state.finalPuzzleSolved) return {
        state: "NÚCLEO ESTABILIZADO",
        detail: "o sistema reconhece o padrão principal",
        integrityDetail: "reconstrução quase concluída"
    };
    if (state.failuresComplete) return {
        state: "COLAPSO CONTROLADO",
        detail: "inconsistências incorporadas ao projeto",
        integrityDetail: "núcleo final ainda inacessível"
    };
    if (state.experiencesComplete) return {
        state: "PADRÕES RECONHECIDOS",
        detail: "hábitos e vínculos foram classificados",
        integrityDetail: "dados relacionais consolidados"
    };
    if (state.memoriesComplete) return {
        state: "ARQUIVO TEMPORAL RESTAURADO",
        detail: "novos padrões foram localizados fora das memórias",
        integrityDetail: "memórias principais reconstruídas"
    };
    if (state.completedMemories >= 4) return {
        state: "IDENTIDADE EMERGENTE",
        detail: "o sistema começa a abandonar classificações antigas",
        integrityDetail: "dados afetivos em alta densidade"
    };
    if (state.completedMemories >= 2) return {
        state: "PADRÕES DETECTADOS",
        detail: "novas conexões aparecem entre os registros",
        integrityDetail: "fragmentos relacionados entre si"
    };
    return {
        state: "EM RECUPERAÇÃO",
        detail: "o sistema ainda não sabe exatamente o que está lembrando",
        integrityDetail: "fragmentos afetivos detectados"
    };
}

/* =========================================================
   MOTOR DE TEXTO / PULAR / PAUSAS
========================================================= */
let typingInterval = null;
let typingResolve = null;
let isTyping = false;
let currentTypingElement = null;
let currentTypingText = "";

let isSkipping = false;
let activeDelayResolve = null;
let activeGlitchFinish = null;
let activeProgressFinish = null;

function delay(ms) {
    return new Promise((resolve) => {
        if (isSkipping) return resolve();

        const timeout = setTimeout(() => {
            activeDelayResolve = null;
            resolve();
        }, ms);

        activeDelayResolve = () => {
            clearTimeout(timeout);
            activeDelayResolve = null;
            resolve();
        };
    });
}

function stopTyping() {
    if (typingInterval) {
        clearTimeout(typingInterval);
        typingInterval = null;
    }

    isTyping = false;

    if (typingResolve) {
        const resolve = typingResolve;
        typingResolve = null;
        resolve();
    }
}

function forceFinishTyping() {
    if (isTyping && currentTypingElement) {
        currentTypingElement.textContent = currentTypingText;
        stopTyping();
    }
}

function getScrollContainer(element) {
    return element.closest(".nos-paper-screen") ||
           element.closest(".memory-content") ||
           element.closest(".workspace-content") ||
           element.closest(".terminal");
}

function typeText(element, text, speed = 25, append = false, options = {}) {
    stopTyping();
    return new Promise((resolve) => {
        if (!element) return resolve();
        const initialText = append ? element.textContent : "";
        const targetText = initialText + text;
        if (isSkipping && !options.human) {
            element.textContent = targetText;
            return resolve();
        }
        element.textContent = initialText;
        isTyping = true;
        currentTypingElement = element;
        currentTypingText = targetText;
        typingResolve = resolve;
        let index = 0;
        const step = () => {
            if (!isTyping || currentTypingElement !== element) return;
            const scrollContainer = getScrollContainer(element);
            const shouldFollow = scrollContainer &&
                scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;
            const char = text[index++];
            element.textContent = initialText + text.slice(0, index);
            if (scrollContainer && shouldFollow) scrollContainer.scrollTop = scrollContainer.scrollHeight;
            if (index >= text.length) { stopTyping(); return; }
            const pause = options.human
                ? ({ ".": 430, "!": 380, "?": 380, ",": 170, ":": 230, ";": 200, "\n": 240 }[char] || 0)
                : 0;
            typingInterval = setTimeout(step, speed + pause);
        };
        if (!text.length) { stopTyping(); return; }
        typingInterval = setTimeout(step, speed);
    });
}

function skipSequence() {
    isSkipping = true;
    forceFinishTyping();

    if (activeDelayResolve) activeDelayResolve();

    if (activeGlitchFinish) {
        const finish = activeGlitchFinish;
        activeGlitchFinish = null;
        finish();
    }

    if (activeProgressFinish) {
        const finish = activeProgressFinish;
        activeProgressFinish = null;
        finish();
    }
}

function cancelSequence() {
    skipSequence();
    isSkipping = false;
}

/* =========================================================
   PROGRESSO SEGURO — NUNCA PASSA DE 100%
========================================================= */
function animateProgressBar(fillElement, percentElement, options = {}) {
    const {
        intervalMs = 120,
        minStep = 1,
        maxStep = 4
    } = options;

    return new Promise((resolve) => {
        let progress = 0;
        let finished = false;

        const render = () => {
            const safe = Math.max(0, Math.min(100, Math.round(progress)));
            fillElement.style.width = `${safe}%`;
            percentElement.textContent = `${safe}%`;
        };

        const finish = () => {
            if (finished) return;
            finished = true;
            clearInterval(interval);
            progress = 100;
            render();
            if (activeProgressFinish === finish) activeProgressFinish = null;
            resolve();
        };

        const interval = setInterval(() => {
            if (isSkipping) {
                finish();
                return;
            }

            const step = Math.floor(Math.random() * (maxStep - minStep + 1)) + minStep;
            progress = Math.min(100, progress + step);
            render();

            if (progress >= 100) finish();
        }, intervalMs);

        activeProgressFinish = finish;
        render();
    });
}

/* =========================================================
   TROCA DE TELAS / MÓDULOS
========================================================= */
function showScreen(screen) {
    cancelSequence();

    document.querySelectorAll(".screen").forEach((item) => item.classList.remove("active"));
    screen.classList.add("active");

    const isModuleScreen = screen.classList.contains("module-screen");
    systemNav.classList.toggle("hidden", !isModuleScreen);

    configureAmbientEffects();
}

function setPhase(phase) {
    currentPhase = phase;
    document.body.classList.remove(
        "phase-cold",
        "phase-memory",
        "phase-unlocking",
        "phase-corrupt",
        "phase-human",
        "phase-update"
    );
    document.body.classList.add(`phase-${phase}`);
    configureAmbientEffects();
}

function updateModuleNav(moduleName) {
    navButtons.forEach((button) => {
        const target = button.dataset.module;
        const unlocked = getModuleAccess(target);
        button.classList.toggle("active", target === moduleName);
        button.classList.toggle("locked-module", !unlocked);
        button.disabled = !unlocked;
        button.setAttribute("aria-disabled", String(!unlocked));
    });
}


const EXPERIENCE_HUB_ORDER = ["jogos", "series", "comidas", "companheiros", "cantinho", "coisas"];

function getExperienceHubVisited() {
    try {
        const parsed = JSON.parse(localStorage.getItem("projetoNos_experienceVisited") || "[]");
        return new Set(Array.isArray(parsed) ? parsed.filter(id => EXPERIENCE_HUB_ORDER.includes(id)) : []);
    } catch {
        return new Set();
    }
}

function updateExperienceHubCards() {
    const cards = [...document.querySelectorAll("[data-experience-hub-card]")];
    if (!cards.length) return;

    const visited = getExperienceHubVisited();
    const moduleComplete =
        localStorage.getItem("projetoNos_experiencesComplete") === "true"
        || EXPERIENCE_HUB_ORDER.every(id => visited.has(id));
    const firstIncomplete = EXPERIENCE_HUB_ORDER.find(id => !visited.has(id));

    cards.forEach(card => {
        const id = card.dataset.experienceHubCard;
        const registered = visited.has(id);
        const available = moduleComplete || registered || id === firstIncomplete || DEBUG_MODE;
        const state = card.querySelector(".experience-hub-state");

        card.classList.toggle("progress-hidden", !available);
        card.classList.toggle("registered", registered);
        card.setAttribute("aria-hidden", String(!available));

        if (state) {
            state.textContent = registered
                ? "REGISTRADA"
                : (available ? "DISPONÍVEL" : "AGUARDANDO");
        }
    });

    const status = document.getElementById("experiencesStatus");
    if (status) status.textContent = `REGISTRADAS: ${visited.size} / 06`;
}

function refreshProgressUI() {
    const state = getProgressState();
    const copy = getSystemStateCopy(state);

    if (homeSystemStatus) homeSystemStatus.textContent = copy.state;
    if (homeMemoryCount) homeMemoryCount.textContent = `${String(state.completedMemories).padStart(2, "0")} / 06`;
    if (homeMemoryDetail) {
        homeMemoryDetail.textContent = state.memoriesComplete
            ? "arquivo temporal principal restaurado"
            : `${state.completedMemories} ${state.completedMemories === 1 ? "registro restaurado" : "registros restaurados"}`;
    }
    if (homeIntegrity) homeIntegrity.textContent = `${state.integrity}%`;
    if (homeIntegrityDetail) homeIntegrityDetail.textContent = copy.integrityDetail;
    if (homeState) homeState.textContent = copy.state;
    if (homeStateDetail) homeStateDetail.textContent = copy.detail;
    if (memoryArchiveStatus) memoryArchiveStatus.textContent = `RESTAURADAS: ${state.completedMemories} / 06`;

    const moduleState = {
        memories: {
            unlocked: true,
            complete: state.memoriesComplete,
            label: state.memoriesComplete ? "CONCLUÍDO" : "EM RECUPERAÇÃO"
        },
        features: {
            unlocked: getModuleAccess("features"),
            complete: state.experiencesComplete,
            label: state.experiencesComplete ? "CONCLUÍDO" : (getModuleAccess("features") ? "DISPONÍVEL" : "REQUISITO NÃO ATENDIDO")
        },
        failures: {
            unlocked: getModuleAccess("failures"),
            complete: state.failuresComplete,
            label: state.failuresComplete ? "CONCLUÍDO" : (getModuleAccess("failures") ? "DISPONÍVEL" : "REQUISITO NÃO ATENDIDO")
        },
        report: {
            unlocked: getModuleAccess("report"),
            complete: state.reportComplete,
            label: state.reportComplete ? "CONCLUÍDO" : (getModuleAccess("report") ? "DISPONÍVEL" : "ACESSO RESTRITO")
        },
        update: {
            unlocked: getModuleAccess("update"),
            complete: false,
            label: getModuleAccess("update") ? "ATUALIZAÇÃO DISPONÍVEL" : "DADOS INSUFICIENTES"
        }
    };

    document.querySelectorAll("[data-module-card]").forEach((card) => {
        const key = card.dataset.moduleCard;
        if (key === "initialization") return;
        const info = moduleState[key];
        if (!info) return;

        card.disabled = !info.unlocked;
        card.classList.toggle("module-locked", !info.unlocked);
        card.classList.toggle("module-complete", info.complete);
        card.setAttribute("aria-disabled", String(!info.unlocked));

        const label = card.querySelector(".module-status-label");
        if (label) label.textContent = info.label;
    });

    updateModuleNav(currentModule);
    updateMemoryCards();
    updateExperienceHubCards();
    buildMemoryWall(true);
    updateInventoryUI();
}

function showModule(moduleName) {
    const screen = MODULE_SCREENS[moduleName];
    if (!screen) return;
    pageRunId++;
    waitingProposalConfirmation = false;

    // A carta é uma experiência exclusiva do Relatório.
    // Ao sair dele, remove qualquer estado visual residual imediatamente.
    if (moduleName !== "report") {
        resetReportLetter();
        reportScreen?.classList.remove("active");
    }

    if (!getModuleAccess(moduleName)) {
        triggerSystemGlitch(false);
        return;
    }

    currentModule = moduleName;
    if (window.location.hash !== `#${moduleName}`) {
        history.replaceState(null, "", `#${moduleName}`);
    }
    setPhase(MODULE_PHASES[moduleName]);
    showScreen(screen);
    refreshProgressUI();

    if (moduleName === "memories") {
        triggerSystemGlitch(false);
    }


    if (moduleName === "failures") {
        playFailuresPage();
        triggerSystemGlitch(true);
    }

    if (moduleName === "report") playReportPage();
    if (moduleName === "update") playUpdatePage();
}

navButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (button.disabled) return;
        showModule(button.dataset.module);
    });
});

document.querySelectorAll("[data-go-module]").forEach((button) => {
    button.addEventListener("click", () => {
        if (button.disabled) return;
        showModule(button.dataset.goModule);
    });
});

/* =========================================================
   GLITCH AMBIENTE / RACHADURA / CAOS DE FUNDO
========================================================= */
const chaosOverlay = document.getElementById("chaosOverlay");
const screenCracks = document.getElementById("screenCracks");

let ambientTimer = null;
let chaosInterval = null;
let crackTimer = null;

const PHASE_EFFECTS = {
    cold:      { glitchMin: 0,    glitchMax: 0,    crackChance: 0,    chaosSpeed: 0 },
    memory:    { glitchMin: 6500, glitchMax: 11000, crackChance: 0.08, chaosSpeed: 2600 },
    unlocking: { glitchMin: 4200, glitchMax: 7600,  crackChance: 0.18, chaosSpeed: 1800 },
    corrupt:   { glitchMin: 2200, glitchMax: 4800,  crackChance: 0.42, chaosSpeed: 1050 },
    human:     { glitchMin: 0,    glitchMax: 0,     crackChance: 0,    chaosSpeed: 0 },
    update:    { glitchMin: 0,    glitchMax: 0,     crackChance: 0,    chaosSpeed: 0 }
};

const frasesCaos = [
    "te amo", "abroba", "boboca", "briga?", "Bó ficar de piguiça?",
    "11:11", "22:22", "eu que amo mais", "15 e 15",
    "casa cmg?", "bom dia", "mimi bem", "bochechas", "beijo no nariz",
    "arquivo afetivo detectado", "isso aqui virou nosso"
];

const imagensCaos = [
    { src: "assets/nois/IMG_20230910_181027.jpg", type: "foto" },
    { src: "assets/nois/IMG_20250718_201457.jpg", type: "foto" },
    { src: "assets/nois/foto1.jpg", type: "foto" },
    { src: "assets/nois/foto10.jpg", type: "foto" },
    { src: "assets/nois/foto2.webp", type: "foto" },
    { src: "assets/nois/foto3.jpg", type: "foto" },
    { src: "assets/nois/foto4.jpg", type: "foto" },
    { src: "assets/nois/foto5.jpg", type: "foto" },
    { src: "assets/nois/foto6.jpg", type: "foto" },
    { src: "assets/nois/foto7.jpg", type: "foto" },
    { src: "assets/nois/foto8.jpg", type: "foto" },
    { src: "assets/amora/5f4ffacf-376e-4b45-9b54-bc756f84066c.jpg", type: "foto" },
    { src: "assets/amora/671790098_18523702858075238_3481681728472858417_n.webp", type: "foto" },
    { src: "assets/amora/835e043d-00f2-4ec4-afb9-820222a85265.jpg", type: "foto" },
    { src: "assets/amora/ceddfaf7-d977-4665-be98-90cd84f9475c.jpg", type: "foto" },
    { src: "assets/zozoe/IMG_20211210_231617.jpg", type: "foto" },
    { src: "assets/zozoe/IMG_20211213_083224.jpg", type: "foto" },
    { src: "assets/zozoe/IMG_20220120_103548.jpg", type: "foto" },
    { src: "assets/zozoe/IMG_20220215_075334.jpg", type: "foto" },
    { src: "assets/zozoe/IMG_20220224_080829.jpg", type: "foto" },
    { src: "assets/zozoe/IMG_20220323_081934.jpg", type: "foto" },
    { src: "assets/zozoe/IMG_20220405_205757.jpg", type: "foto" },
    { src: "assets/zozoe/IMG_20220423_173544.jpg", type: "foto" },
    { src: "assets/zozoe/IMG_20220521_113809.jpg", type: "foto" },
    { src: "assets/origem/IMG_20201223_081608.jpg", type: "foto" },
    { src: "assets/origem/IMG_20201227_111719.jpg", type: "foto" },
    { src: "assets/origem/IMG_20201227_111833.jpg", type: "foto" },
    { src: "assets/origem/IMG_20210220_082630.jpg", type: "foto" },
    { src: "assets/origem/IMG_20210314_221407.jpg", type: "foto" },
    { src: "assets/origem/IMG_20210421_153741.jpg", type: "foto" },
    { src: "assets/origem/IMG_20210421_154303.jpg", type: "foto" },
    { src: "assets/origem/IMG_20210421_155318.jpg", type: "foto" },
    { src: "assets/origem/IMG_20210603_120714.jpg", type: "foto" },
    { src: "assets/origem/IMG_20220411_082723.jpg", type: "foto" },
    { src: "assets/chacha/IMG_20241209_120913.jpg", type: "foto" },
    { src: "assets/chacha/IMG_20250204_142620.jpg", type: "foto" },
    { src: "assets/chacha/IMG_20250214_101748.jpg", type: "foto" },
    { src: "assets/chacha/IMG_20250726_120010.jpg", type: "foto" },
    { src: "assets/chacha/IMG_20250819_121431.jpg", type: "foto" },
    { src: "assets/comidinhas/608239668_18499551235075238_2557246055249518200_n.webp", type: "foto" },
    { src: "assets/comidinhas/Captura de tela 2026-09-22 143610.png", type: "foto" },
    { src: "assets/comidinhas/IMG_20220120_202730.jpg", type: "foto" },
    { src: "assets/comidinhas/IMG_20220212_205042.jpg", type: "foto" },
    { src: "assets/comidinhas/IMG_20220702_185357.jpg", type: "foto" },
    { src: "assets/comidinhas/IMG_20220709_135051.jpg", type: "foto" },
    { src: "assets/comidinhas/IMG_20250204_152350.jpg", type: "foto" },
    { src: "assets/comidinhas/PXL_20230110_133440126.jpg", type: "foto" },
    { src: "assets/imagens/foto-nossa-2.jpg", type: "foto" },
    { src: "assets/imagens/zoe.jpg", type: "foto" },
    { src: "assets/imagens/amora.jpg", type: "foto" },
    { src: "assets/imagens/lagum.jpg", type: "foto" },
    { src: "assets/imagens/primeiroEncontro.jpg", type: "foto" },
    { src: "assets/imagens/relacionamentoCmg.jpg", type: "foto" },
    { src: "assets/imagens/memoria-001.jpg", type: "foto" },
    { src: "assets/imagens/d20.png", type: "transparente", motion: "roll" },
    { src: "assets/imagens/homem-aranha.png", type: "transparente", motion: "spin" }
];
let imagensCaosBag = [];

function refillMainChaosBag() {
    imagensCaosBag = [...imagensCaos];
    for (let i = imagensCaosBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [imagensCaosBag[i], imagensCaosBag[j]] = [imagensCaosBag[j], imagensCaosBag[i]];
    }
}

function nextMainChaosImage() {
    if (!imagensCaosBag.length) refillMainChaosBag();
    return imagensCaosBag.pop();
}

[
    "assets/imagens/rachadura-transparente.png",
    "assets/imagens/rachadura-animada.gif"
].forEach((src) => {
    const image = new Image();
    image.src = src;
});

function isModuleScreenActive() {
    const active = document.querySelector(".screen.active");
    return Boolean(active && active.classList.contains("module-screen"));
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clearAmbientTimer() {
    if (ambientTimer) {
        clearTimeout(ambientTimer);
        ambientTimer = null;
    }
}

function getEffectivePhaseConfig() {
    const base = { ...(PHASE_EFFECTS[currentPhase] || PHASE_EFFECTS.memory) };
    const state = getProgressState();

    // O caos não depende apenas da página: ele cresce conforme o sistema lembra.
    // No relatório e na atualização ele some de propósito, sinalizando estabilização.
    if (currentPhase === "human" || currentPhase === "update") return base;

    const level = Math.max(0, Math.min(1, state.integrity / 100));

    if (currentPhase === "cold" && state.completedMemories >= 2) {
        base.glitchMin = Math.round(11000 - (level * 4500));
        base.glitchMax = Math.round(16000 - (level * 6000));
        base.crackChance = 0.03 + level * 0.08;
        base.chaosSpeed = Math.round(4200 - (level * 1800));
    }

    if (currentPhase === "memory") {
        base.glitchMin = Math.max(3600, 9000 - state.completedMemories * 650);
        base.glitchMax = Math.max(6200, 13500 - state.completedMemories * 900);
        base.crackChance = 0.05 + state.completedMemories * 0.025;
        base.chaosSpeed = Math.max(1250, 3600 - state.completedMemories * 330);
    }

    if (currentPhase === "unlocking") {
        base.glitchMin = Math.max(2600, 6200 - Math.round(level * 2500));
        base.glitchMax = Math.max(4800, 9000 - Math.round(level * 3200));
        base.chaosSpeed = Math.max(1050, 2400 - Math.round(level * 950));
    }

    return base;
}

function configureAmbientEffects() {
    clearAmbientTimer();
    stopChaos();

    const config = getEffectivePhaseConfig();
    if (!config) return;

    // As imagens/frases ficam apenas no fundo das páginas principais.
    if (isModuleScreenActive() && config.chaosSpeed > 0) {
        startChaos(config.chaosSpeed);
    }

    if (config.glitchMin > 0) scheduleAmbientGlitch();
}

function scheduleAmbientGlitch() {
    clearAmbientTimer();
    const config = getEffectivePhaseConfig();
    if (!config || config.glitchMin <= 0) return;

    const wait = randomBetween(config.glitchMin, config.glitchMax);
    ambientTimer = setTimeout(() => {
        triggerSystemGlitch(false);
        scheduleAmbientGlitch();
    }, wait);
}

function triggerSystemGlitch(forceCrack = false) {
    document.body.classList.remove("system-glitch-active");
    void document.body.offsetWidth;
    document.body.classList.add("system-glitch-active");
    setTimeout(() => document.body.classList.remove("system-glitch-active"), 190);

    const config = getEffectivePhaseConfig();
    const state = getProgressState();

    // Conforme o sistema se lembra, os glitches deixam de ser apenas a rachadura.
    // São microfalhas curtas: slices horizontais, fragmentos de texto e um leve desalinhamento.
    if (currentPhase !== "human" && currentPhase !== "update") {
        const memoryLevel = Math.max(0, Math.min(1, state.completedMemories / 6));
        const relationalLevel = state.experiencesComplete ? 0.22 : 0;
        const failureLevel = state.failuresComplete ? 0.18 : 0;
        const severity = Math.min(1, 0.12 + memoryLevel * 0.56 + relationalLevel + failureLevel);
        triggerAmbientDigitalFault(severity, forceCrack);
    }

    if (forceCrack || Math.random() < config.crackChance) {
        triggerCrack(currentPhase === "corrupt" ? 0.28 : 0.16);
    }
}

const AMBIENT_FAULT_FRAGMENTS = [
    "MEMÓRIA RELACIONADA", "ÍNDICE DUPLICADO", "ARQUIVO AFETIVO", "DADO RECUPERADO",
    "PADRÃO DETECTADO", "VOCÊ JÁ ESTEVE AQUI", "ISSO ACONTECEU", "LEMBRANDO...",
    "FRAGMENTO VINCULADO", "NÃO DESCARTAR", "ARQUIVO INSTÁVEL"
];

function getAmbientFaultLayer() {
    let layer = document.getElementById("ambientDigitalFaults");
    if (layer) return layer;
    layer = document.createElement("div");
    layer.id = "ambientDigitalFaults";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    return layer;
}

function spawnAmbientFaultSlice(layer, severity) {
    const slice = document.createElement("i");
    slice.className = "ambient-fault-slice";
    slice.style.top = `${8 + Math.random() * 82}%`;
    slice.style.height = `${1 + Math.random() * (3 + severity * 7)}px`;
    slice.style.setProperty("--fault-shift", `${Math.round((Math.random() - 0.5) * (8 + severity * 28))}px`);
    slice.style.setProperty("--fault-alpha", `${0.06 + severity * 0.13}`);
    layer.appendChild(slice);
    setTimeout(() => slice.remove(), 280 + Math.random() * 260);
}

function spawnAmbientFaultFragment(layer, severity) {
    const fragment = document.createElement("span");
    fragment.className = "ambient-fault-fragment";
    fragment.textContent = AMBIENT_FAULT_FRAGMENTS[Math.floor(Math.random() * AMBIENT_FAULT_FRAGMENTS.length)];
    fragment.style.left = `${4 + Math.random() * 82}%`;
    fragment.style.top = `${7 + Math.random() * 80}%`;
    fragment.style.setProperty("--fault-fragment-alpha", `${0.10 + severity * 0.18}`);
    fragment.style.setProperty("--fault-r", `${-3 + Math.random() * 6}deg`);
    layer.appendChild(fragment);
    setTimeout(() => fragment.remove(), 520 + Math.random() * 520);
}

function triggerAmbientDigitalFault(severity = 0.2, forced = false) {
    // A memória 006 já possui seu próprio crash pesado; aqui evitamos competir com ele.
    if (currentGenericMemory === 6 && readerScreen.classList.contains("active")) return;

    const layer = getAmbientFaultLayer();
    const sliceCount = forced ? 2 + Math.round(severity * 4) : 1 + Math.round(severity * 2);
    for (let i = 0; i < sliceCount; i++) {
        setTimeout(() => spawnAmbientFaultSlice(layer, severity), i * 45);
    }

    if (Math.random() < 0.22 + severity * 0.48) {
        spawnAmbientFaultFragment(layer, severity);
    }

    if (severity > 0.34 && Math.random() < severity * 0.48) {
        document.body.classList.remove("system-micro-skew");
        void document.body.offsetWidth;
        document.body.classList.add("system-micro-skew");
        setTimeout(() => document.body.classList.remove("system-micro-skew"), 260 + severity * 170);
    }
}

function triggerCrack(opacity = 0.2) {
    if (crackTimer) clearTimeout(crackTimer);

    // Query string reinicia o GIF toda vez que uma rachadura é disparada.
    screenCracks.style.backgroundImage = `url("assets/imagens/rachadura-animada.gif?v=${Date.now()}")`;
    screenCracks.style.setProperty("--crack-opacity", opacity);
    screenCracks.classList.remove("active");
    void screenCracks.offsetWidth;
    screenCracks.classList.add("active");

    crackTimer = setTimeout(() => {
        screenCracks.classList.remove("active");
    }, 2200);
}

function startChaos(speed) {
    stopChaos(false);
    document.body.classList.add("chaos-visible");

    chaosInterval = setInterval(() => {
        if (!isModuleScreenActive()) return;
        if (chaosOverlay.querySelectorAll(".chaos-float").length >= 9) return;

        if (Math.random() > 0.48) spawnTextElement();
        else spawnImageElement();
    }, speed);
}

function stopChaos(clear = true) {
    if (chaosInterval) {
        clearInterval(chaosInterval);
        chaosInterval = null;
    }

    document.body.classList.remove("chaos-visible");
    if (clear) chaosOverlay.innerHTML = "";
}

function positionChaosElement(wrapper) {
    wrapper.style.left = `${Math.random() * 82 + 9}vw`;
    wrapper.style.top = `${Math.random() * 76 + 12}vh`;
}

function spawnTextElement() {
    const wrapper = document.createElement("div");
    wrapper.className = "chaos-float";
    positionChaosElement(wrapper);

    const text = document.createElement("div");
    text.className = "chaos-item";
    text.textContent = frasesCaos[Math.floor(Math.random() * frasesCaos.length)];
    text.style.fontSize = `${Math.random() * 1.0 + 0.9}rem`;

    wrapper.appendChild(text);
    chaosOverlay.appendChild(wrapper);
    setTimeout(() => wrapper.remove(), 5700);
}

function spawnImageElement() {
    const item = nextMainChaosImage();

    const wrapper = document.createElement("div");
    wrapper.className = "chaos-float";
    positionChaosElement(wrapper);

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = "";
    image.draggable = false;
    image.className = `chaos-img chaos-img-${item.type}`;

    if (item.motion === "roll") image.classList.add("chaos-motion-roll");
    if (item.motion === "spin") image.classList.add("chaos-motion-spin");

    image.style.width = item.type === "foto"
        ? `${Math.random() * 50 + 145}px`
        : `${Math.random() * 35 + 72}px`;

    image.addEventListener("error", () => wrapper.remove(), { once: true });

    wrapper.appendChild(image);
    chaosOverlay.appendChild(wrapper);
    setTimeout(() => wrapper.remove(), 5900);
}

/* =========================================================
   GLITCH DE TEXTO — SUJEITO B -> JUJUBA
========================================================= */
function applyGlitchEffect(element, finalWord) {
    return new Promise((resolve) => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
        let iterations = 0;
        let finished = false;

        const finish = () => {
            if (finished) return;
            finished = true;
            clearInterval(interval);
            element.textContent = finalWord;
            element.classList.remove("glitch-text");
            if (activeGlitchFinish === finish) activeGlitchFinish = null;
            resolve();
        };

        element.classList.add("glitch-text");

        const interval = setInterval(() => {
            if (isSkipping) {
                finish();
                return;
            }

            element.textContent = finalWord
                .split("")
                .map((letter, index) => {
                    if (index < iterations) return finalWord[index];
                    return letters[Math.floor(Math.random() * letters.length)];
                })
                .join("");

            if (iterations >= finalWord.length) {
                finish();
                return;
            }

            iterations += 1 / 3;
        }, 40);

        activeGlitchFinish = finish;
    });
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */
async function bootSystem() {
    const isUnlocked = localStorage.getItem("projetoNos_unlocked") === "true";
    updateMemoryCards();

    await typeText(
        bootText,
        "╔════════════════════════════════════════════╗\n║  N.O.S. — ARQUIVO DE MEMÓRIAS             ║\n║  SEQUÊNCIA DE INICIALIZAÇÃO               ║\n╚════════════════════════════════════════════╝\n\n",
        20
    );
    await delay(800);

    if (isUnlocked) {
        await typeText(
            bootText,
            "> SESSÃO ANTERIOR DETECTADA.\n> CREDENCIAIS VALIDADAS NO CACHE.\n\n> ACESSANDO PAINEL CENTRAL...\n",
            30,
            true
        );
        await delay(1100);
        showModule("home");
        return;
    }

    await typeText(bootText, "> INICIANDO SISTEMA............. [OK]\n", 30, true);
    await delay(300);
    await typeText(bootText, "> MÓDULO DE MEMÓRIA............. [OK]\n", 30, true);
    await delay(400);
    await typeText(bootText, "> BANCO DE DADOS TEMPORAL....... [OK]\n", 30, true);
    await delay(600);
    await typeText(bootText, "> RECONHECIMENTO DO USUÁRIO..... [FALHA]\n\n", 80, true);
    await delay(1200);

    await typeText(
        bootText,
        "> AVISO:\n> USUÁRIO PRINCIPAL NÃO IDENTIFICADO.\n\n> TENTANDO RECUPERAÇÃO...........\n",
        40,
        true
    );

    bootProgress.classList.remove("hidden");
    await animateProgressBar(progressFill, progressPercent, {
        intervalMs: 150,
        minStep: 1,
        maxStep: 4
    });

    await typeText(bootText, "\n> RECUPERAÇÃO CONCLUÍDA.\n", 30, true);
    await delay(900);

    showScreen(systemScreen);
    dateInput.focus();
}

bootSkipButton.addEventListener("click", skipSequence);

/* =========================================================
   CHAVE / MÁSCARA
========================================================= */
dateInput.addEventListener("input", () => {
    let value = dateInput.value.replace(/\D/g, "");
    if (value.length > 8) value = value.substring(0, 8);

    if (value.length >= 5) {
        value = `${value.substring(0, 2)}/${value.substring(2, 4)}/${value.substring(4)}`;
    } else if (value.length >= 3) {
        value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }

    dateInput.value = value;
});

dateInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    if (dateInput.value.trim() === DATA_CORRETA) {
        keyError.classList.add("hidden");
        startDecryption();
    } else {
        keyError.classList.remove("hidden");
        dateInput.value = "";
    }
});

/* =========================================================
   DESCRIPTOGRAFIA
========================================================= */
let decryptFinished = false;

async function startDecryption() {
    decryptFinished = false;
    setPhase("cold");
    showScreen(decryptScreen);
    decryptFill.style.width = "0%";
    decryptPercent.textContent = "0%";
    decryptContinueButton.classList.add("hidden");

    const fragments = `> CHAVE ACEITA.

> INICIANDO DESCRIPTOGRAFIA...

UMA VAN
12 ANOS ATRÁS
...
OLHOS CASTANHOS, E BOCHECHAS BRUTALMENTE APERTADAS

MEMÓRIA ENCONTRADA.
`;

    await typeText(decryptText, fragments, 80);
    if (!decryptScreen.classList.contains("active")) return;

    await animateProgressBar(decryptFill, decryptPercent, {
        intervalMs: 80,
        minStep: 2,
        maxStep: 2
    });

    if (!decryptScreen.classList.contains("active")) return;
    await finishDecryption();
}

async function finishDecryption() {
    if (decryptFinished) return;
    decryptFinished = true;

    await typeText(
        decryptText,
        "\n> DESCRIPTOGRAFIA CONCLUÍDA.\n\n> SEGMENTO DE MEMÓRIA RESTAURADO.\n\nBEM-VINDA DE VOLTA, JUJUBA.\n",
        30,
        true
    );

    decryptContinueButton.classList.remove("hidden");
}

decryptSkipButton.addEventListener("click", skipSequence);
decryptContinueButton.addEventListener("click", () => showMemory("onboarding"));
decryptBackButton.addEventListener("click", () => {
    showScreen(systemScreen);
    dateInput.focus();
});

/* =========================================================
   MEMÓRIA 001 — FLUXO GUIADO
========================================================= */
let memoryStep = 1;
let memoryRunId = 0;
let lastPhotoChoice = null;
let memoryEntryContext = "archive";

const memorySteps = [
    memoryStep1,
    memoryStep2,
    memoryStep3,
    memoryStep4,
    memoryStep5,
    memoryStep6,
    memoryStep7,
    memoryStep8
];

function isMemoryRunActive(runId, step) {
    return runId === memoryRunId &&
           step === memoryStep &&
           memoryScreen.classList.contains("active");
}

function showMemoryStep(step) {
    cancelSequence();
    memoryRunId++;

    memorySteps.forEach((element) => element.classList.add("hidden"));
    memorySteps[step - 1].classList.remove("hidden");
    memoryStep = step;

    memoryNextButton.textContent = step === 8
        ? (memoryEntryContext === "onboarding" ? "[ ACESSAR SISTEMA ]" : "[ VOLTAR ÀS MEMÓRIAS ]")
        : "[ CONTINUAR ]";

    if (step === 4 || step === 5 || step === 6) {
        memoryNextButton.classList.add("hidden");
    } else {
        memoryNextButton.classList.remove("hidden");
    }

    const content = memoryScreen.querySelector(".memory-content");
    if (content) content.scrollTop = 0;

    return memoryRunId;
}

async function enterMemoryStep(step) {
    const runId = showMemoryStep(step);

    if (step === 1) return playMemorySubjects(runId);
    if (step === 2) return playMemoryBehavior(runId);
    if (step === 3) return playMemoryMotivation(runId);
    if (step === 4) return playPhotoChoice(runId);
    if (step === 5) return playPhotoAnalysis(runId, lastPhotoChoice === "no");
    if (step === 6) return playPhotoReveal(runId);
    if (step === 7) return playPhotoWarning(runId);
    if (step === 8) return playMemoryFinal(runId);
}

async function showMemory(context = "archive") {
    memoryEntryContext = context;
    lastPhotoChoice = null;
    setPhase("memory");
    showScreen(memoryScreen);
    triggerSystemGlitch(false);
    await enterMemoryStep(1);
}

async function playMemorySubjects(runId) {
    subjectATitle.textContent = "SUJEITO A";
    subjectBTitle.textContent = "SUJEITO B";
    subjectBTitle.classList.remove("glitch-text");
    memorySubjectsText.textContent = "";

    // Tempo real de leitura dos cartões antes de qualquer transformação.
    await delay(2800);
    if (!isMemoryRunActive(runId, 1)) return;

    await applyGlitchEffect(subjectBTitle, "JUJUBA");
    if (!isMemoryRunActive(runId, 1)) return;

    await delay(1200);
    if (!isMemoryRunActive(runId, 1)) return;

    const text = `> COMPARANDO OS REGISTROS...

SUJEITO A E SUJEITO B:
INTERAÇÃO FREQUENTE.

STATUS DA RELAÇÃO:
AINDA NÃO CLASSIFICADO.
`;

    await typeText(memorySubjectsText, text, 48);
}

async function playMemoryBehavior(runId) {
    memoryBehaviorText.textContent = "";

    const text = `> ANALISANDO COMPORTAMENTO...

SUJEITO A demonstrou repetidas
tentativas de iniciar conversas
com o SUJEITO B.

TÓPICOS IDENTIFICADOS:

- aleatórios
- desnecessários
- completamente irrelevantes
- dragon city??

FINALIDADE:
DESCONHECIDA.
`;

    await typeText(memoryBehaviorText, text, 58);
    if (!isMemoryRunActive(runId, 2)) return;
}

async function playMemoryMotivation(runId) {
    memoryMotivationText.textContent = "";

    const text = `> ANÁLISE ADICIONAL...

SUJEITO A também demonstrou
repetidas interações físicas
com as bochechas do SUJEITO B.

FREQUÊNCIA: ALTA

RESPOSTA DO SUJEITO B:
NEGATIVA.

> MOTIVAÇÃO:
DESCONHECIDA.

> RECUPERANDO DADOS OCULTOS...
`;

    await typeText(memoryMotivationText, text, 45);
    if (!isMemoryRunActive(runId, 3)) return;

    await delay(900);
    if (!isMemoryRunActive(runId, 3)) return;

    await typeText(
        memoryMotivationText,
        "\n> MOTIVAÇÃO RECUPERADA.\n\nEle só queria uma desculpa\npara ficar perto dela.\n",
        38,
        true
    );
}

async function playPhotoChoice(runId) {
    photoChoiceText.textContent = "";
    photoChoiceButtons.classList.add("hidden");

    const text = `> MEMÓRIA VISUAL DISPONÍVEL.

ARQUIVO:
MEMÓRIA_001_VISUAL

STATUS:
RECUPERAÇÃO CONCLUÍDA.

> DESEJA EXIBIR A MEMÓRIA?
`;

    await typeText(photoChoiceText, text, 45);
    if (!isMemoryRunActive(runId, 4)) return;
    photoChoiceButtons.classList.remove("hidden");
}

showPhoto.addEventListener("click", () => {
    lastPhotoChoice = "yes";
    photoChoiceButtons.classList.add("hidden");
    enterMemoryStep(5);
});

hidePhoto.addEventListener("click", () => {
    lastPhotoChoice = "no";
    photoChoiceButtons.classList.add("hidden");
    enterMemoryStep(5);
});

async function playPhotoAnalysis(runId, choseNo) {
    photoAnalysisText.textContent = "";
    memoryNextButton.classList.add("hidden");

    if (choseNo) {
        await typeText(photoAnalysisText, "> COMANDO RECEBIDO:\nNÃO EXIBIR MEMÓRIA.\n\n> PROCESSANDO...\n", 45);
        if (!isMemoryRunActive(runId, 5)) return;
        await delay(1200);

        await typeText(photoAnalysisText, "\nO PROTOCOLO IDENTIFICOU UMA\nTENTATIVA DE NEGAR ACESSO À MEMÓRIA.\n", 50, true);
        if (!isMemoryRunActive(runId, 5)) return;
        await delay(1500);

        await typeText(photoAnalysisText, "\n> VERIFICANDO PERMISSÕES...\n", 60, true);
        if (!isMemoryRunActive(runId, 5)) return;
        await delay(1800);

        await typeText(photoAnalysisText, "\n> CORREÇÃO:\nPERMISSÃO NÃO FOI CONCEDIDA.", 60, true);
        if (!isMemoryRunActive(runId, 5)) return;
        await delay(1300);

        await typeText(photoAnalysisText, "\n\n> LIVRE-ARBÍTRIO:\nSIMULAÇÃO CONCLUÍDA COM SUCESSO.\n", 45, true);
        if (!isMemoryRunActive(runId, 5)) return;
        await delay(1000);
    } else {
        await typeText(photoAnalysisText, "> COMANDO RECEBIDO:\nEXIBIR MEMÓRIA.\n\n> PROCESSANDO...\n", 45);
        if (!isMemoryRunActive(runId, 5)) return;
        await delay(1000);
    }

    if (!isMemoryRunActive(runId, 5)) return;

    await typeText(photoAnalysisText, "\n> ANALISANDO ARQUIVO VISUAL...\n", 50, true);
    if (!isMemoryRunActive(runId, 5)) return;
    await delay(1500);

    await typeText(
        photoAnalysisText,
        "\nINCONSISTÊNCIA IDENTIFICADA.\n\nANÁLISE FACIAL:\nSUJEITO A ≠ SUJEITO A ATUAL\nSUJEITO B ≠ SUJEITO B ATUAL\n\nNÍVEL DE COMPATIBILIDADE:\n[██████████] 100%\n\nCONCLUSÃO:\nSÃO PESSOAS DIFERENTES.\n",
        60,
        true
    );

    if (!isMemoryRunActive(runId, 5)) return;
    await delay(700);

    memoryNextButton.textContent = "[ CARREGAR MEMÓRIA ]";
    memoryNextButton.classList.remove("hidden");
}

function ensureImageReady(image) {
    if (!image || image.complete) return Promise.resolve();

    return new Promise((resolve) => {
        const done = () => resolve();
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
    });
}

function scrollMemoryTo(element) {
    const container = memoryScreen.querySelector(".memory-content");
    if (!container || !element) return;

    requestAnimationFrame(() => {
        const top = Math.max(0, element.offsetTop - 18);
        container.scrollTo({ top, behavior: "smooth" });
    });
}

async function playPhotoReveal(runId) {
    photoLoadText.textContent = "";
    photoLoadProgress.classList.add("hidden");
    photoLoadFill.style.width = "0%";
    photoLoadPercent.textContent = "0%";
    photoContainer.classList.add("hidden");
    photoContainer.classList.remove("photo-reveal-active");
    memoryNextButton.classList.add("hidden");

    await typeText(
        photoLoadText,
        "> ACESSANDO MEMÓRIA VISUAL...\n\n> ARQUIVO PARCIALMENTE CORROMPIDO.\n> TENTANDO RECONSTRUÇÃO...\n",
        45
    );

    if (!isMemoryRunActive(runId, 6)) return;

    photoLoadProgress.classList.remove("hidden");
    const imageReady = ensureImageReady(memoryPhoto);

    await animateProgressBar(photoLoadFill, photoLoadPercent, {
        intervalMs: 90,
        minStep: 2,
        maxStep: 5
    });

    await imageReady;
    if (!isMemoryRunActive(runId, 6)) return;

    await typeText(
        photoLoadText,
        "\n> RECONSTRUÇÃO CONCLUÍDA.\n> EXIBINDO MEMÓRIA...\n",
        38,
        true
    );

    if (!isMemoryRunActive(runId, 6)) return;
    await delay(450);

    photoContainer.classList.remove("hidden");
    void photoContainer.offsetWidth;
    photoContainer.classList.add("photo-reveal-active");

    // A fotografia passa a ser o foco da etapa. O aviso NÃO começa sozinho.
    scrollMemoryTo(photoContainer);

    memoryNextButton.textContent = "[ CONTINUAR ]";
    memoryNextButton.classList.remove("hidden");
}

async function playPhotoWarning(runId) {
    photoWarningText.textContent = "";

    await typeText(
        photoWarningText,
        "> AVISO:\n\nNÃO EXISTEM REGISTROS VISUAIS\nDESTA FASE DO PROJETO.\n\nARQUIVO VISUAL FOI RECONSTRUÍDO\nCOM BASE EM DADOS DISPONÍVEIS.\n\nPRECISÃO HISTÓRICA:\nQUESTIONÁVEL.\n\nQUALIDADE DA INTENÇÃO:\n100%.\n\nPEDIMOS DESCULPAS PELO\nUSO DE INTELIGÊNCIA ARTIFICIAL.\n\nFOI POR UMA BOA CAUSA.\n",
        48
    );

    if (!isMemoryRunActive(runId, 7)) return;
}

async function playMemoryFinal(runId) {
    memoryFinalText.textContent = "";

    const text = `> MEMÓRIA #001:
RESTAURAÇÃO CONCLUÍDA.

> INTEGRIDADE DO ARQUIVO:
94%

> OBSERVAÇÃO:

ALGUNS DADOS FORAM PERDIDOS
COM O PASSAR DOS ANOS.

FOTOGRAFIAS.
CONVERSAS.
PEQUENOS MOMENTOS.

MAS UMA INFORMAÇÃO
PERMANECE INTACTA:

A HISTÓRIA COMEÇOU AQUI.
`;

    await typeText(memoryFinalText, text, 42);
    if (!isMemoryRunActive(runId, 8)) return;
}

memoryNextButton.addEventListener("click", async () => {
    if (isTyping || activeDelayResolve || activeGlitchFinish || activeProgressFinish) {
        skipSequence();
        return;
    }

    if (memoryStep < 8) {
        await enterMemoryStep(memoryStep + 1);
        return;
    }

    localStorage.setItem("projetoNos_unlocked", "true");
    const progress = parseInt(localStorage.getItem("projetoNos_progress")) || 1;
    localStorage.setItem("projetoNos_progress", String(Math.max(progress, 2)));
    updateMemoryCards();

    if (memoryEntryContext === "onboarding") showModule("home");
    else showModule("memories");
});

memoryBackButton.addEventListener("click", () => {
    if (memoryStep > 1) {
        enterMemoryStep(memoryStep - 1);
        return;
    }

    cancelSequence();
    memoryRunId++;

    if (localStorage.getItem("projetoNos_unlocked") === "true" || memoryEntryContext === "archive") {
        showModule("memories");
    } else {
        setPhase("cold");
        showScreen(decryptScreen);
    }
});

memorySkipButton.addEventListener("click", skipSequence);

/* =========================================================
   MEMÓRIAS 002–006
========================================================= */
const GENERIC_MEMORY_TITLES = {
    2: "PRIMEIRAS EVIDÊNCIAS",
    3: "PRIMEIRO ENCONTRO",
    4: "A RASTEIRA",
    5: "INCIDENTE DO BANHEIRO",
    6: "ARQUIVO 006"
};

const GENERIC_MEMORY_TEXTS = {
    2: `> COMPORTAMENTO OBSERVADO:

- Inventar assuntos completamente inúteis para conversar.
- Procurar qualquer oportunidade para sentar perto dela.
- Perturbar a paciente deliberadamente.
- Apertar suas bochechas mesmo após múltiplas ameaças de violência.

> CONCLUSÃO:
O indivíduo aparentemente estava apaixonado.
Ele só ainda não tinha maturidade suficiente para perceber.

> LINGUAGENS DO AMOR IDENTIFICADAS:
Ele: Atos de perturbação.
Ela: Tempo de qualidade.

Curiosamente, o sistema funcionou.
`,
    3: `> EVENTO HISTÓRICO #001
Primeiro encontro.

LOCAL: Uma igreja.
CONTEXTO: Ela era ateia.
CONTEXTO ADICIONAL: Ele também não queria estar lá.

> MOTIVO PELO QUAL ELE FOI:
Por ser obrigado ;/ mas a vontade verdadeira era por ela.

Enquanto ela olhava para ele toda apaixonada, ele estava ocupado pensando no quanto ele queria beijar aquela garota:
E assim começou possívelmente o "primeiro encontro" mais estranho de um relacionamento.
`,
    4: `> EVENTO HISTÓRICO #002
No primeiro beijo.

Ele aplicou uma rasteira nela. Ela sobreviveu.
O relacionamento também.

> TEORIA NÃO COMPROVADA:
Aquela rasteira foi, na verdade, o evento responsável por ela finalmente perceber que gostava dele.

TEORIA ACEITA PELO AUTOR DESTE DOCUMENTO.

EVIDÊNCIAS CIENTÍFICAS: sim.
`,
    5: `> EVENTO HISTÓRICO #003
Primeira visita à casa dela.

O indivíduo apresentou um quadro gastrointestinal inesperado.
O incidente resultou em:

- 1 banheiro.
- 1 vaso sanitário.
- 1 cocô.

Apesar deste acontecimento traumático, ela decidiu continuar o relacionamento.
Evidência definitiva de que ela realmente o ama.

> NOTA DO SISTEMA:
Se depois disso você ainda ficou comigo, acho que posso confiar que é amor verdadeiro.
`,
    6: `> ARQUIVO TEMPORAL #006

INICIANDO CATALOGAÇÃO DO REGISTRO.

> FONTES DETECTADAS:
viagens / jogos / séries / comidas / bichinhos / piadas / planos / fotografias
`
};

let currentGenericMemory = 2;
let readerRunId = 0;
let memory6Timers = [];
let memory6FinalSequence = 0;
let memory6Intervals = [];

const MEMORY6_FRAGMENT_WORDS = [
    "Floripa", "São Paulo", "BGS", "Celso Portiolli", "Amora", "Zoe", "Charlie",
    "videogame novo", "faculdades terminadas", "só mais um episódio", "comidas", "jogos",
    "viagens", "fotos", "piadas", "igreja", "van", "banheiro", "bochechas",
    "nosso cantinho", "Tour", "11:11", "cachorrinhos", "gatinhos", "coisas nossas",
    "madrugadas", "receitas", "cafés", "planos", "formatura", "casa", "nós"
];

function clearMemory6Effects() {
    memory6Timers.forEach((timer) => clearTimeout(timer));
    memory6Intervals.forEach((timer) => clearInterval(timer));
    memory6Timers = [];
    memory6Intervals = [];
    readerFxLayer.innerHTML = "";
    readerText.classList.remove("reader-corrupting", "reader-crash-complete", "reader-text-split");
    readerContent.classList.remove("reader-content-overloaded", "reader-content-crashed");
    document.body.classList.remove("memory6-global-crash", "memory6-blackout", "memory6-rebooting");
    readerScreen.classList.remove("memory6-screen-crash");
    const terminal = readerScreen.querySelector('.memory-terminal');
    terminal?.classList.remove("memory-overload", "memory-tilt", "memory-stabilized", "memory-critical", "memory-dead");
    if (readerStatus) readerStatus.textContent = 'STATUS: RESTAURADO';
    if (activeGlitchFinish && activeGlitchFinish.__memory6) activeGlitchFinish = null;
}

function queueMemory6(callback, ms) {
    const timer = setTimeout(callback, ms);
    memory6Timers.push(timer);
    return timer;
}

function memory6Interval(callback, ms) {
    const timer = setInterval(callback, ms);
    memory6Intervals.push(timer);
    return timer;
}

function spawnReaderFxWord(word, options = {}) {
    if (!readerFxLayer) return;
    const el = document.createElement('span');
    const x = options.x ?? (4 + Math.random() * 92);
    const y = options.y ?? (6 + Math.random() * 86);
    const rot = options.rot ?? (-28 + Math.random() * 56);
    const scale = options.scale ?? (0.75 + Math.random() * 1.05);
    el.className = `reader-fx-word ${options.alt ? 'alt' : ''} ${options.big ? 'big' : ''} ${options.violent ? 'violent' : ''}`.trim();
    el.style.setProperty('--x', `${x}%`);
    el.style.setProperty('--y', `${y}%`);
    el.style.setProperty('--rot', `${rot}deg`);
    el.style.setProperty('--scale', scale);
    el.textContent = word;
    readerFxLayer.appendChild(el);
    setTimeout(() => el.remove(), options.life ?? 1150);
}

function spawnMemory6Burst(words = [], count = 8) {
    const picks = words.length
        ? words
        : Array.from({ length: count }, () => MEMORY6_FRAGMENT_WORDS[Math.floor(Math.random() * MEMORY6_FRAGMENT_WORDS.length)]);
    picks.forEach((word, index) => {
        queueMemory6(() => spawnReaderFxWord(word, {
            alt: index % 3 === 0,
            big: index % 4 === 0 || word.length > 15,
            violent: index % 2 === 0,
            life: 850 + Math.random() * 750
        }), index * 45);
    });
}

function spawnMemory6Tear() {
    if (!readerFxLayer) return;
    const tear = document.createElement('i');
    tear.className = 'reader-tear';
    tear.style.top = `${5 + Math.random() * 88}%`;
    tear.style.height = `${8 + Math.random() * 34}px`;
    tear.style.setProperty('--tear-x', `${-55 + Math.random() * 110}px`);
    tear.style.setProperty('--tear-skew', `${-8 + Math.random() * 16}deg`);
    readerFxLayer.appendChild(tear);
    setTimeout(() => tear.remove(), 430 + Math.random() * 380);
}

function spawnMemory6ErrorBox(text, index = 0) {
    if (!readerFxLayer) return;
    const box = document.createElement('div');
    box.className = 'reader-error-box';
    box.style.left = `${3 + Math.random() * 66}%`;
    box.style.top = `${7 + Math.random() * 68}%`;
    box.style.setProperty('--error-r', `${-5 + Math.random() * 10}deg`);
    box.innerHTML = `<b>ERRO ${String(index + 1).padStart(2, '0')}</b><span>${text}</span>`;
    readerFxLayer.appendChild(box);
    setTimeout(() => box.remove(), 1000 + Math.random() * 800);
}

function showMemory6Fatal(message, subline = '') {
    if (!readerFxLayer) return;
    const fatal = document.createElement('div');
    fatal.className = 'reader-fatal-card';
    fatal.innerHTML = `<strong>${message}</strong>${subline ? `<span>${subline}</span>` : ''}`;
    readerFxLayer.appendChild(fatal);
    setTimeout(() => fatal.remove(), 950);
}

function scrambleReaderText(duration = 700, intensity = 0.08) {
    const original = readerText.textContent;
    const chars = '#@$%&/\\|!?*01▓▒░';
    const timer = memory6Interval(() => {
        if (currentGenericMemory !== 6) return;
        readerText.textContent = original.split('').map((ch) => {
            if (ch === '\n' || ch === ' ' || Math.random() > intensity) return ch;
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
    }, 58);
    queueMemory6(() => {
        clearInterval(timer);
        readerText.textContent = original;
    }, duration);
}

function brutalMemory6Pulse() {
    triggerSystemGlitch(true);
    for (let i = 0; i < 5; i++) queueMemory6(spawnMemory6Tear, i * 55);
    spawnMemory6Burst([], 10);
    document.body.classList.add('memory6-global-crash');
    queueMemory6(() => document.body.classList.remove('memory6-global-crash'), 520);
}

const MEMORY6_FINAL_TEXT = `> RECUPERAÇÃO PARCIAL CONCLUÍDA.

> REANALISANDO O ERRO...

Talvez o problema não estivesse nos dados.

Eu tentei separar tudo.
Uma viagem de um jogo.
Um bichinho de uma casa.
Uma série de uma madrugada.
Uma fotografia de um dia qualquer.

Mas cada registro continuava apontando para outro.

> NOVA HIPÓTESE ACEITA.

Algumas memórias não existem sozinhas.
Elas fazem parte da mesma história.

Agora eu entendo.

> FRAGMENTO RECUPERADO:
FOTOGRAFIA RECONSTRUÍDA`;

function completeMemory6FinalMessage(runId) {
    if (runId !== readerRunId) return;
    memory6FinalSequence++;
    stopTyping();
    readerText.textContent = MEMORY6_FINAL_TEXT;
    readerText.classList.add('reader-crash-complete');
    if (readerStatus) readerStatus.textContent = 'STATUS: COMPREENDIDO';
    readerTitle.textContent = '> REGISTRO #006 — ARQUIVO ESTABILIZADO';
    readerNextButton.classList.remove('hidden');
    readerNextButton.textContent = '[ RECUPERAR FRAGMENTO ]';
    activeGlitchFinish = null;
}

async function finalizeMemory6Crash(runId) {
    if (runId !== readerRunId) return;

    clearMemory6Effects();
    const terminal = readerScreen.querySelector('.memory-terminal');
    terminal?.classList.add('memory-stabilized');
    readerText.classList.remove('reader-crash-complete');
    readerTitle.textContent = '> REGISTRO #006 — ARQUIVO ESTABILIZADO';
    readerText.textContent = '';
    readerNextButton.classList.add('hidden');

    const sequenceId = ++memory6FinalSequence;
    const stillRunning = () => runId === readerRunId && sequenceId === memory6FinalSequence && readerScreen.classList.contains('active');

    // Depois do crash, o sistema fica alguns instantes sem responder.
    if (readerStatus) readerStatus.textContent = 'STATUS: PROCESSANDO';
    activeGlitchFinish = () => completeMemory6FinalMessage(runId);
    activeGlitchFinish.__memory6 = true;

    await delay(1450);
    if (!stillRunning()) return;

    if (readerStatus) readerStatus.textContent = 'STATUS: REANALISANDO';
    await typeText(readerText, '> RECUPERAÇÃO PARCIAL CONCLUÍDA.\n\n', 44);
    if (!stillRunning()) return;

    await delay(620);
    if (!stillRunning()) return;
    await typeText(readerText, '> REANALISANDO O ERRO...\n\n', 48, true);
    if (!stillRunning()) return;

    await delay(760);
    if (!stillRunning()) return;
    await typeText(readerText, 'Talvez o problema não estivesse nos dados.\n\n', 46, true);
    if (!stillRunning()) return;

    await delay(620);
    if (!stillRunning()) return;
    await typeText(readerText,
        'Eu tentei separar tudo.\n' +
        'Uma viagem de um jogo.\n' +
        'Um bichinho de uma casa.\n' +
        'Uma série de uma madrugada.\n' +
        'Uma fotografia de um dia qualquer.\n\n',
        36,
        true
    );
    if (!stillRunning()) return;

    await delay(780);
    if (!stillRunning()) return;
    await typeText(readerText, 'Mas cada registro continuava apontando para outro.\n\n', 48, true);
    if (!stillRunning()) return;

    await delay(950);
    if (!stillRunning()) return;
    if (readerStatus) readerStatus.textContent = 'STATUS: COMPREENDENDO';
    await typeText(readerText, '> NOVA HIPÓTESE ACEITA.\n\n', 52, true);
    if (!stillRunning()) return;

    await delay(720);
    if (!stillRunning()) return;
    await typeText(readerText,
        'Algumas memórias não existem sozinhas.\n' +
        'Elas fazem parte da mesma história.\n\n',
        46,
        true
    );
    if (!stillRunning()) return;

    await delay(1050);
    if (!stillRunning()) return;
    await typeText(readerText, 'Agora eu entendo.\n\n', 72, true);
    if (!stillRunning()) return;

    await delay(950);
    if (!stillRunning()) return;
    await typeText(readerText, '> FRAGMENTO RECUPERADO:\nFOTOGRAFIA RECONSTRUÍDA', 50, true);
    if (!stillRunning()) return;

    readerText.classList.add('reader-crash-complete');
    if (readerStatus) readerStatus.textContent = 'STATUS: COMPREENDIDO';
    readerNextButton.classList.remove('hidden');
    readerNextButton.textContent = '[ RECUPERAR FRAGMENTO ]';
    activeGlitchFinish = null;
}

async function playMemory6Crash(runId) {
    clearMemory6Effects();
    readerNextButton.classList.add('hidden');
    readerTitle.textContent = '> REGISTRO #006 — ARQUIVO TEMPORAL';
    if (readerStatus) readerStatus.textContent = 'STATUS: EM ANÁLISE';

    await typeText(readerText, GENERIC_MEMORY_TEXTS[6], 34);
    if (runId !== readerRunId || !readerScreen.classList.contains('active')) return;

    await delay(420);
    if (runId !== readerRunId) return;

    const terminal = readerScreen.querySelector('.memory-terminal');
    activeGlitchFinish = () => finalizeMemory6Crash(runId);
    activeGlitchFinish.__memory6 = true;

    await typeText(readerText, `
> fragmentos adicionais encontrados`, 30, true);
    spawnMemory6Burst(["Floripa", "São Paulo", "BGS", "Celso Portiolli", "Amora", "Zoe", "Charlie", "videogame novo"]);
    await delay(360);
    if (runId !== readerRunId) return;

    terminal?.classList.add('memory-overload');
    readerText.classList.add('reader-corrupting');
    readerScreen.classList.add('memory6-screen-crash');
    if (readerStatus) readerStatus.textContent = 'STATUS: SOBRECARGA';
    brutalMemory6Pulse();
    scrambleReaderText(760, 0.075);
    await typeText(readerText, `
> tentando catalogar...`, 18, true);
    await delay(300);
    if (runId !== readerRunId) return;

    terminal?.classList.add('memory-tilt', 'memory-critical');
    if (readerStatus) readerStatus.textContent = 'STATUS: BUFFER EXCEDIDO';
    spawnMemory6Burst(["faculdades terminadas", "séries", "comidas", "viagens", "fotos", "piadas", "11:11", "Tour", "nosso cantinho"]);
    ["DADOS SOBREPOSTOS", "ÍNDICE DUPLICADO", "ÂNCORA INVÁLIDA", "MEMÓRIA FORA DO LIMITE"].forEach((msg, i) => queueMemory6(() => spawnMemory6ErrorBox(msg, i), i * 120));
    brutalMemory6Pulse();
    await delay(520);
    if (runId !== readerRunId) return;

    await typeText(readerText, `
> não consigo separar`, 12, true);
    spawnMemory6Burst(["igreja", "van", "banheiro", "bochechas", "cachorrinhos", "gatinhos", "madrugadas", "cafés", "receitas", "planos"]);
    scrambleReaderText(900, 0.14);
    brutalMemory6Pulse();
    await delay(420);
    if (runId !== readerRunId) return;

    if (readerStatus) readerStatus.textContent = 'STATUS: FALHA CRÍTICA';
    showMemory6Fatal('FALHA CRÍTICA', 'MEMÓRIA 006 // DADOS DEMAIS PARA UMA ÚNICA CATEGORIA');
    terminal?.classList.add('memory-dead');
    document.body.classList.add('memory6-blackout');
    for (let i = 0; i < 7; i++) queueMemory6(spawnMemory6Tear, i * 45);
    await delay(720);
    if (runId !== readerRunId) return;

    document.body.classList.remove('memory6-blackout');
    document.body.classList.add('memory6-rebooting');
    terminal?.classList.remove('memory-dead', 'memory-tilt');
    readerText.classList.remove('reader-corrupting');
    readerText.textContent = '> ...\n> reinicializando subsistema de memória...';
    if (readerStatus) readerStatus.textContent = 'STATUS: REINICIALIZANDO';
    await delay(620);
    if (runId !== readerRunId) return;

    readerText.textContent += '\n> recuperando índice...';
    spawnReaderFxWord('RECUPERANDO', { x: 50, y: 42, big: true, alt: true, life: 700 });
    await delay(520);
    if (runId !== readerRunId) return;

    readerText.textContent += '\n> reorganizando registros...';
    document.body.classList.remove('memory6-rebooting');
    terminal?.classList.remove('memory-overload', 'memory-critical');
    terminal?.classList.add('memory-stabilized');
    if (readerStatus) readerStatus.textContent = 'STATUS: ESTABILIZANDO';
    await delay(540);
    if (runId !== readerRunId) return;

    await finalizeMemory6Crash(runId);
}

async function loadGenericMemory(id) {
    if (!GENERIC_MEMORY_TEXTS[id]) return;

    if (id === 4 && localStorage.getItem("projetoNos_glitchSolved") !== "true") {
        startGlitchSequence(1);
        return;
    }

    currentGenericMemory = id;
    readerRunId++;
    const runId = readerRunId;

    setPhase("memory");
    showScreen(readerScreen);
    triggerSystemGlitch(false);

    readerTitle.textContent = `> REGISTRO #${String(id).padStart(3, "0")} — ${GENERIC_MEMORY_TITLES[id]}`;
    readerText.textContent = "";
    clearMemory6Effects();
    if (readerStatus) readerStatus.textContent = "STATUS: RESTAURADO";
    readerNextButton.classList.remove("hidden");
    readerNextButton.textContent = id >= 6 ? "[ CONCLUIR MÓDULO ]" : "[ PRÓXIMA MEMÓRIA ]";

    if (id === 6) {
        await playMemory6Crash(runId);
        return;
    }

    await typeText(readerText, GENERIC_MEMORY_TEXTS[id], 42);
    if (runId !== readerRunId || !readerScreen.classList.contains("active")) return;
}

readerSkipButton.addEventListener("click", skipSequence);

readerNextButton.addEventListener("click", () => {
    if (isTyping || activeDelayResolve) {
        skipSequence();
        return;
    }

    if (currentGenericMemory >= 6) {
        localStorage.setItem("projetoNos_memoriesComplete", "true");
        localStorage.setItem("projetoNos_item_memories", "true");
        localStorage.setItem("projetoNos_progress", "6");
        refreshProgressUI();
        triggerSystemGlitch(true);
        showModuleItemReward("memories", () => {
            refreshProgressUI();
            showModule("home");
        });
        return;
    }

    const next = currentGenericMemory + 1;
    const progress = parseInt(localStorage.getItem("projetoNos_progress"), 10) || 1;
    localStorage.setItem("projetoNos_progress", String(Math.max(progress, next)));
    refreshProgressUI();
    loadGenericMemory(next);
});

readerBackButton.addEventListener("click", () => {
    cancelSequence();
    readerRunId++;
    clearMemory6Effects();
    const progress = parseInt(localStorage.getItem("projetoNos_progress")) || 1;
    localStorage.setItem("projetoNos_progress", String(Math.max(progress, currentGenericMemory)));
    updateMemoryCards();
    showModule("memories");
});

/* =========================================================
   CARDS DAS MEMÓRIAS
========================================================= */
function updateMemoryCards() {
    const state = getProgressState();
    const progress = state.highestUnlockedMemory;

    document.querySelectorAll(".memory-card[data-memory]").forEach((card) => {
        const id = parseInt(card.dataset.memory, 10);
        const unlocked = DEBUG_MODE || state.memoriesComplete || id <= progress;
        const completed = state.memoriesComplete || id < progress || (id === 1 && localStorage.getItem("projetoNos_unlocked") === "true");

        card.disabled = !unlocked;
        card.classList.toggle("locked", !unlocked);
        card.classList.toggle("restored", completed);

        const title = card.querySelector("strong");
        const status = card.querySelector(".memory-state");
        const description = card.querySelector("small");

        if (!unlocked) {
            if (title) title.textContent = id === 4 ? "[ DADOS CORROMPIDOS ]" : "????????";
            if (status) status.textContent = id === 4 ? "DADOS CORROMPIDOS" : "NÃO IDENTIFICADA";
            if (description) description.textContent = id === 4 ? "âncora temporal ausente" : "dados insuficientes";
            return;
        }

        if (title) title.textContent = card.dataset.title || `ARQUIVO ${String(id).padStart(3, "0")}`;
        if (description) description.textContent = card.dataset.description || "registro localizado";

        if (id === 4 && localStorage.getItem("projetoNos_glitchSolved") !== "true") {
            if (status) status.textContent = "CORROMPIDA";
        } else if (completed) {
            if (status) status.textContent = "RESTAURADA";
        } else {
            if (status) status.textContent = "LOCALIZADA";
        }
    });
}

document.querySelectorAll(".memory-card[data-memory]").forEach((card) => {
    card.addEventListener("click", () => {
        if (card.disabled) return;
        const id = parseInt(card.dataset.memory);

        if (id === 1) showMemory("archive");
        else loadGenericMemory(id);
    });
});

/* =========================================================
   PUZZLE DE ANCORAGEM — TEXTO EM BLOCOS, NÃO EM UM BOLO
========================================================= */
const GLITCH_QUESTIONS = [
    {
        question: "Qual banda a usuária alegou gostar no primeiro contato apenas para manter a interação?",
        validate: (answer) => answer.includes("supercombo")
    },
    {
        question: "Insira o nome de batismo original da entidade felina que parecia um rato quando filhote.",
        validate: (answer) => answer.includes("ottis") || answer.includes("otis")
    },
    {
        question: "Qual filme é classificado no nosso sistema como 'terror' puramente devido ao seu final triste?",
        validate: (answer) => answer.includes("la la land") || answer.includes("lalaland")
    }
];

let currentGlitchQuestion = 1;
let glitchRunId = 0;

async function startGlitchSequence(questionNumber = currentGlitchQuestion) {
    currentGlitchQuestion = questionNumber;
    glitchRunId++;
    const runId = glitchRunId;

    setPhase("corrupt");
    showScreen(glitchScreen);

    glitchLeadText.textContent = "";
    glitchProtocolText.textContent = "";
    glitchQuestionCounter.textContent = "";
    glitchQuestionText.textContent = "";
    glitchQuestionCard.classList.add("hidden");
    glitchInputContainer.classList.add("hidden");
    glitchError.classList.add("hidden");
    glitchInput.value = "";

    triggerSystemGlitch(true);

    if (questionNumber === 1) {
        await typeText(glitchLeadText, "> ALERTA DE CORRUPÇÃO TEMPORAL.", 52);
        if (!isGlitchRunActive(runId)) return;
        await delay(850);

        await typeText(
            glitchProtocolText,
            "> TENTATIVA DE ACESSO À MEMÓRIA #004 INTERROMPIDA.",
            48
        );
        if (!isGlitchRunActive(runId)) return;
        await delay(1050);

        await typeText(
            glitchProtocolText,
            "\n\n> PROTOCOLO DE ANCORAGEM NECESSÁRIO.",
            48,
            true
        );
        if (!isGlitchRunActive(runId)) return;
        await delay(1050);
    } else {
        await typeText(glitchLeadText, "> CORREÇÃO ACEITA.", 48);
        if (!isGlitchRunActive(runId)) return;
        await delay(850);
    }

    glitchQuestionCard.classList.remove("hidden");
    glitchQuestionCounter.textContent = `> PERGUNTA ${questionNumber} DE 3`;
    await delay(500);

    await typeText(
        glitchQuestionText,
        GLITCH_QUESTIONS[questionNumber - 1].question,
        54
    );

    if (!isGlitchRunActive(runId)) return;
    await delay(450);

    glitchInputContainer.classList.remove("hidden");
    glitchInput.focus();

    // Se o usuário pulou a sequência, o próximo evento volta ao comportamento normal.
    isSkipping = false;
}

function isGlitchRunActive(runId) {
    return runId === glitchRunId && glitchScreen.classList.contains("active");
}

glitchInput.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;

    const normalized = glitchInput.value.trim().toLowerCase();
    const item = GLITCH_QUESTIONS[currentGlitchQuestion - 1];

    if (!item.validate(normalized)) {
        glitchError.classList.remove("hidden");
        glitchInput.value = "";
        triggerSystemGlitch(false);
        return;
    }

    glitchError.classList.add("hidden");
    glitchInputContainer.classList.add("hidden");

    if (currentGlitchQuestion < 3) {
        currentGlitchQuestion++;
        await delay(400);
        startGlitchSequence(currentGlitchQuestion);
        return;
    }

    localStorage.setItem("projetoNos_glitchSolved", "true");

    cancelSequence();
    glitchQuestionCard.classList.add("hidden");
    glitchLeadText.textContent = "";
    glitchProtocolText.textContent = "";

    await typeText(glitchLeadText, "> ANCORAGEM CONCLUÍDA.", 48);
    await delay(800);
    await typeText(glitchProtocolText, "> NÚCLEO TEMPORAL ESTABILIZADO.\n> ACESSANDO MEMÓRIA #004...", 48);
    await delay(1100);

    loadGenericMemory(4);
});

glitchBackButton.addEventListener("click", () => {
    glitchRunId++;
    showModule("memories");
});

glitchSkipButton.addEventListener("click", skipSequence);

/* =========================================================
   PÁGINAS PRINCIPAIS — TEXTOS DE TESTE / RASCUNHOS ATUAIS
========================================================= */
const FAILURES_PAGE_TEXT = `> FALHAS CONHECIDAS DO SISTEMA

> O sistema encontrou comportamentos recorrentes que se recusam a ser corrigidos.
> Após revisão, nenhuma das ocorrências abaixo representa risco à integridade do projeto.
> Algumas, inclusive, parecem fazer parte do funcionamento esperado.
`;

const FAILURE_ITEMS = [
    {
        code: "BUG #001",
        title: "IMPULSO DE MORDIDA",
        text: "A USUÁRIA B demonstra vontade recorrente de morder partes aleatórias do SUJEITO A. O sistema não encontrou intenção hostil. Classificação atual: carinho com dentes.",
        status: "PERSISTENTE / ESTRANHAMENTE FOFO"
    },
    {
        code: "BUG #002",
        title: "PÉS EM TEMPERATURA INCOMPATÍVEL",
        text: "Os pés da USUÁRIA B operam em temperaturas abaixo do recomendado e procuram imediatamente o SUJEITO A como fonte de calor. O procedimento já foi incorporado à rotina.",
        status: "AQUECEDOR HUMANO: ATIVO"
    },
    {
        code: "BUG #003",
        title: "ROTA ALTERNATIVA PERSISTENTE",
        text: "A USUÁRIA B continua considerando o meio da rua uma rota perfeitamente aceitável. O SUJEITO A continua reparando, puxando para o lado seguro e seguindo junto como se esse protocolo já viesse instalado de fábrica.",
        status: "ACOMPANHAMENTO AUTOMÁTICO: ATIVO"
    },
    {
        code: "BUG #004",
        title: "EXPLORAÇÃO SEM RECOMPENSA",
        text: "O SUJEITO A consegue passar horas investigando cantos de mapas em jogos onde, estatisticamente, provavelmente não existe absolutamente nada.",
        status: "LOOT ENCONTRADO: 0 / SATISFAÇÃO: ALTA"
    },
    {
        code: "BUG #005",
        title: "COMPATIBILIDADE GASTRONÔMICA PARCIAL",
        text: "A USUÁRIA B continua gostando de azeitonas e água tônica. O SUJEITO A continua sem entender, mas o sistema concluiu que amor não exige concordância com azeitonas nem com água tônica.",
        status: "DIVERGÊNCIA ACEITA / PROJETO INTACTO"
    },
    {
        code: "BUG #006",
        title: "PERTURBAÇÃO AFETIVA RECORRENTE",
        text: "Provocações, bochechas apertadas e pequenas implicâncias continuam sendo usadas pelo SUJEITO A como uma linguagem de carinho altamente inconveniente.",
        status: "LEGADO DO SISTEMA / NÃO REMOVER"
    }
];

const REPORT_PAGE_TEXT = `Oioi, amor da minha vida né? 
A ideia do meu presente era, transformar seis anos no nosso proprio livro de aventuras, mas seis anos não cabem exatamente em um relatório.

Mas, cabem naquela van em que eu conheci você, e inventava qualquer assunto só para continuar falando contigo.
Cabem nas suas bochechas, que eu ainda considero um patrimônio de interesse público, e potencial fonte de beijocas e mordidas.
Cabem na igreja em que olhando agora, não faz o menor sentido pra um primeiro encontro, mas onde eu só conseguia pensar em beijar você.
Cabem numa rasteira absolutamente desnecessária, num banheiro que deveria ter sido apagado da história e em um monte de outras cenas que, por algum motivo, viraram nossa historia.

E em 6 anos ao seu lado, vieram mais coisas do que eu conseguiria colocar em ordem.
Jogos que a gente, brigou, gritou e surtou, mas mais supreendente do que isso zeramos juntos.

Séries que viraram referência, ponto de abrigo em momentos bons e ruins, piadas e falas internas que surgiram com elas.

Cabe nos Cafés, restaurantes, receitas e lugares que fomos descobrindo porque estar junto sempre pareceu motivo suficiente para inventar alguma coisa para fazer, pra comer, rir e sem dúvidas julgar.

Cabe nas nossas viagens, e as que ainda virão. Mas nunca vou esquecer de como é incrivel estar contigo, seja em Floripa, São Paulo, e até encontrando um Celso Portiolli no mais absoluto nada.

Nossa vida, foi aos poucos ficando maior, com a Amorinha. Depois a Zoe. Charlie, o gato gordo que sempre falamos ter.
Falar de “nós” deixou de significar só duas pessoas.

Vieram e foram faculdades, trabalhos, dias ótimos, dias ruins, planos que mudaram e outros que ficaram.
Mas o sonho insistente de ter um cantinho nosso se mantém, com espaço para a gente, para os bichinhos e para todas as coisas que ainda vão aparecer no caminho.

A minha ideia era fazer um sistema que tentava entender por que algumas memórias eram tão importantes, mas enquanto eu organizava, digo... o sistema organizava, eu percebi que não existe uma memoria melhor que a outra, todas são incriveis, nem todas conseguimos registrar, nem todas vamos se lembrar, mas sem dúvidas, cada uma delas, foi e continua sendo unica e obrigado por isso.

Aos 12 anos, eu gostava de estar perto de você. Eu procurava qualquer motivo para conversar com você. Qualquer desculpa servia. (Mas deixa eu perguntar que Dragão tu tem na sua fazenda ai?)

Hoje eu ainda adoro de estar perto de você, Só que agora eu sei exatamente o motivo.

Eu amo ver seus olhos castanhos brilharem quando o sol bate neles.
Amo passar a mão no seu cabelo e sentir como ele é macio.
Amo beijar seu nariz só para ver você encolher o rosto, como sempre faz.
Amo quando você me abraça e me aperta, como se quisesse me esmagar.
Amo quando você sorri para mim e aquele sorriso aparece inteiro.

Amo as coisas grandes que a gente viveu.
Mas também amo profundamente as pequenas: ficar de preguiça, ficar horas pra escolher o que assistir, dividir comida, implicar com você, ouvir uma história que eu já ouvi só pra ficar olhando pra você, jogar alguma coisa por horas ou simplesmente estar no mesmo lugar.

Porque, acima de tudo, eu amo poder ser completamente eu mesmo quando estou com você.
E amo a pessoa que eu me torno quando estou ao seu lado.

Seis anos depois, depois de tudo que mudou, tem uma coisa que continua ridiculamente simples:

eu ainda quero ficar perto de você.
`;

const UPDATE_PAGE_TEXT = `> VERIFICANDO NOVA VERSÃO...

VERSÃO ATUAL: PROJETO NÓS 6.0
NOVA VERSÃO DISPONÍVEL.

...

Tá. Foi mal.
Força do hábito.

Essa atualização é um pouco diferente.

Pra continuar, eu preciso de uma confirmação física.

Então...

olha pra mim.

> AGUARDANDO CONFIRMAÇÃO...
`;

const UPDATE_ACCEPTED_TEXT = `CONFIRMAÇÃO RECEBIDA.

...

PROCESSANDO...

VERSÃO 6.0 ENCERRADA.
NOVA VERSÃO INSTALADA COM SUCESSO.

PROJETO NÓS
6.0 → NOIVOS

STATUS: EM EXECUÇÃO

USUÁRIO A: ✓
USUÁRIA B: ✓

Obrigado por continuar escolhendo a gente.
`;

let pageRunId = 0;

let failureReadIndex = 0;

function renderCurrentFailure() {
    if (!failureCards) return;
    const item = FAILURE_ITEMS[failureReadIndex];
    if (!item) return;

    failureCards.innerHTML = `
        <article class="failure-card failure-card-single">
            <div class="failure-card-progress">FALHA ${String(failureReadIndex + 1).padStart(2, "0")} / ${String(FAILURE_ITEMS.length).padStart(2, "0")}</div>
            <span>${item.code}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
            <small>${item.status}</small>
        </article>
    `;
    failureCards.classList.remove("hidden");
    failureStepControls?.classList.remove("hidden");
    if (failureNextButton) {
        failureNextButton.textContent = failureReadIndex >= FAILURE_ITEMS.length - 1
            ? "[ FINALIZAR REVISÃO ]"
            : "[ PRÓXIMA FALHA ]";
    }
}

function renderAllFailuresForReview() {
    if (!failureCards) return;
    failureCards.innerHTML = FAILURE_ITEMS.map((item, index) => `
        <article class="failure-card failure-card-review">
            <div class="failure-card-progress">FALHA ${String(index + 1).padStart(2, "0")} / ${String(FAILURE_ITEMS.length).padStart(2, "0")}</div>
            <span>${item.code}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
            <small>${item.status}</small>
        </article>
    `).join("");
    failureCards.classList.remove("hidden");
    failureStepControls?.classList.add("hidden");
    failurePageControls?.classList.add("hidden");
    if (failureConclusion) {
        failureConclusion.innerHTML = `
            <span>&gt; IMPACTO NA INTEGRIDADE DO PROJETO: <strong>NENHUM</strong></span>
            <span>&gt; CORREÇÃO RECOMENDADA: <strong>NENHUMA.</strong></span>
            <em>ALGUMAS FALHAS FAZEM PARTE DO SISTEMA.</em>
        `;
        failureConclusion.classList.remove("hidden");
    }
    failureFinalPanel?.classList.remove("hidden");
}

function showFailureConclusion() {
    failureCards?.classList.add("hidden");
    failureStepControls?.classList.add("hidden");
    failurePageControls?.classList.add("hidden");

    if (failureConclusion) {
        failureConclusion.innerHTML = `
            <span>&gt; REAVALIANDO CLASSIFICAÇÃO...</span>
            <span>&gt; IMPACTO NA INTEGRIDADE DO PROJETO: <strong>NENHUM</strong></span>
            <span>&gt; CORREÇÃO RECOMENDADA: <strong>NENHUMA.</strong></span>
            <em>ALGUMAS FALHAS FAZEM PARTE DO SISTEMA.</em>
        `;
        failureConclusion.classList.remove("hidden");
    }
    failureRewardCard?.classList.remove("hidden");
}

function showFailureFinalPanel() {
    failureConclusion?.classList.add("hidden");
    failureRewardCard?.classList.add("hidden");
    failurePageControls?.classList.add("hidden");
    failureFinalPanel?.classList.remove("hidden");
}

async function playFailuresPage() {
    pageRunId++;
    const runId = pageRunId;
    failureReadIndex = 0;
    failuresText.textContent = "";
    failureCards?.classList.add("hidden");
    failureStepControls?.classList.add("hidden");
    failureConclusion?.classList.add("hidden");
    failureRewardCard?.classList.add("hidden");
    failureFinalPanel?.classList.add("hidden");
    failurePageControls?.classList.remove("hidden");

    if (localStorage.getItem("projetoNos_failuresComplete") === "true") {
        failuresText.textContent = "";
        renderAllFailuresForReview();
        return;
    }

    await typeText(failuresText, FAILURES_PAGE_TEXT, 42);
    if (runId !== pageRunId || !failuresScreen.classList.contains("active")) return;
    failurePageControls?.classList.add("hidden");
    renderCurrentFailure();
}

failureNextButton?.addEventListener("click", () => {
    if (failureReadIndex < FAILURE_ITEMS.length - 1) {
        failureReadIndex += 1;
        renderCurrentFailure();
        triggerSystemGlitch(false);
        return;
    }
    showFailureConclusion();
});

failureReturnHome?.addEventListener("click", () => {
    showModule("home");
});

let reportLetterOpening = false;
let reportLetterSkipped = false;
let waitingProposalConfirmation = false;
let proposalConfirmed = false;
let proposalAcceptedAt = "";
let debugProposalAcceptedAt = sessionStorage.getItem("projetoNos_debugProposalAcceptedAt") || "";
const PROPOSAL_STORAGE_KEY = "projetoNos_proposalAcceptedAt";

function getProposalAcceptedAt() {
    const value = DEBUG_MODE ? debugProposalAcceptedAt : localStorage.getItem(PROPOSAL_STORAGE_KEY);
    return value && Number.isFinite(Date.parse(value)) ? value : "";
}
function resetReportLetter() {
    reportLetterOpening = false;
    reportLetterSkipped = false;
    if (currentTypingElement === reportText) stopTyping();
    if (reportText) reportText.textContent = "";
    reportLetterStage?.classList.remove("is-opening", "is-lifting", "is-open");
    reportLetter?.setAttribute("aria-hidden", "true");
    reportLetterSignature?.classList.add("hidden");
    reportLetterControls?.classList.add("hidden");
    const skipBar = document.querySelector(".nos-skip-bar");
    if (skipBar) skipBar.hidden = true;
    const skip = document.getElementById("skipReportLetter");
    if (skip) skip.disabled = false;
    if (reportEnvelope) {
        reportEnvelope.disabled = false;
        reportEnvelope.hidden = false;
    }
}
function finishReportLetter() {
    if (!reportScreen?.classList.contains("active")) return;
    reportLetterSignature?.classList.remove("hidden");
    reportLetterControls?.classList.remove("hidden");
    const skipBar = document.querySelector(".nos-skip-bar");
    if (skipBar) skipBar.hidden = true;
    // A carta libera a atualização ao terminar, sem botão de guardar.
    localStorage.setItem("projetoNos_reportComplete", "true");
    refreshProgressUI();
}
async function openReportLetter() {
    if (reportLetterOpening || !reportScreen?.classList.contains("active")) return;
    reportLetterOpening = true;
    const runId = pageRunId;
    reportEnvelope.disabled = true;
    reportLetterStage?.classList.add("is-opening");
    await delay(720);
    if (runId !== pageRunId || !reportScreen.classList.contains("active")) return;
    reportLetterStage?.classList.add("is-lifting");
    await delay(430);
    if (runId !== pageRunId || !reportScreen.classList.contains("active")) return;
    reportLetterStage?.classList.add("is-open");
    reportEnvelope.hidden = true;
    reportLetter?.setAttribute("aria-hidden", "false");
    document.querySelector(".nos-skip-bar").hidden = false;
    reportScreen.scrollTo?.({ top: 0, behavior: "smooth" });
    await typeText(reportText, REPORT_PAGE_TEXT, 65, false, { human: true });
    if (runId !== pageRunId || !reportScreen.classList.contains("active")) return;
    finishReportLetter();
}
function skipReportLetterTyping() {
    if (!reportLetterOpening || reportLetter?.getAttribute("aria-hidden") !== "false") return;
    reportLetterSkipped = true;
    stopTyping();
    reportText.textContent = REPORT_PAGE_TEXT;
    finishReportLetter();
}
function playReportPage() { pageRunId++; resetReportLetter(); }
reportEnvelope?.addEventListener("click", openReportLetter);
document.getElementById("skipReportLetter")?.addEventListener("click", skipReportLetterTyping);
document.getElementById("aboutUpdateButton")?.addEventListener("click", () => showModule("update"));

function renderProposalAccepted() {
    updateScreen.querySelector(".nos-update-paper")?.classList.add("is-accepted");
    document.getElementById("updateTextReserve").textContent = UPDATE_ACCEPTED_TEXT;
    document.getElementById("proposalWaiting").hidden = true;
    document.getElementById("proposalAcceptedTitle").hidden = false;
    const art = document.getElementById("proposalPixelArt");
    art.innerHTML = nosPixelScene();
    art.hidden = false;
    const button = document.getElementById("openFutureButton");
    button.href = new URL(DEBUG_MODE ? "futuro.html?debug=1" : "futuro.html", NOS_BASE_URL).href;
    button.hidden = false;
}
async function playUpdatePage() {
    pageRunId++;
    const runId = pageRunId;
    waitingProposalConfirmation = false;
    updateScreen.querySelector(".nos-update-paper")?.classList.remove("is-accepted");
    proposalAcceptedAt = getProposalAcceptedAt();
    proposalConfirmed = Boolean(proposalAcceptedAt);
    document.getElementById("proposalWaiting").hidden = true;
    document.getElementById("proposalAcceptedTitle").hidden = true;
    document.getElementById("proposalPixelArt").hidden = true;
    document.getElementById("openFutureButton").hidden = true;
    document.querySelector(".nos-celebration")?.remove();
    updateText.textContent = "";
    document.getElementById("updateTextReserve").textContent = proposalConfirmed ? UPDATE_ACCEPTED_TEXT : UPDATE_PAGE_TEXT;
    if (proposalConfirmed) {
        updateText.textContent = UPDATE_ACCEPTED_TEXT;
        renderProposalAccepted();
        return;
    }
    await typeText(updateText, UPDATE_PAGE_TEXT, 65, false, { human: true });
    if (runId !== pageRunId || !updateScreen.classList.contains("active")) return;
    waitingProposalConfirmation = true;
    document.getElementById("proposalWaiting").hidden = false;
    updateScreen.setAttribute("tabindex", "-1");
    updateScreen.focus?.({ preventScroll: true });
}
async function confirmProposal() {
    if (!waitingProposalConfirmation || proposalConfirmed || !updateScreen?.classList.contains("active")) return;
    proposalConfirmed = true;
    waitingProposalConfirmation = false;
    proposalAcceptedAt = new Date().toISOString();
    if (DEBUG_MODE) {
        debugProposalAcceptedAt = proposalAcceptedAt;
        sessionStorage.setItem("projetoNos_debugProposalAcceptedAt", proposalAcceptedAt);
    } else {
        localStorage.setItem(PROPOSAL_STORAGE_KEY, proposalAcceptedAt);
    }
    const runId = pageRunId;
    document.getElementById("updateTextReserve").textContent = UPDATE_ACCEPTED_TEXT;
    document.getElementById("proposalWaiting").hidden = true;
    document.getElementById("proposalPixelArt").innerHTML = nosPixelScene();
    document.getElementById("proposalPixelArt").hidden = false;
    nosCelebrate();
    await typeText(updateText, UPDATE_ACCEPTED_TEXT, 48, false, { human: true });
    if (runId !== pageRunId || !updateScreen.classList.contains("active")) return;
    renderProposalAccepted();
}
document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.repeat || event.isComposing) return;
    const target = event.target;
    if (target?.closest?.("input, textarea, select, [contenteditable], a, button")) return;
    if (waitingProposalConfirmation && updateScreen?.classList.contains("active")) {
        event.preventDefault();
        confirmProposal();
    }
});
document.getElementById("confirmProposalTouch")?.addEventListener("click", confirmProposal);

document.querySelectorAll(".pageSkipButton").forEach((button) => {
    button.addEventListener("click", skipSequence);
});


/* =========================================================
   RECOMPENSAS / ITENS DO PUZZLE FINAL
========================================================= */
const MODULE_ITEM_CONFIG = {
    memories: {
        kicker: "OBJETO NÃO CATALOGADO RECUPERADO",
        title: "FOTOGRAFIA RECONSTRUÍDA",
        description: "A imagem parece comum, mas o verso contém marcas que não pertencem ao arquivo visual original. O sistema recomenda não descartá-la.",
        meta: "TIPO: PISTA VISUAL · PROPRIEDADE: DOIS LADOS",
        visualClass: "item-photo",
        src: "assets/imagens/memoria-001.jpg"
    },
    features: {
        kicker: "OBJETO NÃO CATALOGADO RECUPERADO",
        title: "MEDALHÃO ANTIGO",
        description: "Um disco metálico antigo e gasto foi recuperado. O formato sugere que ele foi feito para encaixar em algum mecanismo.",
        meta: "TIPO: DISCO METÁLICO · FUNÇÃO: DESCONHECIDA",
        visualClass: "item-medallion",
        src: "assets/itens/medalhao-atual.svg"
    },
    failures: {
        kicker: "OBJETO IMPROVÁVEL RECUPERADO",
        title: "CHAVE",
        description: "Uma chave comum foi recuperada. Nada nela parece especial; provavelmente o importante é descobrir onde ela encaixa.",
        meta: "TIPO: CHAVE MECÂNICA · PROPRIEDADE: COMUM",
        visualClass: "item-key",
        src: "assets/itens/chave-antiga.svg"
    }
};

let pendingModuleItemCallback = null;

function showModuleItemReward(key, onStored) {
    if (!moduleItemOverlay) {
        if (typeof onStored === "function") onStored();
        return;
    }

    const item = MODULE_ITEM_CONFIG[key];
    if (!item) {
        if (typeof onStored === "function") onStored();
        return;
    }

    pendingModuleItemCallback = typeof onStored === "function" ? onStored : null;
    moduleItemKicker.textContent = item.kicker;
    moduleItemTitle.textContent = item.title;
    moduleItemDescription.textContent = item.description;
    moduleItemMeta.textContent = item.meta;
    moduleItemVisual.className = `module-item-visual ${item.visualClass}`;
    moduleItemVisual.innerHTML = `<img src="${item.src}" alt="" draggable="false">`;

    moduleItemOverlay.classList.remove("hidden");
    storeModuleItemButton?.focus();
}

if (storeModuleItemButton) {
    storeModuleItemButton.addEventListener("click", () => {
        moduleItemOverlay.classList.add("hidden");
        const callback = pendingModuleItemCallback;
        pendingModuleItemCallback = null;
        if (callback) callback();
    });
}

/* =========================================================
   PROGRESSÃO DE MÓDULOS / INVENTÁRIO
========================================================= */
function updateInventoryUI() {
    const state = getProgressState();
    const items = [
        {
            key: "memories",
            acquired: localStorage.getItem("projetoNos_item_memories") === "true",
            name: "FOTOGRAFIA RECONSTRUÍDA"
        },
        {
            key: "features",
            acquired: localStorage.getItem("projetoNos_item_features") === "true",
            name: "MEDALHÃO ANTIGO"
        },
        {
            key: "failures",
            acquired: localStorage.getItem("projetoNos_item_failures") === "true",
            name: "CHAVE"
        }
    ];

    let acquiredCount = 0;

    items.forEach((item) => {
        const slot = document.querySelector(`[data-item-slot="${item.key}"]`);
        if (!slot) return;

        const strong = slot.querySelector("strong");
        slot.classList.toggle("inventory-unlocked", item.acquired);
        slot.setAttribute("aria-disabled", item.acquired ? "false" : "true");
        slot.disabled = !item.acquired;

        if (item.acquired) {
            acquiredCount++;
            if (strong) strong.textContent = item.name;
        } else if (strong) {
            strong.textContent = "???";
        }
    });

    if (inventoryCounter) inventoryCounter.textContent = `${acquiredCount} / 3 LOCALIZADOS`;

    if (finalPuzzleButton) {
        const ready = acquiredCount === 3;
        finalPuzzleButton.disabled = !ready;
        finalPuzzleButton.textContent = ready
            ? "[ INICIAR PROTOCOLO FINAL ]"
            : "[ PROTOCOLO FINAL INDISPONÍVEL ]";
    }

    if (completeExperiencesButton) {
        completeExperiencesButton.disabled = state.experiencesComplete;
        completeExperiencesButton.textContent = state.experiencesComplete
            ? "[ ANÁLISE CONCLUÍDA ]"
            : "[ CONCLUIR ANÁLISE — TESTE ]";
    }

    if (completeFailuresButton) {
        completeFailuresButton.disabled = state.failuresComplete;
        completeFailuresButton.textContent = state.failuresComplete
            ? "[ CHAVE RECUPERADA ]"
            : "[ GUARDAR CHAVE ]";
    }
}

if (completeExperiencesButton) {
    completeExperiencesButton.addEventListener("click", () => {
        localStorage.setItem("projetoNos_experiencesComplete", "true");
        localStorage.setItem("projetoNos_item_features", "true");
        refreshProgressUI();
        configureAmbientEffects();
        triggerSystemGlitch(true);
    });
}

if (completeFailuresButton) {
    completeFailuresButton.addEventListener("click", () => {
        localStorage.setItem("projetoNos_failuresComplete", "true");
        localStorage.setItem("projetoNos_item_failures", "true");
        refreshProgressUI();
        configureAmbientEffects();
        triggerSystemGlitch(true);
        showModuleItemReward("failures", () => {
            refreshProgressUI();
            showFailureFinalPanel();
        });
    });
}

const INVENTORY_INSPECT_CONFIG = {
    memories: {
        kicker: "ITEM 01 / ORIGEM: MEMÓRIAS",
        title: "FOTOGRAFIA RECONSTRUÍDA",
        copy: "A primeira memória visual reconstruída. A frente guarda a imagem; o verso contém marcas que ainda não possuem tradução.",
        meta: "OBJETO INSPECIONÁVEL · FRENTE / VERSO",
        action: "[ VIRAR FOTOGRAFIA ]"
    },
    features: {
        kicker: "ITEM 02 / ORIGEM: EXPERIÊNCIAS",
        title: "MEDALHÃO ANTIGO",
        copy: "Um disco metálico antigo, gasto pelo tempo. O formato sugere encaixe, mas o sistema ainda não sabe onde.",
        meta: "OBJETO INSPECIONÁVEL · DISCO METÁLICO",
        action: "[ GIRAR 90° ]"
    },
    failures: {
        kicker: "ITEM 03 / ORIGEM: FALHAS",
        title: "CHAVE",
        copy: "Uma chave comum. O formato não parece esconder nada; a função provavelmente depende apenas de encontrar a fechadura certa.",
        meta: "OBJETO INSPECIONÁVEL · CHAVE MECÂNICA",
        action: null
    }
};

let inspectedInventoryItem = null;
let inventoryPhotoBack = false;
let inventoryMedallionRotation = 0;

function renderInventoryInspectVisual() {
    if (!inventoryInspectStage || !inspectedInventoryItem) return;
    if (inspectedInventoryItem === "memories") {
        inventoryInspectStage.innerHTML = inventoryPhotoBack
            ? '<img class="inventory-object inventory-photo-back" src="assets/itens/fotografia-verso.svg" alt="Verso da fotografia reconstruída">'
            : '<div class="inventory-photo-front"><img class="inventory-object" src="assets/imagens/memoria-001.jpg" alt="Fotografia reconstruída"></div>';
    } else if (inspectedInventoryItem === "features") {
        inventoryInspectStage.innerHTML = `<img class="inventory-object inventory-medallion-object" style="--item-rotation:${inventoryMedallionRotation}deg" src="assets/itens/medalhao-experiencias.svg" alt="Medalhão de experiências">`;
    } else {
        inventoryInspectStage.innerHTML = '<img class="inventory-object inventory-key-object" src="assets/itens/chave-antiga.svg" alt="Chave">';
    }
}

function openInventoryInspect(key) {
    const acquired = localStorage.getItem(`projetoNos_item_${key}`) === "true";
    if (!acquired || !inventoryInspectOverlay) return;
    const info = INVENTORY_INSPECT_CONFIG[key];
    if (!info) return;

    inspectedInventoryItem = key;
    inventoryPhotoBack = false;
    inventoryInspectKicker.textContent = info.kicker;
    inventoryInspectTitle.textContent = info.title;
    inventoryInspectCopy.textContent = info.copy;
    inventoryInspectMeta.textContent = info.meta;
    inventoryInspectAction.classList.toggle("hidden", !info.action);
    inventoryInspectAction.textContent = info.action || "";
    renderInventoryInspectVisual();
    inventoryInspectOverlay.classList.remove("hidden");
    closeInventoryInspect?.focus();
}

function closeInventoryInspector() {
    inventoryInspectOverlay?.classList.add("hidden");
    inspectedInventoryItem = null;
}

document.querySelectorAll("[data-item-slot]").forEach(slot => {
    slot.addEventListener("click", () => {
        const key = slot.dataset.itemSlot;
        const acquired = localStorage.getItem(`projetoNos_item_${key}`) === "true";
        if (!acquired) return;
        window.location.href = `item-viewer.html?item=${encodeURIComponent(key)}`;
    });
});

inventoryInspectAction?.addEventListener("click", () => {
    if (inspectedInventoryItem === "memories") {
        inventoryPhotoBack = !inventoryPhotoBack;
        inventoryInspectAction.textContent = inventoryPhotoBack ? "[ VER FRENTE ]" : "[ VIRAR FOTOGRAFIA ]";
    } else if (inspectedInventoryItem === "features") {
        inventoryMedallionRotation = (inventoryMedallionRotation + 90) % 360;
    }
    renderInventoryInspectVisual();
});

closeInventoryInspect?.addEventListener("click", closeInventoryInspector);
inventoryInspectOverlay?.addEventListener("click", event => {
    if (event.target === inventoryInspectOverlay) closeInventoryInspector();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && inventoryInspectOverlay && !inventoryInspectOverlay.classList.contains("hidden")) {
        closeInventoryInspector();
    }
});

if (finalPuzzleButton) {
    finalPuzzleButton.addEventListener("click", () => {
        if (finalPuzzleButton.disabled) return;
        triggerSystemGlitch(true);
        window.location.href = "puzzle.html";
    });
}

/* =========================================================
   PAREDE DE MEMÓRIAS — COLAGEM CLICÁVEL
========================================================= */
const MEMORY_GALLERY_POOL = [
    "assets/nois/0550935d-d324-4307-b264-39ce3a980d16.jpg",
    "assets/nois/400ec815-d2a5-44da-94ad-5b5cb775577d.jpg",
    "assets/nois/b642e403-8eb8-4410-bb8b-8b5cc1472194.jpg",
    "assets/nois/foto1.jpg",
    "assets/nois/foto10.jpg",
    "assets/nois/foto2.webp",
    "assets/nois/foto3.jpg",
    "assets/nois/foto4.jpg",
    "assets/nois/foto5.jpg",
    "assets/nois/foto6.jpg",
    "assets/nois/foto7.jpg",
    "assets/nois/foto8.jpg",
    "assets/nois/IMG_20230910_181027.jpg",
    "assets/nois/IMG_20250718_201457.jpg",
    "assets/origem/754d66cb-096b-447e-83e0-7d713d21a7b7.jpg",
    "assets/origem/IMG_20201223_081608.jpg",
    "assets/origem/IMG_20201227_111719.jpg",
    "assets/origem/IMG_20201227_111833.jpg",
    "assets/origem/IMG_20210220_082630.jpg",
    "assets/origem/IMG_20210314_221407.jpg",
    "assets/origem/IMG_20210421_153741.jpg",
    "assets/origem/IMG_20210421_154303.jpg",
    "assets/origem/IMG_20210421_155318.jpg",
    "assets/origem/IMG_20210603_120714.jpg",
    "assets/origem/IMG_20220411_082723.jpg",
    "assets/origem/PXL_20231226_085041576.jpg",
    "assets/zozoe/IMG_20211210_231617.jpg",
    "assets/zozoe/IMG_20211213_083224.jpg",
    "assets/zozoe/IMG_20220120_103548.jpg",
    "assets/zozoe/IMG_20220215_075334.jpg",
    "assets/zozoe/IMG_20220224_080829.jpg",
    "assets/zozoe/IMG_20220323_081934.jpg",
    "assets/zozoe/IMG_20220405_205757.jpg",
    "assets/zozoe/IMG_20220423_173544.jpg",
    "assets/zozoe/IMG_20220521_113809.jpg",
    "assets/zozoe/IMG_20220704_185104.jpg",
    "assets/amora/5f4ffacf-376e-4b45-9b54-bc756f84066c.jpg",
    "assets/amora/671790098_18523702858075238_3481681728472858417_n.webp",
    "assets/amora/6fe8dd27-e5bd-4bd7-ae0c-18437e6ec091.jpg",
    "assets/amora/835e043d-00f2-4ec4-afb9-820222a85265.jpg",
    "assets/amora/b539a279-fae9-4ab0-b254-77b244bae882.jpg",
    "assets/amora/ceddfaf7-d977-4665-be98-90cd84f9475c.jpg",
    "assets/amora/defe4d19-9380-42c1-8bd8-410fcb231e16.jpg",
    "assets/amora/e1e66c3a-edab-4f22-89bf-e4842429e00f.jpg",
    "assets/amora/f47ca20c-901d-403b-80e5-0de63f784f95.jpg",
    "assets/amora/PXL_20240831_194929379.jpg",
    "assets/chacha/2a3458fc-0782-4ed9-b347-28dde716f201.jpg",
    "assets/chacha/IMG_20241209_120913.jpg",
    "assets/chacha/IMG_20250204_142620.jpg",
    "assets/chacha/IMG_20250214_101748.jpg",
    "assets/chacha/IMG_20250726_120010.jpg",
    "assets/chacha/IMG_20250819_121431.jpg",
    "assets/comidinhas/1cc6415d-c39d-4010-9686-07806020f22e.jpg",
    "assets/comidinhas/2b68b763-6fce-4402-959c-ce8a34b6cf2f.jpg",
    "assets/comidinhas/3170b143-f2e2-4cb5-ba6d-03534fc0c6e7.jpg",
    "assets/comidinhas/4949b5d3-cd66-45fa-9da5-5d2e2cf2967c.jpg",
    "assets/comidinhas/4a120c84-65dc-4421-b10d-1633bd354abf.jpg",
    "assets/comidinhas/4e6ae4f0-1b74-4181-8258-67f45f7b248c.jpg",
    "assets/comidinhas/4f00d244-4f90-4359-a1e7-4e375bcda1df.jpg",
    "assets/comidinhas/608239668_18499551235075238_2557246055249518200_n.webp",
    "assets/comidinhas/655e8c48-d886-4f02-b9e2-99d1311dff1c.jpg",
    "assets/comidinhas/a13e45eb-ed1a-4233-b4d5-cb7d4b9824c7.jpg",
    "assets/comidinhas/a6e6c4d1-4d47-45ae-8f28-6c69c31adb40.jpg",
    "assets/comidinhas/bc2d5006-4e29-49f5-a8c9-87ca90df1af6.jpg",
    "assets/comidinhas/c017b1cb-378c-40f3-bbc4-dec27b8a54b3.jpg",
    "assets/comidinhas/c492aa6b-1602-4447-9f3f-7355fabeef10.jpg",
    "assets/comidinhas/Captura de tela 2026-09-22 143610.png",
    "assets/comidinhas/IMG_20220120_202730.jpg",
    "assets/comidinhas/IMG_20220212_205042.jpg",
    "assets/comidinhas/IMG_20220702_185357.jpg",
    "assets/comidinhas/IMG_20220709_135051.jpg",
    "assets/comidinhas/IMG_20250204_152350.jpg",
    "assets/comidinhas/PXL_20230110_133440126.jpg",
    "assets/imagens/02ac5233-77a5-4893-8559-c0f285118c21.jpg",
    "assets/imagens/1635317a-a714-462f-9f30-6c8f74817638.jpg",
    "assets/imagens/3fc982c3-1544-409f-adee-cd4873820cef.jpg",
    "assets/imagens/4bd28bdd-7d9e-425e-a3f2-c18e9a42c599.jpg",
    "assets/imagens/521087ee-055f-4897-84cf-1fe018d4d413.jpg",
    "assets/imagens/629b0fc8-7078-4c8b-a498-754d7b800ac5.jpg",
    "assets/imagens/66fce737-ae7f-40ce-b85f-bf0f94489871.jpg",
    "assets/imagens/77d612f5-47b9-4817-ac3a-a98e6404ef98.jpg",
    "assets/imagens/91f40608-569b-4605-ad9a-78f7f40c23aa.jpg",
    "assets/imagens/9d60f006-d10c-455f-8495-9ae9797779d7.jpg",
    "assets/imagens/amora.jpg",
    "assets/imagens/b2d3c7e9-0ad7-4a97-a01d-0ddfaae51e51.jpg",
    "assets/imagens/b9ce9190-f453-4f3c-9f9a-5f50ab15c776.jpg",
    "assets/imagens/c09da740-fadf-4e57-a8ea-a85d40a8aeb5.jpg",
    "assets/imagens/c0a674cd-329a-4262-a3ac-263745e92fb4.jpg",
    "assets/imagens/d1bab01b-3e4d-4121-a677-79032dd67606.jpg",
    "assets/imagens/foto-nossa-2.jpg",
    "assets/imagens/lagum.jpg",
    "assets/imagens/memoria-001.jpg",
    "assets/imagens/primeiroEncontro.jpg",
    "assets/imagens/relacionamentoCmg.jpg",
    "assets/imagens/zoe.jpg"
];

const MEMORY_WALL_CAPTIONS = [
    "FRAGMENTO RECUPERADO", "ARQUIVO VISUAL", "DADO AFETIVO", "CACHE TEMPORAL",
    "REGISTRO NÃO CLASSIFICADO", "EVIDÊNCIA VISUAL", "FRAGMENTO FORA DO PROTOCOLO"
];

function shuffleArray(values) {
    const array = [...values];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createWallLayout(count) {
    const columns = 5;
    const rows = Math.ceil(count / columns);
    return Array.from({ length: count }, (_, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = 10 + col * 20 + (Math.random() * 8 - 4);
        const y = 13 + row * (76 / Math.max(1, rows - 1 || 1)) + (Math.random() * 7 - 3.5);
        return {
            x: Math.max(8, Math.min(92, x)),
            y: Math.max(11, Math.min(89, y)),
            w: 150 + Math.round(Math.random() * 95),
            h: 125 + Math.round(Math.random() * 75),
            r: -9 + Math.round(Math.random() * 18)
        };
    });
}

let memoryWallStage = -1;

function buildMemoryWall(force = false) {
    if (!memoryWall) return;

    const state = getProgressState();
    const stage = DEBUG_MODE ? 6 : Math.max(1, state.completedMemories);
    if (!force && memoryWallStage === stage) return;
    memoryWallStage = stage;

    memoryWall.innerHTML = "";

    // A parede cresce de verdade: poucos fragmentos no começo e muitos no final.
    // A seleção é aleatória sem repetir a mesma imagem dentro da montagem atual.
    const desiredCount = Math.min(MEMORY_GALLERY_POOL.length, 3 + stage * 4);
    const selected = shuffleArray(MEMORY_GALLERY_POOL).slice(0, desiredCount);
    const layout = createWallLayout(selected.length);

    selected.forEach((src, index) => {
        const pos = layout[index];
        const item = {
            src,
            caption: `${MEMORY_WALL_CAPTIONS[index % MEMORY_WALL_CAPTIONS.length]} ${String(index + 1).padStart(2, "0")}`
        };

        const button = document.createElement("button");
        button.className = "wall-photo wall-photo-enter";
        button.style.setProperty("--x", `${pos.x}%`);
        button.style.setProperty("--y", `${pos.y}%`);
        button.style.setProperty("--w", `${pos.w}px`);
        button.style.setProperty("--h", `${pos.h}px`);
        button.style.setProperty("--r", `${pos.r}deg`);
        button.style.setProperty("--delay", `${Math.min(index, 16) * 45}ms`);
        button.style.zIndex = String(index + 1);
        button.setAttribute("aria-label", `Abrir ${item.caption}`);

        const image = document.createElement("img");
        image.src = item.src;
        image.alt = item.caption;
        image.loading = "lazy";

        button.appendChild(image);
        button.addEventListener("click", () => openLightbox(item));
        memoryWall.appendChild(button);
    });
}

function openLightbox(item) {
    lightboxImage.src = item.src;
    lightboxImage.alt = item.caption;
    lightboxCaption.textContent = item.caption;
    photoLightbox.classList.remove("hidden");
    lightboxClose.focus();
}

function closeLightbox() {
    photoLightbox.classList.add("hidden");
    lightboxImage.src = "";
}

lightboxClose.addEventListener("click", closeLightbox);
photoLightbox.addEventListener("click", (event) => {
    if (event.target === photoLightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !photoLightbox.classList.contains("hidden")) {
        closeLightbox();
    }
});


window.addEventListener("hashchange", () => {
    const requested = window.location.hash.replace("#", "");
    if (!MODULE_SCREENS[requested]) return;
    if (!getModuleAccess(requested)) return;
    if (requested === currentModule && MODULE_SCREENS[requested]?.classList.contains("active")) return;
    showModule(requested);
});

/* Ícones Lucide (ISC) e desenhos vetoriais originais do PROJETO: NÓS. */
const NOS_ART = {"map-pin": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" />\n  <circle cx=\"12\" cy=\"10\" r=\"3\" />\n</svg>\n", "cat": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z\" />\n  <path d=\"M8 14v.5\" />\n  <path d=\"M16 14v.5\" />\n  <path d=\"M11.25 16.25h1.5L12 17l-.75-.75Z\" />\n</svg>\n", "utensils": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\" />\n  <path d=\"M7 2v20\" />\n  <path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\" />\n</svg>\n", "sparkles": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" />\n  <path d=\"M20 2v4\" />\n  <path d=\"M22 4h-4\" />\n  <circle cx=\"4\" cy=\"20\" r=\"2\" />\n</svg>\n", "coffee": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M10 2v2\" />\n  <path d=\"M14 2v2\" />\n  <path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\" />\n  <path d=\"M6 2v2\" />\n</svg>\n", "plane": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z\" />\n</svg>\n", "clapperboard": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"m12.296 3.464 3.02 3.956\" />\n  <path d=\"M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z\" />\n  <path d=\"M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />\n  <path d=\"m6.18 5.276 3.1 3.899\" />\n</svg>\n", "gamepad-2": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <line x1=\"6\" x2=\"10\" y1=\"11\" y2=\"11\" />\n  <line x1=\"8\" x2=\"8\" y1=\"9\" y2=\"13\" />\n  <line x1=\"15\" x2=\"15.01\" y1=\"12\" y2=\"12\" />\n  <line x1=\"18\" x2=\"18.01\" y1=\"10\" y2=\"10\" />\n  <path d=\"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z\" />\n</svg>\n", "camera": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z\" />\n  <circle cx=\"12\" cy=\"13\" r=\"3\" />\n</svg>\n", "mountain": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"m8 3 4 8 5-5 5 15H2L8 3z\" />\n</svg>\n", "car": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2\" />\n  <circle cx=\"7\" cy=\"17\" r=\"2\" />\n  <path d=\"M9 17h6\" />\n  <circle cx=\"17\" cy=\"17\" r=\"2\" />\n</svg>\n", "paw-print": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <circle cx=\"11\" cy=\"4\" r=\"2\" />\n  <circle cx=\"18\" cy=\"8\" r=\"2\" />\n  <circle cx=\"20\" cy=\"16\" r=\"2\" />\n  <path d=\"M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z\" />\n</svg>\n", "heart": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\" />\n</svg>\n", "notebook-pen": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4\" />\n  <path d=\"M2 6h4\" />\n  <path d=\"M2 10h4\" />\n  <path d=\"M2 14h4\" />\n  <path d=\"M2 18h4\" />\n  <path d=\"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" />\n</svg>\n", "church": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M10 9h4\" />\n  <path d=\"M12 7v5\" />\n  <path d=\"M14 21v-3a2 2 0 0 0-4 0v3\" />\n  <path d=\"m18 9 3.52 2.147a1 1 0 0 1 .48.854V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6.999a1 1 0 0 1 .48-.854L6 9\" />\n  <path d=\"M6 21V7a1 1 0 0 1 .376-.782l5-3.999a1 1 0 0 1 1.249.001l5 4A1 1 0 0 1 18 7v14\" />\n</svg>\n", "key-round": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z\" />\n  <circle cx=\"16.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />\n</svg>\n", "tv": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"100%\"\n  height=\"100%\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"m17 2-5 5-5-5\" />\n  <rect width=\"20\" height=\"15\" x=\"2\" y=\"7\" rx=\"2\" />\n</svg>\n", "d20": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m50 5 40 22v46L50 95 10 73V27Z M50 5 26 40 74 40 50 5 M26 40 10 27 M74 40 90 27 M26 40 10 73 50 95 74 40 90 73 M26 40 50 82 74 40 M50 82 50 95\"/><text x=\"50\" y=\"63\" fill=\"currentColor\" stroke=\"none\" font-family=\"Georgia\" font-size=\"21\" text-anchor=\"middle\">20</text></svg>", "floripa": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 67h90M8 80q12-8 23 0t23 0t23 0t19 0M12 63V18h8v45M80 63V18h8v45M16 27q34 35 68 0M16 28v35m12-23v23m11-15v15m11-12v12m11-15v15m11-23v23M10 18h12m56 0h12\"/></svg>", "sao-paulo": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 82h90M12 74V30h26v44M62 74V30h26v44M17 30V20h15v10m36 0V20h15v10M38 55h24M38 40h24M18 38v8m12-8v8m-12 8v8m12-8v8m40-26v8m12-8v8m-12 8v8m12-8v8M41 75V56h18v19\"/></svg>", "soot": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m50 14 6 9 12-5 2 11 13 2-5 12 9 8-11 7 3 13-13-1-6 13-10-7-11 7-6-13-13 1 3-13-11-7 9-8-5-12 13-2 2-11 12 5Z\"/><ellipse cx=\"40\" cy=\"46\" rx=\"7\" ry=\"10\"/><ellipse cx=\"60\" cy=\"46\" rx=\"7\" ry=\"10\"/><circle cx=\"42\" cy=\"48\" r=\"2\" fill=\"currentColor\"/><circle cx=\"58\" cy=\"48\" r=\"2\" fill=\"currentColor\"/></svg>", "no-face": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M28 82V34a22 27 0 0 1 44 0v48Z\"/><ellipse cx=\"50\" cy=\"38\" rx=\"17\" ry=\"26\"/><path d=\"M39 29h4m14 0h4M39 36v8m22-8v8M45 53h10\"/></svg>", "adventure": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 78V29L28 10l13 12h18l13-12 9 19v49Z\"/><ellipse cx=\"50\" cy=\"48\" rx=\"24\" ry=\"21\"/><path d=\"M39 44v2m22-2v2M42 57q8 7 16 0M30 84V72m40 12V72\"/></svg>", "jack": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"50\" cy=\"43\" r=\"29\"/><path d=\"M27 35q11-8 16 4-6 14-16 5Z M73 35q-11-8-16 4 6 14 16 5Z M49 46l-3 9h8ZM27 57q23 14 46 0M34 56v9m8-6v9m8-7v9m8-11v9m8-12v9M45 74l-4 14 9-6 9 6-4-14\"/></svg>", "rings": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"37\" cy=\"60\" r=\"23\"/><circle cx=\"65\" cy=\"60\" r=\"23\"/><path d=\"m30 25 7-10 7 10-7 9Z m28 0 7-10 7 10-7 9Z\"/></svg>", "dachshund": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 53q-12-3-6-18M12 53h48q6-20 20-14l9 7h7v9H85l-4 18h-9l-2-16H31l-4 16h-9l-3-16Z M77 42q-6 19 3 19t5-16\"/><circle cx=\"88\" cy=\"48\" r=\"1.5\" fill=\"currentColor\"/></svg>", "beach": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 76q13-8 25 0t25 0t32 0M58 70l9-45M48 29q18-16 32 4l-32-4ZM66 29q-2 16 17 17M65 29q-17 5-19 18M12 58q5-25 28-18\"/><circle cx=\"22\" cy=\"23\" r=\"9\"/></svg>", "apartment": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 88V12h76v76ZM12 45h35V12M47 45h41M47 45v20m0 11v12M20 21h19v15H20ZM60 19h20v18H60ZM20 57h22v20H20ZM57 69h21v12H57Z\"/><path d=\"M47 65q11 0 11 11H47M12 81h10\"/></svg>", "cup-pair": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 37h28v25a13 13 0 0 1-26 0V37M40 43h8q9 12-8 12M58 37h28v25a13 13 0 0 1-26 0V37M86 43h7q9 12-7 12M11 82h79M22 25v-8m9 8v-8m36 8v-8m9 8v-8\"/></svg>", "big-cat": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 61q-11-31 5-39l12 10h22l12-10q16 8 5 39 15 10 3 21H20q-13-11 2-21Z\"/><path d=\"M32 46v2m36-2v2m-23 9 5 4 5-4M50 61v5m-14-9H18m46 0h18M38 79v-7m24 7v-7M82 76q16-19 5-24\"/></svg>"};

function nosIcon(name) { return NOS_ART[name] || NOS_ART.heart; }
function nosPixelScene() {
 const base = typeof NOS_BASE_URL !== "undefined" ? NOS_BASE_URL : new URL(".", window.location.href);
 const src = new URL("assets/letters/proposta-16bit.png?v=4", base).href;
 return `<figure class="nos-pixel-stage"><div class="nos-pixel-strip" role="img" aria-label="Animação em pixel art de três momentos: ele faz o pedido, ela aceita e os dois se abraçam, com a Amorinha, o Charlie e a Zoe no apartamento"><img src="${src}" alt="" width="2172" height="724" decoding="async"></div><figcaption>NOVO STATUS DESBLOQUEADO: NOIVOS</figcaption></figure>`;
}

function nosDecorate(target, items) {
    if (!target) return;
    target.innerHTML = items.map(([name, x, y, tilt, size, caption]) =>
        `<div class="nos-doodle" style="left:${x}%;top:${y}px;--tilt:${tilt}deg;--size:${size}px">${nosIcon(name)}${caption ? `<span>${caption}</span>` : ""}</div>`).join("");
}
function initializeNosDecoration() {
    document.getElementById("reportTextReserve").textContent = REPORT_PAGE_TEXT;
    document.getElementById("updateTextReserve").textContent = UPDATE_PAGE_TEXT;
    // Coordenadas em pixels: a decoração não acompanha a altura da digitação.
    nosDecorate(reportLetter?.querySelector(".nos-letter-decoration"), [
        ["d20",3,120,-14,75,"nossas aventuras"],["gamepad-2",87,300,12,68,"só mais uma fase"],
        ["church",3,490,-8,70,"o primeiro encontro"],["coffee",87,630,9,64,"a gente e um café"],
        ["floripa",2,855,-7,88,"Floripa"],["sao-paulo",86,1040,8,80,"São Paulo"],
        ["paw-print",4,1230,-14,63,"Amora & Zoe"],["big-cat",85,1420,11,80,"Charlie"],
        ["no-face",4,1610,-8,64,"Chihiro"],["adventure",86,1800,10,72,"Hora de Aventura"],
        ["clapperboard",3,1990,-9,70,"filmes nossos"],["jack",86,2180,8,72,"Jack"],
        ["soot",5,2410,-10,65,"um pouco de Ghibli"],["camera",85,2580,10,64,"memórias nossas"]
    ]);
    nosDecorate(updateScreen?.querySelector(".nos-letter-decoration"), [
        ["heart",4,180,-12,62,""],["sparkles",86,360,11,55,""],
        ["cup-pair",3,660,-8,74,"nós dois"],["rings",86,810,9,55,""]
    ]);
    reportLetter?.querySelector(".nos-letter-heading")?.insertAdjacentHTML("afterend",
        `<div class="nos-mobile-memories" aria-hidden="true">${["d20","coffee","paw-print","floripa","no-face"].map(name => `<span>${nosIcon(name)}</span>`).join("")}</div>`);
    document.querySelectorAll(".nos-floaters").forEach(layer => {
        const refs = [["soot",3,16],["plane",91,25],["cat",2,68],["gamepad-2",91,76],["coffee",4,43],["sparkles",92,49]];
        layer.innerHTML = refs.map(([name,x,y],i) => `<div class="nos-floater" style="left:${x}%;top:${y}%;animation-delay:-${i*1.3}s">${nosIcon(name)}</div>`).join("");
    });
}
function nosCelebrate() {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const layer = document.createElement("div");
    layer.className = "nos-celebration";
    layer.setAttribute("aria-hidden", "true");
    for (let i=0;i<24;i++) {
        const petal = document.createElement("i");
        petal.style.left = `${(i*37)%100}%`;
        petal.style.animationDelay = `${(i%6)*.2}s`;
        petal.style.background = ["#a9895a","#bd967f","#8b9873"][i%3];
        layer.appendChild(petal);
    }
    updateScreen.querySelector(".nos-update-paper")?.appendChild(layer);
    setTimeout(() => layer.remove(), 6500);
}
initializeNosDecoration();

/* =========================================================
   INICIAR
========================================================= */
document.body.classList.toggle("debug-mode", DEBUG_MODE);

if (DEBUG_MODE) {
    document.querySelectorAll('a[href^="experiencias.html"]').forEach((link) => {
        const hash = link.hash || "";
        link.href = `experiencias.html?debug=1${hash}`;
    });
}

refreshProgressUI();

const requestedModule = window.location.hash.replace("#", "");
const cachedSession = localStorage.getItem("projetoNos_unlocked") === "true";

if (DEBUG_MODE) {
    showModule(MODULE_SCREENS[requestedModule] ? requestedModule : "home");
} else if (cachedSession && MODULE_SCREENS[requestedModule] && getModuleAccess(requestedModule)) {
    showModule(requestedModule);
} else {
    bootSystem();
}
