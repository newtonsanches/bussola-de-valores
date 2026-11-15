import { AXES, BLOCKS, ITEMS, LIKERT, PAIRV, QUADRANTS } from "./questions.js";
import { score, byId, quadrantOf, intensity, INTENSITY_LABEL, rankFamilies, consistency, encodeResult, decodeResult } from "./scoring.js";
import { icon, illustration } from "./illustrations.js";

const STORE = "bussola-v2";
const AXIS_COLOR = { E: "var(--axE)", A: "var(--axA)", C: "var(--axC)", H: "var(--axH)" };
const AXIS_HEX = { E: "#F5A524", A: "#4C6FFF", C: "#F0569A", H: "#16B08E" };
const Q_HEX = { estadoOrdem: "#FF7A59", mercadoOrdem: "#4C6FFF", estadoLiberdade: "#16B08E", mercadoLiberdade: "#F5A524", centro: "#8B7CF6" };
const LETTERS = "ABCD";

/* ---------------- estado ---------------- */
let S;
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function freshState() {
  const v = ITEMS.filter(i => i.block === "valores").map(i => i.id);
  const af = shuffle(ITEMS.filter(i => i.block === "afirmacoes" && i.check == null).map(i => i.id));
  af.splice(Math.floor(af.length * 0.55), 0, "ATT");
  const si = shuffle(ITEMS.filter(i => i.block === "situacoes").map(i => i.id));
  const optOrder = {};
  ITEMS.filter(i => i.type === "scenario").forEach(i => optOrder[i.id] = shuffle(i.opts.map((_, k) => k)));
  return { order: [...v, ...af, ...si], idx: 0, answers: {}, optOrder, shownAt: Date.now(), done: false, example: false };
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* armazenamento indisponível */ } }
function load() {
  try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.order && s.order.length === ITEMS.length) return s; } catch (e) { }
  return null;
}

/* ---------------- navegação ---------------- */
const app = document.getElementById("app");
function go(route) { if (location.hash !== "#" + route) location.hash = route; else render(); }
function route() { return location.hash.replace(/^#/, ""); }
window.addEventListener("hashchange", () => { document.querySelectorAll(".overlay").forEach(o => o.remove()); render(); window.scrollTo(0, 0); });

function topbar(left = "") {
  return `<header class="topbar">
    ${left || `<button class="logo" data-go="inicio" aria-label="Início"><span class="mark">${icon("compass", 20)}</span>Bússola de Valores</button>`}
    <button class="iconbtn" data-go="ciencia" aria-label="Como funciona">${icon("book", 20)}</button>
  </header>`;
}
function bindGo() { app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go)); }

function render() {
  const r = route();
  if (r.startsWith("r=")) return renderShared(r.slice(2));
  if (r === "teste") return S.done ? go("resultado") : renderQuiz();
  if (r === "resultado") return S.done ? renderResult() : go("inicio");
  if (r === "ciencia") return renderScience();
  return renderHome();
}

/* ---------------- início ---------------- */
function renderHome() {
  const started = Object.keys(S.answers).length > 0 && !S.done && !S.example;
  const quads = ["estadoOrdem", "mercadoOrdem", "estadoLiberdade", "mercadoLiberdade"];
  app.innerHTML = `${topbar()}
  <section class="card fade">
    <div class="hero-grid">${quads.map(q => `<figure>${illustration(q)}<figcaption class="tc-${q}">${QUADRANTS[q].nome}</figcaption></figure>`).join("")}</div>
    <h1>Onde você está no mapa político?</h1>
    <p class="muted">Responda a escolhas do dia a dia e descubra sua posição em <b>4 eixos</b>: economia, autoridade, costumes e igualdade. Sem perguntas óbvias e sem “você é de esquerda ou de direita?”.</p>
    <div class="chips">
      <span class="chip">${icon("clock")}8 minutos</span>
      <span class="chip">${icon("chat")}37 perguntas</span>
      <span class="chip">${icon("lock")}Nada é salvo</span>
    </div>
    <button class="btn primary block" id="start">${started ? "Continuar de onde parei" : S.done && !S.example ? "Ver meu resultado" : "Começar o teste"} ${icon("next", 20)}</button>
    ${started || (S.done && !S.example) ? `<button class="btn text" id="restart">${icon("refresh", 18)} Começar do zero</button>` : ""}
  </section>
  <section class="card">
    <h2>Como funciona</h2>
    <div class="steps">
      ${Object.values(BLOCKS).map((b, i) => `<div class="step"><span class="bubble">${icon(b.icone)}</span><div><b>${i + 1}. ${b.titulo}</b><br><span class="muted small">${b.intro}</span></div></div>`).join("")}
    </div>
    <button class="btn ghost" id="example">${icon("sparkle", 18)} Ver um resultado de exemplo</button>
  </section>
  <p class="muted small" style="text-align:center">Baseado em pesquisas de psicologia política. <button class="btn text small" data-go="ciencia" style="padding:0;text-decoration:underline">Veja a ciência por trás</button></p>`;
  bindGo();
  document.getElementById("start").onclick = () => {
    if (S.example) S = freshState();
    if (S.done) return go("resultado");
    S.shownAt = Date.now(); save(); go("teste");
  };
  const rs = document.getElementById("restart"); if (rs) rs.onclick = () => { S = freshState(); save(); go("teste"); };
  document.getElementById("example").onclick = () => { S = exampleState(); go("resultado"); };
}

/* ---------------- questionário ---------------- */
function renderQuiz() {
  const id = S.order[S.idx], it = byId[id], blkKeys = Object.keys(BLOCKS), blk = BLOCKS[it.block];
  const cur = S.answers[id];
  const counts = blkKeys.map(k => S.order.filter(x => byId[x].block === k).length);
  const before = blkKeys.map((k, i) => counts.slice(0, i).reduce((a, b) => a + b, 0));
  const bi = blkKeys.indexOf(it.block);
  const progress = blkKeys.map((k, i) => {
    const pct = i < bi ? 100 : i > bi ? 0 : ((S.idx - before[i]) / counts[i]) * 100;
    return `<div class="seg ${i === bi ? "on" : ""}"><div class="track"><i style="width:${pct.toFixed(1)}%"></i></div><span>${BLOCKS[k].titulo}</span></div>`;
  }).join("");

  let body = "";
  if (it.type === "likert") {
    const sizes = ["s1", "s2", "s3", "s2", "s1"], cols = ["var(--no)", "var(--no)", "var(--mid)", "var(--yes)", "var(--yes)"];
    body = `<div class="likert" role="radiogroup" aria-label="Grau de concordância">
      ${LIKERT.map(([t, v], k) => `<button class="dot ${sizes[k]} ${cur && cur.v === v ? "sel" : ""}" style="--c:${cols[k]}" data-v="${v}" role="radio" aria-checked="${!!(cur && cur.v === v)}" aria-label="${t}" title="${t}"></button>`).join("")}
    </div>
    <div class="scale-labels"><span class="l">Discordo</span><span class="r">Concordo</span></div>
    <p class="picked" id="picked">${cur && cur.v !== null ? LIKERT.find(x => x[1] === cur.v)[0] : ""}</p>`;
  } else if (it.type === "pair") {
    const sizes = ["s1", "s2", "s2", "s1"], cols = ["var(--q1)", "var(--q1)", "var(--q2)", "var(--q2)"];
    const lab = [`Bem mais: ${it.a}`, `Um pouco mais: ${it.a}`, `Um pouco mais: ${it.b}`, `Bem mais: ${it.b}`];
    const win = cur && cur.v !== null ? (cur.v < 0 ? "a" : "b") : "";
    body = `<div class="pair"><div class="side a ${win === "a" ? "win" : ""}">${it.a}</div><div class="side b ${win === "b" ? "win" : ""}">${it.b}</div></div>
    <div class="likert" role="radiogroup" aria-label="Qual pesa mais">
      ${PAIRV.map((v, k) => `<button class="dot ${sizes[k]} ${cur && cur.v === v ? "sel" : ""}" style="--c:${cols[k]}" data-v="${v}" role="radio" aria-checked="${!!(cur && cur.v === v)}" aria-label="${lab[k]}" title="${lab[k]}"></button>`).join("")}
    </div>
    <div class="scale-labels pair"><span class="l">← Bem mais</span><span class="r">Bem mais →</span></div>
    <p class="picked" id="picked">${cur && cur.v !== null ? lab[PAIRV.indexOf(cur.v)] : ""}</p>`;
  } else {
    body = `<div class="opts" role="radiogroup">${S.optOrder[id].map((o, k) =>
      `<button class="opt ${cur && cur.opt === o ? "sel" : ""}" data-opt="${o}" role="radio" aria-checked="${!!(cur && cur.opt === o)}"><span class="letter">${LETTERS[k]}</span><span>${it.opts[o][0]}</span></button>`).join("")}</div>`;
  }

  const firstOfBlock = S.idx === before[bi];
  app.innerHTML = `${topbar(`<button class="iconbtn" id="back" aria-label="Voltar" ${S.idx === 0 ? "" : ""}>${icon("back", 20)}</button>`)}
  <div class="progress" aria-label="Progresso">${progress}</div>
  <section class="card qcard fade" aria-live="polite">
    <div class="row" style="justify-content:space-between">
      <span class="blocktag">${icon(blk.icone)}${firstOfBlock ? blk.intro : blk.titulo}</span>
      <span class="qnum">${S.idx + 1} de ${S.order.length}</span>
    </div>
    <p class="question" id="qtext">${it.q}</p>
    ${body}
    ${it.check != null ? "" : `<div class="qfoot"><button class="dk ${cur && cur.v === null ? "sel" : ""}" id="dk">Não sei / prefiro pular</button></div>`}
  </section>
  <p class="hint muted">Dica: no teclado, use as teclas 1 a ${it.type === "likert" ? 5 : it.type === "pair" ? 4 : it.opts.length}. A tecla 0 pula a pergunta.</p>`;
  bindGo();

  document.getElementById("back").onclick = back;
  app.querySelectorAll(".dot, .opt").forEach(b => b.onclick = () => {
    const ans = { ms: Date.now() - S.shownAt };
    if (b.dataset.opt != null) { ans.opt = +b.dataset.opt; ans.v = 0; } else ans.v = +b.dataset.v;
    app.querySelectorAll(".dot, .opt").forEach(x => { x.classList.remove("sel"); x.setAttribute("aria-checked", "false"); });
    b.classList.add("sel"); b.setAttribute("aria-checked", "true");
    const p = document.getElementById("picked"); if (p) p.textContent = b.getAttribute("aria-label") || "";
    answer(id, ans);
  });
  const dk = document.getElementById("dk"); if (dk) dk.onclick = () => answer(id, { v: null, ms: Date.now() - S.shownAt });
}
let advancing = null;
function answer(id, ans) {
  S.answers[id] = ans;
  clearTimeout(advancing);
  advancing = setTimeout(() => {
    if (S.idx < S.order.length - 1) S.idx++;
    else { S.done = true; save(); return go("resultado"); }
    S.shownAt = Date.now(); save(); renderQuiz(); window.scrollTo(0, 0);
  }, 260);
}
function back() {
  clearTimeout(advancing);
  if (S.idx === 0) return go("inicio");
  S.idx--; S.shownAt = Date.now(); save(); renderQuiz();
}
document.addEventListener("keydown", e => {
  if (route() !== "teste" || e.metaKey || e.ctrlKey || e.altKey) return;
  const opts = [...app.querySelectorAll(".dot, .opt")];
  if (/^[1-9]$/.test(e.key) && opts[+e.key - 1]) opts[+e.key - 1].click();
  else if (e.key === "0") { const d = document.getElementById("dk"); if (d) d.click(); }
  else if (e.key === "ArrowLeft") back();
});

/* ---------------- resultado ---------------- */
function mapSVG(e, a, quad) {
  const W = 400, pad = 46, inner = W - pad * 2, c = W / 2, half = inner / 2;
  const px = c + (e / 100) * half, py = c - (a / 100) * half;
  const q = (x, y, key, fill) => `<rect x="${x}" y="${y}" width="${half}" height="${half}" fill="${fill}" ${quad === key ? `stroke="${Q_HEX[key]}" stroke-width="3"` : ""}/>`;
  const mini = (x, y, key) => `<svg x="${x}" y="${y}" width="72" height="54" viewBox="0 0 160 120">${illustration(key).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>`;
  const pinUp = py > pad + 60;
  return `<svg class="map" viewBox="0 0 ${W} ${W}" role="img" aria-label="Mapa: economia ${e}, autoridade ${a}">
    ${q(pad, pad, "estadoOrdem", "var(--q1-soft)")}${q(c, pad, "mercadoOrdem", "var(--q2-soft)")}
    ${q(pad, c, "estadoLiberdade", "var(--q3-soft)")}${q(c, c, "mercadoLiberdade", "var(--q4-soft)")}
    <g data-q="estadoOrdem">${mini(pad + 8, pad + 8, "estadoOrdem")}</g>
    <g data-q="mercadoOrdem">${mini(W - pad - 80, pad + 8, "mercadoOrdem")}</g>
    <g data-q="estadoLiberdade">${mini(pad + 8, W - pad - 62, "estadoLiberdade")}</g>
    <g data-q="mercadoLiberdade">${mini(W - pad - 80, W - pad - 62, "mercadoLiberdade")}</g>
    <circle cx="${c}" cy="${c}" r="${half * 0.15}" fill="var(--card)" stroke="var(--q0)" stroke-dasharray="4 4" stroke-width="2"/>
    <line x1="${c}" y1="${pad}" x2="${c}" y2="${W - pad}" stroke="var(--muted)" stroke-width="1.5" opacity=".5"/>
    <line x1="${pad}" y1="${c}" x2="${W - pad}" y2="${c}" stroke="var(--muted)" stroke-width="1.5" opacity=".5"/>
    <text x="${c}" y="${pad - 16}" text-anchor="middle" font-size="15" font-weight="800" fill="var(--ink)">▲ Mais ordem</text>
    <text x="${c}" y="${W - pad + 28}" text-anchor="middle" font-size="15" font-weight="800" fill="var(--ink)">▼ Mais liberdade</text>
    <text x="${pad - 14}" y="${c}" text-anchor="middle" font-size="15" font-weight="800" fill="var(--ink)" transform="rotate(-90 ${pad - 14} ${c})">◀ Mais Estado</text>
    <text x="${W - pad + 14}" y="${c}" text-anchor="middle" font-size="15" font-weight="800" fill="var(--ink)" transform="rotate(90 ${W - pad + 14} ${c})">Mais mercado ▶</text>
    <circle cx="${px}" cy="${py}" r="20" fill="${Q_HEX[quad]}" opacity=".22"/>
    <circle cx="${px}" cy="${py}" r="10" fill="${Q_HEX[quad]}" stroke="#fff" stroke-width="3"/>
    <g transform="translate(${px} ${pinUp ? py - 30 : py + 30})">
      <rect x="-26" y="-13" width="52" height="26" rx="13" fill="var(--ink)"/>
      <text y="5" text-anchor="middle" font-size="13.5" font-weight="800" fill="var(--bg)">Você</text>
    </g>
  </svg>`;
}

function axisCard(k, r, withReading = true) {
  const a = AXES[k];
  if (!r.ok) return `<div class="axis" style="--c:${AXIS_COLOR[k]}"><div class="axis-head"><span class="badge">${icon(a.icone, 20)}</span><h3>${a.nome}</h3></div><p class="muted small">Poucas respostas neste eixo para calcular.</p></div>`;
  const s = r.score, lvl = intensity(s), side = s < 0 ? a.neg : a.pos;
  const reading = lvl === 0 ? a.leitura.centro : s < 0 ? a.leitura.neg : a.leitura.pos;
  return `<div class="axis" style="--c:${AXIS_COLOR[k]}">
    <div class="axis-head"><span class="badge">${icon(a.icone, 20)}</span><h3>${a.nome}</h3><span class="val">${s > 0 ? "+" : ""}${s}</span></div>
    <div class="slider" role="img" aria-label="${a.nome}: ${s} de −100 a +100"><span class="zero"></span><span class="knob" style="left:${50 + s / 2}%"></span></div>
    <div class="poles"><span>◀ ${a.neg}</span><span>${a.pos} ▶</span></div>
    <div class="tagline"><span class="pill c">${lvl === 0 ? "Equilibrado" : `${INTENSITY_LABEL[lvl]}: ${side.toLowerCase()}`}</span>${r.sd != null ? `<span class="pill">Respostas com coerência ${consistency(r.sd)}</span>` : ""}</div>
    ${withReading ? `<p class="reading">${reading}</p><p class="whatis">${icon("info")}<span>${a.oQueMede}</span></p>` : ""}
  </div>`;
}

function miniSlider(label, s, color) {
  return `<div style="--c:${color};display:grid;gap:6px"><div class="lbl"><span>${label}</span><span>${s > 0 ? "+" : ""}${s}</span></div>
  <div class="slider"><span class="zero"></span><span class="knob" style="left:${50 + s / 2}%"></span></div>
  <div class="poles"><span>Autonomia</span><span>Obediência</span></div></div>`;
}

function answerText(id) {
  const it = byId[id], a = S.answers[id];
  if (it.type === "likert") return LIKERT.find(x => x[1] === a.v)[0];
  if (it.type === "pair") return (Math.abs(a.v) === 1 ? "bem mais " : "um pouco mais ") + (a.v < 0 ? it.a : it.b).toLowerCase();
  return it.opts[a.opt][0];
}

function profileBlocks(ax, quad, shared) {
  const Q = QUADRANTS[quad];
  const fams = rankFamilies(ax).slice(0, 3);
  return `
  <section class="card result-hero fade" data-q="${quad}">
    <span class="kicker tc-${quad}">${shared ? "Quadrante" : "Seu quadrante"}</span>
    ${illustration(quad)}
    <h1>${Q.nome}</h1>
    <p class="muted" style="max-width:44ch">${Q.desc}</p>
  </section>

  <section class="card">
    <h2>${shared ? "No mapa" : "Você no mapa"}</h2>
    ${mapSVG(ax.E.score, ax.A.score, quad)}
    <div class="howto">
      <div><b>↔</b><span><b>Da esquerda para a direita:</b> quanto mais à direita, mais confiança no mercado. Quanto mais à esquerda, mais papel para o Estado.</span></div>
      <div><b>↕</b><span><b>De baixo para cima:</b> quanto mais alto, mais valor à ordem e à autoridade. Quanto mais baixo, mais à liberdade individual.</span></div>
      <div><b>◯</b><span><b>O círculo do meio</b> é a zona de equilíbrio. Os outros dois eixos (costumes e igualdade) aparecem logo abaixo.</span></div>
    </div>
  </section>

  <section class="card">
    <h2>Os 4 eixos</h2>
    <p class="muted small">Cada eixo vai de −100 a +100. O zero é o meio da escala, não a média dos brasileiros.</p>
    ${Object.keys(AXES).map(k => axisCard(k, ax[k])).join("")}
  </section>

  <section class="card">
    <h2>Correntes mais parecidas</h2>
    <p class="muted small">Comparação aproximada com o perfil típico de cada corrente. Serve para dar nomes, não para rotular ninguém.</p>
    ${fams.map((f, i) => `<div class="fam"><span class="rank">${i + 1}</span><div><b>${f.nome}</b><br><span class="muted small">${f.desc}</span></div></div>`).join("")}
  </section>`;
}

function resultData() {
  const R = score(S.answers);
  const ax = R.axes;
  const quad = ax.E.ok && ax.A.ok ? quadrantOf(ax.E.score, ax.A.score) : "centro";
  for (const k of Object.keys(AXES)) if (!ax[k].ok) ax[k].score = 0;
  return { R, ax, quad };
}

function renderResult() {
  const { R, ax, quad } = resultData();
  const warns = [];
  if (R.attentionFail) warns.push("A pergunta de atenção não foi respondida como pedido.");
  if (R.medianMs && R.medianMs < 2500 && !S.example) warns.push(`Você respondeu bem rápido (cerca de ${(R.medianMs / 1000).toFixed(1)} s por pergunta).`);
  if (Math.abs(R.acquiescence) >= 0.5) warns.push(`Você ${R.acquiescence > 0 ? "concordou" : "discordou"} de quase tudo, até de frases opostas. Isso puxa o resultado para o centro.`);
  if (R.dontKnow >= 8) warns.push(`Você pulou ${R.dontKnow} perguntas.`);
  const gap = R.indirect != null && R.direct != null ? R.indirect - R.direct : null;

  app.innerHTML = `${topbar()}
  ${S.example ? `<div class="banner"><span>Este é um exemplo com respostas fictícias.</span><button class="btn" id="mine">Fazer o meu</button></div>` : ""}
  ${warns.length ? `<div class="alert">${icon("alert")}<div><b>Leia com cautela</b><ul>${warns.map(w => `<li>${w}</li>`).join("")}</ul></div></div>` : ""}
  ${profileBlocks(ax, quad, false)}

  ${gap != null ? `<section class="card">
    <h2>Seus valores × suas opiniões</h2>
    <p>As perguntas sobre <b>o que vale mais numa criança</b> não falam de política, mas medem a mesma coisa que o eixo Autoridade: o peso que você dá à obediência ou à autonomia.</p>
    <div class="vs">${miniSlider("Valores (criação de filhos)", R.indirect, "var(--q1)")}${miniSlider("Opiniões sobre autoridade", R.direct, "var(--axA)")}</div>
    <p class="muted">${Math.abs(gap) < 25 ? "As duas medidas combinam: seus valores de fundo e suas opiniões apontam para o mesmo lado." : gap > 0 ? "Curioso: seus valores de fundo pendem mais para a obediência do que suas opiniões políticas." : "Curioso: seus valores de fundo pendem mais para a autonomia do que suas opiniões políticas."}</p>
  </section>` : ""}

  <details class="card">
    <summary>O que mais pesou no resultado</summary>
    <div class="infl">${Object.keys(AXES).filter(k => ax[k].ok && ax[k].infl && ax[k].infl.length).map(k => `
      <div><h4>${AXES[k].nome}</h4><ul>${ax[k].infl.map(x => `<li>${byId[x.id].q} <em>${answerText(x.id)}</em></li>`).join("")}</ul></div>`).join("")}</div>
  </details>

  <section class="card">
    <h2>Compartilhe</h2>
    <p class="muted small">O link e a imagem levam só as 4 pontuações. Suas respostas ficam neste aparelho.</p>
    <div class="actions">
      <button class="btn primary" id="share">${icon("share", 18)} Compartilhar</button>
      <button class="btn ghost" id="img">${icon("download", 18)} Imagem</button>
      <button class="btn text wide" id="again">${icon("refresh", 18)} Refazer o teste</button>
    </div>
  </section>
  <p class="muted small" style="text-align:center">Isto é um retrato das suas respostas de hoje, não um diagnóstico. <button class="btn text small" data-go="ciencia" style="padding:0;text-decoration:underline">Entenda o método</button></p>`;
  bindGo();
  const mine = document.getElementById("mine"); if (mine) mine.onclick = () => { S = freshState(); save(); go("teste"); };
  document.getElementById("again").onclick = () => { S = freshState(); save(); go("teste"); };
  document.getElementById("share").onclick = () => shareLink(ax, quad);
  document.getElementById("img").onclick = () => showImage(ax, quad);
}

function renderShared(code) {
  const ax = decodeResult(code);
  if (!ax) return go("inicio");
  for (const k of Object.keys(AXES)) if (!ax[k].ok) ax[k].score = 0;
  const quad = ax.E.ok && ax.A.ok ? quadrantOf(ax.E.score, ax.A.score) : "centro";
  app.innerHTML = `${topbar()}
  <div class="banner"><span>Alguém compartilhou este resultado com você.</span><button class="btn" id="mine">Fazer o meu</button></div>
  ${profileBlocks(ax, quad, true)}`;
  bindGo();
  document.getElementById("mine").onclick = () => { if (S.done || S.example) S = freshState(); save(); go("teste"); };
}

function renderScience() {
  app.innerHTML = `${topbar()}
  <section class="card fade">
    <span class="kicker" style="color:var(--brand)">A ciência por trás</span>
    <h1>Por que 4 eixos e perguntas indiretas?</h1>
    <div class="prose">
      <p><b>Uma linha só não dá conta.</b> Pesquisas mostram que opiniões sobre economia e sobre costumes andam separadas: tem gente que quer pouco Estado na economia e muito nos costumes, e o contrário (Feldman &amp; Johnston, 2014). Por isso medimos 4 eixos.</p>
      <p><b>Perguntas indiretas.</b> “O que vale mais numa criança: obediência ou autoconfiança?” parece não ter nada a ver com política. Mas essa escala, usada há décadas em pesquisas eleitorais nos EUA, mede bem a preferência por ordem e autoridade (Feldman &amp; Stenner, 1997). Ela vem primeiro para que as perguntas políticas não influenciem a resposta.</p>
      <p><b>Frases dos dois lados.</b> Em cada eixo, metade das frases favorece um lado e metade o outro. Quem concorda com tudo não é empurrado para lado nenhum, e o app avisa quando isso acontece.</p>
      <p><b>Situações com escolha difícil.</b> Decidir onde gastar o dinheiro da cidade ou o que fazer com uma fábrica que polui revela prioridades melhor do que perguntas diretas.</p>
      <p><b>Controle de qualidade.</b> Uma pergunta de atenção, o tempo de resposta e a quantidade de perguntas puladas ajudam a saber o quanto confiar no resultado.</p>
      <h3>Limites, sem rodeios</h3>
      <ul>
        <li>As frases foram escritas para este app, inspiradas em escalas científicas. Elas ainda <b>não foram validadas</b> estatisticamente no Brasil.</li>
        <li>O zero é o meio da escala, não a média da população: ainda não há dados de comparação.</li>
        <li>Os nomes dos quadrantes e das correntes são aproximações didáticas.</li>
      </ul>
      <h3>Privacidade</h3>
      <p>Não há cadastro nem servidor recebendo respostas. Tudo é calculado no seu aparelho. Opinião política é dado sensível pela LGPD (Lei 13.709/2018, art. 5º, II), e por isso preferimos não coletar nada.</p>
      <h3>Referências</h3>
      <ul class="refs">
        <li>Altemeyer, B. (1981). <i>Right-wing authoritarianism</i>. University of Manitoba Press.</li>
        <li>Duckitt, J. (2001). A dual-process cognitive-motivational theory of ideology and prejudice. <i>Advances in Experimental Social Psychology</i>, 33, 41–113.</li>
        <li>Everett, J. A. C. (2013). The 12 item Social and Economic Conservatism Scale (SECS). <i>PLoS ONE</i>, 8(12), e82131.</li>
        <li>Feldman, S., &amp; Johnston, C. (2014). Understanding the determinants of political ideology. <i>Political Psychology</i>, 35(3), 337–358.</li>
        <li>Feldman, S., &amp; Stenner, K. (1997). Perceived threat and authoritarianism. <i>Political Psychology</i>, 18(4), 741–770.</li>
        <li>Ho, A. K., Sidanius, J., et al. (2015). The nature of social dominance orientation (SDO₇). <i>Journal of Personality and Social Psychology</i>, 109(6), 1003–1028.</li>
        <li>Jost, J. T., Glaser, J., Kruglanski, A. W., &amp; Sulloway, F. J. (2003). Political conservatism as motivated social cognition. <i>Psychological Bulletin</i>, 129(3), 339–375.</li>
      </ul>
    </div>
    <button class="btn primary" data-go="${S.done ? "resultado" : "inicio"}">${S.done ? "Voltar ao resultado" : "Voltar ao início"}</button>
  </section>`;
  bindGo();
}

/* ---------------- compartilhar ---------------- */
function toast(msg) {
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}
function shareURL(ax) { return location.origin + location.pathname + "#r=" + encodeResult(ax); }
async function shareLink(ax, quad) {
  const url = shareURL(ax);
  const text = `Meu resultado na Bússola de Valores: ${QUADRANTS[quad].nome}. Faça o seu:`;
  if (navigator.share) { try { await navigator.share({ title: "Bússola de Valores", text, url }); return; } catch (e) { if (e.name === "AbortError") return; } }
  try { await navigator.clipboard.writeText(`${text} ${url}`); toast("Link copiado"); }
  catch (e) { toast("Não deu para copiar. Copie o endereço da barra do navegador."); }
}

const STATIC = { "--ill-deep": "#2A2650", "--ill-light": "#FFFFFF", "--ill-sun": "#FFD166" };
const ILL_BG = { estadoOrdem: ["#FFE1D6", "#FF7A59"], mercadoOrdem: ["#DCE4FF", "#4C6FFF"], estadoLiberdade: ["#D2F3E9", "#16B08E"], mercadoLiberdade: ["#FFEDC8", "#F5A524"], centro: ["#E6E1FF", "#8B7CF6"] };
function staticIllustration(key) {
  let s = illustration(key).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" ');
  const vars = { ...STATIC, "--ill-bg": ILL_BG[key][0], "--ill-accent": ILL_BG[key][1] };
  return s.replace(/var\((--ill-[a-z]+)\)/g, (_, v) => vars[v]);
}
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

async function buildImage(ax, quad) {
  try { await document.fonts.ready; } catch (e) { }
  const W = 1080, H = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const ink = "#1D1B3A", muted = "#67638C";
  ctx.fillStyle = "#F3F1FF"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#FFFFFF"; rr(ctx, 48, 48, W - 96, H - 96, 48); ctx.fill();
  ctx.fillStyle = ILL_BG[quad][0]; rr(ctx, 48, 48, W - 96, 420, 48); ctx.fill(); ctx.fillRect(48, 400, W - 96, 68);
  ctx.textAlign = "center";
  ctx.fillStyle = "#6A4CF5"; ctx.font = "700 34px 'Outfit', sans-serif"; ctx.fillText("BÚSSOLA DE VALORES", W / 2, 120);
  const img = await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(staticIllustration(quad)));
  ctx.drawImage(img, W / 2 - 180, 150, 360, 270);
  ctx.fillStyle = ink; ctx.font = "800 76px 'Outfit', sans-serif"; ctx.fillText(QUADRANTS[quad].nome, W / 2, 560);
  ctx.fillStyle = muted; ctx.font = "500 28px 'Plus Jakarta Sans', sans-serif"; ctx.fillText(QUADRANTS[quad].resumo, W / 2, 612);
  // eixos
  let y = 690;
  for (const k of Object.keys(AXES)) {
    const a = AXES[k], s = ax[k].ok ? ax[k].score : 0, col = AXIS_HEX[k];
    ctx.textAlign = "left"; ctx.fillStyle = ink; ctx.font = "700 36px 'Outfit', sans-serif"; ctx.fillText(a.nome, 120, y);
    ctx.textAlign = "right"; ctx.fillStyle = col; ctx.font = "800 40px 'Outfit', sans-serif"; ctx.fillText(ax[k].ok ? (s > 0 ? "+" : "") + s : "–", W - 120, y);
    const bx = 120, bw = W - 240, by = y + 26;
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, col + "B3"); g.addColorStop(.5, "#E4E0F6"); g.addColorStop(1, col);
    ctx.fillStyle = g; rr(ctx, bx, by, bw, 22, 11); ctx.fill();
    const kx = bx + bw * (0.5 + s / 200);
    ctx.beginPath(); ctx.arc(kx, by + 11, 22, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.stroke();
    ctx.font = "600 26px 'Plus Jakarta Sans', sans-serif"; ctx.fillStyle = muted;
    ctx.textAlign = "left"; ctx.fillText(a.neg, bx, by + 60); ctx.textAlign = "right"; ctx.fillText(a.pos, bx + bw, by + 60);
    y += 148;
  }
  ctx.textAlign = "center"; ctx.fillStyle = muted; ctx.font = "600 26px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Faça o seu teste: " + (location.host || "bussola de valores") + location.pathname.replace(/index\.html$/, ""), W / 2, H - 72);
  return cv;
}

async function showImage(ax, quad) {
  let cv;
  try { cv = await buildImage(ax, quad); } catch (e) { return toast("Não foi possível gerar a imagem."); }
  const url = cv.toDataURL("image/png");
  const ov = document.createElement("div"); ov.className = "overlay";
  ov.innerHTML = `<div class="card"><img src="${url}" alt="Imagem do resultado: ${QUADRANTS[quad].nome}">
    <p class="muted small" style="text-align:center">No celular, toque e segure a imagem para salvar.</p>
    <div class="actions"><button class="btn primary" id="dl">${icon("download", 18)} Baixar</button><button class="btn ghost" id="close">Fechar</button></div></div>`;
  document.body.appendChild(ov);
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
  ov.querySelector("#close").onclick = () => ov.remove();
  ov.querySelector("#dl").onclick = async () => {
    const blob = await new Promise(r => cv.toBlob(r, "image/png"));
    const file = new File([blob], "bussola-de-valores.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: "Bússola de Valores" }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "bussola-de-valores.png";
    document.body.appendChild(a); a.click(); a.remove();
  };
}

/* ---------------- exemplo ---------------- */
function exampleState() {
  const st = freshState(); st.example = true; st.done = true;
  const p = { E: -0.35, A: -0.45, C: -0.3, H: -0.4 };
  for (const id of st.order) {
    const it = byId[id];
    if (it.check != null) { st.answers[id] = { v: -1, ms: 6000 }; continue; }
    if (it.type === "scenario") {
      let best = 0, bd = 1e9;
      it.opts.forEach((o, k) => { let d = 0; for (const ax in it.w) d += ((o[1][ax] || 0) - p[ax]) ** 2; d += Math.random() * 0.3; if (d < bd) { bd = d; best = k; } });
      st.answers[id] = { opt: best, v: 0, ms: 7000 }; continue;
    }
    let t = 0; for (const [ax, w] of Object.entries(it.w)) t += Math.sign(w) * p[ax];
    t = t / Object.keys(it.w).length + (Math.random() - 0.5) * 0.7;
    const sc = it.type === "likert" ? LIKERT.map(x => x[1]) : PAIRV;
    st.answers[id] = { v: sc.reduce((a, b) => Math.abs(b - t) < Math.abs(a - t) ? b : a), ms: 6500 };
  }
  return st;
}

/* ---------------- início do app ---------------- */
function start(data) {
  S = (data && data.S) || load() || freshState();
  render();
}
window.claude?.hot?.snapshot?.(() => ({ S }));
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
if ("serviceWorker" in navigator && location.protocol === "https:" && !window.claude) {
  navigator.serviceWorker.register("sw.js").catch(() => { });
}
