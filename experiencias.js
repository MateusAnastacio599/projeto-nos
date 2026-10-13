const DEBUG_MODE = new URLSearchParams(window.location.search).get("debug") === "1";

const lockedView = document.getElementById("lockedView");
const hubView = document.getElementById("experienceHubView");
const detailView = document.getElementById("experienceDetailView");
const experienceMap = document.getElementById("experienceMap");
const detailContent = document.getElementById("experienceDetailContent");
const archiveNav = document.getElementById("experienceArchiveNav");
const detailIndex = document.getElementById("detailIndex");
const detailStatus = document.getElementById("detailStatus");
const backButton = document.getElementById("backToExperienceHub");
const registerButton = document.getElementById("registerExperienceButton");
const nextButton = document.getElementById("nextExperienceButton");
const completionPanel = document.getElementById("moduleCompletionPanel");
const completeModuleButton = document.getElementById("completeExperiencesModule");
const progressText = document.getElementById("expProgressText");
const progressFill = document.getElementById("expProgressFill");
const scanRegistered = document.getElementById("scanRegistered");
const scanClassification = document.getElementById("scanClassification");
const lightbox = document.getElementById("experienceLightbox");
const lightboxImage = document.getElementById("experienceLightboxImage");
const lightboxCaption = document.getElementById("experienceLightboxCaption");
const closeLightboxButton = document.getElementById("closeExperienceLightbox");
const rewardOverlay = document.getElementById("itemRewardOverlay");
const storeRewardButton = document.getElementById("storeRewardButton");
const chaosLayer = document.getElementById("experienceChaos");
const crackLayer = document.getElementById("experienceCracks");

const EXPERIENCE_ORDER = ["jogos", "series", "comidas", "companheiros", "cantinho", "coisas"];

const GAME_ITEMS = [
    ["Neva", "assets/jogos/0590d448e4ab0ea8b753e2f07516559ab3c4411d7bf86d92e886978308e4bb67.avif"],
    ["It Takes Two", "assets/jogos/0Xqi1LgRoEtJ5zlFprpd54Vu.webp"],
    ["Rayman Legends", "assets/jogos/7075b9de20b7c835325dd28d4a9dd9e4e1cf58d3aa9339ced81100933902ee31.avif"],
    ["Until Dawn", "assets/jogos/MV5BMGQwMzA4ODctN2VjNi00NTk2LWE5NzItOWJlYmM3NWUyNjZjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"],
    ["Castle Crashers", "assets/jogos/MV5BZWEwZDNiOTAtZDg1Ny00MjcwLWE3MTAtZTI2NDdhN2Q1MGM1XkEyXkFqcGc@._V1_.jpg"],
    ["Tricky Towers", "assets/jogos/apps.27000.66635400375133017.044f5e90-c778-442e-8556-7b297101249d.jpg"],
    ["Little Nightmares", "assets/jogos/apps.53771.71995601368241962.063be1f5-e727-44b9-9243-8f287ee0ae94.jpg"],
    ["Overcooked!", "assets/jogos/capa-e1610153377610.jpg"],
    ["Cat Quest II", "assets/jogos/d787323f2ae369e87b3602df37762b86ab13c18e86b1e106ec58e14a5ca102b9.avif"],
    ["Untitled Goose Game", "assets/jogos/e3549b645ea3dc77411280ba4a83f018235bbdb6f0b32039a5519cee985f0f4f.avif"],
    ["Stray", "assets/jogos/is-there-anywhere-i-can-commission-artwork-of-the-stray-v0-mpcdmptfkl3a1.webp"],
    ["Overcooked! 2", "assets/jogos/overcooked2-capa.webp"],
    ["Baldur's Gate 3", "assets/jogos/which-cover-is-better-v0-9h0sjl9isccb1.webp"],
    ["Outlast 2", "assets/jogos/wide_art_image-outlast-2-d2b649d8.original.jpg"]
].map(([title, src]) => ({ title, src }));

const SERIES_ITEMS = [
    ["The Office", "assets/serie/0dd8322809f5493fa8c2a8a2bbfe53a1e9960eaab0aac5517296bc9bdfa567ad.jpg"],
    ["The Boys", "assets/serie/1532536.webp"],
    ["Invincible", "assets/serie/3176360.webp"],
    ["Attack on Titan", "assets/serie/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"],
    ["The Mandalorian", "assets/serie/Mandalorian.webp"],
    ["Stranger Things", "assets/serie/Stranger_Things_logo.png"],
    ["Ted Lasso", "assets/serie/ae326487e40933648d362b6abcea852e5040a80ee2beecf58cd7e9fb6b464fb2.jpg"],
    ["How I Met Your Mother", "assets/serie/compose.webp"],
    ["The Big Bang Theory", "assets/serie/eb7d5f3f4485c0378fcc55e68ee797c20965a48a91219ddc36aa48b110b09960._SX1080_FMjpg_.jpg"],
    ["Brooklyn Nine-Nine", "assets/serie/images.jpg"],
    ["Loki", "assets/serie/loki.webp"],
    ["The Good Place", "assets/serie/maxresdefault.jpg"],
    ["Fleabag", "assets/serie/poster_big.jpg"],
    ["Young Sheldon", "assets/serie/v-young-sheldon-1.jpg"]
].map(([title, src]) => ({ title, src }));

const FOOD_ITEMS = [
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
    "assets/comidinhas/PXL_20230110_133440126.jpg"
];

const COMPANION_GROUPS = [
    {
        title: "ORIGEM & JULIEJULIE",
        copy: "Fragmentos mais antigos localizados no arquivo dos companheiros.",
        files: [
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
            "assets/origem/PXL_20231226_085041576.jpg"
]
    },
    {
        title: "ZOE",
        copy: "Entidade incorporada permanentemente ao projeto. Nível de ocupação de espaço emocional: elevado.",
        files: [
            "assets/zozoe/IMG_20211210_231617.jpg",
            "assets/zozoe/IMG_20211213_083224.jpg",
            "assets/zozoe/IMG_20220120_103548.jpg",
            "assets/zozoe/IMG_20220215_075334.jpg",
            "assets/zozoe/IMG_20220224_080829.jpg",
            "assets/zozoe/IMG_20220323_081934.jpg",
            "assets/zozoe/IMG_20220405_205757.jpg",
            "assets/zozoe/IMG_20220423_173544.jpg",
            "assets/zozoe/IMG_20220521_113809.jpg",
            "assets/zozoe/IMG_20220704_185104.jpg"
]
    },
    {
        title: "AMORA",
        copy: "Arquivo afetivo detectado. A quantidade de registros recuperados aumentou consideravelmente.",
        files: [
            "assets/amora/5f4ffacf-376e-4b45-9b54-bc756f84066c.jpg",
            "assets/amora/671790098_18523702858075238_3481681728472858417_n.webp",
            "assets/amora/6fe8dd27-e5bd-4bd7-ae0c-18437e6ec091.jpg",
            "assets/amora/835e043d-00f2-4ec4-afb9-820222a85265.jpg",
            "assets/amora/b539a279-fae9-4ab0-b254-77b244bae882.jpg",
            "assets/amora/ceddfaf7-d977-4665-be98-90cd84f9475c.jpg",
            "assets/amora/defe4d19-9380-42c1-8bd8-410fcb231e16.jpg",
            "assets/amora/e1e66c3a-edab-4f22-89bf-e4842429e00f.jpg",
            "assets/amora/f47ca20c-901d-403b-80e5-0de63f784f95.jpg",
            "assets/amora/PXL_20240831_194929379.jpg"
]
    },
    {
        title: "CHACHÁ",
        copy: "Novo conjunto de registros anexado ao subsistema de companheiros.",
        files: [
            "assets/chacha/2a3458fc-0782-4ed9-b347-28dde716f201.jpg",
            "assets/chacha/IMG_20241209_120913.jpg",
            "assets/chacha/IMG_20250204_142620.jpg",
            "assets/chacha/IMG_20250214_101748.jpg",
            "assets/chacha/IMG_20250726_120010.jpg",
            "assets/chacha/IMG_20250819_121431.jpg"
]
    }
];

const OURS_ITEMS = [
    { title: "NÓS / FRAGMENTO 01", src: "assets/nois/0550935d-d324-4307-b264-39ce3a980d16.jpg" },
    { title: "NÓS / FRAGMENTO 02", src: "assets/nois/400ec815-d2a5-44da-94ad-5b5cb775577d.jpg" },
    { title: "NÓS / FRAGMENTO 03", src: "assets/nois/b642e403-8eb8-4410-bb8b-8b5cc1472194.jpg" },
    { title: "NÓS / FRAGMENTO 04", src: "assets/nois/foto1.jpg" },
    { title: "NÓS / FRAGMENTO 05", src: "assets/nois/foto10.jpg" },
    { title: "NÓS / FRAGMENTO 06", src: "assets/nois/foto2.webp" },
    { title: "NÓS / FRAGMENTO 07", src: "assets/nois/foto3.jpg" },
    { title: "NÓS / FRAGMENTO 08", src: "assets/nois/foto4.jpg" },
    { title: "NÓS / FRAGMENTO 09", src: "assets/nois/foto5.jpg" },
    { title: "NÓS / FRAGMENTO 10", src: "assets/nois/foto6.jpg" },
    { title: "NÓS / FRAGMENTO 11", src: "assets/nois/foto7.jpg" },
    { title: "NÓS / FRAGMENTO 12", src: "assets/nois/foto8.jpg" },
    { title: "NÓS / FRAGMENTO 13", src: "assets/nois/IMG_20230910_181027.jpg" },
    { title: "NÓS / FRAGMENTO 14", src: "assets/nois/IMG_20250718_201457.jpg" },
    { title: "ARQUIVO SOLTO / 01", src: "assets/imagens/02ac5233-77a5-4893-8559-c0f285118c21.jpg" },
    { title: "ARQUIVO SOLTO / 02", src: "assets/imagens/1635317a-a714-462f-9f30-6c8f74817638.jpg" },
    { title: "ARQUIVO SOLTO / 03", src: "assets/imagens/3fc982c3-1544-409f-adee-cd4873820cef.jpg" },
    { title: "ARQUIVO SOLTO / 04", src: "assets/imagens/4bd28bdd-7d9e-425e-a3f2-c18e9a42c599.jpg" },
    { title: "ARQUIVO SOLTO / 05", src: "assets/imagens/521087ee-055f-4897-84cf-1fe018d4d413.jpg" },
    { title: "ARQUIVO SOLTO / 06", src: "assets/imagens/629b0fc8-7078-4c8b-a498-754d7b800ac5.jpg" },
    { title: "ARQUIVO SOLTO / 07", src: "assets/imagens/66fce737-ae7f-40ce-b85f-bf0f94489871.jpg" },
    { title: "ARQUIVO SOLTO / 08", src: "assets/imagens/77d612f5-47b9-4817-ac3a-a98e6404ef98.jpg" },
    { title: "ARQUIVO SOLTO / 09", src: "assets/imagens/91f40608-569b-4605-ad9a-78f7f40c23aa.jpg" },
    { title: "ARQUIVO SOLTO / 10", src: "assets/imagens/9d60f006-d10c-455f-8495-9ae9797779d7.jpg" },
    { title: "ARQUIVO SOLTO / 11", src: "assets/imagens/b2d3c7e9-0ad7-4a97-a01d-0ddfaae51e51.jpg" },
    { title: "ARQUIVO SOLTO / 12", src: "assets/imagens/b9ce9190-f453-4f3c-9f9a-5f50ab15c776.jpg" },
    { title: "ARQUIVO SOLTO / 13", src: "assets/imagens/c09da740-fadf-4e57-a8ea-a85d40a8aeb5.jpg" },
    { title: "ARQUIVO SOLTO / 14", src: "assets/imagens/c0a674cd-329a-4262-a3ac-263745e92fb4.jpg" },
    { title: "ARQUIVO SOLTO / 15", src: "assets/imagens/d1bab01b-3e4d-4121-a677-79032dd67606.jpg" },
    { title: "ARQUIVO SOLTO / 16", src: "assets/imagens/foto-nossa-2.jpg" },
    { title: "PRIMEIRO ENCONTRO / ARQUIVO", src: "assets/imagens/primeiroEncontro.jpg" },
    { title: "STATUS HISTÓRICO", src: "assets/imagens/relacionamentoCmg.jpg" },
    { title: "LAGUM / TRILHA RECORRENTE", src: "assets/imagens/lagum.jpg" },
    { title: "D20 / DADOS DE AVENTURA", src: "assets/imagens/d20.png" },
    { title: "HOMEM-ARANHA / ARQUIVO NÃO CLASSIFICADO", src: "assets/imagens/homem-aranha.png" },
    { title: "MEMÓRIA VISUAL 001", src: "assets/imagens/memoria-001.jpg" },
];

function getOursLayout(index, total) {
    const columns = 5;
    const rows = Math.max(1, Math.ceil(total / columns));
    const col = index % columns;
    const row = Math.floor(index / columns);

    const xJitter = [-2.8, 2.2, -1.2, 2.6, -1.8][col];
    const yJitter = [1.2, -1.7, 1.8, -1.1, 0.8][index % 5];
    const rotations = [-6, 4, -3, 6, -4, 3, -5, 5];
    const widths = [200, 180, 220, 190, 210, 175, 225];

    const x = 10 + col * 20 + xJitter;
    const yStep = rows > 1 ? 84 / (rows - 1) : 0;
    const y = 8 + row * yStep + yJitter;

    return [
        Math.max(7, Math.min(93, x)),
        Math.max(7, Math.min(93, y)),
        rotations[index % rotations.length],
        widths[index % widths.length]
    ];
}

const EXPERIENCE_META = {
    jogos: {
        index: "01",
        title: "JOGOS",
        eyebrow: "PADRÃO COOPERATIVO",
        intro: "Alguns jogos foram só jogos. Outros viraram lugares em que passamos horas juntos, discutimos estratégia, rimos, sofremos e terminamos uma história lado a lado.",
        system: "CLASSIFICAÇÃO: MODO COOPERATIVO RECORRENTE"
    },
    series: {
        index: "02",
        title: "SÉRIES QUE VIRARAM NOSSAS",
        eyebrow: "PADRÃO DE MARATONA",
        intro: "Nem toda série entra neste arquivo. Só as que realmente viraram hábito, referência, piada ou aquela promessa altamente confiável de assistir só mais um episódio.",
        system: "EFEITO CONHECIDO: “SÓ MAIS UM EPISÓDIO”"
    },
    comidas: {
        index: "03",
        title: "CAFÉS, RESTAURANTES & RECEITAS",
        eyebrow: "PADRÃO DE EXPLORAÇÃO",
        intro: "Conhecer um lugar novo, provar alguma coisa diferente, inventar receita ou aproveitar um desconto do Tour para descobrir outro café começou a se repetir com frequência suspeita.",
        system: "AVISO: PRECISAMOS URGENTEMENTE DE UM HOBBY QUE NÃO ENGORDE."
    },
    companheiros: {
        index: "04",
        title: "COMPANHEIROS",
        eyebrow: "ARQUIVOS AFETIVOS",
        intro: "O sistema tentou catalogar estes registros como animais domésticos. A classificação foi rejeitada por insuficiência de dados emocionais.",
        system: "CLASSIFICAÇÃO CORRETA: NOSSOS BICHINHOS"
    },
    cantinho: {
        index: "05",
        title: "NOSSO CANTINHO",
        eyebrow: "PROJETO FUTURO",
        intro: "Nem tudo que pertence ao projeto já aconteceu. Algumas coisas existem primeiro como plano, economia, conversa repetida e vontade de construir um lugar que seja realmente nosso.",
        system: "STATUS: SONHO EM CONSTRUÇÃO"
    },
    coisas: {
        index: "06",
        title: "COISAS NOSSAS",
        eyebrow: "CLASSIFICAÇÃO INSTÁVEL",
        intro: "Depois de analisar atividades, lugares, histórias e companheiros, o sistema encontrou um conjunto que não cabe em nenhuma categoria isolada.",
        system: "RESULTADO: A CLASSIFICAÇÃO TÉCNICA DEIXOU DE SER ÚTIL."
    }
};

function loadVisited() {
    try {
        const value = JSON.parse(localStorage.getItem("projetoNos_experienceVisited") || "[]");
        return new Set(Array.isArray(value) ? value.filter(id => EXPERIENCE_ORDER.includes(id)) : []);
    } catch {
        return new Set();
    }
}

let visited = loadVisited();
let currentExperience = null;
let chaosTimer = null;
let crackTimer = null;
let chaosImageBag = [];

function saveVisited() {
    localStorage.setItem("projetoNos_experienceVisited", JSON.stringify([...visited]));
}

function isAccessGranted() {
    return DEBUG_MODE || localStorage.getItem("projetoNos_memoriesComplete") === "true";
}

function firstFiveComplete() {
    return EXPERIENCE_ORDER.slice(0, 5).every(id => visited.has(id));
}

function allComplete() {
    return EXPERIENCE_ORDER.every(id => visited.has(id));
}

function updateProgressUI() {
    const count = visited.size;
    const pct = Math.round((count / EXPERIENCE_ORDER.length) * 100);
    progressText.textContent = `${count} / 6 REGISTRADAS`;
    progressFill.style.width = `${pct}%`;
    scanRegistered.textContent = String(count).padStart(2, "0");
    scanClassification.textContent = allComplete() ? "RECONHECIDA" : (count >= 3 ? "INSTÁVEL" : "INCOMPLETA");

    document.querySelectorAll(".experience-node").forEach(node => {
        const id = node.dataset.experience;
        const isFinal = id === "coisas";
        const orderIndex = EXPERIENCE_ORDER.indexOf(id);
        const sequentialVisible = isFinal
            ? (firstFiveComplete() || DEBUG_MODE || visited.has(id))
            : orderIndex <= visited.size;
        const unlocked = !isFinal || firstFiveComplete() || DEBUG_MODE;
        const done = visited.has(id);
        const state = node.querySelector(".node-state");
        const strong = node.querySelector("strong");
        const small = node.querySelector("small");

        node.classList.toggle("progress-hidden", !sequentialVisible);
        node.disabled = !unlocked || !sequentialVisible;
        node.classList.toggle("locked", !unlocked);
        node.classList.toggle("visited", done);

        if (isFinal) {
            strong.textContent = unlocked ? "COISAS NOSSAS" : "????????????";
            small.textContent = unlocked
                ? "o sistema encontrou uma categoria que não parece categoria"
                : "cinco padrões precisam ser registrados";
        }

        if (state) state.textContent = done ? "REGISTRADO" : (unlocked ? "DISPONÍVEL" : "BLOQUEADO");
    });

    completionPanel.classList.toggle("hidden", !allComplete());
    if (allComplete() && localStorage.getItem("projetoNos_experiencesComplete") === "true") {
        completeModuleButton.disabled = true;
        completeModuleButton.textContent = "[ OBJETO JÁ RECUPERADO ]";
    } else {
        completeModuleButton.disabled = false;
        completeModuleButton.textContent = "[ RECUPERAR OBJETO ]";
    }

    refreshAmbientChaos();
}

function renderHero(meta) {
    return `
        <header class="detail-hero">
            <p class="eyebrow">${meta.eyebrow}</p>
            <h1>${meta.title}</h1>
            <p>${meta.intro}</p>
            <span class="detail-system-line">${meta.system}</span>
        </header>
    `;
}

function renderShelf(items) {
    const rows = [];
    for (let i = 0; i < items.length; i += 7) rows.push(items.slice(i, i + 7));
    return `<div class="media-shelf-stack">${rows.map(row => `
        <div class="media-shelf-row">
            <div class="shelf-items">
                ${row.map(item => `
                    <button class="media-cover" data-lightbox-src="${item.src}" data-lightbox-caption="${escapeAttribute(item.title)}">
                        <img src="${item.src}" alt="${escapeAttribute(item.title)}" loading="lazy">
                        <span>${item.title}</span>
                    </button>
                `).join("")}
            </div>
        </div>
    `).join("")}</div>`;
}

function renderFoodGallery() {
    return `
        <div class="food-story-card">
            <strong>&gt; PADRÃO RECORRENTE IDENTIFICADO:</strong>
            sair para conhecer cafeterias, restaurantes e comidas novas; depois inventar mais alguma coisa para comer em casa.
            <br><br>
            &gt; FERRAMENTA RECORRENTE: <strong>APP TOUR / DESCONTOS E NOVOS LUGARES</strong><br>
            &gt; OBSERVAÇÃO: ainda precisamos encontrar um hobby que não engorde.
        </div>
        <div class="photo-masonry">
            ${FOOD_ITEMS.map((src, i) => `
                <button data-lightbox-src="${src}" data-lightbox-caption="REGISTRO GASTRONÔMICO ${String(i + 1).padStart(2, "0")}">
                    <img src="${src}" alt="Registro gastronômico ${i + 1}" loading="lazy">
                </button>
            `).join("")}
        </div>
    `;
}

function renderCompanions() {
    return `<div class="companion-groups">${COMPANION_GROUPS.map(group => `
        <section class="companion-group">
            <div class="companion-group-head">
                <h3>${group.title}</h3>
                <small>${group.copy}</small>
            </div>
            <div class="companion-gallery">
                ${group.files.map((src, i) => `
                    <button data-lightbox-src="${src}" data-lightbox-caption="${escapeAttribute(group.title)} / REGISTRO ${String(i + 1).padStart(2, "0")}">
                        <img src="${src}" alt="${escapeAttribute(group.title)} — registro ${i + 1}" loading="lazy">
                    </button>
                `).join("")}
            </div>
        </section>
    `).join("")}</div>`;
}

function renderHomeDream() {
    return `
        <div class="home-dream-layout">
            <div class="home-blueprint" aria-label="Planta conceitual do nosso cantinho">
                <div class="blueprint-room r1">SALA</div>
                <div class="blueprint-room r2">COZINHA</div>
                <div class="blueprint-room r3">QUARTO</div>
                <div class="blueprint-room r4">BANHEIRO</div>
                <div class="blueprint-room r5">BICHINHOS</div>
                <div class="blueprint-heart">♡</div>
            </div>
            <div class="dream-copy">
                <p class="eyebrow">OBJETIVO COMPARTILHADO</p>
                <h2>O ESSENCIAL PARA CHAMAR DE CASA.</h2>
                <p>
                    Guardar dinheiro para a nossa casinha não é só uma meta financeira dentro do projeto.
                    É imaginar o essencial: uma sala para existir juntos, uma cozinha para continuar inventando comida,
                    um quarto nosso, um banheiro e espaço suficiente para os bichinhos fazerem parte de tudo.
                </p>
                <p>
                    O tamanho ainda é desconhecido. O endereço também. A parte importante já foi definida faz tempo:
                    <strong>ser o nosso cantinho.</strong>
                </p>
                <div class="dream-metrics">
                    <div><span>RECURSOS</span><strong>EM ACÚMULO</strong></div>
                    <div><span>CÔMODOS ESSENCIAIS</span><strong>05 MAPEADOS</strong></div>
                    <div><span>COMPANHEIROS</span><strong>INCLUÍDOS</strong></div>
                    <div><span>STATUS</span><strong>EM CONSTRUÇÃO</strong></div>
                </div>
            </div>
        </div>
    `;
}

function renderOurThings() {
    return `
        <div class="ours-intro">
            <p class="eyebrow">ERRO DE CLASSIFICAÇÃO</p>
            <h2>NÃO É UMA LISTA DE HOBBIES.</h2>
            <p class="experience-lead">
                O sistema tentou organizar tudo em caixas separadas. Em algum ponto, as caixas começaram a se misturar.
                Uma música lembra uma conversa. Um jogo lembra uma noite. Uma foto lembra uma frase. Uma palavra sem sentido
                consegue apontar para uma história inteira.
            </p>
        </div>
        <div class="ours-scrapbook" style="--scrapbook-h:${Math.max(1040, Math.ceil(OURS_ITEMS.length / 5) * 230)}px">
            ${OURS_ITEMS.map((item, index) => {
                const [x, y, r, w] = getOursLayout(index, OURS_ITEMS.length);
                return `
                    <button class="ours-photo" style="--x:${x}%;--y:${y}%;--r:${r}deg;--w:${Math.round(w * 1.16)}px" data-lightbox-src="${item.src}" data-lightbox-caption="${escapeAttribute(item.title)}">
                        <img src="${item.src}" alt="${escapeAttribute(item.title)}" loading="lazy">
                    </button>
                `;
            }).join("")}
            <div class="ours-words" aria-hidden="true">
                <span>abroba</span><span>briga?</span><span>11:11</span><span>eu que amo mais</span>
                <span>casa cmg?</span><span>bó ficar de piguiça?</span><span>bochechas</span><span>beijo no nariz</span>
            </div>
        </div>
        <div class="ours-data-strip">
            <span>PIADAS SEM CONTEXTO</span><span>MÚSICAS</span><span>FOTOS RUINS E ÓTIMAS</span>
            <span>PREGUIÇA</span><span>JOGOS</span><span>COMIDA</span><span>BICHINHOS</span><span>PLANOS</span>
        </div>
    `;
}

function escapeAttribute(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}


function refreshArchiveNavigation() {
    if (!archiveNav) return;

    const moduleComplete = allComplete() || localStorage.getItem("projetoNos_experiencesComplete") === "true";
    const currentIndex = EXPERIENCE_ORDER.indexOf(currentExperience);

    archiveNav.querySelectorAll("[data-archive-target]").forEach((button) => {
        const id = button.dataset.archiveTarget;
        const index = EXPERIENCE_ORDER.indexOf(id);

        // Durante o primeiro percurso: mostra apenas arquivos já registrados + arquivo atual.
        // Depois do módulo concluído: todos ficam disponíveis para releitura.
        const visible = DEBUG_MODE || moduleComplete || visited.has(id) || index === currentIndex;
        button.classList.toggle("hidden", !visible);
        button.disabled = !visible;
        button.classList.toggle("active", id === currentExperience);
        button.classList.toggle("registered", visited.has(id));
    });

    archiveNav.classList.toggle("complete", moduleComplete);
}

function renderExperience(id) {
    const meta = EXPERIENCE_META[id];
    if (!meta) return;
    let body = "";

    if (id === "jogos") body = renderShelf(GAME_ITEMS);
    if (id === "series") body = renderShelf(SERIES_ITEMS);
    if (id === "comidas") body = renderFoodGallery();
    if (id === "companheiros") body = renderCompanions();
    if (id === "cantinho") body = renderHomeDream();
    if (id === "coisas") body = renderOurThings();

    detailContent.innerHTML = renderHero(meta) + body;
    detailIndex.textContent = `ARQUIVO ${meta.index}`;
    updateDetailStatus();
    wireLightboxTriggers();
}

function openExperience(id, { updateHash = true } = {}) {
    if (!EXPERIENCE_ORDER.includes(id)) return;
    if (id === "coisas" && !firstFiveComplete() && !DEBUG_MODE) {
        systemJolt();
        return;
    }

    currentExperience = id;
    hubView.classList.remove("active");
    detailView.classList.add("active");
    renderExperience(id);
    window.scrollTo({ top: 0, behavior: "auto" });

    nextButton.classList.add("hidden");
    nextButton.disabled = true;

    if (updateHash) history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
}

function showHub({ updateHash = true } = {}) {
    currentExperience = null;
    detailView.classList.remove("active");
    hubView.classList.add("active");
    updateProgressUI();
    window.scrollTo({ top: 0, behavior: "auto" });
    if (updateHash) history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

function updateDetailStatus() {
    if (!currentExperience) return;
    const done = visited.has(currentExperience);
    detailStatus.textContent = done ? "REGISTRADO" : "NÃO REGISTRADO";
    registerButton.disabled = done;
    registerButton.textContent = done ? "[ EXPERIÊNCIA REGISTRADA ]" : "[ REGISTRAR ESTA EXPERIÊNCIA ]";
}

function registerCurrentExperience() {
    if (!currentExperience || visited.has(currentExperience)) return;
    const registeredId = currentExperience;
    const wasFinalLocked = !firstFiveComplete();
    visited.add(currentExperience);
    saveVisited();
    updateDetailStatus();
    updateProgressUI();
    refreshArchiveNavigation();
    systemJolt();

    if (wasFinalLocked && firstFiveComplete()) {
        const finalNode = document.querySelector('[data-experience="coisas"]');
        if (finalNode) finalNode.classList.add("revealing");
        setTimeout(() => finalNode?.classList.remove("revealing"), 1300);
    }

    setTimeout(() => {
        if (registeredId === "coisas") {
            recoverReward();
            return;
        }
        window.location.href = "index.html#features";
    }, registeredId === "coisas" ? 500 : 420);
}

function nextExperience() {
    showHub();
}

function openLightbox(src, caption) {
    lightboxImage.src = src;
    lightboxImage.alt = caption || "Imagem ampliada";
    lightboxCaption.textContent = caption || "";
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
}

function closeLightbox() {
    if (typeof lightbox.close === "function" && lightbox.open) lightbox.close();
    else lightbox.removeAttribute("open");
    lightboxImage.src = "";
}

function wireLightboxTriggers() {
    detailContent.querySelectorAll("[data-lightbox-src]").forEach(button => {
        button.addEventListener("click", () => openLightbox(button.dataset.lightboxSrc, button.dataset.lightboxCaption));
    });
}

let thingsSequenceRun = 0;

function glitchify(text) {
    const chars = "#@%&/\\|!?*";
    return text.split("").map(ch => {
        if (ch === " " || Math.random() > 0.12) return ch;
        return chars[Math.floor(Math.random() * chars.length)];
    }).join("");
}

function addLogLine(container, text, { final = false } = {}) {
    const p = document.createElement("p");
    p.className = final ? "final-line" : "glitch-line";
    p.textContent = final ? text : glitchify(text);
    container.appendChild(p);
    setTimeout(() => { if (!final) p.textContent = text; }, 140 + Math.random() * 220);
}

function initThingsCollapseSequence() {
    const log = document.getElementById("oursCollapseLog");
    if (!log) return;
    const run = ++thingsSequenceRun;
    log.innerHTML = "";
    const lines = [
        "> REANALISANDO FRAGMENTOS...",
        "> MUITAS LEMBRANÇAS DETECTADAS AO MESMO TEMPO.",
        "> FLORIPA / SÃO PAULO / BGS / CELSO PORTIOLLI.",
        "> AMORA / ZOE / CHARLIE.",
        "> JOGOS / SÉRIES / COMIDAS / PIADAS / PLANOS.",
        "> A CLASSIFICAÇÃO TÉCNICA FALHOU.",
        "> ESTABILIZANDO..."
    ];

    lines.forEach((line, index) => {
        setTimeout(() => {
            if (run !== thingsSequenceRun || currentExperience !== "coisas") return;
            addLogLine(log, line);
            spawnChaos(true);
            if (index % 2 === 0) spawnExperienceCrack(true);
            if (index >= 2) systemJolt();
        }, 220 + index * 420);
    });

    setTimeout(() => {
        if (run !== thingsSequenceRun || currentExperience !== "coisas") return;
        addLogLine(log, "SÃO COISAS NOSSAS.", { final: true });
    }, 220 + lines.length * 420 + 180);
}

function recoverReward() {
    if (!allComplete()) return;
    localStorage.setItem("projetoNos_experiencesComplete", "true");
    localStorage.setItem("projetoNos_item_features", "true");
    updateProgressUI();
    rewardOverlay.classList.remove("hidden");
}

function storeReward() {
    rewardOverlay.classList.add("hidden");
    systemJolt();
    setTimeout(() => {
        window.location.href = "index.html#features";
    }, 650);
}

function systemJolt() {
    document.body.animate([
        { transform: "translate(0,0)", filter: "none" },
        { transform: "translate(-3px,1px)", filter: "contrast(1.8)" },
        { transform: "translate(4px,-1px)", filter: "hue-rotate(18deg)" },
        { transform: "translate(0,0)", filter: "none" }
    ], { duration: 320, iterations: 1 });
    spawnChaos(true);
    spawnExperienceCrack(true);
}

const CHAOS_WORDS = [
    "te amo", "abroba", "briga?", "11:11", "22:22", "eu que amo mais",
    "casa cmg?", "bó ficar de piguiça?", "bochechas", "só mais um episódio",
    "isso aqui virou nosso", "arquivo afetivo detectado"
];
const CHAOS_IMAGE_POOL = [
    "assets/nois/IMG_20230910_181027.jpg",
    "assets/nois/IMG_20250718_201457.jpg",
    "assets/nois/foto1.jpg",
    "assets/nois/foto10.jpg",
    "assets/nois/foto2.webp",
    "assets/nois/foto3.jpg",
    "assets/nois/foto4.jpg",
    "assets/nois/foto5.jpg",
    "assets/nois/foto6.jpg",
    "assets/nois/foto7.jpg",
    "assets/nois/foto8.jpg",
    "assets/amora/5f4ffacf-376e-4b45-9b54-bc756f84066c.jpg",
    "assets/amora/671790098_18523702858075238_3481681728472858417_n.webp",
    "assets/amora/835e043d-00f2-4ec4-afb9-820222a85265.jpg",
    "assets/amora/ceddfaf7-d977-4665-be98-90cd84f9475c.jpg",
    "assets/zozoe/IMG_20211210_231617.jpg",
    "assets/zozoe/IMG_20211213_083224.jpg",
    "assets/zozoe/IMG_20220120_103548.jpg",
    "assets/zozoe/IMG_20220215_075334.jpg",
    "assets/zozoe/IMG_20220224_080829.jpg",
    "assets/zozoe/IMG_20220323_081934.jpg",
    "assets/zozoe/IMG_20220405_205757.jpg",
    "assets/zozoe/IMG_20220423_173544.jpg",
    "assets/zozoe/IMG_20220521_113809.jpg",
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
    "assets/chacha/IMG_20241209_120913.jpg",
    "assets/chacha/IMG_20250204_142620.jpg",
    "assets/chacha/IMG_20250214_101748.jpg",
    "assets/chacha/IMG_20250726_120010.jpg",
    "assets/chacha/IMG_20250819_121431.jpg",
    "assets/comidinhas/608239668_18499551235075238_2557246055249518200_n.webp",
    "assets/comidinhas/Captura de tela 2026-09-22 143610.png",
    "assets/comidinhas/IMG_20220120_202730.jpg",
    "assets/comidinhas/IMG_20220212_205042.jpg",
    "assets/comidinhas/IMG_20220702_185357.jpg",
    "assets/comidinhas/IMG_20220709_135051.jpg",
    "assets/comidinhas/IMG_20250204_152350.jpg",
    "assets/comidinhas/PXL_20230110_133440126.jpg",
    "assets/imagens/foto-nossa-2.jpg",
    "assets/imagens/primeiroEncontro.jpg",
    "assets/imagens/relacionamentoCmg.jpg",
    "assets/imagens/lagum.jpg",
    "assets/imagens/d20.png",
    "assets/imagens/homem-aranha.png",
    "assets/imagens/memoria-001.jpg",
    "assets/imagens/zoe.jpg",
    "assets/imagens/amora.jpg"
];

function refillChaosBag() {
    chaosImageBag = [...CHAOS_IMAGE_POOL];
    for (let i = chaosImageBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chaosImageBag[i], chaosImageBag[j]] = [chaosImageBag[j], chaosImageBag[i]];
    }
}

function nextChaosImage() {
    if (!chaosImageBag.length) refillChaosBag();
    return chaosImageBag.pop();
}

function spawnExperienceCrack(force = false) {
    if (!crackLayer || !isAccessGranted()) return;
    if (!force && Math.random() > (0.16 + visited.size * 0.055)) return;

    const crack = document.createElement("img");
    crack.src = force && Math.random() > .45
        ? `assets/imagens/rachadura-animada.gif?v=${Date.now()}`
        : "assets/imagens/rachadura-transparente.png";
    crack.className = "exp-crack";
    crack.alt = "";
    crack.style.left = `${-8 + Math.random() * 78}%`;
    crack.style.top = `${-8 + Math.random() * 62}%`;
    crack.style.width = `${330 + Math.round(Math.random() * 360)}px`;
    crack.style.setProperty("--crack-r", `${-24 + Math.round(Math.random() * 48)}deg`);
    crackLayer.appendChild(crack);
    setTimeout(() => crack.remove(), force ? 3100 : 4200);
}

function spawnChaos(forceImage = false) {
    if (!chaosLayer || !isAccessGranted()) return;
    const useImage = forceImage || Math.random() > .48;
    const el = useImage ? document.createElement("img") : document.createElement("span");
    el.style.left = `${2 + Math.random() * 91}%`;
    el.style.top = `${6 + Math.random() * 84}%`;
    el.style.setProperty("--chaos-r", `${Math.round(-15 + Math.random() * 30)}deg`);

    if (useImage) {
        const src = nextChaosImage();
        const transparent = /d20|homem-aranha/i.test(src);
        el.src = src;
        el.className = `exp-chaos-image${transparent ? " transparent" : ""}`;
        el.alt = "";
        el.style.width = `${95 + Math.round(Math.random() * 125)}px`;
    } else {
        el.textContent = CHAOS_WORDS[Math.floor(Math.random() * CHAOS_WORDS.length)];
        el.className = "exp-chaos-word";
        el.style.fontSize = `${11 + Math.round(Math.random() * 17)}px`;
    }

    chaosLayer.appendChild(el);
    setTimeout(() => el.remove(), 4700);
}

function refreshAmbientChaos() {
    if (chaosTimer) clearInterval(chaosTimer);
    if (crackTimer) clearInterval(crackTimer);
    if (!isAccessGranted()) return;

    const count = Math.max(1, visited.size);
    const ms = Math.max(1400, 3900 - count * 360);
    const crackMs = Math.max(6400, 12800 - count * 900);

    chaosTimer = setInterval(() => spawnChaos(false), ms);
    crackTimer = setInterval(() => spawnExperienceCrack(false), crackMs);
}

experienceMap.addEventListener("click", event => {
    const node = event.target.closest(".experience-node");
    if (!node || node.disabled) return;
    openExperience(node.dataset.experience);
});

archiveNav?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-archive-target]");
    if (!button || button.disabled || button.classList.contains("hidden")) return;
    openExperience(button.dataset.archiveTarget);
});

backButton.addEventListener("click", () => { window.location.href = "index.html#features"; });
registerButton.addEventListener("click", registerCurrentExperience);
nextButton.addEventListener("click", nextExperience);
completeModuleButton.addEventListener("click", recoverReward);
storeRewardButton.addEventListener("click", storeReward);
closeLightboxButton.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && lightbox.open) closeLightbox();
});

window.addEventListener("hashchange", () => {
    const id = window.location.hash.replace("#", "");
    if (EXPERIENCE_ORDER.includes(id)) {
        openExperience(id, { updateHash: false });
        return;
    }
    const firstIncomplete = EXPERIENCE_ORDER.find(key => !visited.has(key));
    const moduleComplete = allComplete() || localStorage.getItem("projetoNos_experiencesComplete") === "true";
    openExperience(firstIncomplete || (moduleComplete ? "jogos" : "coisas"), { updateHash: false });
});

function init() {
    if (DEBUG_MODE) {
        document.querySelectorAll('a[href^="index.html"]').forEach(link => {
            const hash = link.hash || "";
            link.href = `index.html?debug=1${hash}`;
        });
    }

    if (!isAccessGranted()) {
        lockedView.classList.remove("hidden");
        hubView.classList.remove("active");
        detailView.classList.remove("active");
        refreshAmbientChaos();
        return;
    }

    updateProgressUI();
    hubView.classList.remove("active");
    const hash = window.location.hash.replace("#", "");
    const firstIncomplete = EXPERIENCE_ORDER.find(id => !visited.has(id));
    const moduleComplete = allComplete() || localStorage.getItem("projetoNos_experiencesComplete") === "true";
    const fallback = firstIncomplete || (moduleComplete ? "jogos" : "coisas");
    const requestedAllowed = EXPERIENCE_ORDER.includes(hash)
        && (visited.has(hash) || hash === fallback || moduleComplete || DEBUG_MODE);
    openExperience(requestedAllowed ? hash : fallback, { updateHash: false });

    setTimeout(() => spawnChaos(false), 1200);
}

init();
